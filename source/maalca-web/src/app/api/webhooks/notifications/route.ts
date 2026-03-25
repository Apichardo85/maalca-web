import { NextRequest } from 'next/server';
import { validateInboundWebhook, webhookResponse } from '@/lib/utils/webhook-middleware';
import type { DashboardNotification } from '@/lib/types/n8n.types';

export async function POST(request: NextRequest) {
  const validation = await validateInboundWebhook(request);

  if (!validation.valid) {
    return webhookResponse(401, { error: validation.error });
  }

  const notification = validation.body as DashboardNotification;

  console.log(`[webhook/notifications] ${notification.type}: ${notification.title} (tenant: ${notification.tenantId})`);

  return webhookResponse(200, {
    received: true,
    notificationId: notification.id,
  });
}
