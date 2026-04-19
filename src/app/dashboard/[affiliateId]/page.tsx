"use client";

import Link from "next/link";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { PLAN_META, type ModuleKey } from "@/config/affiliates-config";
import { DashboardHome } from "./components/DashboardHome";

/**
 * Afiliados que ya usan la nueva `DashboardHome`.
 * Para habilitar a otros: añade su id aquí.
 * Cuando todos estén migrados, se puede eliminar el gate y dejar
 * `DashboardHome` como home por defecto.
 */
const NEW_HOME_AFFILIATES = new Set<string>(["the-little-dominican"]);

export default function AffiliateDashboardPage() {
  const { config, hasModule, isModuleConfigured, isModuleInPlan, minPlanForModule, plan, brandName } = useAffiliate();

  if (config?.id && NEW_HOME_AFFILIATES.has(config.id)) {
    return <DashboardHome />;
  }

  // ─── Legacy config-view (afiliados no migrados todavía) ──────────────────
  const isBarbershop = hasModule("queue") && hasModule("salon");

  // "Módulos activos" = configurados Y cubiertos por el plan (no solo configurados)
  const moduleKeys = Object.keys(config?.modules || {}) as ModuleKey[];
  const activeModuleCount = moduleKeys.filter((m) => hasModule(m)).length;
  const lockedModuleCount = moduleKeys.filter(
    (m) => isModuleConfigured(m) && !isModuleInPlan(m)
  ).length;
  const planLabel = PLAN_META[plan].label;

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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            Dashboard — {brandName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            {config?.branding.description}
          </p>
        </div>
        <Link
          href="/servicios"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-brand-primary transition-colors"
          title="Ver planes / upgrade"
        >
          Plan {planLabel}
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Módulos Activos",
            value: String(activeModuleCount),
            hint: lockedModuleCount > 0 ? `${lockedModuleCount} bloqueados por plan` : undefined,
            icon: "📦",
          },
          { label: "Plan", value: planLabel, icon: "💎" },
          { label: "Moneda", value: config?.settings.currency ?? "—", icon: "💱" },
          {
            label: "Zona Horaria",
            value:
              (config?.settings.timezone ?? "").split("/")[1] ??
              config?.settings.timezone ??
              "—",
            icon: "🌍",
          },
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
            {kpi.hint && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kpi.hint}</p>
            )}
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
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Módulos Habilitados</h2>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Incluido en {planLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Requiere upgrade
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" /> No aplica
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {moduleKeys.map((module) => {
            const configured = isModuleConfigured(module);
            const inPlan = isModuleInPlan(module);
            const active = configured && inPlan;
            const locked = configured && !inPlan;
            const requiredPlan = locked ? PLAN_META[minPlanForModule(module)].label : null;
            const auto = automatedModules[module] === "auto";

            return (
              <div
                key={module}
                className={[
                  "flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-medium",
                  active
                    ? "border-green-400 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400"
                    : locked
                    ? "border-amber-300 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400",
                ].join(" ")}
                title={
                  active
                    ? `Incluido en plan ${planLabel}`
                    : locked
                    ? `Requiere plan ${requiredPlan}`
                    : "No configurado para este negocio"
                }
              >
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    active
                      ? "bg-green-500"
                      : locked
                      ? "bg-amber-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
                <span className="capitalize truncate">{module}</span>
                {active && (
                  <span
                    className={
                      auto
                        ? "ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 whitespace-nowrap"
                        : "ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 whitespace-nowrap"
                    }
                  >
                    {auto ? "⚡ Auto" : "✋ Manual"}
                  </span>
                )}
                {locked && requiredPlan && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 whitespace-nowrap uppercase tracking-wider">
                    🔒 {requiredPlan}
                  </span>
                )}
              </div>
            );
          })}
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
