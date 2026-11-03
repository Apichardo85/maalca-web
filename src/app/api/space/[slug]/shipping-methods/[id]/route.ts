import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/affiliate-proxy';

type Ctx = { params: Promise<{ slug: string; id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { slug, id } = await params;
  return proxyAffiliate(slug, 'PUT', `shipping-methods/${encodeURIComponent(id)}`, await req.json(), true);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { slug, id } = await params;
  return proxyAffiliate(slug, 'DELETE', `shipping-methods/${encodeURIComponent(id)}`, undefined, true);
}
