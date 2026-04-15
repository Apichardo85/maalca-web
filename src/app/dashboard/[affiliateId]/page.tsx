"use client";

import { useAffiliate } from "@/contexts/AffiliateContext";
import { DashboardHome } from "./components/DashboardHome";

/**
 * Afiliados que ya usan la nueva `DashboardHome`.
 * Para habilitar a otros: añade su id aquí.
 * Cuando todos estén migrados, se puede eliminar el gate y dejar
 * `DashboardHome` como home por defecto.
 */
const NEW_HOME_AFFILIATES = new Set<string>(["the-little-dominican"]);

export default function AffiliateDashboardPage() {
  const { config, hasModule, brandName } = useAffiliate();

  if (config?.id && NEW_HOME_AFFILIATES.has(config.id)) {
    return <DashboardHome />;
  }

  // ─── Legacy config-view (afiliados no migrados todavía) ──────────────────
  const isBarbershop = hasModule("queue") && hasModule("salon");
  const activeModuleCount = Object.values(config?.modules || {}).filter(Boolean).length;

  const automatedModules: Record<string, "auto" | "manual"> = {
    queue: "auto",
    customers: "auto",
    campaigns: "auto",
    reports: "auto",
    appointments: "manual",
    inventory: "manual",
    invoicing: "manual",
    ecommerce: "manual",
    team: "manual",
    salon: "manual",
    giftcards: "manual",
    menu: "manual",
    orders: "manual",
    qrCodes: "manual",
    metrics: "auto",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
          Dashboard — {brandName}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
          {config?.branding.description}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Módulos Activos", value: String(activeModuleCount), icon: "📦", color: "#2563eb" },
          { label: "Moneda",          value: config?.settings.currency ?? "—", icon: "💱", color: "#16a34a" },
          {
            label: "Zona Horaria",
            value:
              (config?.settings.timezone ?? "").split("/")[1] ??
              config?.settings.timezone ??
              "—",
            icon: "🌍",
            color: "#ea580c",
          },
          { label: "Multi-idioma", value: config?.features.multiLanguage ? "Sí" : "No", icon: "🗣️", color: "#9333ea" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{kpi.icon}</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
              {kpi.label}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      {isBarbershop && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Estado del Salón</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "En Cola", value: "3", color: "#f59e0b" },
              { label: "En Silla", value: "2", color: "#2563eb" },
              { label: "Libre", value: "1", color: "#16a34a" },
            ].map((s) => (
              <div key={s.label} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-3xl font-bold" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Módulos Habilitados</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(config?.modules || {}).map(([module, enabled]) => (
            <div
              key={module}
              className={[
                "flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-medium",
                enabled
                  ? "border-green-400 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400"
                  : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400",
              ].join(" ")}
            >
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${enabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
              />
              <span className="capitalize truncate">{module}</span>
              {enabled && (
                <span
                  className={
                    automatedModules[module] === "auto"
                      ? "ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 whitespace-nowrap"
                      : "ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 whitespace-nowrap"
                  }
                >
                  {automatedModules[module] === "auto" ? "⚡ Auto" : "✋ Manual"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Actividad Reciente</h2>
        <div className="space-y-3">
          {[
            { dot: "bg-green-500", text: "Dashboard configurado correctamente" },
            { dot: "bg-blue-500", text: "Sistema multi-tenant activo" },
            { dot: "bg-purple-500", text: `${activeModuleCount} módulos disponibles` },
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
