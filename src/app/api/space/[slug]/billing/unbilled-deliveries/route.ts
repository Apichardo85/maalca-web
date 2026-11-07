import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

// Entregas con productos sin facturar, por cliente (para "Facturar ciclo").
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return proxyAffiliate(req, slug, '/billing/unbilled-deliveries', 'GET');
}
