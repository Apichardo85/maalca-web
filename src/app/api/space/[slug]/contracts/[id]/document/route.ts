import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

// Contrato con la plantilla ya llenada, listo para imprimir.
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  return proxyAffiliate(req, slug, `/contracts/${id}/document`, 'GET');
}
