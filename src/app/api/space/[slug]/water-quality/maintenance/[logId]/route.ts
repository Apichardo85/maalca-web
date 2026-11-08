import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

type Ctx = { params: Promise<{ slug: string; logId: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { slug, logId } = await params;
  return proxyAffiliate(req, slug, `/water-quality/maintenance/${logId}`, 'PUT');
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { slug, logId } = await params;
  return proxyAffiliate(req, slug, `/water-quality/maintenance/${logId}`, 'DELETE');
}
