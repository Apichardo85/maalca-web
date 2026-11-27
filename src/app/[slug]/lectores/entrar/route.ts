import { NextRequest, NextResponse } from 'next/server';
import { clubPost, publicOrigin, setReaderCookie } from '@/lib/reader-session';

// Enlace para entrar que llega por correo (30 minutos). Sin token o vencido: a la página de lector, que
// tiene el formulario para pedir otro.
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = req.nextUrl.searchParams.get('t');
  const origin = publicOrigin(req);
  if (!t) return NextResponse.redirect(`${origin}/${slug}/lectores`);
  const res = await clubPost(slug, '/verify', { token: t });
  if (!res.ok) return NextResponse.redirect(`${origin}/${slug}/lectores?aviso=vencido`);
  const data = await res.json().catch(() => null);
  const out = NextResponse.redirect(`${origin}/${slug}/lectores?ok=entraste`);
  if (data?.sessionToken) setReaderCookie(out, slug, data.sessionToken);
  return out;
}
