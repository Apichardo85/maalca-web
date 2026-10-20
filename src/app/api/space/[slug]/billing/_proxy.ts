import { NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/** Proxy común de facturación → maalca-api /api/affiliates/{id}/billing{path}. Devuelve el
 *  cuerpo del API tal cual ({ error: { code, message } } en errores) para que el dashboard
 *  muestre el mensaje real y reaccione al code (ALREADY_SUBSCRIBED, NO_SUBSCRIPTION, …). */
export async function proxyBilling(slug: string, method: string, path: string, body?: unknown) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'unauthorized' } }, { status: 401 });

  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'not_found' } }, { status: 404 });

  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/billing${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      'X-Affiliate-Id': affiliate.id,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}
