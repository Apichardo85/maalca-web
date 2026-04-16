import { getAffiliateConfig, affiliateHasModule } from "@/config/affiliates-config";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard/shared/DashboardSkeleton";
import { MenuClient } from "./components/MenuClient";
import { MenuClientV2 } from "./components/MenuClientV2";

/**
 * Afiliados que reciben el nuevo MenuClientV2 (con editor de periodos).
 * El resto sigue viendo el MenuClient legacy — replicamos solo tras validar el piloto.
 */
const NEW_MENU_AFFILIATES = new Set<string>(["the-little-dominican"]);

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

  const useV2 = NEW_MENU_AFFILIATES.has(affiliateId);

  return (
    <Suspense fallback={<DashboardSkeleton variant="cards" />}>
      {useV2 ? (
        <MenuClientV2 affiliateId={affiliateId} config={config} />
      ) : (
        <MenuClient affiliateId={affiliateId} config={config} />
      )}
    </Suspense>
  );
}
