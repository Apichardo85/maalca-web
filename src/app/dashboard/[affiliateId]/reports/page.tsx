"use client";

import { useAffiliate } from "@/contexts/AffiliateContext";
import { DashboardCard, StatCard } from "@/components/dashboard/DashboardCard";
import { ResponsiveTable, TableColumn } from "@/components/ui/ResponsiveTable";

interface TopProduct {
  id: string;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  growth: number;
}

/**
 * Módulo de Reportes
 * KPIs, métricas y análisis de ventas
 */
export default function ReportsPage() {
  const { brandName, config } = useAffiliate();
  const currency = config?.settings.currency === "USD" ? "$" : "RD$";

  // Mock data para top productos
  const topProducts: TopProduct[] = [
    {
      id: "1",
      name: "Corte de cabello",
      category: "Servicio",
      unitsSold: 245,
      revenue: 122500,
      growth: 15.5
    },
    {
      id: "2",
      name: "Arreglo de barba",
      category: "Servicio",
      unitsSold: 180,
      revenue: 54000,
      growth: 8.2
    },
    {
      id: "3",
      name: "Pastillas de freno",
      category: "Repuesto",
      unitsSold: 45,
      revenue: 157500,
      growth: -3.1
    },
    {
      id: "4",
      name: "Aceite motor 5W-30",
      category: "Lubricante",
      unitsSold: 120,
      revenue: 102000,
      growth: 12.8
    },
    {
      id: "5",
      name: "Menú ejecutivo",
      category: "Catering",
      unitsSold: 89,
      revenue: 178000,
      growth: 22.4
    }
  ];

  // Definir columnas para tabla de top productos
  const columns: TableColumn<TopProduct>[] = [
    {
      key: "name",
      header: "Producto/Servicio",
      mobileLabel: "Producto",
      render: (product) => (
        <div>
          <p className="font-medium">{product.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
        </div>
      )
    },
    {
      key: "unitsSold",
      header: "Unidades Vendidas",
      mobileLabel: "Unidades",
      render: (product) => (
        <span className="font-semibold">{product.unitsSold}</span>
      )
    },
    {
      key: "revenue",
      header: "Ingresos",
      mobileLabel: "Ingresos",
      render: (product) => (
        <span className="font-semibold">{currency}{product.revenue.toLocaleString()}</span>
      )
    },
    {
      key: "growth",
      header: "Crecimiento",
      mobileLabel: "Crecimiento",
      render: (product) => {
        const isPositive = product.growth >= 0;
        return (
          <span className={`font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? "▲" : "▼"} {Math.abs(product.growth)}%
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reportes y Análisis
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            KPIs, métricas de ventas y rendimiento de {brandName}
          </p>
        </div>
      </div>

      {/* KPIs principales */}
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Ventas Hoy"
            value={`${currency}4,250`}
            icon="📅"
            change={{ value: 8.5, type: "increase" }}
            color="blue"
          />
          <StatCard
            label="Ventas del Mes"
            value={`${currency}127,400`}
            icon="📊"
            change={{ value: 15.3, type: "increase" }}
            color="green"
          />
          <StatCard
            label="Facturas Generadas"
            value="342"
            icon="🧾"
            change={{ value: 12, type: "increase" }}
            color="purple"
          />
          <StatCard
            label="Ticket Promedio"
            value={`${currency}372`}
            icon="💰"
            change={{ value: -2.1, type: "decrease" }}
            color="orange"
          />
        </div>
      </div>

      {/* Métricas adicionales */}
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Clientes Nuevos</h3>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">42</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Este mes</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Tasa de Retención</h3>
              <span className="text-2xl">🔄</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">78%</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">↑ 5% vs mes anterior</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Satisfacción</h3>
              <span className="text-2xl">⭐</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">4.8/5.0</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Promedio de reseñas</p>
          </div>
        </div>
      </div>

      {/* Placeholder para gráfico de ventas */}
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DashboardCard title="Ventas por Día" icon="📈">
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Gráfico de Ventas por Día
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Próximamente con Recharts
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Visualización interactiva de tendencias de ventas
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Placeholder para gráfico de categorías */}
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DashboardCard title="Ventas por Categoría" icon="🏷️">
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="text-center">
              <div className="text-6xl mb-4">🥧</div>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Distribución por Categoría
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Próximamente con Recharts (PieChart)
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Análisis de productos más vendidos por categoría
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Tabla de Top 5 Productos/Servicios */}
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DashboardCard title="Top 5 Productos/Servicios" icon="🏆">
          <ResponsiveTable
            data={topProducts}
            columns={columns}
            getRowKey={(product) => product.id}
            emptyMessage="No hay datos disponibles"
          />
        </DashboardCard>
      </div>

      {/* Comparativa de períodos */}
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DashboardCard title="Comparativa de Períodos" icon="📊">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Última Semana</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{currency}28,450</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 12.5%</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Último Mes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{currency}127,400</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 15.3%</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Último Trimestre</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{currency}389,200</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 18.7%</p>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
