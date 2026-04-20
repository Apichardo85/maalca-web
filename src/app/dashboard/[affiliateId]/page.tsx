"use client";

import { DashboardHome } from "./components/DashboardHome";

/**
 * Home del dashboard — una sola vista para todos los afiliados.
 * `DashboardHome` decide qué renderizar según businessType y plan:
 *  - restaurant: mock rico (KPIs, alerts, live, top, trend) filtrado por plan
 *  - otros verticales: FallbackShell limpio (hero + accesos rápidos del plan)
 */
export default function AffiliateDashboardPage() {
  return <DashboardHome />;
}
