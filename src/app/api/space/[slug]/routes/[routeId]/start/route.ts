import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string; routeId: string }> }) {
  const { slug, routeId } = await params;
  return proxyAffiliate(req, slug, `/routes/${routeId}/start`, 'POST');
}
