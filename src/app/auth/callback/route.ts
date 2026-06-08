import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// Known staff emails → affiliate mapping (hardcoded affiliates)
const KNOWN_AFFILIATES: Record<string, { affiliate_id: string; role: string }> = {
  "alejandropichardo85@gmail.com":    { affiliate_id: "maalca",                role: "admin"  },
  "littledominicanarestaurant@gmail.com": { affiliate_id: "the-little-dominican", role: "owner" },
};

// Affiliate GUID mapping (backward compat with menu editor cookie)
const AFFILIATE_GUIDS: Record<string, string> = {
  "maalca":                "a1000000-0000-0000-0000-000000000006",
  "the-little-dominican":  "a1000000-0000-0000-0000-000000000003",
  "pegote-barbershop":     "a1000000-0000-0000-0000-000000000001",
  "britocolor":            "a1000000-0000-0000-0000-000000000002",
  "masa-tina":             "a1000000-0000-0000-0000-000000000005",
  "dr-pichardo":           "a1000000-0000-0000-0000-000000000004",
};

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("[auth/callback]", error);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const email   = data.user.email ?? "";
  const mapping = KNOWN_AFFILIATES[email];

  // Upsert profile
  await supabase.from("profiles").upsert(
    {
      id:           data.user.id,
      email,
      affiliate_id: mapping?.affiliate_id ?? null,
      role:         mapping?.role ?? "owner",
      plan:         "free",
    },
    { onConflict: "id" },
  );

  // ── Routing logic ────────────────────────────────────────────────────────
  //
  //  1. Known affiliate email (admin/staff)  →  /dashboard/[affiliate_id]
  //  2. Self-service user with ?redirect param  →  honor it (e.g. /onboarding)
  //  3. Self-service user with existing space  →  /space/[slug]
  //  4. Brand-new self-service user  →  /onboarding

  let redirectPath: string;

  if (mapping?.affiliate_id) {
    // 1. Hardcoded staff affiliate — always go to their dashboard
    redirectPath = `/dashboard/${mapping.affiliate_id}`;
  } else {
    // Check for an explicit redirect param (e.g. from /login?redirect=/onboarding)
    const redirectParam = searchParams.get("redirect") ?? searchParams.get("next");
    const safeRedirect = redirectParam && redirectParam.startsWith("/") ? redirectParam : null;

    if (safeRedirect) {
      // 2. Honor the explicit redirect
      redirectPath = safeRedirect;
    } else {
      // 3 & 4. Check maalca-api for an existing space
      const accessToken = data.session?.access_token;
      redirectPath = "/onboarding";

      if (accessToken) {
        try {
          const res = await fetch(`${API}/api/me/affiliates`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: "no-store",
          });

          if (res.ok) {
            const affiliates: Array<{ id: string; slug: string }> =
              await res.json().catch(() => []);
            if (affiliates.length > 0) {
              redirectPath = `/space/${affiliates[0].slug}`;
            }
          }
        } catch {
          // maalca-api unreachable — send to onboarding
        }
      }
    }
  }

  const response = NextResponse.redirect(`${origin}${redirectPath}`);

  // Set backward-compat cookies for hardcoded affiliates
  if (mapping?.affiliate_id) {
    const guid = AFFILIATE_GUIDS[mapping.affiliate_id];
    if (guid) {
      response.cookies.set("affiliate_guid", guid, { path: "/", maxAge: 86400, sameSite: "lax" });
    }
    response.cookies.set("user_role", mapping.role, { path: "/", maxAge: 86400, sameSite: "lax" });
  }

  return response;
}
