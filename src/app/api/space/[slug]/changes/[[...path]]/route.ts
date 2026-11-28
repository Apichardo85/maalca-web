import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

type Ctx = { params: Promise<{ slug: string; path?: string[] }> };

/** Historial de cambios del negocio: /api/space/{slug}/changes/* → maalca-api /api/affiliates/{id}/changes/*. */
async function forward(req: NextRequest, { params }: Ctx, method: 'GET' | 'POST') {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { slug, path = [] } = await params;
  if (path.some((p) => !/^[A-Za-z0-9-]+$/.test(p))) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const suffix = path.length ? `/${path.join('/')}` : '';
  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/changes${suffix}${req.nextUrl.search}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliate.id },
    body: method === 'POST' ? JSON.stringify(await req.json().catch(() => ({}))) : undefined,
    cache: 'no-store',
  });
  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}

export function GET(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx, 'GET');
}

export function POST(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx, 'POST');
}
