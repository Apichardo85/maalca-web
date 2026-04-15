import { redirect } from "next/navigation";

/**
 * @deprecated /reports ha sido fusionado en /metrics (tab "Reportes")
 * Esta página redirige para mantener compatibilidad con links existentes.
 */
export default async function ReportsRedirect({
  params,
}: {
  params: Promise<{ affiliateId: string }>;
}) {
  const { affiliateId } = await params;
  redirect(`/dashboard/${affiliateId}/metrics?tab=reports`);
}
