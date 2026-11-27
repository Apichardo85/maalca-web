import { NextRequest, NextResponse } from 'next/server';
import { clubPost, publicOrigin, readerToken, setReaderCookie } from '@/lib/reader-session';

// Regreso del Checkout de la membresía. No espera al webhook: le pide al API que lea el Checkout en Stripe y
// active la membresía ya. Si el lector nació en este pago, también queda con su sesión.
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sessionId = req.nextUrl.searchParams.get('session_id') ?? '';
  const origin = publicOrigin(req);
  const token = await readerToken(slug);
  const res = await clubPost(slug, '/membership/sync', { sessionId }, token);
  const data = res.ok ? await res.json().catch(() => null) : null;
  const ok = data?.active === true;
  const signedIn = Boolean(token || data?.sessionToken);
  const out = NextResponse.redirect(`${origin}/${slug}/lectores?ok=${ok ? (signedIn ? 'miembro' : 'miembro_entrar') : 'pago_pendiente'}`);
  if (data?.sessionToken) setReaderCookie(out, slug, data.sessionToken);
  return out;
}
