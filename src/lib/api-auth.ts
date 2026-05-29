import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const API = process.env.MAALCA_API_URL
  ?? process.env.NEXT_PUBLIC_API_BASE_URL
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

  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
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
