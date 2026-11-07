import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

type Ctx = { params: Promise<{ slug: string; id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { slug, id } = await params;
  return proxyAffiliate(req, slug, `/contracts/${id}`, 'PUT');
}

// "Borrar" un contrato = desactivarlo (el API lo deja en el historial con su fecha de fin).
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { slug, id } = await params;
  return proxyAffiliate(req, slug, `/contracts/${id}`, 'DELETE');
}
