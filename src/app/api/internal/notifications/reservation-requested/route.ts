import { NextRequest, NextResponse } from 'next/server';
import { sendReservationRequestedEmail } from '@/lib/services/resend-service';

/**
 * Mismo patrón que /api/internal/notifications/invoice-paid: maalca-api (C#) llama acá cuando
 * entra una reserva pública de mesa (ver ReservationNotificationService). Manda el aviso al
 * restaurante y, si el comensal dejó correo, un acuse de recibo. Protegido por el mismo secreto
 * compartido.
 */
interface ReservationRequestedBody {
  businessName: string;
  businessEmail?: string | null;
  slug?: string | null;
  logoUrl?: string | null;
  brandColor?: string | null;
  language?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  date: string;
  time: string;
  partySize: number;
  notes?: string | null;
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

  let body: ReservationRequestedBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.businessName || !body.customerName || !body.date || !body.time) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!body.businessEmail && !body.customerEmail) {
    return NextResponse.json({ error: 'No recipients' }, { status: 400 });
  }

  const sent = await sendReservationRequestedEmail({
    businessName: body.businessName,
    businessEmail: body.businessEmail ?? null,
    slug: body.slug ?? null,
    brand: { name: body.businessName, logoUrl: body.logoUrl ?? null, color: body.brandColor ?? null },
    customerName: body.customerName,
    customerPhone: body.customerPhone,
    customerEmail: body.customerEmail ?? null,
    date: body.date,
    time: body.time,
    partySize: body.partySize,
    notes: body.notes ?? null,
    language: (body.language === 'en' ? 'en' : 'es') as 'es' | 'en',
  });

  return NextResponse.json(sent);
}
