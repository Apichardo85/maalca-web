"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { AffiliateConfig } from "@/config/affiliates-config";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { QueueClient } from "./QueueClient";
import { SalonSection } from "./SalonSection";
import { cn } from "@/lib/utils";

type TabKey = "queue" | "salon";

interface Props {
  affiliateId: string;
  config: AffiliateConfig;
  hasSalon: boolean;
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
        active
          ? "bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white"
          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      )}
      style={active ? { color: "var(--brand-primary)" } : undefined}
    >
      {children}
    </button>
  );
}

export function WorkspaceClient({ affiliateId, config, hasSalon }: Props) {
  const { getLabel } = useAffiliate();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialTab: TabKey =
    searchParams?.get("tab") === "salon" && hasSalon ? "salon" : "queue";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // Sync ?tab= param
  useEffect(() => {
    const currentParam = searchParams?.get("tab") ?? null;
    const desiredParam = activeTab === "salon" ? "salon" : null;
    if (currentParam === desiredParam) return;
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (desiredParam) params.set("tab", desiredParam);
    else params.delete("tab");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [activeTab, searchParams, pathname, router]);

  // If salon is not enabled, just render queue directly (no tabs)
  if (!hasSalon) {
    return <QueueClient affiliateId={affiliateId} config={config} />;
  }

  const queueLabel = getLabel("queue");
  const salonLabel = getLabel("salon");

  return (
    <div className="space-y-6">
      {/* Tab switcher — aligned to the right */}
      <div className="flex justify-end">
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <TabButton active={activeTab === "queue"} onClick={() => setActiveTab("queue")}>
            {queueLabel}
          </TabButton>
          <TabButton active={activeTab === "salon"} onClick={() => setActiveTab("salon")}>
            {salonLabel}
          </TabButton>
        </div>
      </div>

      {activeTab === "queue" && <QueueClient affiliateId={affiliateId} config={config} />}
      {activeTab === "salon" && <SalonSection />}
    </div>
  );
}
