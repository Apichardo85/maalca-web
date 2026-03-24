"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";
import SimpleLanguageToggle from "@/components/ui/SimpleLanguageToggle";
import { authService } from "@/lib/auth/auth-service";

interface DashboardHeaderProps {
  onMobileMenuToggle?: () => void;
}

export function DashboardHeader({ onMobileMenuToggle }: DashboardHeaderProps) {
  const { config, brandName, primaryColor, isAdmin } = useAffiliate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="px-4 lg:px-8 h-16 flex items-center justify-between">

        {/* Mobile menu button */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Abrir menú"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Brand */}
        <Link href={`/dashboard/${config?.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          {config?.branding.logo && (
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
              <img src={config.branding.logo} alt={brandName} className="w-8 h-8 object-contain" />
            </div>
          )}
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white text-lg">{brandName}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              Dashboard
              {isAdmin && (
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                  Admin
                </span>
              )}
            </p>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {config?.features.multiLanguage && <SimpleLanguageToggle variant="light" />}
          {config?.features.darkMode && <ThemeSwitch />}

          {config?.features.notifications && (
            <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="Notificaciones">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          )}

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className={`w-8 h-8 bg-${primaryColor} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                {brandName.charAt(0)}
              </div>
            </button>

            {showUserMenu && (
              <>
                {/* Backdrop to close */}
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />

                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20 animate-[fadeIn_.15s_ease]">
                  {/* User info */}
                  <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 mb-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{brandName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isAdmin ? '👑 Administrador' : '👤 Owner'}
                    </p>
                  </div>

                  <Link
                    href={`/affiliates/${config?.id}`}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-base">🌐</span> Ver perfil público
                  </Link>

                  <Link
                    href={`/dashboard/${config?.id}/settings`}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-base">⚙️</span> Configuración
                  </Link>

                  <Link
                    href="/"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-base">🏠</span> Volver al ecosistema
                  </Link>

                  <hr className="my-1.5 border-gray-200 dark:border-gray-700" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                  >
                    <span className="text-base">{loggingOut ? '⏳' : '🚪'}</span>
                    {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
