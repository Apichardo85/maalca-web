import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
type Ctx = { params: Promise<{ slug: string }> };

// Reglas de confianza para "pagar al recoger" (Pedidos → Reglas).
async function proxy(method: 'GET' | 'PUT', slug: string, body?: unknown) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/pickup-rules`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      'X-Affiliate-Id': affiliate.id,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  // El límite viaja en el catálogo público (aviso en el checkout): refrescar la página del negocio.
  if (method === 'PUT' && apiRes.ok) revalidateTag(`affiliate:${slug}`);
  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxy('GET', slug);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxy('PUT', slug, await req.json());
}
