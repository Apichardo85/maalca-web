// src/app/api/space/[slug]/community/recipes/[id]/ingredients/route.ts
import { NextRequest } from 'next/server';
import { communityProxy } from '@/lib/community-api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  return communityProxy(slug, `/recipes/${id}/ingredients`);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const body = await req.json();
  return communityProxy(slug, `/recipes/${id}/ingredients`, { method: 'POST', body });
}
