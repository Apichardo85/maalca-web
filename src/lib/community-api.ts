// src/lib/community-api.ts
// Shared proxy for MaalCa Comunidad's inventory/recipe/combo/serve endpoints
// (/api/affiliates/{id}/inventory-items, /recipes, /combos, /community-metrics
// on maalca-api — see CommunityDtos.cs / CommunityService.cs). Every route
// under src/app/api/space/[slug]/community/** is a thin wrapper around this,
// same auth pattern as content/route.ts and inventory/route.ts: resolve the
// Supabase session to a maalca-api bearer token, resolve slug -> affiliate id,
// forward with Authorization + X-Affiliate-Id.
import { NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export async function communityProxy(
  slug: string,
  path: string,
  init?: { method?: string; body?: unknown; search?: string },
): Promise<NextResponse> {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const hasBody = init?.body !== undefined;
  const apiRes = await fetch(
    `${API}/api/affiliates/${affiliate.id}${path}${init?.search ?? ''}`,
    {
      method: init?.method ?? 'GET',
      headers: {
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${token}`,
        'X-Affiliate-Id': affiliate.id,
      },
      body: hasBody ? JSON.stringify(init.body) : undefined,
      cache: 'no-store',
    },
  );

  if (apiRes.status === 204) return new NextResponse(null, { status: 204 });
  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}
