import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Genera/regenera el PIN de ponche de un miembro del equipo (gestión de equipo — workforce).
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; memberId: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { slug, memberId } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/team/${memberId}/pin`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliate.id },
  });

  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}
