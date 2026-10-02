import { NextRequest, NextResponse } from 'next/server';
import { sendAppointmentStatusEmail } from '@/lib/services/resend-service';

/**
 * Tarea #247 — mismo patrón que /api/internal/notifications/order: maalca-api (C#) llama acá
 * cuando el negocio confirma o cancela una cita desde su panel y el cliente tiene email, para reusar la
 * infraestructura de Resend de maalca-web en vez de duplicarla en el backend .NET. Protegido
 * por el mismo secreto compartido.
 */
interface AppointmentStatusBody {
  kind: 'confirmed' | 'cancelled';
  token: string;
  slug: string;
  businessName: string;
  logoUrl?: string | null;
  brandColor?: string | null;
  customerEmail: string;
  customerName?: string | null;
  serviceName: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  staffName?: string | null;
  isVirtual?: boolean;
  zoomLink?: string | null;
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

  let body: AppointmentStatusBody;
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

  const sent = await sendAppointmentStatusEmail({
    kind: body.kind === 'cancelled' ? 'cancelled' : 'confirmed',
    customerEmail: body.customerEmail,
    customerName: body.customerName ?? null,
    businessName: body.businessName,
    serviceName: body.serviceName,
    date: body.date,
    time: body.time,
    staffName: body.staffName,
    manageUrl,
    zoomLink: body.isVirtual ? body.zoomLink : null,
    brand: { name: body.businessName, logoUrl: body.logoUrl ?? null, color: body.brandColor ?? null },
  });

  return NextResponse.json({ sent });
}
