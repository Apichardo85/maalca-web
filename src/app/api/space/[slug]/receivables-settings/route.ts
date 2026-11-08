import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

type Ctx = { params: Promise<{ slug: string }> };

// Ajustes de cobros e impuestos de las facturas de reparto: antigüedad de saldos (emisión/vencimiento) e ITBIS.
export async function GET(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(req, slug, '/receivables-settings', 'GET');
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(req, slug, '/receivables-settings', 'PUT');
}
