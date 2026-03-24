"use client";

import { createContext, useContext, ReactNode } from "react";
import { AffiliateConfig } from "@/config/affiliates-config";

interface AffiliateContextType {
  config: AffiliateConfig | null;
  affiliateId: string | null;
  isAdmin: boolean;
  hasModule: (module: keyof AffiliateConfig['modules']) => boolean;
  hasFeature: (feature: keyof AffiliateConfig['features']) => boolean;
  primaryColor: string;
  secondaryColor: string;
  brandName: string;
}

const AffiliateContext = createContext<AffiliateContextType | null>(null);

interface AffiliateProviderProps {
  children: ReactNode;
  config: AffiliateConfig | null;
  isAdmin?: boolean;
}

export function AffiliateProvider({ children, config, isAdmin = false }: AffiliateProviderProps) {
  const hasModule = (module: keyof AffiliateConfig['modules']): boolean => {
    return config?.modules[module] ?? false;
  };

  const hasFeature = (feature: keyof AffiliateConfig['features']): boolean => {
    return config?.features[feature] ?? false;
  };

  const value: AffiliateContextType = {
    config,
    affiliateId: config?.id ?? null,
    isAdmin,
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
