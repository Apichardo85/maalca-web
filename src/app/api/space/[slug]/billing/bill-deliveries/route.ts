import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

// dryRun=true (por defecto en el API) simula; dryRun=false crea las facturas.
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return proxyAffiliate(req, slug, '/billing/bill-deliveries', 'POST');
}
