import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// POS (Etapa D, fase 1) — venta presencial registrada desde el dashboard. Proxya a
// POST /api/affiliates/{id}/orders/pos, que entra directo como Paid (el cobro real ya ocurrió
// en el mostrador; esto solo lo deja constando y lo empuja a Kitchen Display).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { slug } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const body = await req.json();

  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/orders/pos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Affiliate-Id': affiliate.id,
    },
    body: JSON.stringify(body),
  });

  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}
