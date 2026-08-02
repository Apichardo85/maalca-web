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

// ─── Login form ───────────────────────────────────────────────────────────────

function LoginForm() {
  const searchParams = useSearchParams();
  const errorParam   = searchParams?.get("error");

  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError,   setGoogleError]   = useState<string | null>(null);

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

  const anyError = errorParam || googleError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/20 to-slate-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-800 p-8">

          {/* Logo + headline */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-5">
              <Logo variant="full" size="sm" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Empieza gratis en segundos
            </h1>
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              Sin tarjeta. Sin compromiso.
            </p>
          </div>

          {/* OAuth error */}
          {anyError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg p-3 mb-5">
              <p className="text-sm text-red-600 dark:text-red-400">
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
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl text-sm font-semibold text-gray-800 dark:text-neutral-200 hover:border-gray-300 dark:hover:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

          <p className="text-xs text-center text-gray-400 dark:text-neutral-500 mt-5">
            Al continuar, aceptas los{" "}
            <a href="/terminos" className="underline hover:text-gray-600 dark:hover:text-neutral-300">términos de uso</a>
            {" "}de MaalCa.
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-white transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoginLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/20 to-slate-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <div className="h-8 w-40 bg-gray-200 dark:bg-neutral-800 rounded" />
        <div className="h-4 w-56 bg-gray-200 dark:bg-neutral-800 rounded" />
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
