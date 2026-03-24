// src/app/api/auth/logout/route.ts

import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })

  // Clear both auth cookies
  const cookieOpts = { httpOnly: false, path: '/', maxAge: 0 } as const

  response.cookies.set('auth_token', '', cookieOpts)
  response.cookies.set('user_role', '', cookieOpts)

  return response
}
