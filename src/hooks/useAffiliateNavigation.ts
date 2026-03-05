import { useAffiliate } from "@/contexts/AffiliateContext";
import type { AffiliateConfig } from "@/config/affiliates-config";

interface NavModule {
  name: string;
  url: string;
  icon: string;
  enabled: boolean;
}

/**
 * Hook helper para navegación de afiliados
 * Provee utilidades para construir URLs y obtener módulos disponibles
 */
export function useAffiliateNavigation() {
  const { config, affiliateId, hasModule } = useAffiliate();

  /**
   * Construye la URL de un módulo del dashboard
   */
  const getModuleUrl = (module: string): string => {
    if (!affiliateId) return "#";
    return `/dashboard/${affiliateId}/${module}`;
  };

  /**
   * Obtiene todos los módulos disponibles para el afiliado
   */
  const availableModules: NavModule[] = [
    {
      name: "Métricas",
      url: getModuleUrl("metrics"),
      icon: "📊",
      enabled: hasModule("metrics")
    },
    {
      name: "Campañas",
      url: getModuleUrl("campaigns"),
      icon: "📢",
      enabled: hasModule("campaigns")
    },
    {
      name: "Clientes",
      url: getModuleUrl("customers"),
      icon: "👥",
      enabled: hasModule("customers")
    },
    {
      name: "Citas",
      url: getModuleUrl("appointments"),
      icon: "📅",
      enabled: hasModule("appointments")
    },
    {
      name: "Tienda",
      url: getModuleUrl("store"),
      icon: "🛍️",
      enabled: hasModule("ecommerce")
    },
    {
      name: "Inventario",
      url: getModuleUrl("inventory"),
      icon: "📦",
      enabled: hasModule("inventory")
    },
    {
      name: "Facturación",
      url: getModuleUrl("invoicing"),
      icon: "💰",
      enabled: hasModule("invoicing")
    },
    {
      name: "Equipo",
      url: getModuleUrl("team"),
      icon: "👨‍💼",
      enabled: hasModule("team")
    }
  ].filter((module) => module.enabled);

  /**
   * Obtiene la URL del dashboard principal
   */
  const getDashboardUrl = (): string => {
    return `/dashboard/${affiliateId}`;
  };

  /**
   * Verifica si una ruta está activa
   */
  const isActiveRoute = (route: string): boolean => {
    if (typeof window === "undefined") return false;
    return window.location.pathname.includes(route);
  };

  return {
    getModuleUrl,
    getDashboardUrl,
    availableModules,
    isActiveRoute,
    config
  };
}
