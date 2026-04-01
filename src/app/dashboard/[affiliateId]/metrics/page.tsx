"use client";

import { useAffiliate } from "@/contexts/AffiliateContext";
import { DashboardCard, StatCard } from "@/components/dashboard/DashboardCard";

/**
 * Página completa de métricas y analytics
 */
export default function MetricsPage() {
  const { brandName, config } = useAffiliate();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Métricas y Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Análisis detallado del rendimiento de {brandName}
        </p>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label={`Ingresos (${config?.settings.currency})`}
          value={config?.settings.currency === "USD" ? "$45,231" : "RD$2,548,920"}
          icon="💰"
          change={{ value: 12.5, type: "increase" }}
          color="green"
        />
        <StatCard
          label="Clientes Totales"
          value="1,248"
          icon="👥"
          change={{ value: 8.2, type: "increase" }}
          color="blue"
        />
        <StatCard
          label="Tasa de Conversión"
          value="3.24%"
          icon="📊"
          change={{ value: 0.8, type: "increase" }}
          color="purple"
        />
        <StatCard
          label="Ticket Promedio"
          value={config?.settings.currency === "USD" ? "$156" : "RD$8,760"}
          icon="💳"
          change={{ value: 5.3, type: "increase" }}
          color="orange"
        />
      </div>

      {/* Gráficos y detalles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Ventas por Mes" icon="📈">
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="mb-2">Gráfico de barras</p>
              <p className="text-sm">Próximamente con Recharts</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Fuentes de Tráfico" icon="🌐">
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="mb-2">Gráfico de pastel</p>
              <p className="text-sm">Próximamente con Recharts</p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Tabla de productos/servicios más vendidos */}
      <DashboardCard title="Más Vendidos Este Mes" icon="🏆">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Producto/Servicio</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Ventas</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Ingresos</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Tendencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {[
                { name: "Servicio Premium", sales: 156, revenue: "$4,680", trend: "up" },
                { name: "Paquete Básico", sales: 243, revenue: "$3,645", trend: "up" },
                { name: "Producto Especial", sales: 89, revenue: "$2,670", trend: "down" },
              ].map((item, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{item.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.sales}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.revenue}</td>
                  <td className="px-4 py-3">
                    <span className={item.trend === "up" ? "text-green-600" : "text-red-600"}>
                      {item.trend === "up" ? "↑" : "↓"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
}
