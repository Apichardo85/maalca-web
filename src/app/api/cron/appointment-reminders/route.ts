import { NextRequest, NextResponse } from 'next/server';
import { sendAppointmentReminderEmail } from '@/lib/services/resend-service';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface DueReminder {
  id: string;
  affiliateName: string;
  affiliateSlug: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  date: string;
  time: string;
  staffName?: string | null;
  token: string;
}

/**
 * Task #193 — corre vía Vercel Cron (ver vercel.json). Pide a maalca-api las citas de hoy que
 * caen dentro de las próximas `withinMinutes` y todavía no tienen recordatorio enviado, manda
 * el correo con Resend, y marca cada una como recordada en maalca-api para no repetir en el
 * próximo barrido. Falla en silencio por cita individual (una falla no debe tumbar el resto
 * del barrido) — mismo criterio que el resto de las notificaciones best-effort del proyecto.
 *
 * Nota de infraestructura: en el plan Hobby de Vercel los cron jobs corren como máximo una vez
 * al día, no cada N minutos — si este proyecto está en Hobby, "withinMinutes" efectivamente se
 * comporta como "recuérdame en algún momento del día", no como un recordatorio preciso 2-3h
 * antes. Para precisión real hace falta plan Pro (permite crons más frecuentes) o mover esto a
 * un worker separado con su propio scheduler.
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

  const dueRes = await fetch(`${API}/api/internal/appointments/due-reminders?withinMinutes=180`, {
    headers: { 'X-Internal-Secret': internalSecret },
    cache: 'no-store',
  });
  if (!dueRes.ok) {
    return NextResponse.json({ error: 'failed to fetch due reminders', status: dueRes.status }, { status: 502 });
  }
  const due: DueReminder[] = await dueRes.json().catch(() => []);

  let sent = 0;
  let failed = 0;

  const origin = (process.env.NEXT_PUBLIC_SITE_URL || 'https://maalca.com').replace(/\/$/, '');

  for (const appt of due) {
    try {
      const ok = await sendAppointmentReminderEmail({
        customerEmail: appt.customerEmail,
        customerName: appt.customerName || null,
        businessName: appt.affiliateName,
        serviceName: appt.serviceName,
        date: appt.date.slice(0, 10),
        time: appt.time,
        staffName: appt.staffName ?? null,
        manageUrl: appt.token ? `${origin}/cita/${appt.token}` : null,
      });
      if (ok) {
        sent += 1;
        await fetch(`${API}/api/internal/appointments/${appt.id}/mark-reminded`, {
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
