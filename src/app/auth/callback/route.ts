import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

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
  //  1. Known affiliate email  →  /dashboard/[affiliate_id]  (existing flow)
  //  2. Self-service user with business already created  →  /space/[slug]
  //  3. Brand-new self-service user  →  /onboarding

  let redirectPath: string;

  if (mapping?.affiliate_id) {
    // 1. Hardcoded affiliate
    redirectPath = `/dashboard/${mapping.affiliate_id}`;
  } else {
    // 2. Check if this user already has a business
    const { data: businesses } = await supabase
      .from("businesses")
      .select("slug")
      .eq("owner_id", data.user.id)
      .order("created_at", { ascending: true })
      .limit(1);

    if (businesses && businesses.length > 0) {
      redirectPath = `/space/${businesses[0].slug}`;
    } else {
      // 3. New user — go create their space
      redirectPath = "/onboarding";
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
