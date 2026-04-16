/**
 * Tarjeta de negocios digital pública — compartible por link y escaneable por QR.
 *
 * URL: /tarjeta/[affiliateId]
 *
 * Uso:
 *   - Se genera un QR en el dashboard que apunta aquí.
 *   - Compartible por WhatsApp, SMS, email.
 *   - Incluye botones accionables: llamar, WhatsApp, guardar contacto (.vcf), maps.
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAffiliateConfig } from "@/config/affiliates-config";
import { generateQrDataUrl } from "@/lib/qr";
import { getBrandColors } from "@/lib/affiliate-branding";
import { AffiliateBusinessCard } from "@/components/affiliate/AffiliateBusinessCard";
import { VCardDownloadButton } from "./VCardDownloadButton";

interface PageProps {
  params: Promise<{ affiliateId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { affiliateId } = await params;
  const config = getAffiliateConfig(affiliateId);
  if (!config) return { title: "Tarjeta" };
  return {
    title: `${config.branding.name} — Tarjeta de negocios`,
    description: config.branding.description,
    openGraph: {
      title: config.branding.name,
      description: config.branding.description,
      type: "profile",
    },
  };
}

export default async function TarjetaPage({ params }: PageProps) {
  const { affiliateId } = await params;
  const config = getAffiliateConfig(affiliateId);
  if (!config) notFound();

  const colors = getBrandColors(config.branding.primaryColor);

  // El QR de la tarjeta pública apunta a esta misma URL (para que alguien pueda
  // escanearla desde la tarjeta impresa y abrir la versión digital).
  const qrUrl = config.contact?.website
    ?? `https://maalca.com/tarjeta/${affiliateId}`;

  const qrDataUrl = await generateQrDataUrl(qrUrl, {
    darkColor: colors.dark,
    width: 512,
  });

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: `linear-gradient(135deg, ${colors.light} 0%, #ffffff 100%)`,
      }}
    >
      <div className="w-full max-w-md">
        <AffiliateBusinessCard
          config={config}
          qrDataUrl={qrDataUrl}
          qrUrl={qrUrl}
          variant="digital"
        />

        {/* Acción extra: guardar contacto (client-only) */}
        <div className="mt-5">
          <VCardDownloadButton affiliateId={affiliateId} color={colors.primary} />
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Powered by <span className="font-bold">MaalCa</span>
        </p>
      </div>
    </main>
  );
}
