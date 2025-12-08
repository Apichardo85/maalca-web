import { notFound } from "next/navigation";
import { getAffiliateConfig } from "@/config/affiliates-config";
import { AffiliateProvider } from "@/contexts/AffiliateContext";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

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
    <AffiliateProvider config={config}>
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        {/* Header con branding del afiliado */}
        <DashboardHeader />

        {/* Layout con sidebar + contenido */}
        <div className="flex">
          {/* Sidebar con navegación de módulos */}
          <DashboardSidebar />

          {/* Área de contenido principal */}
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AffiliateProvider>
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
