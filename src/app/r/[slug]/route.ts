import { NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://maalca.com';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/**
 * QR-scan tracking redirect. The design-tab QR now encodes /r/{slug} instead of the
 * direct public URL, so every scan hits this route before landing on the real page.
 * The tracking call is awaited (not fire-and-forget) because serverless functions can
 * be torn down right after the response is sent — an un-awaited request here could
 * never actually leave the server. A failure still can't block the redirect.
 */
export async function GET(_req: Request, ctx: RouteContext) {
  const { slug } = await ctx.params;

  try {
    await fetch(`${API}/api/public/affiliates/${slug}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'qr_scan' }),
    });
  } catch {
    // Swallow — a broken tracking call must never strand the visitor.
  }

  return NextResponse.redirect(`${SITE}/${slug}`, 302);
}
