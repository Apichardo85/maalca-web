"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AffiliateProvider } from "@/contexts/AffiliateContext";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getBrandColors } from "@/lib/affiliate-branding";
import { PLAN_META, type AffiliateConfig, type Plan } from "@/config/affiliates-config";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  config: AffiliateConfig;
  isAdmin?: boolean;
}

const VALID_PLANS: Plan[] = ["starter", "growth", "pro", "enterprise"];

export function DashboardLayoutClient({ children, config, isAdmin = false }: DashboardLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const colors = getBrandColors(config.branding.primaryColor);
  const searchParams = useSearchParams();

  // Admin-only preview override: ?previewPlan=starter|growth|pro|enterprise
  const previewPlanParam = searchParams?.get("previewPlan");
  const previewPlan: Plan | null =
    isAdmin && previewPlanParam && VALID_PLANS.includes(previewPlanParam as Plan)
      ? (previewPlanParam as Plan)
      : null;

  const effectiveConfig = useMemo<AffiliateConfig>(() => {
    if (!previewPlan) return config;
    return { ...config, plan: previewPlan };
  }, [config, previewPlan]);

  return (
    <AffiliateProvider config={effectiveConfig} isAdmin={isAdmin}>
      <div
        className="min-h-screen bg-gray-50 dark:bg-black"
        style={{
          '--brand-primary': colors.primary,
          '--brand-dark': colors.dark,
          '--brand-light': colors.light,
        } as React.CSSProperties}
      >
        <DashboardHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        {previewPlan && (
          <div className="bg-amber-100 dark:bg-amber-900/30 border-b border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs px-4 py-2 flex items-center justify-center gap-3">
            <span>
              ⚠️ <strong>Preview mode</strong>: viendo como{" "}
              <span className="font-bold uppercase tracking-wider">
                {PLAN_META[previewPlan].label}
              </span>
            </span>
            <Link
              href="?"
              className="underline font-semibold hover:text-amber-700 dark:hover:text-amber-100"
            >
              Salir
            </Link>
          </div>
        )}
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
