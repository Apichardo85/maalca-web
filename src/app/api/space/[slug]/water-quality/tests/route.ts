import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

type Ctx = { params: Promise<{ slug: string }> };

// Acepta ?year=.
export async function GET(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(req, slug, '/water-quality/tests', 'GET');
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(req, slug, '/water-quality/tests', 'POST');
}
