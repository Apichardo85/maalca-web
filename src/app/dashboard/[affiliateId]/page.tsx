"use client";

import { motion } from "framer-motion";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { MetricsModule } from "@/components/dashboard/modules/MetricsModule";
import { QuickActionsModule } from "@/components/dashboard/modules/QuickActionsModule";

/**
 * Dashboard principal del afiliado
 *
 * Muestra:
 * - Bienvenida personalizada
 * - Métricas clave si el módulo está habilitado
 * - Acciones rápidas según módulos activos
 */
export default function AffiliateDashboardPage() {
  const { config, hasModule, brandName } = useAffiliate();

  return (
    <div className="space-y-8">
      {/* Header del dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
          Dashboard - {brandName}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
          {config?.branding.description}
        </p>
      </motion.div>

      {/* Módulo de métricas (si está habilitado) */}
      {hasModule('metrics') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <MetricsModule />
        </motion.div>
      )}

      {/* Acciones rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <QuickActionsModule />
      </motion.div>

      {/* Resumen de actividad reciente */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
      >
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
      </motion.div>
    </div>
  );
}
