import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

type Ctx = { params: Promise<{ slug: string; invoiceId: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { slug, invoiceId } = await params;
  return proxyAffiliate(req, slug, `/fiscal/invoices/${invoiceId}`, 'GET');
}
