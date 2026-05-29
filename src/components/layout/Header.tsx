"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/buttons";
import { Logo } from "@/components/ui/Logo";
import SimpleLanguageToggle from "@/components/ui/SimpleLanguageToggle";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useTranslation, useSimpleLanguage } from "@/hooks/useSimpleLanguage";
import { HeaderProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AuthNav } from "@/components/layout/AuthNav";
import { createBrowserClient } from "@supabase/ssr";
import type { Session } from "@supabase/supabase-js";

export default function Header({
  className = "",
  variant = "default",
  showLogo = true,
  showActions = true,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileSession, setMobileSession] = useState<Session | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { language, setLanguage } = useSimpleLanguage();

  // Product nav (left of divider)
  const primaryNav = [
    { label: t('nav.platform'), href: '/#plataforma' },
    { label: t('nav.cases'), href: '/casos' },
    { label: t('nav.pricing'), href: '/servicios' },
    { label: t('nav.docs'), href: '/docs' },
  ];

  // Worlds nav (right of divider)
  const worldsNav = [
    { label: t('nav.editorial'), href: '/editorial' },
    { label: t('nav.ciriwhispers'), href: '/ciriwhispers' },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    supabase.auth.getSession().then(({ data: { session } }) => setMobileSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setMobileSession(session));
    return () => subscription.unsubscribe();
  }, []);

  // These routes have their own layouts
  if (
    pathname.startsWith('/ciriwhispers') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/editorial')
  ) {
    return null;
  }

  const getHeaderStyle = () => {
    const base = "fixed top-0 left-0 right-0 z-50 transition-all duration-300";
    switch (variant) {
      case "transparent":
        return `${base} ${isScrolled ? "bg-background/95 backdrop-blur-lg shadow-lg border-b border-border" : "bg-transparent"}`;
      case "solid":
        return `${base} bg-background shadow-lg border-b border-border`;
      default:
        return `${base} ${isScrolled ? "bg-background/95 backdrop-blur-lg shadow-lg border-b border-border" : "bg-background/90 backdrop-blur-sm border-b border-border/30"}`;
    }
  };

  const isActive = (href: string) => {
    if (href === "/" || href.startsWith("/#")) return pathname === "/";
    return pathname.startsWith(href);
  };

  const navLinkClass = (href: string) =>
    cn(
      "relative px-3 py-2 text-sm font-medium transition-colors duration-300 group",
      isActive(href) ? "text-brand-primary" : "text-text-primary hover:text-brand-primary"
    );

  return (
    <>
      <header className={cn(getHeaderStyle(), "animate-fade-in-down", className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            {showLogo && (
              <div className="flex-shrink-0 hover:scale-105 transition-transform duration-300">
                <Link href="/" className="flex items-center">
                  <Logo variant="full" size="md" />
                </Link>
              </div>
            )}

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* Primary nav — SaaS product */}
              {primaryNav.map((item) => (
                <Link key={item.href} href={item.href} className={navLinkClass(item.href)}>
                  {item.label}
                  {isActive(item.href) && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full" />
                  )}
                </Link>
              ))}

              {/* Divider */}
              <span className="w-px h-5 bg-border mx-3 self-center" aria-hidden="true" />

              {/* Worlds nav */}
              {worldsNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors duration-300",
                    "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              <SimpleLanguageToggle />
              <ThemeToggle />
              {showActions && (
                <div className="animate-fade-in">
                  <AuthNav size="sm" />
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-surface-elevated transition-colors text-text-primary active:scale-95"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileMenuOpen}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center gap-1.5">
                <span className={cn("w-6 h-0.5 bg-current rounded-full block transition-all duration-300", isMobileMenuOpen && "rotate-45 translate-y-2")} />
                <span className={cn("w-6 h-0.5 bg-current rounded-full block transition-all duration-300", isMobileMenuOpen && "opacity-0")} />
                <span className={cn("w-6 h-0.5 bg-current rounded-full block transition-all duration-300", isMobileMenuOpen && "-rotate-45 -translate-y-2")} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute top-16 left-0 right-0 bg-surface shadow-2xl border-t border-border animate-fade-in-down">
            <div className="max-w-7xl mx-auto px-4 py-6">
              {/* Primary nav */}
              <nav className="space-y-1 mb-6">
                {primaryNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300",
                      isActive(item.href)
                        ? "bg-brand-primary/10 text-brand-primary border-l-4 border-brand-primary"
                        : "text-text-primary hover:bg-surface-elevated hover:text-brand-primary"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Worlds nav */}
              <div className="border-t border-border pt-4 mb-6">
                <p className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Mundos
                </p>
                {worldsNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Auth row */}
              <div className="border-t border-border pt-4 px-4">
                {mobileSession ? (
                  <div className="flex items-center justify-between">
                    <Link
                      href="/dashboard"
                      className="text-sm text-text-secondary hover:text-text-primary py-2 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {mobileSession.user.user_metadata?.name || mobileSession.user.email?.split('@')[0]}
                    </Link>
                    <button
                      className="text-sm text-text-muted hover:text-brand-primary py-2 transition-colors"
                      onClick={async () => {
                        const supabase = createBrowserClient(
                          process.env.NEXT_PUBLIC_SUPABASE_URL!,
                          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                        );
                        await supabase.auth.signOut();
                        setIsMobileMenuOpen(false);
                        router.push("/");
                      }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="block text-sm text-text-secondary hover:text-white py-2 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Iniciar sesión
                  </Link>
                )}
              </div>

              {/* Toggles */}
              <div className="border-t border-white/10 pt-4 mt-4 flex items-center gap-2 px-4">
                <button
                  onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-elevated border border-border text-text-secondary hover:text-text-primary text-sm transition-colors"
                >
                  <span>{language === 'es' ? '🇺🇸 EN' : '🇩🇴 ES'}</span>
                </button>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="h-16 lg:h-20" />
    </>
  );
}
