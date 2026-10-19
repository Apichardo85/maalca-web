import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/** Proxy común de los muros de pantallas → maalca-api /api/affiliates/{id}/screen-walls{path}.
 *  Mismo patrón que screens/screen-ads. En escrituras exitosas revalida el board público
 *  (ISR 30 s, tag affiliate:{slug}) para que una TV recién creada abra al instante; las TVs
 *  que ya están corriendo toman el cambio en su próximo poll (≤ 60 s). */
export async function proxyWalls(slug: string, method: string, path = '', body?: unknown) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/screen-walls${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      'X-Affiliate-Id': affiliate.id,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (method !== 'GET' && apiRes.ok) revalidateTag(`affiliate:${slug}`);
  if (apiRes.status === 204) return new NextResponse(null, { status: 204 });
  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? (method === 'GET' ? [] : {}), { status: apiRes.status });
}
