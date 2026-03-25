import { NextRequest, NextResponse } from 'next/server';
import { n8nService } from '@/lib/services/n8n-service';
import { generateCorrelationId } from '@/lib/utils/webhook-crypto';
import type { OrderPayload } from '@/lib/types/n8n.types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const order: OrderPayload = {
      orderId: generateCorrelationId(),
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      items: body.items || [],
      subtotal: body.subtotal || 0,
      tax: body.tax || 0,
      total: body.total || 0,
      notes: body.notes,
      whatsappNumber: body.whatsappNumber || '16078574226',
    };

    const tenantId = body.tenantId || 'the-little-dominican';

    // Fire-and-forget to n8n — don't block the response
    n8nService.sendOrder(tenantId, order).catch((err) => {
      console.error('[api/orders/create] n8n forwarding failed:', err);
    });

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      message: 'Orden recibida',
    });
  } catch (err) {
    console.error('[api/orders/create] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Error procesando la orden' },
      { status: 500 }
    );
  }
}
