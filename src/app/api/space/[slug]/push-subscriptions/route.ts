import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

async function forward(req: NextRequest, params: Promise<{ slug: string }>, suffix: string) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { slug } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/push-subscriptions${suffix}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliate.id },
    body: JSON.stringify(body),
  });
  if (apiRes.status === 204) return new NextResponse(null, { status: 204 });
  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}

/** Registra este navegador para Web Push: { endpoint, p256dh, auth, lang }. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return forward(req, params, '');
}

/** Quita este navegador: { endpoint }. */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return forward(req, params, '/remove');
}
