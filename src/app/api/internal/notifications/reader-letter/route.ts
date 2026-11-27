import { NextRequest, NextResponse } from 'next/server';
import { sendReaderLetter, type LetterRecipient } from '@/lib/services/reader-mail';

/**
 * maalca-api (ReaderLetterWorker → ReaderMailer.SendLetterAsync) manda aquí un lote de una carta del club de
 * lectores. Responde { sent: [readerId...] } con los que salieron: el API registra la entrega de cada uno y
 * reintenta solo a los que faltan.
 */
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const secret = process.env.INTERNAL_NOTIFICATIONS_SECRET || '';
  if (!secret) return NextResponse.json({ error: 'INTERNAL_NOTIFICATIONS_SECRET not configured' }, { status: 503 });
  if ((request.headers.get('x-internal-secret') || '') !== secret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.subject || !body?.author?.name || !Array.isArray(body?.recipients)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const recipients: LetterRecipient[] = body.recipients
    .filter((r: Partial<LetterRecipient>) => r && typeof r.email === 'string' && typeof r.readerId === 'string')
    .slice(0, 500);

  const sent = await sendReaderLetter({
    subject: String(body.subject),
    bodyHtml: String(body.bodyHtml ?? ''),
    author: { name: String(body.author.name), slug: String(body.author.slug ?? ''), logoUrl: body.author.logoUrl ?? null, color: body.author.color ?? null, replyTo: body.author.replyTo ?? null },
    recipients,
  });
  return NextResponse.json({ sent });
}
