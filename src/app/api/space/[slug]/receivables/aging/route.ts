import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

// Antigüedad de saldos de todos los clientes — proxya a /api/affiliates/{id}/receivables/aging.
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return proxyAffiliate(req, slug, '/receivables/aging', 'GET');
}
