import { NextRequest, NextResponse } from 'next/server';
import { sendInvoiceDueReminderEmail } from '@/lib/services/resend-service';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface DueInvoiceReminder {
  id: string;
  customerEmail: string;
  customerName: string | null;
  businessName: string;
  invoiceNumber: string;
  total: number;
  currency: string;
  dueDate: string | null;
  isOverdue: boolean;
  logoUrl?: string | null;
  brandColor?: string | null;
}

/**
 * Backlog documentos/correos (2026-09-29) — mismo patrón que /api/cron/appointment-reminders.
 * Corre vía Vercel Cron (ver vercel.json). Pide a maalca-api las facturas Pending/Overdue con
 * vencimiento próximo o ya pasado y todavía sin recordatorio, manda el correo con Resend, y
 * marca cada una como recordada. Falla en silencio por factura individual.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  const internalSecret = process.env.INTERNAL_NOTIFICATIONS_SECRET;
  if (!internalSecret) {
    return NextResponse.json({ error: 'INTERNAL_NOTIFICATIONS_SECRET not configured' }, { status: 503 });
  }

  const dueRes = await fetch(`${API}/api/internal/invoices/due-reminders?daysBeforeDue=3`, {
    headers: { 'X-Internal-Secret': internalSecret },
    cache: 'no-store',
  });
  if (!dueRes.ok) {
    return NextResponse.json({ error: 'failed to fetch due reminders', status: dueRes.status }, { status: 502 });
  }
  const due: DueInvoiceReminder[] = await dueRes.json().catch(() => []);

  let sent = 0;
  let failed = 0;

  for (const inv of due) {
    try {
      const ok = await sendInvoiceDueReminderEmail({
        customerEmail: inv.customerEmail,
        customerName: inv.customerName,
        businessName: inv.businessName,
        invoiceNumber: inv.invoiceNumber,
        total: inv.total,
        currency: inv.currency,
        dueDate: inv.dueDate,
        isOverdue: inv.isOverdue,
        brand: { name: inv.businessName, logoUrl: inv.logoUrl ?? null, color: inv.brandColor ?? null },
      });
      if (ok) {
        sent += 1;
        await fetch(`${API}/api/internal/invoices/${inv.id}/mark-reminded`, {
          method: 'POST',
          headers: { 'X-Internal-Secret': internalSecret },
        }).catch(() => null);
      } else {
        failed += 1;
      }
    } catch {
      failed += 1;
    }
  }

  return NextResponse.json({ candidates: due.length, sent, failed });
}
