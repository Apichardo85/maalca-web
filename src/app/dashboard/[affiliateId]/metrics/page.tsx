"use client";

import { useAffiliate } from "@/contexts/AffiliateContext";
import { DashboardCard, StatCard } from "@/components/dashboard/DashboardCard";
import { ResponsiveTable, type TableColumn } from "@/components/ui/ResponsiveTable";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartCard, chartColors, chartTheme } from "@/components/dashboard/shared/ChartCard";

// Mock data — sales by month
const MONTHLY_SALES = [
  { month: "Ene", ventas: 18500 },
  { month: "Feb", ventas: 22300 },
  { month: "Mar", ventas: 19800 },
  { month: "Abr", ventas: 27600 },
  { month: "May", ventas: 31200 },
  { month: "Jun", ventas: 28900 },
  { month: "Jul", ventas: 34100 },
];

// Mock data — traffic sources
const TRAFFIC_SOURCES = [
  { name: "Orgánico", value: 45 },
  { name: "Directo", value: 25 },
  { name: "Redes Sociales", value: 20 },
  { name: "Referidos", value: 10 },
];

// Mock data — top products
interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: string;
  trend: "up" | "down";
}

const TOP_PRODUCTS: TopProduct[] = [
  { id: "1", name: "Servicio Premium", sales: 156, revenue: "$4,680", trend: "up" },
  { id: "2", name: "Paquete Básico", sales: 243, revenue: "$3,645", trend: "up" },
  { id: "3", name: "Producto Especial", sales: 89, revenue: "$2,670", trend: "down" },
  { id: "4", name: "Consulta Express", sales: 67, revenue: "$1,340", trend: "up" },
  { id: "5", name: "Tratamiento Completo", sales: 45, revenue: "$3,375", trend: "down" },
];

const topProductColumns: TableColumn<TopProduct>[] = [
  {
    key: "name",
    header: "Producto/Servicio",
    render: (item) => (
      <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
    ),
  },
  {
    key: "sales",
    header: "Ventas",
    render: (item) => <span className="tabular-nums">{item.sales}</span>,
  },
  {
    key: "revenue",
    header: "Ingresos",
    render: (item) => <span className="tabular-nums font-medium">{item.revenue}</span>,
  },
  {
    key: "trend",
    header: "Tendencia",
    render: (item) => (
      <span className={item.trend === "up" ? "text-green-600" : "text-red-600"}>
        {item.trend === "up" ? "↑ Subiendo" : "↓ Bajando"}
      </span>
    ),
  },
];

export default function MetricsPage() {
  const { brandName, config } = useAffiliate();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Métricas y Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Análisis detallado del rendimiento de {brandName}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: `Ingresos (${config?.settings.currency})`,
            value: config?.settings.currency === "USD" ? "$45,231" : "RD$2,548,920",
            icon: "💰",
            change: { value: 12.5, type: "increase" as const },
            color: "green",
          },
          {
            label: "Clientes Totales",
            value: "1,248",
            icon: "👥",
            change: { value: 8.2, type: "increase" as const },
            color: "blue",
          },
          {
            label: "Tasa de Conversión",
            value: "3.24%",
            icon: "📊",
            change: { value: 0.8, type: "increase" as const },
            color: "purple",
          },
          {
            label: "Ticket Promedio",
            value: config?.settings.currency === "USD" ? "$156" : "RD$8,760",
            icon: "💳",
            change: { value: 5.3, type: "increase" as const },
            color: "orange",
          },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by month — Bar chart */}
        <ChartCard title="Ventas por Mes" icon="📈" timeRanges={["6m", "12m"]}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_SALES}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={chartTheme.grid.stroke}
                strokeOpacity={chartTheme.grid.strokeOpacity}
              />
              <XAxis
                dataKey="month"
                stroke={chartTheme.axis.stroke}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={chartTheme.axis.stroke}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
              <Bar dataKey="ventas" fill={chartColors[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Traffic sources — Donut chart */}
        <ChartCard title="Fuentes de Tráfico" icon="🌐">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={TRAFFIC_SOURCES}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {TRAFFIC_SOURCES.map((_, index) => (
                  <Cell
                    key={index}
                    fill={chartColors[index % chartColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 -mt-2">
            {TRAFFIC_SOURCES.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: chartColors[index % chartColors.length],
                  }}
                />
                <span className="text-gray-500 dark:text-gray-400">
                  {entry.name}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {entry.value}%
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Revenue trend line */}
      <ChartCard
        title="Tendencia de Ingresos"
        icon="💰"
        timeRanges={["7d", "30d", "90d"]}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={MONTHLY_SALES}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={chartTheme.grid.stroke}
              strokeOpacity={chartTheme.grid.strokeOpacity}
            />
            <XAxis
              dataKey="month"
              stroke={chartTheme.axis.stroke}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={chartTheme.axis.stroke}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
            <Line
              type="monotone"
              dataKey="ventas"
              stroke={chartColors[1]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: chartColors[1] }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Top products table */}
      <DashboardCard title="Más Vendidos Este Mes" icon="🏆">
        <ResponsiveTable
          data={TOP_PRODUCTS}
          columns={topProductColumns}
          getRowKey={(item) => item.id}
          emptyMessage="No hay datos de ventas disponibles"
        />
      </DashboardCard>
    </div>
  );
}
