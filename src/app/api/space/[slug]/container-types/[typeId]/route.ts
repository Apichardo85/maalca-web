import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string; typeId: string }> }) {
  const { slug, typeId } = await params;
  return proxyAffiliate(req, slug, `/container-types/${typeId}`, 'PUT');
}
