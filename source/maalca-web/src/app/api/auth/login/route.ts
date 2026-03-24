// src/app/api/auth/login/route.ts
// Mock auth endpoint — sustituir con llamada a maalca-api cuando API-REQ-001 esté listo
// TODO: API-REQ-001: replace with real POST /api/auth/login from maalca-api

import { NextResponse } from 'next/server'

// Demo credentials → affiliateId mapping
// En producción esto vendrá de la DB via maalca-api
const MOCK_USERS: Record<string, { password: string; affiliateId: string; name: string; role: string }> = {
  'admin@maalca.com':               { password: 'demo',   affiliateId: 'pegote-barbershop',    name: 'Admin MaalCa',       role: 'admin'  },
  'pegote@maalca.com':              { password: 'demo',   affiliateId: 'pegote-barbershop',    name: 'Pegote Team',        role: 'owner'  },
  'britocolor@maalca.com':          { password: 'demo',   affiliateId: 'britocolor',           name: 'BritoColor Team',    role: 'owner'  },
  'tld@maalca.com':                 { password: 'demo',   affiliateId: 'the-little-dominican', name: 'TLD Team',           role: 'owner'  },
  'drpichardo@maalca.com':          { password: 'demo',   affiliateId: 'dr-pichardo',          name: 'Dr. Pichardo',       role: 'owner'  },
  'masatina@maalca.com':            { password: 'demo',   affiliateId: 'masa-tina',            name: 'Masa Tina',          role: 'owner'  },
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: { code: 'MISSING_CREDENTIALS', message: 'Email y contraseña requeridos' } },
        { status: 400 }
      )
    }

    const user = MOCK_USERS[email.toLowerCase()]

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales incorrectas' } },
        { status: 401 }
      )
    }

    // Mock JWT token — in production this comes from maalca-api
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

    // Set HttpOnly cookie so middleware can read it
    response.cookies.set('auth_token', mockToken, {
      httpOnly: false,   // false so client JS can also read if needed
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    })

    // Role cookie — readable by server components (layout.tsx) for admin gating
    response.cookies.set('user_role', user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    })

    return response
  } catch {
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    )
  }
}
