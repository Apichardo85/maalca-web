// src/app/api/space/[slug]/community/recipes/[id]/ingredients/[ingredientId]/route.ts
import { NextRequest } from 'next/server';
import { communityProxy } from '@/lib/community-api';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string; ingredientId: string }> },
) {
  const { slug, id, ingredientId } = await params;
  const body = await req.json();
  return communityProxy(slug, `/recipes/${id}/ingredients/${ingredientId}`, { method: 'PUT', body });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string; ingredientId: string }> },
) {
  const { slug, id, ingredientId } = await params;
  return communityProxy(slug, `/recipes/${id}/ingredients/${ingredientId}`, { method: 'DELETE' });
}
