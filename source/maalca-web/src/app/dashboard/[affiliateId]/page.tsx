"use client";

import { useAffiliate } from "@/contexts/AffiliateContext";
import { MetricsModule } from "@/components/dashboard/modules/MetricsModule";
import { QuickActionsModule } from "@/components/dashboard/modules/QuickActionsModule";
import { BarbershopQuickStats } from "@/components/dashboard/modules/BarbershopQuickStats";

/**
 * Dashboard principal del afiliado
 *
 * Muestra:
 * - Bienvenida personalizada
 * - Métricas clave si el módulo está habilitado
 * - Acciones rápidas según módulos activos
 * - Quick stats específicos para barberías (si aplica)
 */
export default function AffiliateDashboardPage() {
  const { config, hasModule, brandName } = useAffiliate();

  // Detectar si es una barbería (tiene queue + salon)
  const isBarbershop = hasModule('queue') && hasModule('salon');

  return (
    <div className="space-y-8">
      {/* Header del dashboard */}
      <div className="fade-in-up">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
          Dashboard - {brandName}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
          {config?.branding.description}
        </p>
      </div>

      {/* Quick Stats para Barberías */}
      {isBarbershop && (
        <div className="fade-in-up delay-100">
          <BarbershopQuickStats />
        </div>
      )}

      {/* Módulo de métricas (si está habilitado y NO es barbería) */}
      {hasModule('metrics') && !isBarbershop && (
        <div className="fade-in-up delay-100">
          <MetricsModule />
        </div>
      )}

      {/* Acciones rápidas (solo si NO es barbería, porque ya tiene su propio componente) */}
      {!isBarbershop && (
        <div className="fade-in-up delay-200">
          <QuickActionsModule />
        </div>
      )}

      {/* Resumen de actividad reciente */}
      <div className="fade-in-up delay-300 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Actividad Reciente
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p>Dashboard configurado correctamente</p>
          </div>
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p>Sistema multi-tenant activo</p>
          </div>
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <p>Módulos disponibles: {Object.values(config?.modules || {}).filter(Boolean).length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
