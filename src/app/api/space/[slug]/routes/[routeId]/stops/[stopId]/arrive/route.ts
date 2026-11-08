import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string; routeId: string; stopId: string }> }) {
  const { slug, routeId, stopId } = await params;
  return proxyAffiliate(req, slug, `/routes/${routeId}/stops/${stopId}/arrive`, 'POST');
}
