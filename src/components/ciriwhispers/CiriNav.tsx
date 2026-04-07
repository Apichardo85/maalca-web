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
    <nav className="sticky top-0 z-50 backdrop-blur-sm border-b"
      style={{ backgroundColor: 'var(--ciri-nav-bg)', borderColor: 'var(--ciri-border)' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/ciriwhispers"
            className="font-serif text-xl font-bold transition-colors"
            style={{ color: 'var(--ciri-brand)' }}
          >
            CiriWhispers
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors text-sm"
                  style={{
                    color: pathname === item.href ? 'var(--ciri-brand)' : 'var(--ciri-text-secondary)',
                    fontWeight: pathname === item.href ? 500 : 400,
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <LanguageToggle />
          </div>
          {/* Mobile */}
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
              className="whitespace-nowrap text-xs transition-colors"
              style={{
                color: pathname === item.href ? 'var(--ciri-brand)' : 'var(--ciri-text-muted)',
                fontWeight: pathname === item.href ? 500 : 400,
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
