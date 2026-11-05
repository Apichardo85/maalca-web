import { NextRequest, NextResponse } from 'next/server';
import { sendStoreAccountApprovedEmail } from '@/lib/services/resend-service';

/**
 * Mismo patrón que /api/internal/notifications/reservation-requested: maalca-api (C#) llama acá
 * cuando un negocio aprueba la cuenta de un cliente/mayorista (ver StoreAccountNotificationService).
 * La tienda le promete al cliente "te avisamos cuando te aprueben"; este endpoint lo cumple.
 * Protegido por el mismo secreto compartido.
 */
interface StoreAccountApprovedBody {
  businessName: string;
  businessEmail?: string | null;
  slug?: string | null;
  logoUrl?: string | null;
  brandColor?: string | null;
  language?: string | null;
  customerName: string;
  customerEmail: string;
  priceListName?: string | null;
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

  let body: StoreAccountApprovedBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.businessName || !body.customerEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const sent = await sendStoreAccountApprovedEmail({
    businessName: body.businessName,
    businessEmail: body.businessEmail ?? null,
    slug: body.slug ?? null,
    brand: { name: body.businessName, logoUrl: body.logoUrl ?? null, color: body.brandColor ?? null },
    customerName: body.customerName || body.customerEmail,
    customerEmail: body.customerEmail,
    priceListName: body.priceListName ?? null,
    language: (body.language === 'en' ? 'en' : 'es') as 'es' | 'en',
  });

  return NextResponse.json(sent);
}
