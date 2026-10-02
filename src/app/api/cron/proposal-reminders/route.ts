import { NextRequest, NextResponse } from 'next/server';
import { sendProposalReminderEmail } from '@/lib/services/resend-service';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface DueProposalReminder {
  id: string;
  customerEmail: string;
  customerName: string | null;
  businessName: string;
  title: string;
  amount: number;
  currency: string;
  expiresAt: string | null;
  token: string;
  logoUrl?: string | null;
  brandColor?: string | null;
}

/**
 * Backlog documentos/correos (2026-09-29) — mismo patrón que /api/cron/appointment-reminders.
 * Corre vía Vercel Cron (ver vercel.json). Pide a maalca-api las propuestas "Sent" hace varios
 * días que siguen sin firmar y todavía no tienen recordatorio enviado, manda el correo con
 * Resend, y marca cada una como recordada en maalca-api para no repetir en el próximo barrido.
 * Falla en silencio por propuesta individual — una falla no debe tumbar el resto del barrido.
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

  const dueRes = await fetch(`${API}/api/internal/proposals/due-reminders?minDaysSinceSent=3`, {
    headers: { 'X-Internal-Secret': internalSecret },
    cache: 'no-store',
  });
  if (!dueRes.ok) {
    return NextResponse.json({ error: 'failed to fetch due reminders', status: dueRes.status }, { status: 502 });
  }
  const due: DueProposalReminder[] = await dueRes.json().catch(() => []);

  let sent = 0;
  let failed = 0;

  const origin = (process.env.NEXT_PUBLIC_SITE_URL || 'https://maalca.com').replace(/\/$/, '');

  for (const p of due) {
    try {
      const ok = await sendProposalReminderEmail({
        customerEmail: p.customerEmail,
        customerName: p.customerName,
        businessName: p.businessName,
        title: p.title,
        amount: p.amount,
        currency: p.currency,
        expiresAt: p.expiresAt,
        proposalLink: `${origin}/propuesta/${p.token}`,
        brand: { name: p.businessName, logoUrl: p.logoUrl ?? null, color: p.brandColor ?? null },
      });
      if (ok) {
        sent += 1;
        await fetch(`${API}/api/internal/proposals/${p.id}/mark-reminded`, {
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
