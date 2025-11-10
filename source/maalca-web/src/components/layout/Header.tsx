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
      <motion.header
        className={cn(getHeaderStyle(), className)}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            {showLogo && (
              <motion.div
                className="flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link href="/" className="flex items-center">
                  <Logo variant="full" size="md" />
                </Link>
              </motion.div>
            )}

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index + 0.3 }}
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
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"
                        layoutId="activeTab"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    
                    {/* Hover indicator */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-primary/60 to-brand-secondary/60 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-300"
                      initial={false}
                    />
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Language Toggle */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <SimpleLanguageToggle />
              </motion.div>

              {/* Theme Toggle */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <ThemeToggle />
              </motion.div>

              {showActions && (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        document.getElementById('ecosistema')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {t('nav.explore')}
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <Button
                      variant="primary"
                      size="sm"
                    >
                      {t('nav.join')}
                    </Button>
                  </motion.div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <motion.button
              className="lg:hidden p-2 rounded-lg hover:bg-surface-elevated transition-colors text-text-primary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
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
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              className="absolute top-16 left-0 right-0 bg-surface shadow-2xl border-t border-border"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Navigation Items */}
                <nav className="space-y-4">
                  {navigationItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
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
                    </motion.div>
                  ))}
                </nav>

                {/* Mobile Actions */}
                <motion.div
                  className="mt-8 pt-6 border-t border-border space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
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
                </motion.div>
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