import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

// Rutas en curso con su última posición (tablero del dueño).
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return proxyAffiliate(req, slug, '/routes/live', 'GET');
}
