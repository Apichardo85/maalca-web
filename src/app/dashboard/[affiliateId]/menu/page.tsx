import { getAffiliateConfig, affiliateHasModule } from "@/config/affiliates-config";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard/shared/DashboardSkeleton";
import { MenuClient } from "./components/MenuClient";

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
      <MenuClient affiliateId={affiliateId} config={config} />
    </Suspense>
  );
}
