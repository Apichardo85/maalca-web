"use client";

import { useState, useEffect } from "react";
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

interface DashboardSidebarProps {
  mobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

/**
 * Sidebar de navegación con módulos condicionales
 */
export function DashboardSidebar({ mobileMenuOpen = false, onMobileMenuClose }: DashboardSidebarProps) {
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
    hasModule('queue') && {
      name: "Fila Virtual",
      href: `/dashboard/${config?.id}/queue`,
      icon: "⏳",
      module: 'queue'
    },
    hasModule('salon') && {
      name: "Salón Virtual",
      href: `/dashboard/${config?.id}/salon`,
      icon: "💈",
      module: 'salon'
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
    hasModule('giftcards') && {
      name: "Gift Cards",
      href: `/dashboard/${config?.id}/giftcards`,
      icon: "💳",
      module: 'giftcards'
    },
    hasModule('team') && {
      name: "Equipo",
      href: `/dashboard/${config?.id}/team`,
      icon: "👨‍💼",
      module: 'team'
    },
    hasModule('reports') && {
      name: "Reportes",
      href: `/dashboard/${config?.id}/reports`,
      icon: "📊",
      module: 'reports'
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

  // Prevenir scroll del body cuando el drawer mobile está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Renderizar item de navegación
  const renderNavItem = (item: NavItem, isMobile = false) => {
    const active = isActive(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => {
          if (isMobile && onMobileMenuClose) {
            onMobileMenuClose();
          }
        }}
      >
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
          <span className="text-xl flex-shrink-0">{item.icon}</span>
          {(!isCollapsed || isMobile) && (
            <span className="font-medium whitespace-nowrap">
              {item.name}
            </span>
          )}
          {active && (!isCollapsed || isMobile) && (
            <motion.div
              layoutId={isMobile ? "activeIndicatorMobile" : "activeIndicator"}
              className={`ml-auto w-1.5 h-1.5 bg-${primaryColor} rounded-full`}
            />
          )}
        </motion.div>
      </Link>
    );
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
              aria-label={isCollapsed ? "Expandir menú" : "Contraer menú"}
            >
              <span className="text-xl">{isCollapsed ? "→" : "←"}</span>
            </button>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navItems.map((item) => renderNavItem(item, false))}
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

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={onMobileMenuClose}
              aria-hidden="true"
            />

            {/* Drawer Panel */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
              aria-label="Menú de navegación móvil"
            >
              {/* Header del drawer */}
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Menú
                    </p>
                  </div>
                </div>

                {/* Botón cerrar */}
                <button
                  onClick={onMobileMenuClose}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Cerrar menú"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation items mobile */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {navItems.map((item) => renderNavItem(item, true))}
              </nav>

              {/* Footer info mobile */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <p className="font-semibold mb-1">MaalCa Ecosystem</p>
                  <p>Dashboard Multi-tenant</p>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
