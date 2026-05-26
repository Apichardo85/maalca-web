// src/app/api/auth/logout/route.ts

import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await supabaseServer()
    await supabase.auth.signOut()
  } catch {
    // Continue to clear cookies even if server-side signOut fails
  }

  const response = NextResponse.json({ success: true })
  const cookieOpts = { path: '/', maxAge: 0 } as const

  response.cookies.set('auth_token', '', cookieOpts)
  response.cookies.set('refresh_token', '', cookieOpts)
  response.cookies.set('affiliate_guid', '', cookieOpts)
  response.cookies.set('user_role', '', cookieOpts)
  // Supabase chunked session cookies
  response.cookies.set('sb-nyiocxrrbrphfczsbqpf-auth-token.0', '', cookieOpts)
  response.cookies.set('sb-nyiocxrrbrphfczsbqpf-auth-token.1', '', cookieOpts)

  return response
}
