import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; screenId: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { slug, screenId } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const body = await req.json();

  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/screens/${screenId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Affiliate-Id': affiliate.id,
    },
    body: JSON.stringify(body),
  });

  const data = await apiRes.json().catch(() => null);
  if (apiRes.ok) revalidateTag(`affiliate:${slug}`);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; screenId: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { slug, screenId } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/screens/${screenId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliate.id },
  });

  if (apiRes.status === 204) {
    revalidateTag(`affiliate:${slug}`);
    return new NextResponse(null, { status: 204 });
  }
  const data = await apiRes.json().catch(() => null);
  if (apiRes.ok) revalidateTag(`affiliate:${slug}`);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}
