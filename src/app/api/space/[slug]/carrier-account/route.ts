import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/affiliate-proxy';

type Ctx = { params: Promise<{ slug: string }> };

// Cuenta de etiquetas (United Bridge): la API key la guarda el API cifrada y nunca vuelve; aquí solo viajan los últimos 4.
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(slug, 'GET', 'carrier-account');
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(slug, 'PUT', 'carrier-account', await req.json());
}
