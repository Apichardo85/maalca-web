import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, sendOrderFulfilledEmail, type OrderEmailItem } from '@/lib/services/resend-service';

/**
 * Endpoint interno server-to-server: maalca-api (C#) llama aquí cuando un Order real cambia
 * de estado (Paid / Fulfilled), para reusar la infraestructura de Resend que ya vive en
 * maalca-web en vez de duplicarla en el backend .NET. Protegido por un secreto compartido
 * (no es público, no es para el navegador) — mismo patrón que /api/webhooks/* pero más simple
 * porque el "proveedor" acá es nuestro propio backend, no un tercero con firma HMAC.
 */
interface OrderNotificationBody {
  kind: 'confirmed' | 'fulfilled';
  orderId: string;
  businessName: string;
  slug: string;
  customerEmail: string;
  customerName?: string | null;
  items: OrderEmailItem[];
  total: number;
  currency: string;
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

  let body: OrderNotificationBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.customerEmail || !body.orderId || !body.kind) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const params = {
    customerEmail: body.customerEmail,
    customerName: body.customerName ?? null,
    businessName: body.businessName,
    slug: body.slug,
    orderId: body.orderId,
    items: body.items || [],
    total: body.total,
    currency: body.currency || 'USD',
  };

  const sent =
    body.kind === 'fulfilled' ? await sendOrderFulfilledEmail(params) : await sendOrderConfirmationEmail(params);

  return NextResponse.json({ sent });
}
