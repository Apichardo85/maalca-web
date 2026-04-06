"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-[#E8DED1]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/ciriwhispers"
            className="font-serif text-xl font-bold text-[#8B1A1A] hover:text-[#6B1414] transition-colors"
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
                      ? "text-[#8B1A1A] font-medium"
                      : "text-[#5C3D2E] hover:text-[#8B1A1A]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <LanguageToggle />
          </div>

          {/* Mobile: simplified */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageToggle />
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
                  ? "text-[#8B1A1A] font-medium"
                  : "text-[#8B7355] hover:text-[#8B1A1A]"
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
