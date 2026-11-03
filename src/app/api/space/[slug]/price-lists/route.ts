import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/affiliate-proxy';

type Ctx = { params: Promise<{ slug: string }> };

// Listas de precio del negocio (Miembro, Mayorista…).
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(slug, 'GET', 'price-lists');
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  return proxyAffiliate(slug, 'POST', 'price-lists', await req.json());
}
