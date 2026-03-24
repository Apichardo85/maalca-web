// Auth service for handling authentication API calls
// Login/logout use relative Next.js routes, not apiClient (which points to maalca-api)

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  affiliateId: string;
  role: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

export interface AuthError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  private readonly USER_KEY = 'auth_user';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Use relative URL so it always hits the Next.js route (not maalca-api)
    // The Next.js route sets the auth_token cookie via Set-Cookie header
    // TODO: when maalca-api API-REQ-001 ships, update /api/auth/login route to proxy there
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as AuthError
      throw new Error(body.error?.message || 'Error de autenticación')
    }

    const response = await res.json() as AuthResponse

    // Also persist to localStorage for client-side isAuthenticated() checks
    if (response.token) {
      this.setToken(response.token)
      this.setRefreshToken(response.refreshToken)
      this.setUser(response.user)
    }

    return response
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // Continue with local logout even if request fails
    } finally {
      this.clearAuth()
    }
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      })
      if (!res.ok) { this.clearAuth(); return false }
      const response = await res.json() as AuthResponse
      if (response.token) {
        this.setToken(response.token)
        this.setRefreshToken(response.refreshToken)
        this.setUser(response.user)
        return true
      }
      return false
    } catch {
      this.clearAuth()
      return false
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  private setRefreshToken(refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  private setUser(user: AuthUser): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }
}

export const authService = new AuthService();
