"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/buttons";
import { Logo } from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import SimpleLanguageToggle from "@/components/ui/SimpleLanguageToggle";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import { NavigationItem, HeaderProps } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * OPTIMIZATION NOTE:
 * This Header must remain a Client Component because it needs:
 * - Scroll state for transparent/solid effect
 * - Mobile menu toggle state
 * - Body scroll lock
 * 
 * HOWEVER, we've optimized it by:
 * - Removing entrance animations from most elements
 * - Using CSS for hover effects
 * - Keeping Framer Motion ONLY for mobile menu hamburger animation
 * - Adding passive scroll listener for performance
 */
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

  // Handle scroll effect - OPTIMIZED with passive listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    // Use passive listener for better scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial position
    
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
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
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
        className={cn(getHeaderStyle(), className)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            {showLogo && (
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center">
                  <Logo variant="full" size="md" />
                </Link>
              </div>
            )}

            {/* Desktop Navigation - CSS animations instead of Framer Motion */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-3 py-2 text-sm font-medium transition-colors duration-300 group",
                    isActive(item.href)
                      ? "text-brand-primary"
                      : "text-text-primary hover:text-brand-primary"
                  )}
                >
                  {item.label}
                  
                  {/* Active indicator - CSS only */}
                  {isActive(item.href) && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full" />
                  )}
                  
                  {/* Hover indicator - CSS only */}
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-primary/60 to-brand-secondary/60 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                </Link>
              ))}
            </nav>

            {/* Actions - Removed entrance animations */}
            <div className="hidden lg:flex items-center space-x-4">
              <SimpleLanguageToggle />
              <ThemeToggle />

              {showActions && (
                <>
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Iniciar sesión
                    </Button>
                  </Link>

                  <Button variant="primary" size="sm">
                    {t('nav.join')}
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button - Framer Motion kept for complex hamburger animation */}
            <motion.button
              className="lg:hidden p-2 rounded-lg hover:bg-surface-elevated transition-colors text-text-primary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {/* Complex hamburger animation kept as Framer Motion */}
              <motion.div
                animate={isMobileMenuOpen ? "open" : "closed"}
                className="w-6 h-6 flex flex-col justify-center items-center"
              >
                <motion.span
                  className="w-6 h-0.5 bg-current rounded-full block"
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: 45, y: 6 }
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="w-6 h-0.5 bg-current rounded-full block mt-1.5"
                  variants={{
                    closed: { opacity: 1 },
                    open: { opacity: 0 }
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="w-6 h-0.5 bg-current rounded-full block mt-1.5"
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: -45, y: -6 }
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Simplified animations */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel - CSS animation for slide */}
            <motion.div
              className="absolute top-16 left-0 right-0 bg-surface shadow-2xl border-t border-border"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "tween", duration: 0.2 }}
            >
              <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Navigation Items - CSS animations */}
                <nav className="space-y-4">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
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
                  ))}
                </nav>

                {/* Mobile Actions */}
                <div className="mt-8 pt-6 border-t border-border space-y-4">
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-16 lg:h-20" />
    </>
  );
}
