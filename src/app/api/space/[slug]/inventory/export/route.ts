import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Exporta el inventario completo como CSV descargable — carga inicial/backup manual.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { slug } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/inventory/export`, {
    headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliate.id },
    cache: 'no-store',
  });

  if (!apiRes.ok) return NextResponse.json({ error: 'export_failed' }, { status: apiRes.status });

  const csv = await apiRes.text();
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="inventario-${slug}.csv"`,
    },
  });
}
