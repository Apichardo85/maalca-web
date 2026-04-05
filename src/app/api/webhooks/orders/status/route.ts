import { NextRequest } from 'next/server';
import { validateInboundWebhook, webhookResponse } from '@/lib/utils/webhook-middleware';
import type { OrderStatusUpdate } from '@/lib/types/n8n.types';

export async function POST(request: NextRequest) {
  const validation = await validateInboundWebhook(request);

  if (!validation.valid) {
    return webhookResponse(401, { error: validation.error });
  }

  const update = (validation.body as { data: OrderStatusUpdate }).data || validation.body;

  console.log(`[webhook/orders/status] Order ${(update as OrderStatusUpdate).orderId}: ${(update as OrderStatusUpdate).status}`);

  return webhookResponse(200, {
    received: true,
    orderId: (update as OrderStatusUpdate).orderId,
    status: (update as OrderStatusUpdate).status,
  });
}
