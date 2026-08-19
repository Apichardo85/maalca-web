import { NextRequest, NextResponse } from 'next/server';
import { sendAppointmentConfirmationEmail } from '@/lib/services/resend-service';

/**
 * Tarea #247 — mismo patrón que /api/internal/notifications/order: maalca-api (C#) llama acá
 * cuando alguien reserva una cita por el widget público y dejó su email, para reusar la
 * infraestructura de Resend de maalca-web en vez de duplicarla en el backend .NET. Protegido
 * por el mismo secreto compartido.
 */
interface AppointmentNotificationBody {
  token: string;
  slug: string;
  businessName: string;
  customerEmail: string;
  customerName?: string | null;
  serviceName: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  staffName?: string | null;
}

export async function POST(request: NextRequest) {
  const secret = process.env.INTERNAL_NOTIFICATIONS_SECRET || '';
  if (!secret) {
    return NextResponse.json({ error: 'INTERNAL_NOTIFICATIONS_SECRET not configured' }, { status: 503 });
  }

  const provided = request.headers.get('x-internal-secret') || '';
  if (provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: AppointmentNotificationBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.customerEmail || !body.token || !body.slug) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://maalca.com';
  const manageUrl = `${origin.replace(/\/$/, '')}/cita/${body.token}`;

  const sent = await sendAppointmentConfirmationEmail({
    customerEmail: body.customerEmail,
    customerName: body.customerName ?? null,
    businessName: body.businessName,
    serviceName: body.serviceName,
    date: body.date,
    time: body.time,
    staffName: body.staffName,
    manageUrl,
  });

  return NextResponse.json({ sent });
}
