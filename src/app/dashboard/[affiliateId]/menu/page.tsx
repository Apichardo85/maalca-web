import { getAffiliateConfig, affiliateHasModule } from "@/config/affiliates-config";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard/shared/DashboardSkeleton";
import { MenuClientV2 } from "./components/MenuClientV2";

/**
 * Módulo `menu` — un solo flow para todos los afiliados con `modules.menu: true`.
 * Usa MenuClientV2: editor completo con descripción, recorte de imagen, periodos de comida,
 * y persistencia real en Supabase vía /api/dashboard/[affiliateId]/dishes.
 */
export default async function MenuPage({
  params,
}: {
  params: Promise<{ affiliateId: string }>;
}) {
  const { affiliateId } = await params;
  const config = getAffiliateConfig(affiliateId);

  if (!config || !affiliateHasModule(affiliateId, "menu")) {
    notFound();
  }

  return (
    <Suspense fallback={<DashboardSkeleton variant="cards" />}>
      <MenuClientV2 affiliateId={affiliateId} config={config} />
    </Suspense>
  );
}
