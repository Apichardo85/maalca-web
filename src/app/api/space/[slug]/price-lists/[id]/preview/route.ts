import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/affiliate-proxy';

type Ctx = { params: Promise<{ slug: string; id: string }> };

// Precio público vs precio con la lista (mismo motor que el pedido en el API).
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { slug, id } = await params;
  return proxyAffiliate(slug, 'GET', `price-lists/${encodeURIComponent(id)}/preview`);
}
