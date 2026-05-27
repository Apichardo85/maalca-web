"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { supabaseBrowser } from "@/lib/supabase/client";

// ─── Icons ────────────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

// ─── Login form ───────────────────────────────────────────────────────────────

function LoginForm() {
  const searchParams = useSearchParams();
  const errorParam   = searchParams?.get("error");

  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError,   setGoogleError]   = useState<string | null>(null);

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError,   setEmailError]   = useState<string | null>(null);
  const [resetSent,    setResetSent]    = useState(false);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setGoogleError(null);
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabaseBrowser().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      setGoogleError(error.message);
      setGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailError(null);

    const supabase = supabaseBrowser();

    // 1. Try sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (!signInError) {
      window.location.href = "/dashboard";
      return;
    }

    // 2. Invalid credentials → try sign up (new user)
    if (signInError.message === "Invalid login credentials") {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });

      if (!signUpError) {
        window.location.href = "/onboarding";
        return;
      }

      // Map "User already registered" back to a wrong-password message
      const msg = signUpError.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already exists")) {
        setEmailError("Contraseña incorrecta.");
      } else {
        setEmailError(signUpError.message);
      }
      setEmailLoading(false);
      return;
    }

    setEmailError(signInError.message);
    setEmailLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setEmailError("Ingresa tu email para recuperar la contraseña.");
      return;
    }
    setEmailLoading(true);
    setEmailError(null);
    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    if (error) {
      setEmailError(error.message);
      setEmailLoading(false);
    } else {
      setResetSent(true);
      setEmailLoading(false);
    }
  };

  const anyError = errorParam || googleError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/20 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          {/* Logo + headline */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-5">
              <Logo variant="full" size="sm" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Empieza gratis en segundos
            </h1>
            <p className="text-sm text-gray-500">
              Sin tarjeta. Sin compromiso.
            </p>
          </div>

          {/* OAuth error */}
          {anyError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5">
              <p className="text-sm text-red-600">
                {errorParam === "auth_failed"
                  ? "No pudimos completar el login. Intenta de nuevo."
                  : (googleError ?? "Error inesperado.")}
              </p>
            </div>
          )}

          {/* Google CTA */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-800 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <svg className="animate-spin w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <GoogleIcon />
            )}
            {googleLoading ? "Conectando..." : "Continuar con Google"}
          </button>

          {/* Separator */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted whitespace-nowrap">o continúa con email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Reset sent confirmation */}
          {resetSent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-sm font-semibold text-green-800 mb-1">Revisa tu correo</p>
              <p className="text-xs text-green-700">
                Te enviamos un enlace para restablecer tu contraseña a <strong>{email}</strong>.
              </p>
              <button
                onClick={() => setResetSent(false)}
                className="mt-3 text-xs text-green-700 underline hover:text-green-900"
              >
                Volver al inicio de sesión
              </button>
            </div>
          ) : (
            /* Email / password form */
            <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-surface text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* Forgot password */}
              <div className="text-right -mt-1">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={emailLoading}
                  className="text-xs text-text-muted hover:text-brand-primary transition-colors disabled:opacity-50"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {emailError && (
                <p className="text-xs text-red-600">{emailError}</p>
              )}

              <button
                type="submit"
                disabled={emailLoading}
                className="w-full py-3 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emailLoading ? "Un momento..." : "Continuar"}
              </button>
            </form>
          )}

          <p className="text-xs text-center text-gray-400 mt-5">
            Al continuar, aceptas los{" "}
            <a href="/terminos" className="underline hover:text-gray-600">términos de uso</a>
            {" "}de MaalCa.
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoginLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/20 to-slate-100 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <div className="h-8 w-40 bg-gray-200 rounded" />
        <div className="h-4 w-56 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
