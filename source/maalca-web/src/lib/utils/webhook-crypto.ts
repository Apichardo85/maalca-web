import { createHmac, timingSafeEqual, randomUUID } from 'crypto';

export function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) return false;

  const expected = signPayload(payload, secret);
  const sig = signature.replace('sha256=', '');

  if (sig.length !== expected.length) return false;

  return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
}

export function generateCorrelationId(): string {
  return randomUUID();
}
