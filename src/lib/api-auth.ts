import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const API = process.env.NEXT_PUBLIC_API_BASE_URL
  ?? 'http://localhost:8080';

/**
 * Returns the current user's Supabase access token, or null if not authenticated.
 * All proxy routes that forward requests to maalca-api use this.
 */
export async function getMaalcaApiToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  // Use getUser() instead of getSession() — getSession() reads from
  // local cache and may return null in Server Components even when
  // the user is authenticated. getUser() validates against Supabase.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Re-read session to get the access token
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export interface CurrentSpaceUser {
  token: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}

/**
 * Same auth check as getMaalcaApiToken(), but also surfaces the Google profile info
 * (full_name/avatar_url) Supabase already puts on user_metadata for OAuth logins —
 * used by the /space header to greet the user by name/photo instead of just showing
 * the business. Separate function (not a getMaalcaApiToken() signature change) so the
 * other ~20 call sites that only need the token stay untouched.
 */
export async function getCurrentSpaceUser(): Promise<CurrentSpaceUser | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return null;

  // user_metadata only carries full_name/avatar_url for OAuth logins (Google) — email/password
  // signups have neither, so both fall back to null and the caller shows email/initial instead.
  const metadata = user.user_metadata ?? {};
  return {
    token: session.access_token,
    email: user.email ?? null,
    fullName: (metadata.full_name as string | undefined) ?? (metadata.name as string | undefined) ?? null,
    avatarUrl: (metadata.avatar_url as string | undefined) ?? (metadata.picture as string | undefined) ?? null,
  };
}

/**
 * Resolves a slug to an affiliate GUID via maalca-api.
 * Required because catalog endpoints use GUID, not slug.
 */
export async function resolveAffiliateIdBySlug(
  slug: string,
  token: string,
): Promise<{ id: string; name: string } | null> {
  const res = await fetch(`${API}/api/affiliates/by-slug/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) throw new Error(`Failed to resolve slug ${slug}: ${res.status}`);

  return res.json();
}
