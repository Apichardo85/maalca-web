import { NextRequest, NextResponse } from 'next/server';
import { API_BASE, clearReaderCookie, clubPost, publicOrigin, readerToken } from '@/lib/reader-session';

// Acciones del lector desde el navegador (club del autor, ver ReaderClub.cs en maalca-api). El navegador nunca
// toca el token: este handler lee la cookie httpOnly y la reenvía al API.
//   POST subscribe   { email, name?, language?, workSlug? }   → cartas (doble opt-in)
//   POST login       { email, language? }                     → enlace para entrar
//   POST unsubscribe { token }                                → baja de las cartas (desde /lectores/baja)
//   POST progress    { workSlug, chapterNumber }              → "seguir leyendo" (204 / 401 sin sesión)
//   POST checkout    { email?, language? }                    → URL del Checkout de la membresía
//   POST portal      {}                                       → URL del portal de Stripe (cancelar, tarjeta)
//   POST logout      {}                                       → borra la cookie
//   GET  me                                                   → estado del lector (200 / 401)

type Ctx = { params: Promise<{ slug: string; action: string }> };

async function relay(res: Response) {
  if (res.status === 204) return new NextResponse(null, { status: 204 });
  const data = await res.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: res.status });
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { slug, action } = await params;
  if (action !== 'me') return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const token = await readerToken(slug);
  if (!token) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  const res = await fetch(`${API_BASE}/api/public/affiliates/${encodeURIComponent(slug)}/readers/me`, {
    headers: { 'X-Reader-Token': token },
    cache: 'no-store',
  });
  return relay(res);
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { slug, action } = await params;
  const body = await req.json().catch(() => ({}));
  const token = await readerToken(slug);

  switch (action) {
    case 'subscribe':
      return relay(await clubPost(slug, '', {
        email: body.email, name: body.name ?? null, language: body.language ?? null, workSlug: body.workSlug ?? null, source: body.source ?? null,
        // Campo trampa: viaja tal cual; el API descarta el alta si trae texto.
        website: typeof body.website === 'string' ? body.website : null,
      }));
    case 'login':
      return relay(await clubPost(slug, '/login', { email: body.email, language: body.language ?? null }));
    case 'unsubscribe':
      return relay(await clubPost(slug, '/unsubscribe', { token: String(body.token ?? '') }));
    case 'progress': {
      if (!token) return new NextResponse(null, { status: 401 });
      const res = await fetch(`${API_BASE}/api/public/affiliates/${encodeURIComponent(slug)}/readers/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Reader-Token': token },
        body: JSON.stringify({ workSlug: body.workSlug, chapterNumber: Number(body.chapterNumber) }),
        cache: 'no-store',
      });
      return relay(res);
    }
    case 'checkout': {
      const origin = publicOrigin(req);
      return relay(await clubPost(slug, '/membership/checkout', {
        email: body.email ?? null,
        language: body.language ?? null,
        successUrl: `${origin}/${slug}/lectores/membresia?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/${slug}/lectores?membresia=cancelada`,
      }, token));
    }
    case 'portal': {
      if (!token) return NextResponse.json({ error: 'no_session' }, { status: 401 });
      const origin = publicOrigin(req);
      return relay(await clubPost(slug, '/membership/portal', { returnUrl: `${origin}/${slug}/lectores` }, token));
    }
    case 'logout': {
      const res = NextResponse.json({ ok: true });
      clearReaderCookie(res, slug);
      return res;
    }
    default:
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
}
