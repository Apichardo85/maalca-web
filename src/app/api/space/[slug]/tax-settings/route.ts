import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/affiliate-proxy';

type Ctx = { params: Promise<{ slug: string }> };

// Impuesto de venta del negocio (tasa % y si grava el envío). Viaja en el catálogo público: refresca la página.
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(slug, 'GET', 'tax-settings');
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(slug, 'PUT', 'tax-settings', await req.json(), true);
}
