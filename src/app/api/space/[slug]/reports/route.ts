import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Reportes ampliados de Estadísticas — proxya a /api/affiliates/{id}/metrics/reports. Existe
// como proxy propio (en vez de que StatsContent llame directo al backend) para poder cambiar el
// rango de días desde el cliente (7/30/90) sin recargar la página server-side completa, mismo
// patrón que cualquier otra pantalla de /space que necesita refetch client-side.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { slug } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const qs = req.nextUrl.search;
  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/metrics/reports${qs}`, {
    headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliate.id },
    cache: 'no-store',
  });

  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}
