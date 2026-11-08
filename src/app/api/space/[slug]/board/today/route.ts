import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

// Cobros y entregas de hoy (tablero del dueño).
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return proxyAffiliate(req, slug, '/board/today', 'GET');
}
