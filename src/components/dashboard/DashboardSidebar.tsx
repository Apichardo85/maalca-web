"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { useAffiliateNavigation } from "@/hooks/useAffiliateNavigation";
import { PLAN_META } from "@/config/affiliates-config";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: string;
  locked?: boolean;
  requiredPlanLabel?: string;
}

interface NavGroupRendered {
  label: string;
  items: NavItem[];
}

interface DashboardSidebarProps {
  mobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

export function DashboardSidebar({ mobileMenuOpen = false, onMobileMenuClose }: DashboardSidebarProps) {
  const { config, isAdmin, plan } = useAffiliate();
  const { navGroups } = useAffiliateNavigation();
  const planMeta = PLAN_META[plan];
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const dashboardHome: NavItem = {
    name: "Dashboard",
    href: `/dashboard/${config?.id}`,
    icon: "📊",
  };

  const settingsItem: NavItem | null = isAdmin
    ? { name: "Configuración", href: `/dashboard/${config?.id}/settings`, icon: "⚙️" }
    : null;

  const groups: NavGroupRendered[] = navGroups.map((g) => ({
    label: g.label,
    items: g.items.map((i) => ({
      name: i.name,
      href: i.url,
      icon: i.icon,
      locked: i.locked,
      requiredPlanLabel: i.requiredPlanLabel,
    })),
  }));

  const isActive = (href: string) => {
    if (href === `/dashboard/${config?.id}`) return pathname === href;
    return pathname?.startsWith(href);
  };

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const renderNavItem = (item: NavItem) => {
    const active = !item.locked && isActive(item.href);

    // Locked: no navega, muestra lock + badge del tier requerido + tooltip
    if (item.locked) {
      return (
        <div
          key={`locked-${item.name}`}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg cursor-not-allowed select-none",
            "text-gray-400 dark:text-gray-600 opacity-70 hover:opacity-90 transition-opacity"
          )}
          title={item.requiredPlanLabel ? `Requiere plan ${item.requiredPlanLabel}` : "No incluido en tu plan"}
          aria-disabled="true"
        >
          <span className="text-xl flex-shrink-0 grayscale">{item.icon}</span>
          {!isCollapsed && (
            <>
              <span className="font-medium whitespace-nowrap flex-1 truncate">{item.name}</span>
              <span className="inline-flex items-center gap-1 shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5"
                  aria-hidden="true"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                {item.requiredPlanLabel && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {item.requiredPlanLabel}
                  </span>
                )}
              </span>
            </>
          )}
        </div>
      );
    }

    return (
      <Link key={item.href} href={item.href} onClick={onMobileMenuClose}>
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 cursor-pointer",
            "hover:scale-[1.02] active:scale-[0.98]",
            active
              ? "font-semibold"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          )}
          style={
            active
              ? {
                  backgroundColor: "color-mix(in srgb, var(--brand-light) 40%, transparent)",
                  color: "var(--brand-primary)",
                }
              : undefined
          }
        >
          <span className="text-xl flex-shrink-0">{item.icon}</span>
          {!isCollapsed && (
            <span className="font-medium whitespace-nowrap flex-1">{item.name}</span>
          )}
          {active && !isCollapsed && (
            <span
              className="ml-auto w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "var(--brand-primary)" }}
            />
          )}
        </div>
      </Link>
    );
  };

  // Grouped nav rendering (desktop: with labels; collapsed: dividers)
  const renderGroups = (variant: "desktop" | "mobile") => {
    const showLabels = variant === "mobile" || !isCollapsed;
    return (
      <>
        {renderNavItem(dashboardHome)}
        {groups.map((group, idx) => (
          <div key={group.label} className="pt-2">
            {showLabels ? (
              <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {group.label}
              </p>
            ) : (
              idx > 0 && <div className="my-2 mx-4 border-t border-gray-200 dark:border-gray-800" />
            )}
            <div className="space-y-1">{group.items.map(renderNavItem)}</div>
          </div>
        ))}
        {settingsItem && (
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
            {renderNavItem(settingsItem)}
          </div>
        )}
      </>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:block bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="h-[calc(100vh-4rem)] flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={isCollapsed ? "Expandir menú" : "Contraer menú"}
            >
              <span className="text-xl">{isCollapsed ? "→" : "←"}</span>
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">{renderGroups("desktop")}</nav>
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Plan</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 font-bold uppercase tracking-wider text-[10px] text-gray-700 dark:text-gray-300">
                    {planMeta.label}
                  </span>
                </div>
                <a
                  href="/servicios"
                  className="block text-[11px] underline-offset-2 hover:underline hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Ver planes / upgrade →
                </a>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Overlay + Drawer */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-200",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onMobileMenuClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col",
          "transition-transform duration-300",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {config?.branding.logo && (
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={config.branding.logo}
                  alt={config.branding.name}
                  className="w-6 h-6 object-contain"
                />
              </div>
            )}
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">
                {config?.branding.name}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Menú</p>
            </div>
          </div>
          <button
            onClick={onMobileMenuClose}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Cerrar menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">{renderGroups("mobile")}</nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Plan</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 font-bold uppercase tracking-wider text-[10px] text-gray-700 dark:text-gray-300">
                {planMeta.label}
              </span>
            </div>
            <a
              href="/servicios"
              className="block text-[11px] underline-offset-2 hover:underline hover:text-gray-700 dark:hover:text-gray-300"
            >
              Ver planes / upgrade →
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
