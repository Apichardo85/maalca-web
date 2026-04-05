"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useTranslation } from "@/hooks/useSimpleLanguage";

export default function CiriNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { href: "/ciriwhispers", label: t("ciriwhispers.nav2.inicio") },
    { href: "/ciriwhispers/biblioteca", label: t("ciriwhispers.nav2.biblioteca") },
    { href: "/ciriwhispers/obras", label: t("ciriwhispers.nav2.obras") },
    { href: "/ciriwhispers/manifiesto", label: t("ciriwhispers.nav2.manifiesto") },
    { href: "/ciriwhispers/contacto", label: t("ciriwhispers.nav2.contacto") },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/ciriwhispers"
            className="font-serif text-xl font-bold text-red-400 hover:text-red-300 transition-colors"
          >
            CiriWhispers
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors text-sm ${
                    pathname === item.href
                      ? "text-red-400"
                      : "text-slate-300 hover:text-red-400"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <LanguageToggle />
            <ThemeToggle />
          </div>

          {/* Mobile: simplified */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile nav links */}
        <div className="md:hidden flex overflow-x-auto space-x-4 pb-3 -mt-1 scrollbar-hide">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap text-xs transition-colors ${
                pathname === item.href
                  ? "text-red-400"
                  : "text-slate-400 hover:text-red-400"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
