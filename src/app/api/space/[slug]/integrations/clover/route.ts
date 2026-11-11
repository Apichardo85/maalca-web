import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/affiliate-proxy';

type Ctx = { params: Promise<{ slug: string }> };

// Conexión con Clover (solo lectura): el token lo guarda el API cifrado y nunca vuelve; aquí solo viajan los últimos 4.
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(slug, 'GET', 'integrations/clover');
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(slug, 'PUT', 'integrations/clover', await req.json());
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(slug, 'DELETE', 'integrations/clover');
}
