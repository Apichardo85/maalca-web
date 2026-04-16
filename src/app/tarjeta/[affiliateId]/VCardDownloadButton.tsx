"use client";

import { getAffiliateConfig } from "@/config/affiliates-config";
import { downloadVCard } from "@/lib/vcard";

interface Props {
  affiliateId: string;
  color: string;
}

export function VCardDownloadButton({ affiliateId, color }: Props) {
  const handleDownload = () => {
    const config = getAffiliateConfig(affiliateId);
    if (!config) return;
    downloadVCard(config);
  };

  return (
    <button
      onClick={handleDownload}
      className="w-full py-4 rounded-xl font-bold text-white text-sm transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
      style={{ background: color }}
    >
      📥 Guardar contacto en tu teléfono
    </button>
  );
}
