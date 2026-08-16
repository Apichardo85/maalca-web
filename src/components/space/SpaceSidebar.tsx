'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { CATALOG_NAV_LABELS, type BusinessType } from '@/lib/templates/registry';
import { UserBadge } from './UserBadge';

// Ancho real del sidebar cuando está abierto (coincide con w-60 = 15rem) — se expone como CSS
// var en :root para que el wrapper de contenido en layout.tsx (server component, no puede leer
// useState de acá) sepa cuánto padding-left dejar, sin tener que convertir todo layout.tsx en
// un client component solo por esto.
const OPEN_WIDTH = '15rem';
const STORAGE_KEY = 'space-sidebar-collapsed';

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
  /** Affiliate.modulosActivos ya filtrado por ModuleCatalog.FilterActive — controlado desde
   *  /ops (control de módulos por afiliado). Items sin `token` (Dashboard, Diseñar, Identidad,
   *  Módulos) siempre se muestran; el resto se filtra por esta lista. */
  activeModules?: string[];
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
  activeModules,
}: Props) {
  const pathname = usePathname();
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => language === 'es' ? es : en;

  // Colapsable en desktop para ahorrar espacio (pedido explícito — antes era imposible
  // ocultarlo). Empieza abierto en el primer render (evita mismatch de hidratación con lo que
  // ya haya en localStorage) y se ajusta apenas monta.
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === '1') setCollapsed(true);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--space-sidebar-w', collapsed ? '0px' : OPEN_WIDTH);
  }, [collapsed]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      return next;
    });
  }

  const catalogLabel = CATALOG_NAV_LABELS[businessType][language];

  const allNavItems: { label: string; icon: string; href: string; token?: string }[] = [
    { label: getText('Dashboard', 'Dashboard'),               icon: '🏠', href: `/space/${slug}` },
    { label: getText('Diseñar mi Espacio', 'Design my Space'), icon: '🎨', href: `/space/${slug}/design` },
    { label: getText('Identidad', 'Identity'),                icon: '🪪', href: `/space/${slug}/identidad` },
    { label: catalogLabel,                                    icon: '📦', href: `/space/${slug}/catalog`, token: 'catalog' },
    { label: getText('Pedidos', 'Orders'),                    icon: '🧾', href: `/space/${slug}/orders`, token: 'orders' },
    // Cocina solo tiene sentido para negocios de comida — una barbería o retail no preparan
    // platos, mostrárselo ahí es ruido (y confunde, como reportó Pegote Barbershop).
    ...(businessType === 'restaurant'
      ? [{ label: getText('Cocina', 'Kitchen'), icon: '🍳', href: `/space/${slug}/kitchen`, token: 'kitchen' }]
      : []),
    // POS (Etapa D, fase 1) — arranca solo con restaurante (mismo criterio que Cocina, con la
    // que se conecta: una venta del POS aparece en el Kitchen Display igual que un pedido
    // online). Otros BusinessType se suman después si hace falta.
    ...(businessType === 'restaurant'
      ? [{ label: getText('Punto de venta', 'Point of sale'), icon: '🧮', href: `/space/${slug}/pos`, token: 'pos' }]
      : []),
    { label: getText('Pantalla', 'Screen'),                   icon: '📺', href: `/space/${slug}/board`, token: 'board' },
    // Equipo (Personal + Equipo unificados): staff que atiende clientes y/o tiene acceso al
    // dashboard, todo en una sola pantalla. Lo ve cualquier rol, aunque solo Owner/Manager
    // pueden editar y solo Owner administra accesos de dashboard (ver gating en la página).
    { label: getText('Equipo', 'Team'),                       icon: '👥', href: `/space/${slug}/equipo`, token: 'staff' },
    // Agenda no aplica a Retail/Creator/Publisher — esos negocios no reservan citas.
    ...(!['retail', 'creator', 'publisher'].includes(businessType)
      ? [{ label: getText('Agenda', 'Agenda'), icon: '🗓️', href: `/space/${slug}/agenda`, token: 'appointments' }]
      : []),
    { label: getText('Módulos', 'Modules'),                   icon: '🧩', href: `/space/${slug}/modules` },
    { label: getText('Estadísticas', 'Stats'),                icon: '📊', href: `/space/${slug}/stats`, token: 'metrics' },
    { label: getText('Facturación', 'Billing'),               icon: '💳', href: `/space/${slug}/settings`, token: 'billing' },
  ];

  // Sin activeModules (undefined) no filtra nada — evita romper cualquier consumidor viejo que
  // todavía no pase la prop. Con la lista presente, un item sin token siempre pasa; uno con
  // token solo se muestra si MaalCa lo dejó activo para este afiliado (ver /ops).
  const navItems = activeModules
    ? allNavItems.filter((item) => !item.token || activeModules.includes(item.token))
    : allNavItems;

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
      <aside
        className={`hidden md:flex fixed top-0 bottom-0 left-0 z-30 flex-col overflow-hidden bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 transition-[width] duration-200 ${
          collapsed ? 'w-0 border-r-0' : 'w-60'
        }`}
      >
        {/* Business header */}
        <div className="w-60 shrink-0 px-4 py-5 border-b border-gray-200 dark:border-neutral-800">
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
        <nav className="w-60 shrink-0 flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
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

      {/* Fuera del <aside> a propósito — así no depende de su ancho/overflow y siempre queda
          clickeable, pegado al borde del sidebar (o al borde de la pantalla cuando está
          colapsado). transition-[left] lo acompaña en el mismo movimiento que el ancho del aside. */}
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={collapsed ? getText('Mostrar menú', 'Show menu') : getText('Ocultar menú', 'Hide menu')}
        title={collapsed ? getText('Mostrar menú', 'Show menu') : getText('Ocultar menú', 'Hide menu')}
        className="hidden md:flex fixed top-20 z-40 h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 shadow-sm transition-[left] duration-200 hover:text-gray-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        style={{ left: collapsed ? '0.75rem' : '15rem' }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          className={`h-3 w-3 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
        >
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </>
  );
}
