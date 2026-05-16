"use client";

import { useAffiliate } from "@/contexts/AffiliateContext";
import { MaalCaMetrics } from "./MaalCaMetrics";
import { AffiliateMetrics } from "./AffiliateMetrics";

export default function MetricsPage() {
  const { config } = useAffiliate();
  if (config?.businessType === "platform") return <MaalCaMetrics />;
  return <AffiliateMetrics />;
}
