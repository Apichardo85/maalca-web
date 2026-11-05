import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendAuthEmail } from '@/lib/services/resend-service';

/**
 * Send Email Hook de Supabase Auth.
 *
 * Por qué existe: con la configuración por defecto, el enlace de acceso lo manda Supabase con su
 * plantilla ("Supabase Auth <noreply@mail.app.supabase.io>"), igual para todos los negocios. Un
 * cliente de una tienda recibe un correo sin la marca de esa tienda y desde un dominio que no
 * reconoce. Con este hook, Supabase no envía nada: nos pasa el enlace y lo mandamos nosotros con
 * Resend, con el logo, el color y el nombre del negocio al que está entrando.
 *
 * Configuración en Supabase → Authentication → Hooks → Send Email Hook:
 *   URI:     https://maalca.com/api/auth/email-hook
 *   Secreto: el valor v1,whsec_... que genera Supabase → SUPABASE_AUTH_HOOK_SECRET
 *
 * Firma: Standard Webhooks (mismo esquema que el webhook de Resend, con cabeceras webhook-*).
 */
export const runtime = 'nodejs';

const TOLERANCE_SECONDS = 5 * 60;

/** Rutas de maalca.com que no son el espacio público de un negocio. */
const NOT_A_BUSINESS = new Set([
  'login', 'signup', 'onboarding', 'ops', 'space', 'auth', 'api', 'preview',
  'ecosistema', 'blog', 'contacto', 'legal', 'privacidad', 'terminos',
]);

function verifySignature(rawBody: string, headers: Headers, secret: string): boolean {
  const id = headers.get('webhook-id');
  const timestamp = headers.get('webhook-timestamp');
  const signatureHeader = headers.get('webhook-signature');
  if (!id || !timestamp || !signatureHeader) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > TOLERANCE_SECONDS) return false;

  // Supabase entrega el secreto como "v1,whsec_<base64>"; el material de la clave es el base64.
  const key = Buffer.from(secret.replace(/^v1,/, '').replace(/^whsec_/, ''), 'base64');
  const expected = crypto.createHmac('sha256', key).update(`${id}.${timestamp}.${rawBody}`).digest('base64');
  const expectedBuf = Buffer.from(expected);

  return signatureHeader.split(' ').some((part) => {
    const [version, sig] = part.split(',');
    if (version !== 'v1' || !sig) return false;
    const sigBuf = Buffer.from(sig);
    return sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
  });
}

/** Saca el slug del negocio de la URL de regreso ("https://maalca.com/gift-of-god-fragances?cuenta=1"). */
function slugFromRedirect(redirectTo?: string | null): string | null {
  if (!redirectTo) return null;
  try {
    const first = new URL(redirectTo).pathname.split('/').filter(Boolean)[0];
    if (!first || NOT_A_BUSINESS.has(first.toLowerCase())) return null;
    return /^[a-z0-9][a-z0-9-]*$/i.test(first) ? first : null;
  } catch {
    return null;
  }
}

interface Brand { name: string; logoUrl: string | null; color: string | null; language: 'es' | 'en' }

/** Marca del negocio. Si algo falla se cae a MaalCa: el correo tiene que salir igual. */
async function brandFor(slug: string | null): Promise<Brand | null> {
  if (!slug) return null;
  const api = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!api) return null;
  try {
    const res = await fetch(`${api}/api/public/affiliates/${slug}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const a = await res.json();
    if (!a?.name) return null;
    return {
      name: a.name,
      logoUrl: a.logoUrl ?? null,
      color: a.primaryColor ?? null,
      language: a.language === 'en' ? 'en' : 'es',
    };
  } catch {
    return null;
  }
}

interface HookBody {
  user?: { email?: string | null };
  email_data?: {
    token_hash?: string;
    redirect_to?: string;
    email_action_type?: string;
    site_url?: string;
  };
}

export async function POST(request: NextRequest) {
  const secret = process.env.SUPABASE_AUTH_HOOK_SECRET || '';
  if (!secret) {
    return NextResponse.json({ error: 'SUPABASE_AUTH_HOOK_SECRET not configured' }, { status: 503 });
  }

  const rawBody = await request.text();
  if (!verifySignature(rawBody, request.headers, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let body: HookBody;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = body.user?.email;
  const data = body.email_data;
  if (!email || !data?.token_hash || !data.email_action_type) {
    return NextResponse.json({ error: 'Missing user email or email_data' }, { status: 400 });
  }

  // El enlace de verificación lo arma Supabase a partir del token_hash; el redirect_to decide
  // dónde cae el usuario después de validarlo.
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  if (!supabaseUrl) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_SUPABASE_URL not configured' }, { status: 503 });
  }
  const params = new URLSearchParams({ token: data.token_hash, type: data.email_action_type });
  if (data.redirect_to) params.set('redirect_to', data.redirect_to);
  const confirmUrl = `${supabaseUrl}/auth/v1/verify?${params.toString()}`;

  const brand = await brandFor(slugFromRedirect(data.redirect_to));

  const { sent } = await sendAuthEmail({
    to: email,
    confirmUrl,
    actionType: data.email_action_type,
    brand: brand ? { name: brand.name, logoUrl: brand.logoUrl, color: brand.color } : undefined,
    language: brand?.language ?? 'es',
  });

  // Si el correo no salió hay que devolver error: con el hook activo Supabase ya no manda nada
  // por su cuenta, así que un 200 aquí dejaría al usuario esperando sin enterarse nadie.
  if (!sent) {
    return NextResponse.json({ error: 'Email send failed' }, { status: 500 });
  }
  return NextResponse.json({});
}
