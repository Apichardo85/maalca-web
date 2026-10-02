import { NextRequest, NextResponse } from 'next/server';
import { sendReservationStatusEmail } from '@/lib/services/resend-service';

/**
 * maalca-api (C#) llama acá cuando el negocio confirma o cancela una reserva (ver
 * ReservationNotificationService.NotifyReservationStatusAsync) y le avisa al comensal. Protegido por el mismo secreto
 * compartido.
 */
interface ReservationStatusBody {
  kind: 'confirmed' | 'cancelled';
  businessName: string;
  businessEmail?: string | null;
  slug?: string | null;
  logoUrl?: string | null;
  brandColor?: string | null;
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

  let body: ReservationStatusBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.businessName || !body.customerName || !body.date || !body.time) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!body.customerEmail || (body.kind !== 'confirmed' && body.kind !== 'cancelled')) {
    return NextResponse.json({ error: 'Missing customerEmail or invalid kind' }, { status: 400 });
  }

  const sent = await sendReservationStatusEmail({
    kind: body.kind,
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
  });

  return NextResponse.json(sent);
}
