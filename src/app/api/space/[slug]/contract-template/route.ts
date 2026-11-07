import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

type Ctx = { params: Promise<{ slug: string }> };

// Plantilla del documento de contrato — proxya a /api/affiliates/{id}/contract-template.
export async function GET(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(req, slug, '/contract-template', 'GET');
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(req, slug, '/contract-template', 'PUT');
}

// DELETE = volver a la plantilla base.
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(req, slug, '/contract-template', 'DELETE');
}
