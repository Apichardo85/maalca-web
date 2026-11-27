// src/lib/reader-session.ts — solo servidor. Sesión del lector del club (ver ReaderClub.cs en maalca-api):
// el token firmado vive en una cookie httpOnly por autor y viaja al API en X-Reader-Token. El navegador nunca
// lo ve, así que un script de la página no puede robarlo.
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import { READER_COOKIE_MAX_AGE, readerCookieName } from '@/lib/creator';

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export async function readerToken(slug: string): Promise<string | null> {
  const jar = await cookies();
  return jar.get(readerCookieName(slug))?.value ?? null;
}

export function setReaderCookie(res: NextResponse, slug: string, token: string) {
  res.cookies.set(readerCookieName(slug), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: READER_COOKIE_MAX_AGE,
  });
}

export function clearReaderCookie(res: NextResponse, slug: string) {
  res.cookies.set(readerCookieName(slug), '', { httpOnly: true, path: '/', maxAge: 0 });
}

/** POST al club en el API con la sesión del lector si la hay. */
export async function clubPost(slug: string, path: string, body: unknown, token?: string | null) {
  return fetch(`${API_BASE}/api/public/affiliates/${encodeURIComponent(slug)}/readers${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { 'X-Reader-Token': token } : {}) },
    body: JSON.stringify(body ?? {}),
    cache: 'no-store',
  });
}

/** Origen de la web desde el propio request (staging vuelve a staging, producción a producción). */
export function publicOrigin(req: Request): string {
  const url = new URL(req.url);
  const host = req.headers.get('x-forwarded-host') ?? url.host;
  const proto = req.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '');
  return host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || 'https://maalca.com').replace(/\/$/, '');
}
