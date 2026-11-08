import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

// Utilidad del mes: ?month=aaaa-mm.
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return proxyAffiliate(req, slug, '/reports/profit', 'GET');
}
