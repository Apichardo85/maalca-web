"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import type { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/buttons";

interface AuthNavProps {
  size?: "sm" | "lg";
  className?: string;
  onNavigate?: () => void;
}

export function AuthNav({ size = "sm", className, onNavigate }: AuthNavProps) {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session),
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    await supabase.auth.signOut();
    onNavigate?.();
    router.push("/");
  };

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/dashboard" onClick={onNavigate}>
          <Button variant="outline" size={size} className={className}>
            {session.user.email?.split("@")[0]}
          </Button>
        </Link>
        <button
          onClick={handleSignOut}
          className="text-sm text-text-muted hover:text-brand-primary transition-colors px-2 py-1"
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <Link href="/login" className={className} onClick={onNavigate}>
      <Button variant="outline" size={size} className={className}>
        Iniciar sesión
      </Button>
    </Link>
  );
}
