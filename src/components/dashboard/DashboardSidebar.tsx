"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: string;
  module?: keyof typeof import("@/config/affiliates-config").affiliatesConfig[string]['modules'];
}

/**
 * Sidebar de navegación con módulos condicionales
 */
export function DashboardSidebar() {
  const { config, hasModule, primaryColor } = useAffiliate();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Definir items de navegación basados en módulos habilitados
  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: `/dashboard/${config?.id}`,
      icon: "📊"
    },
    hasModule('metrics') && {
      name: "Métricas",
      href: `/dashboard/${config?.id}/metrics`,
      icon: "📈",
      module: 'metrics'
    },
    hasModule('campaigns') && {
      name: "Campañas",
      href: `/dashboard/${config?.id}/campaigns`,
      icon: "📢",
      module: 'campaigns'
    },
    hasModule('customers') && {
      name: "Clientes",
      href: `/dashboard/${config?.id}/customers`,
      icon: "👥",
      module: 'customers'
    },
    hasModule('appointments') && {
      name: "Citas",
      href: `/dashboard/${config?.id}/appointments`,
      icon: "📅",
      module: 'appointments'
    },
    hasModule('ecommerce') && {
      name: "Tienda",
      href: `/dashboard/${config?.id}/store`,
      icon: "🛍️",
      module: 'ecommerce'
    },
    hasModule('inventory') && {
      name: "Inventario",
      href: `/dashboard/${config?.id}/inventory`,
      icon: "📦",
      module: 'inventory'
    },
    hasModule('invoicing') && {
      name: "Facturación",
      href: `/dashboard/${config?.id}/invoicing`,
      icon: "💰",
      module: 'invoicing'
    },
    hasModule('team') && {
      name: "Equipo",
      href: `/dashboard/${config?.id}/team`,
      icon: "👨‍💼",
      module: 'team'
    },
    {
      name: "Configuración",
      href: `/dashboard/${config?.id}/settings`,
      icon: "⚙️"
    }
  ].filter(Boolean) as NavItem[];

  const isActive = (href: string) => {
    if (href === `/dashboard/${config?.id}`) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "hidden lg:block bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="h-[calc(100vh-4rem)] flex flex-col">
          {/* Toggle collapse button */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <span className="text-xl">{isCollapsed ? "→" : "←"}</span>
            </button>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      active
                        ? `bg-${primaryColor} bg-opacity-10 text-${primaryColor} dark:text-${primaryColor}`
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="font-medium whitespace-nowrap"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {active && !isCollapsed && (
                      <motion.div
                        layoutId="activeIndicator"
                        className={`ml-auto w-1.5 h-1.5 bg-${primaryColor} rounded-full`}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Footer info */}
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

      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed bottom-4 right-4 z-50 w-14 h-14 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center"
        onClick={() => {/* TODO: implementar mobile menu */}}
      >
        <span className="text-2xl">☰</span>
      </button>
    </>
  );
}
