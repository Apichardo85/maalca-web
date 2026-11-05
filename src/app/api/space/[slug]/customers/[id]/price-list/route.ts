import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/affiliate-proxy';

// POS: precios de la lista del cliente elegido (204 = no tiene lista activa → precio normal).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  return proxyAffiliate(slug, 'GET', `customers/${encodeURIComponent(id)}/price-list`);
}
