import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/affiliate-proxy';

type Ctx = { params: Promise<{ slug: string; id: string }> };

// Asignar (o quitar) esta lista de precios a varios clientes de una vez.
export async function POST(req: NextRequest, { params }: Ctx) {
  const { slug, id } = await params;
  return proxyAffiliate(slug, 'POST', `price-lists/${id}/customers`, await req.json());
}
