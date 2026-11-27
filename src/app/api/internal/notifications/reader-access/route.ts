import { NextRequest, NextResponse } from 'next/server';
import { sendReaderAccessEmail } from '@/lib/services/reader-mail';

/**
 * maalca-api (ReaderMailer.SendAccessAsync) llama acá para el correo de acceso del club de lectores de un
 * autor: confirmar la suscripción a las cartas o el enlace para entrar. Mismo secreto compartido que el resto
 * de /api/internal/notifications.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.INTERNAL_NOTIFICATIONS_SECRET || '';
  if (!secret) return NextResponse.json({ error: 'INTERNAL_NOTIFICATIONS_SECRET not configured' }, { status: 503 });
  if ((request.headers.get('x-internal-secret') || '') !== secret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.url || !body?.author?.name || (body.kind !== 'confirm' && body.kind !== 'login')) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const sent = await sendReaderAccessEmail({
    kind: body.kind,
    url: String(body.url),
    email: String(body.email),
    name: body.name ?? null,
    language: body.language === 'en' ? 'en' : 'es',
    author: { name: String(body.author.name), slug: String(body.author.slug ?? ''), logoUrl: body.author.logoUrl ?? null, color: body.author.color ?? null, replyTo: body.author.replyTo ?? null },
  });
  return NextResponse.json({ sent }, { status: sent ? 200 : 502 });
}
