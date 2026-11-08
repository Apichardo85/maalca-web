import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

type Ctx = { params: Promise<{ slug: string }> };

// Acepta ?from=&to=&category=.
export async function GET(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(req, slug, '/expenses', 'GET');
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(req, slug, '/expenses', 'POST');
}
