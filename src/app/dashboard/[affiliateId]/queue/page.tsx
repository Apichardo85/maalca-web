import { getAffiliateConfig, affiliateHasModule } from "@/config/affiliates-config";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard/shared/DashboardSkeleton";
import { WorkspaceClient } from "./components/WorkspaceClient";

export default async function QueuePage({
  params,
}: {
  params: Promise<{ affiliateId: string }>;
}) {
  const { affiliateId } = await params;
  const config = getAffiliateConfig(affiliateId);

  const hasQueue = affiliateHasModule(affiliateId, "queue");
  const hasSalon = affiliateHasModule(affiliateId, "salon");

  // /queue ahora hostea el "Workspace" (queue + salon fusionados).
  // Se muestra si el afiliado tiene CUALQUIERA de los dos módulos.
  if (!config || (!hasQueue && !hasSalon)) {
    notFound();
  }

  return (
    <Suspense fallback={<DashboardSkeleton variant="table" />}>
      <WorkspaceClient affiliateId={affiliateId} config={config} hasSalon={hasSalon} />
    </Suspense>
  );
}
