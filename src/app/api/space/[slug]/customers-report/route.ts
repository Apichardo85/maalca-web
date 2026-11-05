import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/affiliate-proxy';

// Reporte de ventas por cliente en un rango (from/to = YYYY-MM-DD, opcionales).
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const qs = new URLSearchParams();
  const from = req.nextUrl.searchParams.get('from');
  const to = req.nextUrl.searchParams.get('to');
  if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) qs.set('from', from);
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) qs.set('to', to);
  return proxyAffiliate(slug, 'GET', `customers-report${qs.size ? `?${qs}` : ''}`);
}
