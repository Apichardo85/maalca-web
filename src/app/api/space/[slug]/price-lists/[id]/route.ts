import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/affiliate-proxy';

type Ctx = { params: Promise<{ slug: string; id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { slug, id } = await params;
  return proxyAffiliate(slug, 'PUT', `price-lists/${encodeURIComponent(id)}`, await req.json());
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { slug, id } = await params;
  return proxyAffiliate(slug, 'DELETE', `price-lists/${encodeURIComponent(id)}`);
}
