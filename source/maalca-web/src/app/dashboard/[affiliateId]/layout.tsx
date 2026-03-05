import { notFound } from "next/navigation";
import { getAffiliateConfig } from "@/config/affiliates-config";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";

interface AffiliateDashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    affiliateId: string;
  }>;
}

/**
 * Layout principal para los dashboards de afiliados
 *
 * Provee:
 * - Configuración del afiliado vía AffiliateProvider
 * - Header con branding personalizado
 * - Sidebar con navegación de módulos
 * - Validación de afiliado existente
 */
export default async function AffiliateDashboardLayout({
  children,
  params
}: AffiliateDashboardLayoutProps) {
  const { affiliateId } = await params;
  const config = getAffiliateConfig(affiliateId);

  // Si el afiliado no existe, mostrar 404
  if (!config) {
    notFound();
  }

  return (
    <DashboardLayoutClient config={config}>
      {children}
    </DashboardLayoutClient>
  );
}

/**
 * Metadata dinámica para SEO
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ affiliateId: string }>;
}) {
  const { affiliateId } = await params;
  const config = getAffiliateConfig(affiliateId);

  if (!config) {
    return {
      title: "Dashboard no encontrado"
    };
  }

  return {
    title: `Dashboard - ${config.branding.name} | MaalCa`,
    description: `Panel de control para ${config.branding.description}`
  };
}
