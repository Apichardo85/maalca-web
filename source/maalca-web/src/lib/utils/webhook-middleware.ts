import { NextRequest, NextResponse } from 'next/server';
import { validateWebhookSignature } from './webhook-crypto';
import { getN8nConfig } from '@/lib/config/n8n-config';

export interface WebhookValidationResult {
  valid: boolean;
  error?: string;
  body?: unknown;
  rawBody?: string;
}

export async function validateInboundWebhook(
  request: NextRequest
): Promise<WebhookValidationResult> {
  const { webhookSecret } = getN8nConfig();

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return { valid: false, error: 'Failed to read request body' };
  }

  if (!rawBody) {
    return { valid: false, error: 'Empty request body' };
  }

  // Validate signature if secret is configured
  if (webhookSecret) {
    const signature = request.headers.get('x-webhook-signature') || '';
    if (!validateWebhookSignature(rawBody, signature, webhookSecret)) {
      return { valid: false, error: 'Invalid webhook signature' };
    }
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return { valid: false, error: 'Invalid JSON body' };
  }

  return { valid: true, body, rawBody };
}

export function webhookResponse(status: number, data: unknown): NextResponse {
  return NextResponse.json(data, { status });
}
