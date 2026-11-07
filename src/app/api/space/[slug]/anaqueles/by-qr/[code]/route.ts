import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

// Resuelve el QR de un anaquel dentro del negocio activo (404 si no existe o es de otro negocio).
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string; code: string }> }) {
  const { slug, code } = await params;
  return proxyAffiliate(req, slug, `/anaqueles/by-qr/${encodeURIComponent(code)}`, 'GET');
}
