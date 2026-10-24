import { NextRequest, NextResponse } from 'next/server';
import { sendScreenAlertEmail, type ScreenAlertEvent } from '@/lib/services/resend-service';

/**
 * maalca-api (ScreenMonitorWorker) llama acá cuando una TV se cae en horario de atención o vuelve.
 * Mismo secreto compartido que el resto de /api/internal/notifications/*. Por ahora el aviso es
 * solo para MaalCa (destinatarios los decide el API: SCREEN_ALERT_EMAILS o los admins Owner).
 * Responde 502 si el correo no salió, así el API reintenta en el siguiente ciclo.
 */
interface ScreenAlertBody {
  to: string[];
  events: ScreenAlertEvent[];
}

export async function POST(request: NextRequest) {
  const secret = process.env.INTERNAL_NOTIFICATIONS_SECRET || '';
  if (!secret) {
    return NextResponse.json({ error: 'INTERNAL_NOTIFICATIONS_SECRET not configured' }, { status: 503 });
  }
  if ((request.headers.get('x-internal-secret') || '') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: ScreenAlertBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!Array.isArray(body.to) || body.to.length === 0 || !Array.isArray(body.events) || body.events.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const sent = await sendScreenAlertEmail({ to: body.to.slice(0, 20), events: body.events.slice(0, 100) });
  return NextResponse.json({ sent }, { status: sent ? 200 : 502 });
}
