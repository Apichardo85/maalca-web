import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

type Ctx = { params: Promise<{ slug: string; routeId: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { slug, routeId } = await params;
  return proxyAffiliate(req, slug, `/routes/${routeId}`, 'GET');
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { slug, routeId } = await params;
  return proxyAffiliate(req, slug, `/routes/${routeId}`, 'PUT');
}
