import { NextRequest, NextResponse } from 'next/server';
import { sendInvoicePaymentLinkEmail } from '@/lib/services/resend-service';

/**
 * Mismo patrón que /api/internal/notifications/appointment: maalca-api (C#) llama acá cuando se
 * genera un link de cobro real (Stripe Checkout) para una factura y el cliente tiene email
 * guardado, para reusar la infraestructura de Resend de maalca-web en vez de duplicarla en el
 * backend .NET. Protegido por el mismo secreto compartido.
 */
interface InvoiceNotificationBody {
  customerEmail: string;
  customerName?: string | null;
  businessName: string;
  invoiceNumber: string;
  total: number;
  currency: string;
  paymentLink: string;
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

  let body: InvoiceNotificationBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.customerEmail || !body.invoiceNumber || !body.paymentLink) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const sent = await sendInvoicePaymentLinkEmail({
    customerEmail: body.customerEmail,
    customerName: body.customerName ?? null,
    businessName: body.businessName,
    invoiceNumber: body.invoiceNumber,
    total: body.total,
    currency: body.currency,
    paymentLink: body.paymentLink,
  });

  return NextResponse.json({ sent });
}
