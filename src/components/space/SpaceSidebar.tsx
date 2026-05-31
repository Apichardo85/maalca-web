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

function SidebarContent({
  slug,
  businessName,
  plan,
  businessId,
  onNavigate,
}: Props & { onNavigate?: () => void }) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const pathname = usePathname();
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => language === 'es' ? es : en;

  const freeModules = [
    { label: getText('Inicio', 'Home'),         icon: '🏠', href: `/space/${slug}` },
    { label: getText('Catálogo', 'Catalog'),    icon: '📦', href: `/space/${slug}/catalog` },
    { label: 'QR',                              icon: '📱', href: `/space/${slug}/qr` },
    { label: getText('Configuración', 'Settings'), icon: '⚙️', href: `/space/${slug}/settings` },
  ];

  const paidModules = [
    { label: getText('Métricas', 'Metrics'),       icon: '📊', href: `/space/${slug}/metrics`,      locked: true },
    { label: getText('Clientes', 'Customers'),     icon: '👥', href: `/space/${slug}/customers`,    locked: true },
    { label: getText('Citas', 'Appointments'),     icon: '📅', href: `/space/${slug}/appointments`, locked: true },
    { label: getText('Campañas', 'Campaigns'),     icon: '📢', href: `/space/${slug}/campaigns`,    locked: true },
    { label: getText('Facturación', 'Billing'),    icon: '🧾', href: `/space/${slug}/invoicing`,    locked: true },
  ];

  const isActive = (href: string) => {
    if (href === `/space/${slug}`) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex h-full flex-col bg-white dark:bg-neutral-900 w-60 border-r border-gray-200 dark:border-neutral-800">
      {/* Header — pt-16 clears the SpaceSwitcherBar fixed at top-4 */}
      <div className="flex min-h-[64px] items-end px-4 pb-4 pt-16 border-b border-gray-200 dark:border-neutral-800">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {businessName}
          </p>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
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
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {freeModules.map((mod) => {
          const active = isActive(mod.href);
          return (
            <Link
              key={mod.href}
              href={mod.href}
              onClick={onNavigate}
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
              onClick={onNavigate}
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

      {showUpgrade && (
        <UpgradeModal
          businessId={businessId}
          businessSlug={slug}
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </aside>
  );
}

export function SpaceSidebar({ slug, businessName, plan, businessId }: Props) {
  const [open, setOpen] = useState(false);
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => language === 'es' ? es : en;

  return (
    <>
      {/* Mobile hamburger — right side to avoid SpaceSwitcherBar (fixed top-4 left-4) */}
      <button
        className="fixed top-3 right-3 z-50 rounded-md bg-gray-100 dark:bg-neutral-800 p-2 text-gray-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700 md:hidden transition-colors"
        onClick={() => setOpen(!open)}
        aria-label={open ? getText('Cerrar menú', 'Close menu') : getText('Abrir menú', 'Open menu')}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Desktop sidebar — fixed */}
      <div className="hidden md:flex fixed inset-y-0 left-0 z-30 w-60">
        <SidebarContent
          slug={slug}
          businessName={businessName}
          plan={plan}
          businessId={businessId}
        />
      </div>

      {/* Mobile sidebar — slide in from left */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-60 transform transition-transform duration-200 ease-in-out md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent
          slug={slug}
          businessName={businessName}
          plan={plan}
          businessId={businessId}
          onNavigate={() => setOpen(false)}
        />
      </div>
    </>
  );
}
