import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

/**
 * Endpoint interno server-to-server: maalca-api (C#) llama aquí cuando hay un aviso nuevo para el
 * dueño (pedido, reserva, cita, factura pagada, propuesta aceptada) y manda las suscripciones de
 * Web Push de ese negocio. Aquí vive la librería web-push y las llaves VAPID; el API solo guarda
 * avisos y suscripciones. Mismo patrón de secreto compartido que el resto de /internal/notifications.
 * Responde { sent, expired } — `expired` son los endpoints que el servicio de push dio por muertos
 * (404/410) para que el API los borre.
 */
interface PushBody {
  subscriptions: Array<{ endpoint: string; p256dh: string; auth: string; lang?: string }>;
  message: {
    type: string;
    title: string;
    body?: string | null;
    titleEn: string;
    bodyEn?: string | null;
    slug?: string | null;
    url?: string | null;
    /** Ruta absoluta que abre el clic (p. ej. /t/{token} para el cliente); si falta se arma /space/{slug}/{url}. */
    path?: string | null;
  };
}

export async function POST(request: NextRequest) {
  const secret = process.env.INTERNAL_NOTIFICATIONS_SECRET || '';
  if (!secret) {
    return NextResponse.json({ error: 'INTERNAL_NOTIFICATIONS_SECRET not configured' }, { status: 503 });
  }
  if ((request.headers.get('x-internal-secret') || '') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  const privateKey = process.env.VAPID_PRIVATE_KEY || '';
  const subject = process.env.VAPID_SUBJECT || 'mailto:hola@maalca.com';
  if (!publicKey || !privateKey) {
    // Sin llaves el push simplemente no sale; los badges y la campana siguen funcionando.
    return NextResponse.json({ sent: 0, expired: [], skipped: 'vapid_not_configured' });
  }

  let body: PushBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!Array.isArray(body.subscriptions) || !body.message?.title) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const { message } = body;
  const path = message.path
    ? message.path
    : message.url ? `/space/${message.slug}/${message.url}` : `/space/${message.slug}`;

  let sent = 0;
  const expired: string[] = [];

  await Promise.all(
    body.subscriptions.map(async (sub) => {
      const en = sub.lang === 'en';
      const payload = JSON.stringify({
        title: en ? message.titleEn : message.title,
        body: (en ? message.bodyEn : message.body) ?? '',
        url: path,
        // Mismo tag por tipo: varios pedidos seguidos se reemplazan en la bandeja en vez de apilarse.
        tag: `maalca-${message.type}`,
      });
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
          { TTL: 60 * 60 },
        );
        sent += 1;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) expired.push(sub.endpoint);
      }
    }),
  );

  return NextResponse.json({ sent, expired });
}
