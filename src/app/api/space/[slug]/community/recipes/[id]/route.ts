// src/app/api/space/[slug]/community/recipes/[id]/route.ts
import { NextRequest } from 'next/server';
import { communityProxy } from '@/lib/community-api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  return communityProxy(slug, `/recipes/${id}`);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const body = await req.json();
  return communityProxy(slug, `/recipes/${id}`, { method: 'PUT', body });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  return communityProxy(slug, `/recipes/${id}`, { method: 'DELETE' });
}
