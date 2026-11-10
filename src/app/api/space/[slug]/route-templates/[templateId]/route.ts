import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

type Ctx = { params: Promise<{ slug: string; templateId: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { slug, templateId } = await params;
  return proxyAffiliate(req, slug, `/route-templates/${templateId}`, 'PUT');
}
