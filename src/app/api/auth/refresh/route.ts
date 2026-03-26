// src/app/api/auth/refresh/route.ts
// Proxies token refresh to maalca-api, falls back to mock if API is unavailable

import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth_token')?.value
    const refreshToken = request.cookies.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: { code: 'NO_REFRESH_TOKEN', message: 'No refresh token available' } },
        { status: 401 }
      )
    }

    // Try maalca-api first
    try {
      const apiRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: authToken || '',
          refreshToken,
        }),
        signal: AbortSignal.timeout(5000),
      })

      if (apiRes.ok) {
        const data = await apiRes.json()
        // data shape: { token, refreshToken }

        const response = NextResponse.json({ token: data.token })

        response.cookies.set('auth_token', data.token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24,
        })

        response.cookies.set('refresh_token', data.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        })

        return response
      }

      // 401 = refresh token expired or invalid
      if (apiRes.status === 401) {
        const response = NextResponse.json(
          { error: { code: 'REFRESH_EXPIRED', message: 'Session expired, please login again' } },
          { status: 401 }
        )
        // Clear stale cookies
        response.cookies.set('auth_token', '', { path: '/', maxAge: 0 })
        response.cookies.set('refresh_token', '', { path: '/', maxAge: 0 })
        response.cookies.set('user_role', '', { path: '/', maxAge: 0 })
        return response
      }
    } catch {
      // API unreachable — fall through to mock
      console.warn('[auth/refresh] maalca-api unreachable, using mock refresh')
    }

    // Fallback: mock refresh (development only)
    if (refreshToken.startsWith('mock-refresh-')) {
      const affiliateId = refreshToken.replace('mock-refresh-', '').split('-')[0]
      const newToken = `mock-jwt-${affiliateId}-${Date.now()}`
      const newRefreshToken = `mock-refresh-${affiliateId}-${Date.now()}`

      const response = NextResponse.json({ token: newToken })

      response.cookies.set('auth_token', newToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      })

      response.cookies.set('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })

      return response
    }

    // Invalid refresh token
    const response = NextResponse.json(
      { error: { code: 'INVALID_REFRESH', message: 'Invalid refresh token' } },
      { status: 401 }
    )
    response.cookies.set('auth_token', '', { path: '/', maxAge: 0 })
    response.cookies.set('refresh_token', '', { path: '/', maxAge: 0 })
    response.cookies.set('user_role', '', { path: '/', maxAge: 0 })
    return response
  } catch {
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    )
  }
}
