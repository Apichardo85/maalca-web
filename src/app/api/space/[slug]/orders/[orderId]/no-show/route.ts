import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
type Ctx = { params: Promise<{ slug: string; orderId: string }> };

// "No vino": PATCH marca el pedido (cancelado + el cliente suma un No vino); DELETE lo deshace.
async function proxy(method: 'PATCH' | 'DELETE', { params }: Ctx) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { slug, orderId } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/orders/${orderId}/no-show`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliate.id },
  });
  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}

export async function PATCH(_req: NextRequest, ctx: Ctx) {
  return proxy('PATCH', ctx);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  return proxy('DELETE', ctx);
}
