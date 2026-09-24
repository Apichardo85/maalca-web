// src/app/api/space/[slug]/community/combos/[id]/route.ts
import { NextRequest } from 'next/server';
import { communityProxy } from '@/lib/community-api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  return communityProxy(slug, `/combos/${id}`);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const body = await req.json();
  return communityProxy(slug, `/combos/${id}`, { method: 'PUT', body });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  return communityProxy(slug, `/combos/${id}`, { method: 'DELETE' });
}
