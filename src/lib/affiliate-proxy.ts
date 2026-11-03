import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/**
 * Proxy autenticado del dashboard → maalca-api para rutas /api/affiliates/{id}/{path}: resuelve el afiliado
 * por slug, manda Bearer + X-Affiliate-Id y devuelve el status del API tal cual. Mismo patrón que
 * pickup-rules/route.ts, en un solo lugar para las rutas de tienda (listas de precio, envíos, despacho).
 * `revalidatePublic` = la escritura cambia lo que ve la página pública: refresca su caché (tag affiliate:{slug}).
 */
export async function proxyAffiliate(
  slug: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  revalidatePublic = false,
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      'X-Affiliate-Id': affiliate.id,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (revalidatePublic && method !== 'GET' && apiRes.ok) revalidateTag(`affiliate:${slug}`);
  if (apiRes.status === 204) return new NextResponse(null, { status: 204 });
  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}
