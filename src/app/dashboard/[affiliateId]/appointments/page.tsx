import { getAffiliateConfig, affiliateHasModule } from "@/config/affiliates-config";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard/shared/DashboardSkeleton";
import { AppointmentsClient } from "./components/AppointmentsClient";

export default async function AppointmentsPage({
  params,
}: {
  params: Promise<{ affiliateId: string }>;
}) {
  const { affiliateId } = await params;
  const config = getAffiliateConfig(affiliateId);

  if (!config || !affiliateHasModule(affiliateId, "appointments")) {
    notFound();
  }

  return (
    <Suspense fallback={<DashboardSkeleton variant="table" />}>
      <AppointmentsClient affiliateId={affiliateId} config={config} />
    </Suspense>
  );
}
