// src/app/api/space/[slug]/community/combos/route.ts
import { NextRequest } from 'next/server';
import { communityProxy } from '@/lib/community-api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return communityProxy(slug, '/combos');
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await req.json();
  return communityProxy(slug, '/combos', { method: 'POST', body });
}
