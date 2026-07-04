'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

interface Props {
  slug: string;
  businessName: string;
  plan: 'free' | 'entrepreneur';
}

export function SpaceSidebar({ slug, businessName, plan }: Props) {
  const pathname = usePathname();
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => language === 'es' ? es : en;

  const navItems = [
    { label: getText('Dashboard', 'Dashboard'),               icon: '🏠', href: `/space/${slug}` },
    { label: getText('Diseñar mi Espacio', 'Design my Space'), icon: '🎨', href: `/space/${slug}/design` },
    { label: getText('Catálogo', 'Catalog'),                  icon: '📦', href: `/space/${slug}/catalog` },
    { label: getText('Módulos', 'Modules'),                   icon: '🧩', href: `/space/${slug}/modules` },
    { label: getText('Estadísticas', 'Stats'),                icon: '📊', href: `/space/${slug}/stats` },
  ];

  const isActive = (href: string) => {
    if (href === `/space/${slug}`) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/*
       * Desktop-only sidebar — mobile navigation lives in the global Header's
       * hamburger menu (language toggle + theme toggle + space nav items).
       * Starts at top-16/top-20 to clear the global Header height.
       */}
      <aside className="hidden md:flex fixed top-16 lg:top-20 bottom-0 left-0 z-30 w-60 flex-col bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800">
        {/* Business header */}
        <div className="px-4 py-5 border-b border-gray-200 dark:border-neutral-800">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {businessName}
          </p>
          <span
            className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              plan === 'entrepreneur'
                ? 'bg-[#C8102E]/10 text-[#C8102E]'
                : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400'
            }`}
          >
            {plan === 'entrepreneur'
              ? getText('Emprendedor', 'Entrepreneur')
              : getText('Plan Gratis', 'Free Plan')}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {navItems.map((mod) => {
            const active = isActive(mod.href);
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#C8102E] text-white'
                    : 'text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span className="text-base">{mod.icon}</span>
                <span>{mod.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
