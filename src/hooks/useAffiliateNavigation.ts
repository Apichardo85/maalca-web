import { useAffiliate } from "@/contexts/AffiliateContext";
import {
  SIDEBAR_GROUPS,
  MODULE_NAV_CONFIG,
  type ModuleKey,
} from "@/config/affiliates-config";

interface NavModule {
  name: string;
  url: string;
  icon: string;
  enabled: boolean;
}

/**
 * Hook helper para navegación de afiliados
 * Provee utilidades para construir URLs y obtener módulos disponibles
 * respetando la terminología del afiliado (getLabel) y los SIDEBAR_GROUPS.
 */
export function useAffiliateNavigation() {
  const { config, affiliateId, hasModule, getLabel } = useAffiliate();

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
   * Determina si un módulo debe aparecer en la navegación.
   * Casos especiales (módulos fusionados):
   *   - `metrics` aparece si el afiliado tiene metrics OR reports
   *   - `queue`   aparece si el afiliado tiene queue OR salon
   */
  const shouldShowModule = (mod: ModuleKey): boolean => {
    if (mod === "metrics") return hasModule("metrics") || hasModule("reports");
    if (mod === "queue") return hasModule("queue") || hasModule("salon");
    // salon/reports ya están fusionados — nunca aparecen como entrada propia
    if (mod === "salon" || mod === "reports") return false;
    return hasModule(mod);
  };

  /**
   * Lista plana de módulos disponibles (compat con código existente).
   */
  const availableModules: NavModule[] = SIDEBAR_GROUPS.flatMap((group) =>
    group.modules
      .filter((mod) => shouldShowModule(mod))
      .map((mod) => ({
        name: getLabel(mod),
        url: getModuleUrl(mod),
        icon: MODULE_NAV_CONFIG[mod]?.icon ?? "📄",
        enabled: true,
      }))
  );

  /**
   * Módulos agrupados por categoría — fuente de verdad para el sidebar.
   */
  const navGroups = SIDEBAR_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    items: group.modules
      .filter((mod) => shouldShowModule(mod))
      .map((mod) => ({
        key: mod,
        name: getLabel(mod),
        url: getModuleUrl(mod),
        icon: MODULE_NAV_CONFIG[mod]?.icon ?? "📄",
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
    isActiveRoute,
    config,
  };
}
