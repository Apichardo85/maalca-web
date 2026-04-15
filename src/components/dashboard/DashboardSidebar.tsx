"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { useAffiliateNavigation } from "@/hooks/useAffiliateNavigation";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: string;
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
  const { config, isAdmin } = useAffiliate();
  const { navGroups } = useAffiliateNavigation();
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
    items: g.items.map((i) => ({ name: i.name, href: i.url, icon: i.icon })),
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
    const active = isActive(item.href);
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
                <p className="font-semibold mb-1">MaalCa Ecosystem</p>
                <p>Multi-tenant Dashboard</p>
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
            <p className="font-semibold mb-1">MaalCa Ecosystem</p>
            <p>Dashboard Multi-tenant</p>
          </div>
        </div>
      </aside>
    </>
  );
}
