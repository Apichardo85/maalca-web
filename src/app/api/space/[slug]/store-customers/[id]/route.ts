import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/affiliate-proxy';

type Ctx = { params: Promise<{ slug: string; id: string }> };

// Aprobar / rechazar / asignar lista / notas.
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { slug, id } = await params;
  return proxyAffiliate(slug, 'PATCH', `store-customers/${encodeURIComponent(id)}`, await req.json());
}

// Quitar al miembro de la tienda (sus pedidos se conservan).
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { slug, id } = await params;
  return proxyAffiliate(slug, 'DELETE', `store-customers/${encodeURIComponent(id)}`);
}
