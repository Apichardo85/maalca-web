import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/affiliate-proxy';

type Ctx = { params: Promise<{ slug: string }> };

// Métodos de envío del negocio. Viajan en el catálogo público (checkout): las escrituras refrescan la página.
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(slug, 'GET', 'shipping-methods');
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(slug, 'POST', 'shipping-methods', await req.json(), true);
}
