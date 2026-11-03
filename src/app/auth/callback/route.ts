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
  //  1. Platform admin  →  /ops (siempre, salvo regreso desde una tienda pública — ver isStoreReturn)
  //  2. ?redirect / ?next explícito  →  se respeta (ej. /onboarding)
  //  3. Usuario con negocio real (maalca-api)  →  /space/[slug]
  //  4. Usuario nuevo  →  /onboarding
  const redirectParam = searchParams.get("redirect") ?? searchParams.get("next");
  // Solo rutas internas: "//host" y "/\\host" son redirecciones abiertas, no rutas.
  const safeRedirect =
    redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//") && !redirectParam.startsWith("/\\")
      ? redirectParam
      : null;

  // Excepción a "admin siempre a /ops": quien inicia sesión DESDE la tienda pública de un negocio (el login de
  // cliente vuelve a "/{slug}?cuenta=1") se queda en esa tienda, aunque su correo sea de admin. Si no, el admin
  // que prueba la cuenta mayorista de un negocio acababa en /ops y nunca podía comprar como cliente.
  const isStoreReturn = !!safeRedirect && /^\/[a-z0-9][a-z0-9-]*\?cuenta=1$/i.test(safeRedirect);

  const PLATFORM_ADMIN_EMAILS = ["alejandropichardo85@gmail.com"];
  if (PLATFORM_ADMIN_EMAILS.includes(email) && !isStoreReturn) {
    return NextResponse.redirect(`${origin}/ops`);
  }

  const redirectPath = safeRedirect
    ?? await resolveUserDestination(email, data.session?.access_token);

  return NextResponse.redirect(`${origin}${redirectPath}`);
}
