// src/app/api/space/[slug]/community/metrics/route.ts
import { NextRequest } from 'next/server';
import { communityProxy } from '@/lib/community-api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return communityProxy(slug, '/community-metrics');
}
