// Service-role Supabase client. Bypasses RLS. SERVER ONLY.
// Never import from client components.
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// Slug ↔ GUID (duplicated from login route to keep this module standalone)
const AFFILIATE_GUID_TO_SLUG: Record<string, string> = {
  'a1000000-0000-0000-0000-000000000001': 'pegote-barbershop',
  'a1000000-0000-0000-0000-000000000002': 'britocolor',
  'a1000000-0000-0000-0000-000000000003': 'the-little-dominican',
  'a1000000-0000-0000-0000-000000000004': 'dr-pichardo',
  'a1000000-0000-0000-0000-000000000005': 'masa-tina',
  'a1000000-0000-0000-0000-000000000006': 'maalca-llc',
}

export function guidToSlug(guid: string | undefined): string | null {
  if (!guid) return null
  return AFFILIATE_GUID_TO_SLUG[guid] ?? guid
}

/**
 * Validate that the caller's `affiliate_guid` cookie matches the route's affiliateId.
 * Returns the affiliate slug on success, or null if the user isn't authorised.
 */
export function assertAffiliateAccess(
  cookieGuid: string | undefined,
  routeAffiliateId: string,
  userRole?: string,
): string | null {
  if (!cookieGuid) return null
  // Admins can edit any affiliate
  if (userRole === 'admin') return routeAffiliateId
  const slug = guidToSlug(cookieGuid)
  if (!slug) return null
  if (slug !== routeAffiliateId) return null
  return slug
}
