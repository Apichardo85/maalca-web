import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/**
 * Proxy genérico a /api/affiliates/{id}{path} de maalca-api: resuelve el negocio por slug, manda el token y
 * devuelve la respuesta tal cual (incluido el cuerpo de error { error: { code, message } }).
 * Lo usan las rutas de Contratos y cobros; las rutas más viejas siguen con su proxy a mano.
 */
export async function proxyAffiliate(
  req: NextRequest,
  slug: string,
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
): Promise<NextResponse> {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'X-Affiliate-Id': affiliate.id,
  };
  const init: RequestInit = { method, headers, cache: 'no-store' };
  if (method === 'POST' || method === 'PUT') {
    headers['Content-Type'] = 'application/json';
    init.body = await req.text();
  }

  const qs = method === 'GET' ? req.nextUrl.search : '';
  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}${path}${qs}`, init);
  if (apiRes.status === 204) return new NextResponse(null, { status: 204 });

  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}
