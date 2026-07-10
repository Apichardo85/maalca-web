import { NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/**
 * Unauthenticated proxy for public-page analytics (page_view/canal_click/qr_scan).
 * Mirrors the authenticated src/app/api/space/[slug]/events/route.ts, but visitors
 * aren't logged in, so this forwards straight to maalca-api's public events endpoint
 * by slug — no token, no affiliate-id lookup.
 *
 * NOTE: maalca-api's public events endpoint isn't confirmed live yet (depends on
 * their KPI-aggregation work) — this proxy is written to the expected contract
 * (POST /api/public/affiliates/{slug}/events) and forwards whatever status it gets.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body.type !== 'string') {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  try {
    const apiRes = await fetch(`${API}/api/public/affiliates/${slug}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (apiRes.status === 204) return new NextResponse(null, { status: 204 });
    const data = await apiRes.json().catch(() => null);
    return NextResponse.json(data ?? {}, { status: apiRes.status });
  } catch {
    // Tracking must never surface as a visible error on the public page.
    return NextResponse.json({ ok: false }, { status: 202 });
  }
}
