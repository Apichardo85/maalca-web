import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Cambiar estado de una entrada de la fila (llamar, atender, completar, no-show) — el backend
// espera status/barberId como query string, no body (ver Program.cs, MapPatch de /queue/{id}).
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { slug, id } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const qs = req.nextUrl.search;

  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/queue/${id}${qs}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliate.id },
  });

  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}
