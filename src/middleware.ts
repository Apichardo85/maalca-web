import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Build a response we can attach updated Supabase cookies to
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session (also refreshes the cookie if expired)
  const { data: { user } } = await supabase.auth.getUser();

  // auth_token cookie = hardcoded affiliate (mock/maalca-api login) — skip affiliate check
  const authToken = request.cookies.get("auth_token")?.value;
  const isLoggedIn = !!user || !!authToken;

  const isProtected = pathname.startsWith("/dashboard") ||
                      pathname.startsWith("/onboarding") ||
                      pathname.startsWith("/space");
  const isAuthRoute  = pathname === "/login";

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── Affiliate-map guard for /dashboard/* ──────────────────────────────────
  // Only applies to Supabase session users (not legacy auth_token holders).
  // A user with no UserAffiliateMap entry must be sent to /onboarding.
  if (pathname.startsWith("/dashboard") && user && !authToken) {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.access_token) {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
        const res = await fetch(`${apiBase}/api/me/affiliates`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
          signal: AbortSignal.timeout(3000),
        });

        if (res.status === 401) {
          return NextResponse.redirect(new URL("/onboarding", request.url));
        }

        if (res.ok) {
          const affiliates: unknown[] = await res.json().catch(() => []);
          if (affiliates.length === 0) {
            return NextResponse.redirect(new URL("/onboarding", request.url));
          }
        }
        // Any other non-ok status (5xx, network issue) → fail open, let the page handle it
      } catch {
        // maalca-api unreachable or timed out → fail open
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
