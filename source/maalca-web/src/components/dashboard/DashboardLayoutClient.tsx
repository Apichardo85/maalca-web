"use client";

import { useState } from "react";
import { AffiliateProvider } from "@/contexts/AffiliateContext";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import type { getAffiliateConfig } from "@/config/affiliates-config";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  config: ReturnType<typeof getAffiliateConfig>;
}

/**
 * Client component wrapper para el layout del dashboard
 * Maneja el estado del menú mobile
 */
export function DashboardLayoutClient({ children, config }: DashboardLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AffiliateProvider config={config!}>
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        {/* Header con branding del afiliado */}
        <DashboardHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Layout con sidebar + contenido */}
        <div className="flex">
          {/* Sidebar con navegación de módulos */}
          <DashboardSidebar
            mobileMenuOpen={mobileMenuOpen}
            onMobileMenuClose={() => setMobileMenuOpen(false)}
          />

          {/* Área de contenido principal */}
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AffiliateProvider>
  );
}
