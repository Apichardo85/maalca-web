"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/buttons";
import { Logo } from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import SimpleLanguageToggle from "@/components/ui/SimpleLanguageToggle";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import { NavigationItem, HeaderProps } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function Header({
  className = "",
  variant = "default",
  showLogo = true,
  showActions = true
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();

  const navigationItems: NavigationItem[] = [
    { label: t('nav.home'), href: "/" },
    { label: t('nav.ecosystem'), href: "/ecosistema" },
    { label: t('nav.editorial'), href: "/editorial" },
    { label: t('nav.services'), href: "/servicios" },
    { label: t('nav.contact'), href: "/contacto" }
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const getHeaderStyle = () => {
    const baseStyle = "fixed top-0 left-0 right-0 z-50 transition-all duration-300";

    switch (variant) {
      case "transparent":
        return `${baseStyle} ${isScrolled ? "bg-background/95 backdrop-blur-lg shadow-lg border-b border-border" : "bg-transparent"}`;
      case "solid":
        return `${baseStyle} bg-background shadow-lg border-b border-border`;
      default:
        return `${baseStyle} ${isScrolled ? "bg-background/95 backdrop-blur-lg shadow-lg border-b border-border" : "bg-background/90 backdrop-blur-sm"}`;
    }
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={cn(getHeaderStyle(), "animate-fade-in-down", className)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            {showLogo && (
              <div className="flex-shrink-0 hover:scale-105 transition-transform duration-300 animate-fade-in">
                <Link href="/" className="flex items-center">
                  <Logo variant="full" size="md" />
                </Link>
              </div>
            )}

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item, index) => (
                <div
                  key={item.href}
                  className="animate-fade-in-down"
                  style={{ animationDelay: `${0.1 * index + 0.1}s` }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "relative px-3 py-2 text-sm font-medium transition-colors duration-300 group",
                      isActive(item.href)
                        ? "text-brand-primary"
                        : "text-text-primary hover:text-brand-primary"
                    )}
                  >
                    {item.label}

                    {/* Active indicator */}
                    {isActive(item.href) && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full transition-all duration-300"
                      />
                    )}

                    {/* Hover indicator */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-primary/60 to-brand-secondary/60 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-300"
                    />
                  </Link>
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Language Toggle */}
              <div className="flex-shrink-0 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <SimpleLanguageToggle />
              </div>

              {/* Theme Toggle */}
              <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <ThemeToggle />
              </div>

              {showActions && (
                <>
                  <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <Link href="/login">
                      <Button variant="outline" size="sm">
                        Iniciar sesión
                      </Button>
                    </Link>
                  </div>

                  <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
                    <Button variant="primary" size="sm">
                      {t('nav.join')}
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-surface-elevated transition-colors text-text-primary active:scale-95"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span
                  className={cn(
                    "w-6 h-0.5 bg-current rounded-full block transition-all duration-300",
                    isMobileMenuOpen ? "rotate-45 translate-y-[4px]" : ""
                  )}
                />
                <span
                  className={cn(
                    "w-6 h-0.5 bg-current rounded-full block mt-1.5 transition-all duration-300",
                    isMobileMenuOpen ? "opacity-0" : ""
                  )}
                />
                <span
                  className={cn(
                    "w-6 h-0.5 bg-current rounded-full block mt-1.5 transition-all duration-300",
                    isMobileMenuOpen ? "-rotate-45 -translate-y-[10px]" : ""
                  )}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden animate-overlay-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute top-16 left-0 right-0 bg-surface shadow-2xl border-t border-border animate-fade-in-down">
            <div className="max-w-7xl mx-auto px-4 py-6">
              {/* Navigation Items */}
              <nav className="space-y-4">
                {navigationItems.map((item, index) => (
                  <div
                    key={item.href}
                    className="animate-fade-in-left"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "block px-4 py-3 rounded-xl text-lg font-medium transition-all duration-300",
                        isActive(item.href)
                          ? "bg-gradient-to-r from-brand-primary/10 to-brand-primary/20 text-brand-primary border-l-4 border-brand-primary"
                          : "text-text-primary hover:bg-surface-elevated hover:text-brand-primary"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
              </nav>

              {/* Mobile Actions */}
              <div
                className="mt-8 pt-6 border-t border-border space-y-4 animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                {/* Language & Theme Toggles for Mobile */}
                <div className="flex justify-center gap-4">
                  <SimpleLanguageToggle />
                  <ThemeToggle />
                </div>

                {showActions && (
                  <>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        document.getElementById('ecosistema')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {t('nav.explore')}
                    </Button>

                    <Link href="/login" className="w-full">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Iniciar sesión
                      </Button>
                    </Link>

                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('nav.join')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-16 lg:h-20" />
    </>
  );
}
