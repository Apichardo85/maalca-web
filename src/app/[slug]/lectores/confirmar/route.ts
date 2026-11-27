import { NextRequest, NextResponse } from 'next/server';
import { clubPost, publicOrigin, setReaderCookie } from '@/lib/reader-session';

// Enlace del correo de confirmación (doble opt-in de las cartas). Confirma, deja la sesión del lector en su
// cookie y lo manda a su página de lector. Un enlace viejo o usado cae ahí mismo con un aviso.
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = req.nextUrl.searchParams.get('t') ?? '';
  const origin = publicOrigin(req);
  const res = await clubPost(slug, '/confirm', { token: t });
  if (!res.ok) return NextResponse.redirect(`${origin}/${slug}/lectores?aviso=enlace`);
  const data = await res.json().catch(() => null);
  const out = NextResponse.redirect(`${origin}/${slug}/lectores?ok=confirmado`);
  if (data?.sessionToken) setReaderCookie(out, slug, data.sessionToken);
  return out;
}
