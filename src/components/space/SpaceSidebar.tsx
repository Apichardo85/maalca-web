'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { UpgradeModal } from './UpgradeModal';

interface Props {
  slug: string;
  businessName: string;
  plan: 'free' | 'entrepreneur';
  businessId: string;
}

export function SpaceSidebar({ slug, businessName, plan, businessId }: Props) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const pathname = usePathname();
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => language === 'es' ? es : en;

  const freeModules = [
    { label: getText('Inicio', 'Home'),            icon: '🏠', href: `/space/${slug}` },
    { label: getText('Catálogo', 'Catalog'),       icon: '📦', href: `/space/${slug}/catalog` },
    { label: 'QR',                                 icon: '📱', href: `/space/${slug}/qr` },
    { label: getText('Configuración', 'Settings'), icon: '⚙️', href: `/space/${slug}/settings` },
  ];

  const paidModules = [
    { label: getText('Métricas', 'Metrics'),    icon: '📊', href: `/space/${slug}/metrics`,      locked: true },
    { label: getText('Clientes', 'Customers'),  icon: '👥', href: `/space/${slug}/customers`,    locked: true },
    { label: getText('Citas', 'Appointments'), icon: '📅', href: `/space/${slug}/appointments`, locked: true },
    { label: getText('Campañas', 'Campaigns'), icon: '📢', href: `/space/${slug}/campaigns`,    locked: true },
    { label: getText('Facturación', 'Billing'), icon: '🧾', href: `/space/${slug}/invoicing`,   locked: true },
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
          {freeModules.map((mod) => {
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

          <div className="my-3 border-t border-gray-200 dark:border-neutral-800" />

          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-neutral-600">
            Pro
          </p>

          {paidModules.map((mod) => {
            const locked = mod.locked && plan === 'free';
            const active = !locked && isActive(mod.href);

            if (locked) {
              return (
                <div
                  key={mod.href}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm"
                >
                  <div className="flex items-center gap-3 text-gray-400 dark:text-neutral-600">
                    <span className="text-base opacity-40">{mod.icon}</span>
                    <span>{mod.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    <span className="text-xs">🔒</span>
                    <button
                      onClick={() => setShowUpgrade(true)}
                      className="text-xs font-medium text-[#C8102E] hover:underline"
                    >
                      {getText('Mejorar', 'Upgrade')}
                    </button>
                  </div>
                </div>
              );
            }

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

      {showUpgrade && (
        <UpgradeModal
          businessId={businessId}
          businessSlug={slug}
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </>
  );
}
