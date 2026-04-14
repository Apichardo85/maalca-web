"use client";

import { useState, useTransition } from "react";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { AffiliateConfig } from "@/config/affiliates-config";
import { MODULE_NAV_CONFIG } from "@/lib/affiliate-branding";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

type ModuleKey = keyof AffiliateConfig["modules"];

interface ModuleState {
  [module: string]: boolean;
}

const FEATURE_LABELS: Record<string, string> = {
  multiLanguage: "Multi-idioma",
  darkMode: "Modo Oscuro",
  notifications: "Notificaciones",
  analytics: "Analytics Avanzado",
};

export default function SettingsPage() {
  const { config, brandName, isAdmin } = useAffiliate();

  const initialModules: ModuleState = Object.fromEntries(
    Object.entries(config?.modules ?? {}).map(([k, v]) => [k, v])
  );

  const [modules, setModules] = useState<ModuleState>(initialModules);
  const [generating, setGenerating] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isAdmin) {
    return (
      <div className="max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configuración
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Información de {brandName}
          </p>
        </div>

        <div className="flex gap-3 items-start bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <span className="text-xl">🔒</span>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Solo los administradores de MaalCa pueden modificar la configuración
            de módulos.
          </p>
        </div>

        <InfoSection config={config} />
      </div>
    );
  }

  async function handleToggle(moduleName: string, newState: boolean) {
    if (!config) return;
    setError(null);
    if (newState) setGenerating(moduleName);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/dashboard/${config.id}/modules`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ module: moduleName, enabled: newState }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Error al actualizar módulo");
          return;
        }

        setModules(data.modules);
        if (data.pageGenerated) {
          setLastGenerated(moduleName);
          setTimeout(() => setLastGenerated(null), 5000);
        }
      } catch {
        setError("Error de conexión al actualizar módulo");
      } finally {
        setGenerating(null);
      }
    });
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configuración del Sistema
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Administra los módulos activos de <strong>{brandName}</strong>
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <span>⚠️</span>
          <p className="text-sm text-red-600 dark:text-red-400 flex-1">
            {error}
          </p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-lg"
          >
            ×
          </button>
        </div>
      )}

      {/* Generated banner */}
      {lastGenerated && MODULE_NAV_CONFIG[lastGenerated] && (
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <span>✅</span>
          <p className="text-sm text-green-700 dark:text-green-300">
            Ruta{" "}
            <code className="bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded text-xs">
              /dashboard/{config?.id}/{MODULE_NAV_CONFIG[lastGenerated].path}
            </code>{" "}
            generada automáticamente.
          </p>
        </div>
      )}

      {/* Module toggles */}
      <DashboardCard title="Módulos" icon="🧩">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(modules).map(([moduleName, enabled], index) => {
            const info = MODULE_NAV_CONFIG[moduleName];
            if (!info) return null;
            const isGenerating = generating === moduleName;
            const justGenerated = lastGenerated === moduleName;

            return (
              <div
                key={moduleName}
                className={`rounded-xl border-2 p-5 flex flex-col gap-3 transition-all animate-fade-in-up ${
                  enabled
                    ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {info.label}
                      </p>
                      <p className="text-xs text-gray-400">{info.desc}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      enabled
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                    }`}
                  >
                    {enabled ? "ON" : "OFF"}
                  </span>
                </div>

                {justGenerated && (
                  <p className="text-xs text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                    Ruta generada automáticamente ✓
                  </p>
                )}

                <button
                  disabled={isGenerating || isPending}
                  onClick={() =>
                    handleToggle(moduleName as ModuleKey, !enabled)
                  }
                  className={`self-start px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    enabled
                      ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40"
                      : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                  } ${
                    isGenerating || isPending
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isGenerating
                    ? "⏳ Generando ruta..."
                    : enabled
                      ? "Desactivar"
                      : "Activar"}
                </button>
              </div>
            );
          })}
        </div>
      </DashboardCard>

      {/* Business info */}
      <InfoSection config={config} />
    </div>
  );
}

function InfoSection({ config }: { config: AffiliateConfig | null }) {
  if (!config) return null;

  return (
    <div className="space-y-6">
      {/* Branding */}
      <DashboardCard title="Información del Negocio" icon="🏢">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Nombre", value: config.branding.name },
            { label: "Descripción", value: config.branding.description },
            { label: "Color Primario", value: config.branding.primaryColor },
            { label: "Moneda", value: config.settings.currency },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                {f.label}
              </label>
              <input
                type="text"
                value={f.value}
                readOnly
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
              />
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400">
          ℹ️ La información del negocio se gestiona desde{" "}
          <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
            src/config/affiliates-config.ts
          </code>
        </p>
      </DashboardCard>

      {/* Features */}
      <DashboardCard title="Características" icon="⚙️">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(config.features).map(([feature, enabled]) => (
            <div
              key={feature}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                enabled
                  ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              }`}
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {FEATURE_LABELS[feature] ?? feature}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  enabled
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                }`}
              >
                {enabled ? "ON" : "OFF"}
              </span>
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* Regional */}
      <DashboardCard title="Configuración Regional" icon="🌎">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Zona Horaria", value: config.settings.timezone },
            { label: "Formato Fecha", value: config.settings.dateFormat },
            { label: "Moneda", value: config.settings.currency },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                {f.label}
              </label>
              <input
                type="text"
                value={f.value}
                readOnly
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
              />
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}
