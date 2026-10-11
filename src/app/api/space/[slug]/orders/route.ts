import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Lista de pedidos del negocio — usado por la Estación de pedidos (StationContent) como
// sondeo de respaldo cada POLL_INTERVAL_MS, por si un evento de SignalR se perdió. Mismo
// origen de datos que orders/page.tsx y kitchen/page.tsx (GET /api/affiliates/{id}/orders),
// solo que accesible desde el cliente (ese fetch original corre en el servidor).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { slug } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/orders`, {
    headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliate.id },
    cache: 'no-store',
  });

  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? [], { status: apiRes.status });
}
