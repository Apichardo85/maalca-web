"use client";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { DashboardCard, StatCard } from "../DashboardCard";
/**
 * Módulo de métricas y analytics
 */
export function MetricsModule() {
  const { config, primaryColor } = useAffiliate();
  const metrics = {
    revenue: {
      label: config?.settings.currency === "USD" ? "Ingresos USD" : "Ingresos DOP",
      value: config?.settings.currency === "USD" ? "$12,450" : "RD$698,320",
      icon: "💰",
      change: { value: 12.5, type: "increase" as const }
    },
    customers: {
      label: "Clientes Activos",
      value: "248",
      icon: "👥",
      change: { value: 8.2, type: "increase" as const }
    },
    orders: {
      label: "Pedidos Este Mes",
      value: "156",
      icon: "📦",
      change: { value: 15.3, type: "increase" as const }
    },
    satisfaction: {
      label: "Satisfacción",
      value: "4.8/5",
      icon: "⭐",
      change: { value: 2.1, type: "increase" as const }
    }
  };
  return (
    <DashboardCard
      title="Métricas Clave"
      subtitle="Resumen de rendimiento del mes actual"
      icon="📊"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <StatCard {...metrics.revenue} color={primaryColor.split('-')[0]} />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <StatCard {...metrics.customers} color="green" />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <StatCard {...metrics.orders} color="purple" />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <StatCard {...metrics.satisfaction} color="orange" />
        </div>
      </div>
      {/* Gráfico placeholder */}
      <div className="mt-8 p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium mb-2">📈 Gráfico de Tendencias</p>
          <p className="text-sm">Aquí se mostrará el gráfico de ventas y tendencias</p>
          <p className="text-xs mt-2 text-gray-400">(En desarrollo - próximamente con Chart.js o Recharts)</p>
        </div>
      </div>
    </DashboardCard>
  );
}
