// src/app/api/auth/login/route.ts
// Tries maalca-api; falls back to mock users.
// NOTE: Menu editing in the dashboard trusts the `affiliate_guid` cookie set here.
// API routes under /api/dashboard/* use the service-role Supabase key to write,
// with app-layer validation (cookie matches route param).

import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// Map API GUIDs to dashboard slugs
const AFFILIATE_GUID_TO_SLUG: Record<string, string> = {
  'a1000000-0000-0000-0000-000000000001': 'pegote-barbershop',
  'a1000000-0000-0000-0000-000000000002': 'britocolor',
  'a1000000-0000-0000-0000-000000000003': 'the-little-dominican',
  'a1000000-0000-0000-0000-000000000004': 'dr-pichardo',
  'a1000000-0000-0000-0000-000000000005': 'masa-tina',
  'a1000000-0000-0000-0000-000000000006': 'maalca-llc',
}

const AFFILIATE_SLUG_TO_GUID: Record<string, string> = Object.fromEntries(
  Object.entries(AFFILIATE_GUID_TO_SLUG).map(([k, v]) => [v, k])
)

const resolveAffiliateSlug = (affiliateId: string): string =>
  AFFILIATE_GUID_TO_SLUG[affiliateId] || affiliateId

const resolveAffiliateGuid = (slug: string): string =>
  AFFILIATE_SLUG_TO_GUID[slug] || slug

// Fallback mock users for when maalca-api is down
const MOCK_USERS: Record<string, { password: string; affiliateId: string; name: string; role: string }> = {
  'admin@maalca.com':      { password: 'demo', affiliateId: 'pegote-barbershop',    name: 'Admin MaalCa',    role: 'admin' },
  'pegote@maalca.com':     { password: 'demo', affiliateId: 'pegote-barbershop',    name: 'Pegote Team',     role: 'owner' },
  'britocolor@maalca.com': { password: 'demo', affiliateId: 'britocolor',           name: 'BritoColor Team', role: 'owner' },
  'tld@maalca.com':        { password: 'demo', affiliateId: 'the-little-dominican', name: 'TLD Team',        role: 'owner' },
  'drpichardo@maalca.com': { password: 'demo', affiliateId: 'dr-pichardo',          name: 'Dr. Pichardo',    role: 'owner' },
  'masatina@maalca.com':   { password: 'demo', affiliateId: 'masa-tina',            name: 'Masa Tina',       role: 'owner' },
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: { code: 'MISSING_CREDENTIALS', message: 'Email y contraseña requeridos' } },
        { status: 400 }
      )
    }

    // Try maalca-api
    try {
      const apiRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(5000),
      })

      if (apiRes.ok) {
        const data = await apiRes.json()
        const affiliateGuid = data.user.affiliateId
        data.user.affiliateId = resolveAffiliateSlug(data.user.affiliateId)

        const response = NextResponse.json(data)
        const common = {
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          path: '/',
          maxAge: 60 * 60 * 24,
        }
        response.cookies.set('affiliate_guid', affiliateGuid, { ...common, httpOnly: false })
        response.cookies.set('auth_token', data.token, { ...common, httpOnly: false })
        response.cookies.set('refresh_token', data.refreshToken, { ...common, httpOnly: true, maxAge: 60 * 60 * 24 * 7 })
        response.cookies.set('user_role', data.user.role, { ...common, httpOnly: false })
        return response
      }

      if (apiRes.status === 401) {
        return NextResponse.json(
          { error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales incorrectas' } },
          { status: 401 }
        )
      }
    } catch {
      console.warn('[auth/login] maalca-api unreachable, using mock auth')
    }

    // Fallback: mock auth (development only)
    const user = MOCK_USERS[email.toLowerCase()]
    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales incorrectas' } },
        { status: 401 }
      )
    }

    const affiliateGuid = resolveAffiliateGuid(user.affiliateId)
    const mockToken = `mock-jwt-${user.affiliateId}-${Date.now()}`
    const mockRefreshToken = `mock-refresh-${user.affiliateId}-${Date.now()}`

    const response = NextResponse.json({
      token: mockToken,
      refreshToken: mockRefreshToken,
      user: {
        id: `user-${user.affiliateId}`,
        email: email.toLowerCase(),
        affiliateId: user.affiliateId,
        role: user.role,
        name: user.name,
      },
    })

    const common = {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24,
    }
    response.cookies.set('auth_token', mockToken, { ...common, httpOnly: false })
    response.cookies.set('refresh_token', mockRefreshToken, { ...common, httpOnly: true, maxAge: 60 * 60 * 24 * 7 })
    response.cookies.set('affiliate_guid', affiliateGuid, { ...common, httpOnly: false })
    response.cookies.set('user_role', user.role, { ...common, httpOnly: false })

    return response
  } catch {
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    )
  }
}
