import { NextRequest } from 'next/server';
import { proxyWalls } from '../../_proxy';

// Reacomodo de las TVs del muro (intercambiar posiciones).
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string; wallId: string }> }) {
  const { slug, wallId } = await params;
  return proxyWalls(slug, 'PUT', `/${encodeURIComponent(wallId)}/slots`, await req.json());
}
