"use client";

import { createContext, useContext, ReactNode } from "react";
import { AffiliateConfig } from "@/config/affiliates-config";

/**
 * Context type para el afiliado activo
 */
interface AffiliateContextType {
  config: AffiliateConfig | null;
  affiliateId: string | null;
  hasModule: (module: keyof AffiliateConfig['modules']) => boolean;
  hasFeature: (feature: keyof AffiliateConfig['features']) => boolean;
  primaryColor: string;
  secondaryColor: string;
  brandName: string;
}

/**
 * Context para el afiliado activo en el dashboard
 */
const AffiliateContext = createContext<AffiliateContextType | null>(null);

interface AffiliateProviderProps {
  children: ReactNode;
  config: AffiliateConfig | null;
}

/**
 * Provider que envuelve el dashboard de cada afiliado
 * Provee acceso a la configuración del afiliado activo
 */
export function AffiliateProvider({ children, config }: AffiliateProviderProps) {
  const hasModule = (module: keyof AffiliateConfig['modules']): boolean => {
    return config?.modules[module] ?? false;
  };

  const hasFeature = (feature: keyof AffiliateConfig['features']): boolean => {
    return config?.features[feature] ?? false;
  };

  const value: AffiliateContextType = {
    config,
    affiliateId: config?.id ?? null,
    hasModule,
    hasFeature,
    primaryColor: config?.branding.primaryColor ?? "red-600",
    secondaryColor: config?.branding.secondaryColor ?? "red-400",
    brandName: config?.branding.name ?? "MaalCa"
  };

  return (
    <AffiliateContext.Provider value={value}>
      {children}
    </AffiliateContext.Provider>
  );
}

/**
 * Hook para acceder a la configuración del afiliado activo
 *
 * @example
 * const { config, hasModule, primaryColor } = useAffiliate();
 *
 * if (hasModule('metrics')) {
 *   // Mostrar módulo de métricas
 * }
 */
export function useAffiliate() {
  const context = useContext(AffiliateContext);

  if (!context) {
    throw new Error(
      "useAffiliate must be used within AffiliateProvider. " +
      "Make sure you're using this hook inside a dashboard route."
    );
  }

  return context;
}

/**
 * Hook seguro que no lanza error si se usa fuera del provider
 * Útil para componentes compartidos que pueden estar dentro o fuera del dashboard
 */
export function useAffiliateOptional() {
  return useContext(AffiliateContext);
}
