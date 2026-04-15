"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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
import { cn } from "@/lib/utils";

// ─── Mock data ──────────────────────────────────────────────────────────────

const MONTHLY_SALES = [
  { month: "Ene", ventas: 18500 },
  { month: "Feb", ventas: 22300 },
  { month: "Mar", ventas: 19800 },
  { month: "Abr", ventas: 27600 },
  { month: "May", ventas: 31200 },
  { month: "Jun", ventas: 28900 },
  { month: "Jul", ventas: 34100 },
];

const TRAFFIC_SOURCES = [
  { name: "Orgánico", value: 45 },
  { name: "Directo", value: 25 },
  { name: "Redes Sociales", value: 20 },
  { name: "Referidos", value: 10 },
];

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

// Reports tab — detailed KPIs and period comparison
interface ReportProduct {
  id: string;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  growth: number;
}

const REPORT_PRODUCTS: ReportProduct[] = [
  { id: "1", name: "Corte de cabello",      category: "Servicio",  unitsSold: 245, revenue: 122500, growth:  15.5 },
  { id: "2", name: "Arreglo de barba",      category: "Servicio",  unitsSold: 180, revenue:  54000, growth:   8.2 },
  { id: "3", name: "Pastillas de freno",    category: "Repuesto",  unitsSold:  45, revenue: 157500, growth:  -3.1 },
  { id: "4", name: "Aceite motor 5W-30",    category: "Lubricante",unitsSold: 120, revenue: 102000, growth:  12.8 },
  { id: "5", name: "Menú ejecutivo",        category: "Catering",  unitsSold:  89, revenue: 178000, growth:  22.4 },
];

// ─── UI helpers ─────────────────────────────────────────────────────────────

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

// ─── Page ───────────────────────────────────────────────────────────────────

type TabKey = "overview" | "reports";

export default function MetricsPage() {
  const { brandName, config, hasModule } = useAffiliate();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const hasReports = hasModule("reports");
  const initialTab: TabKey =
    searchParams?.get("tab") === "reports" && hasReports ? "reports" : "overview";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // Keep ?tab= in sync when user switches
  useEffect(() => {
    const currentParam = searchParams?.get("tab") ?? null;
    const desiredParam = activeTab === "reports" ? "reports" : null;
    if (currentParam === desiredParam) return;
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (desiredParam) params.set("tab", desiredParam);
    else params.delete("tab");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [activeTab, searchParams, pathname, router]);

  const currency = config?.settings.currency === "USD" ? "$" : "RD$";

  return (
    <div className="space-y-8">
      {/* Header + tab toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {activeTab === "overview"
              ? `Análisis detallado del rendimiento de ${brandName}`
              : `KPIs y reportes avanzados de ${brandName}`}
          </p>
        </div>
        {hasReports && (
          <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 self-start">
            <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
              Resumen
            </TabButton>
            <TabButton active={activeTab === "reports"} onClick={() => setActiveTab("reports")}>
              Reportes
            </TabButton>
          </div>
        )}
      </div>

      {activeTab === "overview" && (
        <>
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
                      <Cell key={index} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 -mt-2">
                {TRAFFIC_SOURCES.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: chartColors[index % chartColors.length],
                      }}
                    />
                    <span className="text-gray-500 dark:text-gray-400">{entry.name}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {entry.value}%
                    </span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* Revenue trend line */}
          <ChartCard title="Tendencia de Ingresos" icon="💰" timeRanges={["7d", "30d", "90d"]}>
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

          <DashboardCard title="Más Vendidos Este Mes" icon="🏆">
            <ResponsiveTable
              data={TOP_PRODUCTS}
              columns={topProductColumns}
              getRowKey={(item) => item.id}
              emptyMessage="No hay datos de ventas disponibles"
            />
          </DashboardCard>
        </>
      )}

      {activeTab === "reports" && hasReports && (
        <>
          {/* KPIs principales */}
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

          {/* Métricas adicionales */}
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
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                ↑ 5% vs mes anterior
              </p>
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

          {/* Sales by day — real chart */}
          <ChartCard title="Ventas por Día" icon="📈" timeRanges={["7d", "30d"]}>
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
                  stroke={chartColors[2]}
                  strokeWidth={2}
                  dot={{ fill: chartColors[2], r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Category distribution — pie chart */}
          <ChartCard title="Ventas por Categoría" icon="🏷️">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={REPORT_PRODUCTS.map((p) => ({ name: p.category, value: p.revenue }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="value"
                  label={(entry) => entry.name}
                >
                  {REPORT_PRODUCTS.map((_, index) => (
                    <Cell key={index} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Top 5 Products (advanced table) */}
          <DashboardCard title="Top 5 Productos/Servicios" icon="🏆">
            <ResponsiveTable
              data={REPORT_PRODUCTS}
              columns={[
                {
                  key: "name",
                  header: "Producto/Servicio",
                  mobileLabel: "Producto",
                  render: (product) => (
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {product.category}
                      </p>
                    </div>
                  ),
                },
                {
                  key: "unitsSold",
                  header: "Unidades",
                  render: (p) => <span className="font-semibold tabular-nums">{p.unitsSold}</span>,
                },
                {
                  key: "revenue",
                  header: "Ingresos",
                  render: (p) => (
                    <span className="font-semibold tabular-nums">
                      {currency}
                      {p.revenue.toLocaleString()}
                    </span>
                  ),
                },
                {
                  key: "growth",
                  header: "Crecimiento",
                  render: (p) => {
                    const up = p.growth >= 0;
                    return (
                      <span className={`font-medium ${up ? "text-green-600" : "text-red-600"}`}>
                        {up ? "▲" : "▼"} {Math.abs(p.growth)}%
                      </span>
                    );
                  },
                },
              ]}
              getRowKey={(p) => p.id}
              emptyMessage="No hay datos disponibles"
            />
          </DashboardCard>

          {/* Period comparison */}
          <DashboardCard title="Comparativa de Períodos" icon="📊">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Última Semana</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currency}28,450
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 12.5%</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Último Mes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currency}127,400
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 15.3%</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Último Trimestre</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currency}389,200
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 18.7%</p>
              </div>
            </div>
          </DashboardCard>
        </>
      )}
    </div>
  );
}
