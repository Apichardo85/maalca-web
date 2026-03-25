import { NextRequest } from 'next/server';
import { validateInboundWebhook, webhookResponse } from '@/lib/utils/webhook-middleware';
import type { N8nInboundWebhook } from '@/lib/types/n8n.types';

export async function POST(request: NextRequest) {
  const validation = await validateInboundWebhook(request);

  if (!validation.valid) {
    return webhookResponse(401, { error: validation.error });
  }

  const webhook = validation.body as N8nInboundWebhook;

  console.log(`[webhook/n8n] Received: ${webhook.event} for tenant ${webhook.tenantId}`);

  // Route by event type
  switch (webhook.event) {
    case 'order.status_update':
    case 'reservation.confirmed':
    case 'appointment.confirmed':
    case 'notification.push':
      console.log(`[webhook/n8n] Processing ${webhook.event}:`, JSON.stringify(webhook.data).slice(0, 200));
      break;
    default:
      console.log(`[webhook/n8n] Unhandled event: ${webhook.event}`);
  }

  return webhookResponse(200, {
    received: true,
    event: webhook.event,
    timestamp: new Date().toISOString(),
  });
}

export async function OPTIONS() {
  return webhookResponse(200, {});
}
