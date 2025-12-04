"use client";

import { motion } from "framer-motion";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/buttons";

export default function CampaignsPage() {
  const { brandName } = useAffiliate();

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Campañas de Marketing
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gestiona tus campañas y promociones de {brandName}
          </p>
        </div>
        <Button variant="primary" size="lg">
          + Nueva Campaña
        </Button>
      </motion.div>

      <DashboardCard icon="📢">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚧</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Módulo en Desarrollo
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            El módulo de campañas estará disponible próximamente
          </p>
        </div>
      </DashboardCard>
    </div>
  );
}
