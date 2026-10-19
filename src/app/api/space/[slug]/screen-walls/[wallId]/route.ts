import { NextRequest } from 'next/server';
import { proxyWalls } from '../_proxy';

type Ctx = { params: Promise<{ slug: string; wallId: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { slug, wallId } = await params;
  return proxyWalls(slug, 'PATCH', `/${encodeURIComponent(wallId)}`, await req.json());
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { slug, wallId } = await params;
  return proxyWalls(slug, 'DELETE', `/${encodeURIComponent(wallId)}`);
}
