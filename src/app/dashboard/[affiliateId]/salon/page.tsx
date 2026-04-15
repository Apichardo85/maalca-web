import { redirect } from "next/navigation";

/**
 * @deprecated /salon ha sido fusionado en /queue (tab "Salón Virtual")
 * Esta página redirige para mantener compatibilidad con links existentes.
 */
export default async function SalonRedirect({
  params,
}: {
  params: Promise<{ affiliateId: string }>;
}) {
  const { affiliateId } = await params;
  redirect(`/dashboard/${affiliateId}/queue?tab=salon`);
}
