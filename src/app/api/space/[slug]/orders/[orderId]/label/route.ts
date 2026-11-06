import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/affiliate-proxy';

type Ctx = { params: Promise<{ slug: string; orderId: string }> };

// Compra la etiqueta con el agregador del negocio, guarda el rastreo y marca el pedido como enviado.
export async function POST(req: NextRequest, { params }: Ctx) {
  const { slug, orderId } = await params;
  const body = await req.json().catch(() => ({}));
  return proxyAffiliate(slug, 'POST', `orders/${encodeURIComponent(orderId)}/label`, body);
}
