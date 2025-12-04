"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";
import SimpleLanguageToggle from "@/components/ui/SimpleLanguageToggle";

/**
 * Header del dashboard con branding personalizado por afiliado
 */
export function DashboardHeader() {
  const { config, brandName, primaryColor } = useAffiliate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="px-4 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo y nombre del afiliado */}
        <Link
          href={`/dashboard/${config?.id}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          {config?.branding.logo && (
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={config.branding.logo}
                alt={brandName}
                className="w-8 h-8 object-contain"
              />
            </div>
          )}
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white text-lg">
              {brandName}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Dashboard
            </p>
          </div>
        </Link>

        {/* Acciones del header */}
        <div className="flex items-center gap-4">
          {/* Language toggle si está habilitado */}
          {config?.features.multiLanguage && (
            <SimpleLanguageToggle variant="light" />
          )}

          {/* Theme switcher si está habilitado */}
          {config?.features.darkMode && <ThemeSwitch />}

          {/* Notificaciones si está habilitado */}
          {config?.features.notifications && (
            <button
              className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Notificaciones"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {/* Badge de notificaciones */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          )}

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className={`w-8 h-8 bg-${primaryColor} rounded-full flex items-center justify-center text-white font-semibold`}>
                {brandName.charAt(0)}
              </div>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2"
              >
                <Link
                  href={`/affiliates/${config?.id}`}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Ver perfil público
                </Link>
                <Link
                  href={`/dashboard/${config?.id}/settings`}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Configuración
                </Link>
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                <Link
                  href="/"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Volver al ecosistema
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
