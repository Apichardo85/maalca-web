import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { resolveUserDestination } from "@/lib/resolve-user-destination";

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

  const email = data.user.email ?? "";

  // Upsert profile (self-service signup bookkeeping — no longer carries any
  // hardcoded affiliate/role, esos vivían solo en el sistema legacy /dashboard).
  await supabase.from("profiles").upsert(
    { id: data.user.id, email, plan: "free" },
    { onConflict: "id" },
  );

  // ── Routing ──────────────────────────────────────────────────────────────
  //  1. Platform admin  →  /ops (siempre, sin excepción — ver tarea #142)
  //  2. ?redirect / ?next explícito  →  se respeta (ej. /onboarding)
  //  3. Usuario con negocio real (maalca-api)  →  /space/[slug]
  //  4. Usuario nuevo  →  /onboarding
  const PLATFORM_ADMIN_EMAILS = ["alejandropichardo85@gmail.com"];
  if (PLATFORM_ADMIN_EMAILS.includes(email)) {
    return NextResponse.redirect(`${origin}/ops`);
  }

  const redirectParam = searchParams.get("redirect") ?? searchParams.get("next");
  const safeRedirect = redirectParam && redirectParam.startsWith("/") ? redirectParam : null;

  const redirectPath = safeRedirect
    ?? await resolveUserDestination(email, data.session?.access_token);

  return NextResponse.redirect(`${origin}${redirectPath}`);
}
