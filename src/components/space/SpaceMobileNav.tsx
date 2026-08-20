'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { SpaceTopBarControls } from '@/components/space/SpaceTopBarControls';
import { BusinessSwitcher } from '@/components/space/BusinessSwitcher';
import { UserBadge } from '@/components/space/UserBadge';
import { cn } from '@/lib/utils';
import type { Plan } from '@/lib/plan-limits';
import { CATALOG_NAV_LABELS, type BusinessType } from '@/lib/templates/registry';

interface Business {
  id: string;
  slug: string;
  name: string;
  plan: Plan;
}

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
  businesses: Business[];
  canCreateMore: boolean;
  /** Ver mismo comentario en SpaceSidebar.tsx — control de módulos por afiliado desde /ops. */
  activeModules?: string[];
}

/**
 * Centralized top bar + mobile nav for every /space/[slug]/* page — mounted
 * once from that route's layout.tsx, not per-page. Also carries
 * SpaceTopBarControls (language/theme/logout), which used to be mounted
 * separately in 5 different page components; that duplication was the root
 * cause of the "switcher covers the plan badge" bug. Same hamburger/drawer
 * interaction pattern as the corporate Header.tsx (3-line -> X, blurred
 * overlay, click-outside close, body scroll lock) — reused, not reinvented.
 */
