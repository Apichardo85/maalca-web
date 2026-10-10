import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Webhook de Resend (email.delivered / opened / clicked / bounced ...).
 * Verifica la firma Svix con RESEND_WEBHOOK_SECRET (whsec_...) y reenvía el evento a maalca-api,
 * que lo guarda (tabla EmailEvents) con idempotencia por svix-id.
 *
 * Requiere en Resend: Open/Click tracking activos en el dominio + webhook apuntando a
 * https://maalca.com/api/webhooks/resend. Variables: RESEND_WEBHOOK_SECRET, INTERNAL_NOTIFICATIONS_SECRET,
 * NEXT_PUBLIC_API_BASE_URL como en el resto de rutas internas.
 */
export const runtime = 'nodejs';

const TOLERANCE_SECONDS = 5 * 60;

function verifySvix(rawBody: string, headers: Headers, secret: string): boolean {
  const id = headers.get('svix-id');
  const timestamp = headers.get('svix-timestamp');
  const signatureHeader = headers.get('svix-signature');
  if (!id || !timestamp || !signatureHeader) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > TOLERANCE_SECONDS) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = crypto.createHmac('sha256', key).update(`${id}.${timestamp}.${rawBody}`).digest('base64');
  const expectedBuf = Buffer.from(expected);

  // Header: "v1,<sig> v1,<sig2>" (puede traer varias firmas durante rotación de secreto).
  return signatureHeader.split(' ').some((part) => {
    const [version, sig] = part.split(',');
    if (version !== 'v1' || !sig) return false;
    const sigBuf = Buffer.from(sig);
    return sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
  });
}

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET || '';
  if (!secret) {
    return NextResponse.json({ error: 'RESEND_WEBHOOK_SECRET not configured' }, { status: 503 });
  }

  const rawBody = await request.text();
  if (!verifySvix(rawBody, request.headers, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: {
    type?: string;
    created_at?: string;
    data?: {
      email_id?: string;
      to?: string[] | string;
      subject?: string;
      click?: { link?: string };
      created_at?: string;
    };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const type = event.type || '';
  if (!type.startsWith('email.')) return NextResponse.json({ ok: true, ignored: true });

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const internalSecret = process.env.INTERNAL_NOTIFICATIONS_SECRET || '';
  if (!apiBase || !internalSecret) {
    console.error('[ResendWebhook] NEXT_PUBLIC_API_BASE_URL / INTERNAL_NOTIFICATIONS_SECRET missing');
    return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  }

  const to = Array.isArray(event.data?.to) ? event.data?.to[0] : event.data?.to;
  const payload = {
    svixId: request.headers.get('svix-id'),
    eventType: type,
    resendEmailId: event.data?.email_id ?? null,
    toEmail: to ?? null,
    subject: event.data?.subject ?? null,
    clickedUrl: event.data?.click?.link ?? null,
    occurredAt: event.created_at ?? event.data?.created_at ?? null,
  };

  const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/internal/email-events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Internal-Secret': internalSecret },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error('[ResendWebhook] API rejected event', type, res.status);
    // 5xx para que Resend reintente.
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
