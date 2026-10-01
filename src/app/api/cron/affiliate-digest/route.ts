import { NextRequest, NextResponse } from 'next/server';
import { sendAffiliateDigestEmail } from '@/lib/services/resend-service';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface AffiliateDigestRow {
  businessEmail: string;
  businessName: string;
  slug: string | null;
  currency: string;
  revenueThisWeek: number;
  invoicesPaidCount: number;
  proposalsSentCount: number;
  proposalsAcceptedCount: number;
  newCustomersCount: number;
}

/**
 * Backlog documentos/correos (2026-09-29, tarea #4 cierre) — mismo patrón que
 * /api/cron/appointment-reminders. Corre vía Vercel Cron los lunes (ver vercel.json). Pide a
 * maalca-api el resumen de la semana anterior por afiliado activo con ContactEmail, y manda un
 * correo por afiliado. Se manda siempre, incluso sin actividad — ver sendAffiliateDigestEmail.
 * Falla en silencio por afiliado individual.
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

  const digestRes = await fetch(`${API}/api/internal/affiliates/weekly-digest`, {
    headers: { 'X-Internal-Secret': internalSecret },
    cache: 'no-store',
  });
  if (!digestRes.ok) {
    return NextResponse.json({ error: 'failed to fetch weekly digest', status: digestRes.status }, { status: 502 });
  }
  const rows: AffiliateDigestRow[] = await digestRes.json().catch(() => []);

  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      const ok = await sendAffiliateDigestEmail({
        businessEmail: row.businessEmail,
        businessName: row.businessName,
        slug: row.slug,
        currency: row.currency,
        revenueThisWeek: row.revenueThisWeek,
        invoicesPaidCount: row.invoicesPaidCount,
        proposalsSentCount: row.proposalsSentCount,
        proposalsAcceptedCount: row.proposalsAcceptedCount,
        newCustomersCount: row.newCustomersCount,
      });
      if (ok) sent += 1;
      else failed += 1;
    } catch {
      failed += 1;
    }
  }

  return NextResponse.json({ candidates: rows.length, sent, failed });
}
