import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Inscripciones de Comunidad (voluntarios y eventos) -- proxy del panel, mismo patron que /activities.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { slug } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const qs = new URLSearchParams();
  const kind = req.nextUrl.searchParams.get('kind');
  const status = req.nextUrl.searchParams.get('status');
  if (kind) qs.set('kind', kind);
  if (status) qs.set('status', status);
  const suffix = qs.toString();

  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/signups${suffix ? `?${suffix}` : ''}`, {
    headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliate.id },
    cache: 'no-store',
  });

  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? [], { status: apiRes.status });
}
