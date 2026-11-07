import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

// Rutas de hoy del conductor que consulta (PWA).
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return proxyAffiliate(req, slug, '/routes/mine', 'GET');
}
