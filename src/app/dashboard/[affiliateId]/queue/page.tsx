import { getAffiliateConfig, affiliateHasModule } from "@/config/affiliates-config";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard/shared/DashboardSkeleton";
import { QueueClient } from "./components/QueueClient";

export default async function QueuePage({
  params,
}: {
  params: Promise<{ affiliateId: string }>;
}) {
  const { affiliateId } = await params;
  const config = getAffiliateConfig(affiliateId);

  if (!config || !affiliateHasModule(affiliateId, "queue")) {
    notFound();
  }

  return (
    <Suspense fallback={<DashboardSkeleton variant="table" />}>
      <QueueClient affiliateId={affiliateId} config={config} />
    </Suspense>
  );
}
