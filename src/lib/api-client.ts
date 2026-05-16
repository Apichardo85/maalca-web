// src/lib/api-client.ts
// Central HTTP client for maalca-api. Attaches Supabase JWT and X-Affiliate-Id header.
// Public endpoints (skipAuth: true) work without auth.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetchOptions extends RequestInit {
  affiliateId?: string;
  skipAuth?: boolean;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { affiliateId, skipAuth, ...init } = options;

  const headers = new Headers(init.headers as HeadersInit | undefined);
  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    // Dynamic import keeps this client-safe (only runs in browser or server context)
    const { supabaseBrowser } = await import('@/lib/supabase/client');
    const supabase = supabaseBrowser();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }
  }

  if (affiliateId) {
    headers.set('X-Affiliate-Id', affiliateId);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  if (response.status === 401) {
    const needsOnboarding = response.headers.get('X-Onboarding-Required') === 'true';
    if (needsOnboarding && typeof window !== 'undefined') {
      window.location.href = '/onboarding';
      return Promise.reject(new ApiError(401, 'Onboarding required'));
    }
    throw new ApiError(401, 'Unauthorized');
  }

  if (!response.ok) {
    const body = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, body);
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

// Server-side only: uses API_BASE_URL directly without auth headers.
// For public endpoints that don't need a JWT.
export async function apiPublicFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${process.env.API_BASE_URL ?? API_BASE_URL}${path}`, init);

  if (response.status === 404) {
    const err = new ApiError(404, 'Not found');
    throw err;
  }
  if (!response.ok) {
    const body = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, body);
  }

  return response.json() as Promise<T>;
}
