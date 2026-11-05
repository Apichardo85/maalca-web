import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/affiliate-proxy';

// Ficha del cliente: estadísticas, productos más comprados, pedidos con líneas y su cuenta mayorista.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  return proxyAffiliate(slug, 'GET', `customers/${encodeURIComponent(id)}/insights`);
}
