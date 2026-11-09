import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/affiliate-proxy';

type Ctx = { params: Promise<{ slug: string }> };

// Cuántos clientes tiene cada lista de precios (y cuántos quedan a precio público).
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(slug, 'GET', 'price-lists/customer-counts');
}
