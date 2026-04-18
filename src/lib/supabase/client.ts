// Supabase browser client — use from client components / dashboard.
// Reads the public anon key; RLS policies enforce per-affiliate ownership.
import { createBrowserClient } from '@supabase/ssr'

export const supabaseBrowser = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
