'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { CATALOG_NAV_LABELS, type BusinessType } from '@/lib/templates/registry';
import { UserBadge } from './UserBadge';

interface Props {
  slug: string;
  businessName: string;
  businessType: BusinessType;
  plan: 'free' | 'entrepreneur';
  primaryColor?: string | null;
  userFullName?: string | null;
  userAvatarUrl?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
}

export function SpaceSidebar({
  slug,
  businessName,
  businessType,
  plan,
  primaryColor,
  userFullName = null,
  userAvatarUrl = null,
  userEmail = null,
  userRole = null,
}: Props) {
  const pathname = usePathname();
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => language === 'es' ? es : en;

  const catalogLabel = CATALOG_NAV_LABELS[businessType][language];

  const navItems = [
    { label: getText('Dashboard', 'Dashboard'),               icon: '🏠', href: `/space/${slug}` },
    { label: getText('Diseñar mi Espacio', 'Design my Space'), icon: '🎨', href: `/space/${slug}/design` },
    { label: getText('Identidad', 'Identity'),                icon: '🪪', href: `/space/${slug}/identidad` },
    { label: catalogLabel,                                    icon: '📦', href: `/space/${slug}/catalog` },
    { label: getText('Pedidos', 'Orders'),                    icon: '🧾', href: `/space/${slug}/orders` },
    // Cocina solo tiene sentido para negocios de comida — una barbería o retail no preparan
    // platos, mostrárselo ahí es ruido (y confunde, como reportó Pegote Barbershop).
    ...(businessType === 'restaurant'
      ? [{ label: getText('Cocina', 'Kitchen'), icon: '🍳', href: `/space/${slug}/kitchen` }]
      : []),
    { label: getText('Pantalla', 'Screen'),                   icon: '📺', href: `/space/${slug}/board` },
    // Personal (meseros, barberos...) — distinto de Equipo (quién entra al dashboard). Lo ve
    // cualquier rol, aunque solo Owner/Manager pueden editar (ver gating en la propia página).
    { label: getText('Personal', 'Personal'),                 icon: '🧑‍🤝‍🧑', href: `/space/${slug}/personal` },
    // Agenda no aplica a Retail/Creator/Publisher — esos negocios no reservan citas.
    ...(!['retail', 'creator', 'publisher'].includes(businessType)
      ? [{ label: getText('Agenda', 'Agenda'), icon: '🗓️', href: `/space/${slug}/agenda` }]
      : []),
    { label: getText('Módulos', 'Modules'),                   icon: '🧩', href: `/space/${slug}/modules` },
    { label: getText('Estadísticas', 'Stats'),                icon: '📊', href: `/space/${slug}/stats` },
    // Equipo solo lo ve el Owner — Manager/Staff no tienen a quién invitar/gestionar.
    ...(userRole === 'Owner'
      ? [{ label: getText('Equipo', 'Team'), icon: '👥', href: `/space/${slug}/team` }]
      : []),
    { label: getText('Facturación', 'Billing'),               icon: '💳', href: `/space/${slug}/settings` },
  ];

  const isActive = (href: string) => {
    if (href === `/space/${slug}`) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/*
       * Desktop-only sidebar. The marketing Header (and its hamburger-menu
       * language/theme toggles) is deliberately hidden on /space routes, so
       * this starts at top-0 — each page's own top bar now carries its own
       * SpaceTopBarControls instead of relying on the global Header for that.
       */}
      <aside className="hidden md:flex fixed top-0 bottom-0 left-0 z-30 w-60 flex-col bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800">
        {/* Business header */}
        <div className="px-4 py-5 border-b border-gray-200 dark:border-neutral-800">
          <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-gray-900 dark:text-white">
            {primaryColor && (
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ background: primaryColor }}
                aria-hidden="true"
              />
            )}
            <span className="truncate">{businessName}</span>
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
          <UserBadge fullName={userFullName} avatarUrl={userAvatarUrl} email={userEmail} role={userRole} />
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
