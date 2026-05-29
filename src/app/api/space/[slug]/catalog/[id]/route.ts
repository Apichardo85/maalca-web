import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.MAALCA_API_URL
  ?? process.env.NEXT_PUBLIC_API_BASE_URL
  ?? 'http://localhost:8080';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { slug, id: itemId } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const body = await req.json();

  const apiRes = await fetch(
    `${API}/api/affiliates/${affiliate.id}/catalog-items/${itemId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    },
  );

  const data = await apiRes.json();
  return NextResponse.json(data, { status: apiRes.status });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { slug, id: itemId } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const apiRes = await fetch(
    `${API}/api/affiliates/${affiliate.id}/catalog-items/${itemId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (apiRes.status === 204) return new NextResponse(null, { status: 204 });

  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}
