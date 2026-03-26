// src/app/api/auth/logout/route.ts

import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })

  // Clear all auth cookies
  const cookieOpts = { path: '/', maxAge: 0 } as const

  response.cookies.set('auth_token', '', cookieOpts)
  response.cookies.set('refresh_token', '', cookieOpts)
  response.cookies.set('user_role', '', cookieOpts)

  return response
}