export function SpaceMobileNav({
  slug,
  businessName,
  businessType,
  plan,
  primaryColor,
  userFullName = null,
  userAvatarUrl = null,
  userEmail = null,
  userRole = null,
  businesses,
  canCreateMore,
  activeModules,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  const current = businesses.find((b) => b.slug === slug);
  const others = businesses.filter((b) => b.slug !== slug);
  const showSwitcher = !!current && (others.length > 0 || canCreateMore);

  const catalogLabel = CATALOG_NAV_LABELS[businessType][language];

  const allNavItems: { label: string; icon: string; href: string; token?: string }[] = [
    { label: getText('Dashboard', 'Dashboard'), icon: '🏠', href: `/space/${slug}` },
    { label: getText('Diseñar mi Espacio', 'Design my Space'), icon: '🎨', href: `/space/${slug}/design` },
    { label: getText('Identidad', 'Identity'), icon: '🪪', href: `/space/${slug}/identidad` },
    { label: catalogLabel, icon: '📦', href: `/space/${slug}/catalog`, token: 'catalog' },
    { label: getText('Pedidos', 'Orders'), icon: '🧾', href: `/space/${slug}/orders`, token: 'orders' },
    // Cocina/Fila/Facturas/Propuestas: ya no se filtran por businessType acá — ver el comentario
    // completo en SpaceSidebar.tsx. El gate real es activeModules.includes(token) más abajo.
    { label: getText('Cocina', 'Kitchen'), icon: '🍳', href: `/space/${slug}/kitchen`, token: 'kitchen' },
    // POS — restaurante y retail, ver mismo criterio en SpaceSidebar.tsx.
    ...(['restaurant', 'retail'].includes(businessType)
      ? [{ label: getText('Punto de venta', 'Point of sale'), icon: '🧮', href: `/space/${slug}/pos`, token: 'pos' }]
      : []),
    ...(['restaurant', 'retail'].includes(businessType)
      ? [{ label: getText('Inventario', 'Inventory'), icon: '📋', href: `/space/${slug}/inventory`, token: 'inventory' }]
      : []),
    { label: getText('Fila de espera', 'Waiting queue'), icon: '🪑', href: `/space/${slug}/queue`, token: 'queue' },
    { label: getText('Facturas', 'Invoices'), icon: '🧾', href: `/space/${slug}/invoices`, token: 'invoices' },
    { label: getText('Propuestas', 'Proposals'), icon: '✍️', href: `/space/${slug}/proposals`, token: 'proposals' },
    { label: getText('Pantalla', 'Screen'), icon: '📺', href: `/space/${slug}/board`, token: 'board' },
    // Equipo (Personal + Equipo unificados) — mismo criterio que SpaceSidebar.tsx.
    { label: getText('Equipo', 'Team'), icon: '👥', href: `/space/${slug}/equipo`, token: 'staff' },
    ...(businessType === 'restaurant'
      ? [{ label: getText('Reservas', 'Reservations'), icon: '🍽️', href: `/space/${slug}/reservations`, token: 'reservations' }]
      : []),
    ...(!['retail', 'creator', 'publisher', 'restaurant'].includes(businessType)
      ? [{ label: getText('Agenda', 'Agenda'), icon: '🗓️', href: `/space/${slug}/agenda`, token: 'appointments' }]
      : []),
    // Clientes (tarea #249) — sin token, mismo criterio que en SpaceSidebar.tsx.
    { label: getText('Clientes', 'Customers'), icon: '🗂️', href: `/space/${slug}/clientes` },
    { label: getText('Módulos', 'Modules'), icon: '🧩', href: `/space/${slug}/modules` },
    { label: getText('Estadísticas', 'Stats'), icon: '📊', href: `/space/${slug}/stats`, token: 'metrics' },
    { label: getText('Facturación', 'Billing'), icon: '💳', href: `/space/${slug}/settings`, token: 'billing' },
  ];

  const navItems = activeModules
    ? allNavItems.filter((item) => !item.token || activeModules.includes(item.token))
    : allNavItems;

  const isActive = (href: string) =>
    href === `/space/${slug}` ? pathname === href : !!pathname?.startsWith(href);

  // Close the drawer on route change, same as Header.tsx's mobile menu.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Top bar — mobile hamburger + business name, and SpaceTopBarControls
          which stays visible at every breakpoint. This is now its one mount
          point for the whole /space section. */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900 md:justify-end md:border-none md:bg-transparent md:px-6 md:py-4">
        <div className="flex min-w-0 items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="-ml-2 flex-shrink-0 rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 active:scale-95 dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label={isOpen ? getText('Cerrar menú', 'Close menu') : getText('Abrir menú', 'Open menu')}
            aria-expanded={isOpen}
          >
            <div className="flex h-5 w-5 flex-col items-center justify-center gap-1.5">
              <span className={cn('block h-0.5 w-5 rounded-full bg-current transition-all duration-300', isOpen && 'translate-y-2 rotate-45')} />
              <span className={cn('block h-0.5 w-5 rounded-full bg-current transition-all duration-300', isOpen && 'opacity-0')} />
              <span className={cn('block h-0.5 w-5 rounded-full bg-current transition-all duration-300', isOpen && '-translate-y-2 -rotate-45')} />
            </div>
          </button>
          <span className="flex min-w-0 items-center gap-1.5 truncate text-sm font-semibold text-gray-900 dark:text-white">
            {primaryColor && (
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ background: primaryColor }}
                aria-hidden="true"
              />
            )}
            <span className="truncate">{businessName}</span>
          </span>
        </div>
        <SpaceTopBarControls />
      </div>

      {/* Drawer — mobile only, mirrors SpaceSidebar's desktop <aside> content
          (business name + plan badge, then the same 5 nav links in the same
          order, active link highlighted the same way). */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div className="animate-fade-in-left absolute bottom-0 left-0 top-0 flex w-72 max-w-[80vw] flex-col bg-white shadow-2xl dark:bg-neutral-900">
            <div className="border-b border-gray-200 px-4 py-5 dark:border-neutral-800">
              {showSwitcher && current ? (
                <BusinessSwitcher current={current} others={others} canCreateMore={canCreateMore} />
              ) : (
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
              )}
              <span
                className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  plan === 'entrepreneur'
                    ? 'bg-[#C8102E]/10 text-[#C8102E]'
                    : 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400'
                }`}
              >
                {plan === 'entrepreneur'
                  ? getText('Emprendedor', 'Entrepreneur')
                  : getText('Plan Gratis', 'Free Plan')}
              </span>
              <UserBadge fullName={userFullName} avatarUrl={userAvatarUrl} email={userEmail} role={userRole} />
            </div>
            <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-[#C8102E] text-white'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-neutral-300 dark:hover:bg-neutral-800',
                    )}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
