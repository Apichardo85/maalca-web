import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

type Ctx = { params: Promise<{ slug: string }> };

// Rutas fijas (plantillas que crean la ruta del día solas). Solo administración. Acepta ?includeInactive=true.
export async function GET(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(req, slug, '/route-templates', 'GET');
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(req, slug, '/route-templates', 'POST');
}
