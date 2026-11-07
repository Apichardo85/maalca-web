import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string; anaquelId: string }> }) {
  const { slug, anaquelId } = await params;
  return proxyAffiliate(req, slug, `/anaqueles/${anaquelId}`, 'PUT');
}
