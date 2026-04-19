import { useAffiliate } from "@/contexts/AffiliateContext";
import {
  SIDEBAR_GROUPS,
  MODULE_NAV_CONFIG,
  PLAN_META,
  type ModuleKey,
  type Plan,
} from "@/config/affiliates-config";

interface NavModule {
  name: string;
  url: string;
  icon: string;
  enabled: boolean;
  locked?: boolean;
  requiredPlan?: Plan;
  requiredPlanLabel?: string;
}

/**
 * Hook helper para navegación de afiliados
 * Provee utilidades para construir URLs y obtener módulos disponibles
 * respetando la terminología del afiliado (getLabel) y los SIDEBAR_GROUPS.
 *
 * Diferencia "configurado" vs "incluido en el plan":
 *  - hasModule(): ambos — el item aparece habilitado.
 *  - isModuleConfigured() && !isModuleInPlan(): aparece LOCKED con badge del tier requerido.
 */
export function useAffiliateNavigation() {
  const {
    config,
    affiliateId,
    hasModule,
    isModuleConfigured,
    isModuleInPlan,
    minPlanForModule,
    getLabel,
  } = useAffiliate();

  /**
   * Construye la URL de un módulo del dashboard (usando el path canónico
   * definido en MODULE_NAV_CONFIG — p.ej. ecommerce → /store).
   */
  const getModuleUrl = (module: ModuleKey | string): string => {
    if (!affiliateId) return "#";
    const path = MODULE_NAV_CONFIG[module as string]?.path ?? module;
    return `/dashboard/${affiliateId}/${path}`;
  };

  /**
   * Determina si un módulo debe aparecer en la navegación (habilitado).
   * Casos especiales (módulos fusionados):
   *   - `metrics` aparece si el afiliado tiene metrics OR reports
   *   - `queue`   aparece si el afiliado tiene queue OR salon
   */
  const shouldShowModule = (mod: ModuleKey): boolean => {
    if (mod === "metrics") return hasModule("metrics") || hasModule("reports");
    if (mod === "queue") return hasModule("queue") || hasModule("salon");
    if (mod === "salon" || mod === "reports") return false;
    return hasModule(mod);
  };

  /**
   * Determina si un módulo debe aparecer como LOCKED.
   * Locked = configurado para este negocio pero fuera del plan contratado.
   */
  const shouldShowLocked = (mod: ModuleKey): boolean => {
    if (mod === "salon" || mod === "reports") return false;
    if (mod === "metrics") {
      const configured = isModuleConfigured("metrics") || isModuleConfigured("reports");
      const inPlan = isModuleInPlan("metrics") || isModuleInPlan("reports");
      return configured && !inPlan;
    }
    if (mod === "queue") {
      const configured = isModuleConfigured("queue") || isModuleConfigured("salon");
      const inPlan = isModuleInPlan("queue") || isModuleInPlan("salon");
      return configured && !inPlan;
    }
    return isModuleConfigured(mod) && !isModuleInPlan(mod);
  };

  const buildItem = (mod: ModuleKey, locked: boolean): NavModule => {
    const requiredPlan = locked ? minPlanForModule(mod) : undefined;
    return {
      name: getLabel(mod),
      url: locked ? "#" : getModuleUrl(mod),
      icon: MODULE_NAV_CONFIG[mod]?.icon ?? "📄",
      enabled: !locked,
      locked,
      requiredPlan,
      requiredPlanLabel: requiredPlan ? PLAN_META[requiredPlan].label : undefined,
    };
  };

  /**
   * Lista plana de módulos disponibles (compat con código existente).
   * No incluye locked — ese viaja por `navGroups[].items[].locked`.
   */
  const availableModules: NavModule[] = SIDEBAR_GROUPS.flatMap((group) =>
    group.modules.filter((mod) => shouldShowModule(mod)).map((mod) => buildItem(mod, false))
  );

  /**
   * Módulos agrupados por categoría — fuente de verdad para el sidebar.
   * Cada item incluye flag `locked` y `requiredPlanLabel` cuando corresponde.
   */
  const navGroups = SIDEBAR_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    items: group.modules
      .filter((mod) => shouldShowModule(mod) || shouldShowLocked(mod))
      .map((mod) => ({
        key: mod,
        ...buildItem(mod, shouldShowLocked(mod)),
      })),
  })).filter((group) => group.items.length > 0);

  const getDashboardUrl = (): string => `/dashboard/${affiliateId}`;

  const isActiveRoute = (route: string): boolean => {
    if (typeof window === "undefined") return false;
    return window.location.pathname.includes(route);
  };

  return {
    getModuleUrl,
    getDashboardUrl,
    availableModules,
    navGroups,
    shouldShowModule,
    shouldShowLocked,
    isActiveRoute,
    config,
  };
}
