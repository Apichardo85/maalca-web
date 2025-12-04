"use client";

import { motion } from "framer-motion";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/buttons";

export default function AppointmentsPage() {
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
            Gestión de Citas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Calendario y citas de {brandName}
          </p>
        </div>
        <Button variant="primary" size="lg">
          + Nueva Cita
        </Button>
      </motion.div>

      <DashboardCard icon="📅">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚧</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Módulo en Desarrollo
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            El sistema de citas estará disponible próximamente
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Inspirado en el portal de Dr. Pichardo
          </p>
        </div>
      </DashboardCard>
    </div>
  );
}
