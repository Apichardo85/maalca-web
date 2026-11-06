import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/affiliate-proxy';

type Ctx = { params: Promise<{ slug: string; orderId: string }> };

// Costo real de la etiqueta de un pedido (no compra nada).
export async function POST(req: NextRequest, { params }: Ctx) {
  const { slug, orderId } = await params;
  const body = await req.json().catch(() => ({}));
  return proxyAffiliate(slug, 'POST', `orders/${encodeURIComponent(orderId)}/label-quote`, body);
}
