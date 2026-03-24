"use client";

import { useAffiliate } from "@/contexts/AffiliateContext";

export default function AffiliateDashboardPage() {
  const { config, hasModule, brandName } = useAffiliate();

  const isBarbershop = hasModule('queue') && hasModule('salon');
  const activeModuleCount = Object.values(config?.modules || {}).filter(Boolean).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
          Dashboard — {brandName}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
          {config?.branding.description}
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Módulos Activos',  value: String(activeModuleCount), icon: '📦', color: '#2563eb' },
          { label: 'Moneda',           value: config?.settings.currency ?? '—',  icon: '💱', color: '#16a34a' },
          { label: 'Zona Horaria',     value: (config?.settings.timezone ?? '').split('/')[1] ?? config?.settings.timezone ?? '—', icon: '🌍', color: '#ea580c' },
          { label: 'Multi-idioma',     value: config?.features.multiLanguage ? 'Sí' : 'No', icon: '🗣️', color: '#9333ea' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{kpi.icon}</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Quick stats for barbershops */}
      {isBarbershop && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Estado del Salón
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'En Cola',    value: '3',  color: '#f59e0b' },
              { label: 'En Silla',  value: '2',  color: '#2563eb' },
              { label: 'Libre',     value: '1',  color: '#16a34a' },
            ].map(s => (
              <div key={s.label} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modules overview */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Módulos Habilitados
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(config?.modules || {}).map(([module, enabled]) => (
            <div key={module} className={[
              "flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-medium",
              enabled
                ? "border-green-400 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400"
                : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400"
            ].join(' ')}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
              <span className="capitalize">{module}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Actividad Reciente
        </h2>
        <div className="space-y-3">
          {[
            { dot: 'bg-green-500',  text: 'Dashboard configurado correctamente' },
            { dot: 'bg-blue-500',   text: 'Sistema multi-tenant activo' },
            { dot: 'bg-purple-500', text: `${activeModuleCount} módulos disponibles` },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <div className={`w-2 h-2 ${item.dot} rounded-full flex-shrink-0`} />
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
