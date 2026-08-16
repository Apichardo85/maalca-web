/**
 * Resuelve a dónde debe ir un usuario autenticado tras el login: al panel de
 * operaciones (platform admin), a su negocio real en /space, u onboarding si
 * no tiene ninguno todavía. Compartido por auth/callback (post-OAuth) y /me
 * (click en el header cuando ya hay sesión) para no duplicar la lógica.
 */

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// Único email con acceso al panel de operaciones interno de MaalCa.
const PLATFORM_ADMIN_EMAILS = ["alejandropichardo85@gmail.com"];

export async function resolveUserDestination(
  email: string | null | undefined,
  accessToken: string | null | undefined,
): Promise<string> {
  if (email && PLATFORM_ADMIN_EMAILS.includes(email)) {
    return "/ops";
  }

  if (accessToken) {
    try {
      const res = await fetch(`${API}/api/me/affiliates`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      if (res.ok) {
        const affiliates: Array<{ id: string; slug: string }> = await res.json().catch(() => []);
        if (affiliates.length > 0) return `/space/${affiliates[0].slug}`;
      }
    } catch {
      // maalca-api unreachable — cae a onboarding
    }
  }

  return "/onboarding";
}
