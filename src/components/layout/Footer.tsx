"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const EXCLUDED_PATHS = ["/dashboard", "/ciriwhispers", "/login", "/onboarding"];

export default function Footer() {
  const pathname = usePathname();
  if (EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) return null;

  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-text-muted">
            © {year} MaalCa LLC · Elmira, NY · All rights reserved
          </p>
          <div className="flex items-center gap-4 text-sm text-text-muted">
            <Link href="/privacidad" className="hover:text-text-secondary transition-colors">
              Privacidad
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/terminos" className="hover:text-text-secondary transition-colors">
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
