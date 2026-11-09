import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/affiliate-proxy';

type Ctx = { params: Promise<{ slug: string }> };

// Clientes del negocio y en qué lista de precios está cada uno. Sin listId devuelve todos (buscador al asignar).
export async function GET(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  const from = req.nextUrl.searchParams;
  const qs = new URLSearchParams();
  for (const key of ['listId', 'q', 'take']) {
    const value = from.get(key);
    if (value) qs.set(key, value);
  }
  const suffix = qs.toString();
  return proxyAffiliate(slug, 'GET', `price-lists/customers${suffix ? `?${suffix}` : ''}`);
}
