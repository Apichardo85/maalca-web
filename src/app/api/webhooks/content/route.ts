import { NextRequest } from 'next/server';
import { validateInboundWebhook, webhookResponse } from '@/lib/utils/webhook-middleware';
import type { N8nInboundWebhook } from '@/lib/types/n8n.types';

export async function POST(request: NextRequest) {
  const validation = await validateInboundWebhook(request);

  if (!validation.valid) {
    return webhookResponse(401, { error: validation.error });
  }

  const webhook = validation.body as N8nInboundWebhook;

  console.log(`[webhook/content] Received: ${webhook.event} for brand ${webhook.tenantId}`);

  switch (webhook.event) {
    case 'content.script.generated':
      console.log(`[webhook/content] Script generated for ${webhook.tenantId}`);
      break;
    case 'content.voice.generated':
      console.log(`[webhook/content] Voice generated for ${webhook.tenantId}`);
      break;
    case 'content.video.generated':
      console.log(`[webhook/content] Video generated for ${webhook.tenantId}`);
      break;
    case 'content.published':
      console.log(`[webhook/content] Content published for ${webhook.tenantId}`);
      break;
    case 'content.analytics.updated':
      console.log(`[webhook/content] Analytics updated for ${webhook.tenantId}`);
      break;
    case 'content.viral.detected':
      console.log(`[webhook/content] VIRAL detected for ${webhook.tenantId}:`, JSON.stringify(webhook.data).slice(0, 200));
      break;
    default:
      console.log(`[webhook/content] Unhandled event: ${webhook.event}`);
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
