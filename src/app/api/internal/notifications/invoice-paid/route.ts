import { NextRequest, NextResponse } from 'next/server';
import { sendInvoiceReceiptEmail } from '@/lib/services/resend-service';

/**
 * Mismo patrón que /api/internal/notifications/invoice: maalca-api (C#) llama acá cuando una
 * factura pasa a "Paid" de forma manual (cash/transferencia/Zelle vía "Marcar pagada" en el
 * dashboard — ver InvoiceService.UpdateInvoiceAsync). No se dispara en pagos por Stripe Checkout,
 * que ya traen su propio recibo automático de Stripe. Protegido por el mismo secreto compartido.
 */
interface InvoicePaidNotificationBody {
  customerEmail: string;
  customerName?: string | null;
  businessName: string;
  logoUrl?: string | null;
  brandColor?: string | null;
  invoiceNumber: string;
  total: number;
  currency: string;
  paidDate?: string | null;
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

  let body: InvoicePaidNotificationBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.customerEmail || !body.invoiceNumber) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const sent = await sendInvoiceReceiptEmail({
    customerEmail: body.customerEmail,
    customerName: body.customerName ?? null,
    businessName: body.businessName,
    invoiceNumber: body.invoiceNumber,
    total: body.total,
    currency: body.currency,
    paidDate: body.paidDate ?? null,
    brand: { name: body.businessName, logoUrl: body.logoUrl ?? null, color: body.brandColor ?? null },
  });

  return NextResponse.json({ sent });
}
