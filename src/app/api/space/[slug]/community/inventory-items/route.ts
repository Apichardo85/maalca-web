// src/app/api/space/[slug]/community/inventory-items/route.ts
import { NextRequest } from 'next/server';
import { communityProxy } from '@/lib/community-api';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return communityProxy(slug, '/inventory-items', { search: req.nextUrl.search });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await req.json();
  return communityProxy(slug, '/inventory-items', { method: 'POST', body });
}
