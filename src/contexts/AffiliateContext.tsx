"use client";

import { createContext, useContext, ReactNode } from "react";
import {
  AffiliateConfig,
  BusinessType,
  ModuleKey,
  Plan,
  PlanLimits,
  getModuleLabel,
  getAffiliatePlan,
  getAffiliateLimits,
  isModuleInPlan,
  getMinPlanForModule,
} from "@/config/affiliates-config";

interface AffiliateContextType {
  config: AffiliateConfig | null;
  affiliateId: string | null;
  isAdmin: boolean;
  /** ¿El módulo está habilitado Y cubierto por el plan? */
  hasModule: (module: ModuleKey) => boolean;
  /** ¿El módulo está habilitado en config (ignorando plan)? — útil para UI locked. */
  isModuleConfigured: (module: ModuleKey) => boolean;
  /** ¿El plan contratado incluye este módulo? */
  isModuleInPlan: (module: ModuleKey) => boolean;
  /** Plan mínimo que incluye un módulo (para badges "Requiere Pro"). */
  minPlanForModule: (module: ModuleKey) => Plan;
  hasFeature: (feature: keyof AffiliateConfig['features']) => boolean;
  getLabel: (module: ModuleKey) => string;
  businessType: BusinessType | null;
  primaryColor: string;
  secondaryColor: string;
  brandName: string;
  /** Plan comercial contratado. */
  plan: Plan;
  /** Límites cuantitativos del plan. */
  limits: PlanLimits;
}

const AffiliateContext = createContext<AffiliateContextType | null>(null);

interface AffiliateProviderProps {
  children: ReactNode;
  config: AffiliateConfig | null;
  isAdmin?: boolean;
}

export function AffiliateProvider({ children, config, isAdmin = false }: AffiliateProviderProps) {
  const plan = getAffiliatePlan(config);
  const limits = getAffiliateLimits(config);

  const isModuleConfigured = (module: ModuleKey): boolean => {
    return config?.modules[module] ?? false;
  };

  const moduleInPlan = (module: ModuleKey): boolean => {
    return isModuleInPlan(plan, module);
  };

  const hasModule = (module: ModuleKey): boolean => {
    return isModuleConfigured(module) && moduleInPlan(module);
  };

  const minPlanForModule = (module: ModuleKey): Plan => getMinPlanForModule(module);

  const hasFeature = (feature: keyof AffiliateConfig['features']): boolean => {
    return config?.features[feature] ?? false;
  };

  const getLabel = (module: ModuleKey): string => {
    if (!config) return module;
    return getModuleLabel(config, module);
  };

  const value: AffiliateContextType = {
    config,
    affiliateId: config?.id ?? null,
    isAdmin,
    hasModule,
    isModuleConfigured,
    isModuleInPlan: moduleInPlan,
    minPlanForModule,
    hasFeature,
    getLabel,
    businessType: config?.businessType ?? null,
    primaryColor: config?.branding.primaryColor ?? "red-600",
    secondaryColor: config?.branding.secondaryColor ?? "red-400",
    brandName: config?.branding.name ?? "MaalCa",
    plan,
    limits,
  };

  return (
    <AffiliateContext.Provider value={value}>
      {children}
    </AffiliateContext.Provider>
  );
}

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

export function useAffiliateOptional() {
  return useContext(AffiliateContext);
}
