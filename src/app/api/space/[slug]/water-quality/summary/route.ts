import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return proxyAffiliate(req, slug, '/water-quality/summary', 'GET');
}
