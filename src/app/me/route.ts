import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { resolveUserDestination } from "@/lib/resolve-user-destination";

/**
 * Resolver universal de "llévame a mi panel" — usado por el link de sesión en
 * el header (Header.tsx / AuthNav.tsx) en vez de codificar el destino ahí.
 * Misma lógica que auth/callback (admin→/ops, negocio real→/space/[slug],
 * si no→/onboarding), reutilizable sin pasar por el flujo de OAuth code.
 */
export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { data: { session } } = await supabase.auth.getSession();
  const redirectPath = await resolveUserDestination(user.email, session?.access_token);

  return NextResponse.redirect(`${origin}${redirectPath}`);
}
