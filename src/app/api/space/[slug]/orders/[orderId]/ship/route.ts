import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/affiliate-proxy';

type Ctx = { params: Promise<{ slug: string; orderId: string }> };

// Despacho manual de un envío: paquetería + número de rastreo (el pedido pasa a Entregado y el cliente lo ve en /t/{token}).
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { slug, orderId } = await params;
  return proxyAffiliate(slug, 'PATCH', `orders/${encodeURIComponent(orderId)}/ship`, await req.json());
}
