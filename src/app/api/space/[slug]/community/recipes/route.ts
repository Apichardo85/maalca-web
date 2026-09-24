// src/app/api/space/[slug]/community/recipes/route.ts
import { NextRequest } from 'next/server';
import { communityProxy } from '@/lib/community-api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return communityProxy(slug, '/recipes');
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await req.json();
  return communityProxy(slug, '/recipes', { method: 'POST', body });
}
