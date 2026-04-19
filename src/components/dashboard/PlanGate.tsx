"use client";

import Link from "next/link";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { MODULE_NAV_CONFIG, PLAN_META, type ModuleKey } from "@/config/affiliates-config";

interface PlanGateProps {
  module: ModuleKey;
  children: React.ReactNode;
}

/**
 * Envuelve el contenido de un módulo del dashboard.
 * - Si el módulo NO está configurado para este afiliado → renderiza fallback "no disponible".
 * - Si está configurado pero NO cubierto por el plan → renderiza upgrade CTA.
 * - Si está OK → renderiza children.
 *
 * Uso:
 *   <PlanGate module="campaigns">
 *     <CampaignsModule />
 *   </PlanGate>
 */
export function PlanGate({ module, children }: PlanGateProps) {
  const { isModuleConfigured, isModuleInPlan, minPlanForModule, plan } = useAffiliate();

  const configured = isModuleConfigured(module);
  const inPlan = isModuleInPlan(module);

  if (configured && inPlan) {
    return <>{children}</>;
  }

  const moduleLabel = MODULE_NAV_CONFIG[module]?.label ?? module;
  const moduleIcon = MODULE_NAV_CONFIG[module]?.icon ?? "🔒";
  const currentPlanLabel = PLAN_META[plan].label;

  // Configurado pero no en el plan → upgrade CTA
  if (configured && !inPlan) {
    const requiredPlan = minPlanForModule(module);
    const requiredMeta = PLAN_META[requiredPlan];

    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-center">
        <div className="text-5xl mb-4">{moduleIcon}</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {moduleLabel} no está incluido en tu plan
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Tu plan actual es{" "}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold uppercase tracking-wider">
            {currentPlanLabel}
          </span>
          . Para desbloquear <strong>{moduleLabel}</strong> necesitas el plan{" "}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-wider">
            {requiredMeta.label}
          </span>
          {requiredMeta.priceMonthly !== null && (
            <>
              {" "}desde <strong>${requiredMeta.priceMonthly}/mes</strong>
            </>
          )}
          .
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/servicios"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold rounded-lg transition-colors"
          >
            Ver planes
          </Link>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors"
          >
            Hablar con ventas
          </Link>
        </div>
      </div>
    );
  }

  // No configurado para este negocio — mensaje neutro
  return (
    <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-center">
      <div className="text-5xl mb-4">🚫</div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {moduleLabel} no está disponible
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Este módulo no aplica al tipo de negocio configurado.
      </p>
    </div>
  );
}
