import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/affiliate-proxy';

type Ctx = { params: Promise<{ slug: string }> };

// Resumen de ventas del local leído en vivo de Clover. from/to (yyyy-MM-dd) opcionales.
export async function GET(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  const qs = new URLSearchParams();
  for (const k of ['from', 'to']) {
    const v = req.nextUrl.searchParams.get(k);
    if (v && /^\d{4}-\d{2}-\d{2}$/.test(v)) qs.set(k, v);
  }
  return proxyAffiliate(slug, 'GET', `integrations/clover/sales${qs.size ? `?${qs}` : ''}`);
}
