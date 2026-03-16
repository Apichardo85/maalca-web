"use client";

import { motion } from "framer-motion";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/buttons";

/**
 * Página de configuración del dashboard
 */
export default function SettingsPage() {
  const { config, brandName } = useAffiliate();

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Configuración
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Administra la configuración de {brandName}
        </p>
      </motion.div>

      {/* Información del negocio */}
      <DashboardCard title="Información del Negocio" icon="🏢">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Negocio
            </label>
            <input
              type="text"
              defaultValue={config?.branding.name}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <input
              type="text"
              defaultValue={config?.branding.description}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color Primario
            </label>
            <input
              type="text"
              defaultValue={config?.branding.primaryColor}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Moneda
            </label>
            <input
              type="text"
              defaultValue={config?.settings.currency}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled
            />
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            ℹ️ Esta configuración se gestiona desde <code>src/config/affiliates-config.ts</code>
          </p>
        </div>
      </DashboardCard>

      {/* Módulos habilitados */}
      <DashboardCard title="Módulos Habilitados" icon="📦">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(config?.modules || {}).map(([module, enabled]) => (
            <div
              key={module}
              className={`p-4 rounded-lg border-2 ${
                enabled
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${enabled ? "bg-green-500" : "bg-gray-400"}`}></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {module}
                </span>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* Features */}
      <DashboardCard title="Características" icon="⚡">
        <div className="space-y-4">
          {Object.entries(config?.features || {}).map(([feature, enabled]) => (
            <div
              key={feature}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  enabled ? "bg-green-100 dark:bg-green-900/20" : "bg-gray-200 dark:bg-gray-700"
                }`}>
                  {enabled ? "✓" : "✗"}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {enabled ? "Activo" : "Desactivado"}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                enabled
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
              }`}>
                {enabled ? "ON" : "OFF"}
              </span>
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* Configuración regional */}
      <DashboardCard title="Configuración Regional" icon="🌍">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Zona Horaria
            </label>
            <input
              type="text"
              defaultValue={config?.settings.timezone}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Formato de Fecha
            </label>
            <input
              type="text"
              defaultValue={config?.settings.dateFormat}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Moneda
            </label>
            <input
              type="text"
              defaultValue={config?.settings.currency}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled
            />
          </div>
        </div>
      </DashboardCard>

      {/* Acciones */}
      <div className="flex justify-end gap-4">
        <Button variant="outline">
          Cancelar
        </Button>
        <Button variant="primary" disabled>
          Guardar Cambios (Próximamente)
        </Button>
      </div>
    </div>
  );
}
