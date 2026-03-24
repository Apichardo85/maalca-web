"use client";

import { useState } from "react";
import { AffiliateProvider } from "@/contexts/AffiliateContext";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import type { AffiliateConfig } from "@/config/affiliates-config";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  config: AffiliateConfig;
  isAdmin?: boolean;
}

export function DashboardLayoutClient({ children, config, isAdmin = false }: DashboardLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AffiliateProvider config={config} isAdmin={isAdmin}>
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <DashboardHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <div className="flex">
          <DashboardSidebar
            mobileMenuOpen={mobileMenuOpen}
            onMobileMenuClose={() => setMobileMenuOpen(false)}
          />
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
