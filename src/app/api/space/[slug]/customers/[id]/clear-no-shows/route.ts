import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/affiliate-proxy';

// Ficha del cliente: quita las marcas "No vino" para que pueda volver a pedir pagando al recoger.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  return proxyAffiliate(slug, 'POST', `customers/${encodeURIComponent(id)}/clear-no-shows`);
}
