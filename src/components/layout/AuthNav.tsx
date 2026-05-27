"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

  if (session) {
    return (
      <Link href="/dashboard" className={className} onClick={onNavigate}>
        <Button variant="outline" size={size} className={className}>
          {session.user.email?.split("@")[0]}
        </Button>
      </Link>
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
