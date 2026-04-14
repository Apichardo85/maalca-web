"use client";

import { useState, useMemo } from "react";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { DashboardCard, StatCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/buttons";
import { Pagination } from "@/components/ui/Pagination";
import { ResponsiveTable, type TableColumn, type SortConfig } from "@/components/ui/ResponsiveTable";
import { TableActionButton, TableActions } from "@/components/ui/TableActionButton";
import { FilterBar, type FilterConfig } from "@/components/dashboard/shared/FilterBar";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { ChartCard, chartColors, chartTheme } from "@/components/dashboard/shared/ChartCard";
import { NewSalePanel } from "@/components/dashboard/NewSalePanel";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Invoice {
  id: string;
  customerName: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
}

const MOCK_INVOICES: Invoice[] = [
  { id: "FAC-001", customerName: "María González",     amount: 450.00,  date: "2025-12-01", dueDate: "2025-12-15", status: "paid" },
  { id: "FAC-002", customerName: "Juan Pérez",         amount: 890.00,  date: "2025-12-03", dueDate: "2025-12-17", status: "pending" },
  { id: "FAC-003", customerName: "Ana Martínez",       amount: 2150.00, date: "2025-11-28", dueDate: "2025-12-12", status: "pending" },
  { id: "FAC-004", customerName: "Carlos López",       amount: 325.00,  date: "2025-11-20", dueDate: "2025-12-04", status: "overdue" },
  { id: "FAC-005", customerName: "Laura Fernández",    amount: 1200.00, date: "2025-12-05", dueDate: "2025-12-19", status: "paid" },
  { id: "FAC-006", customerName: "Roberto Silva",      amount: 675.00,  date: "2025-12-02", dueDate: "2025-12-16", status: "paid" },
  { id: "FAC-007", customerName: "Patricia Ruiz",      amount: 1890.00, date: "2025-11-25", dueDate: "2025-12-09", status: "pending" },
  { id: "FAC-008", customerName: "Fernando Castro",    amount: 420.00,  date: "2025-11-18", dueDate: "2025-12-02", status: "overdue" },
  { id: "FAC-009", customerName: "Gabriela Torres",    amount: 3200.00, date: "2025-12-06", dueDate: "2025-12-20", status: "pending" },
  { id: "FAC-010", customerName: "Miguel Ángel Díaz",  amount: 540.00,  date: "2025-12-04", dueDate: "2025-12-18", status: "paid" },
  { id: "FAC-011", customerName: "Sofía Mendoza",      amount: 980.00,  date: "2025-11-22", dueDate: "2025-12-06", status: "overdue" },
  { id: "FAC-012", customerName: "Diego Morales",      amount: 1560.00, date: "2025-12-07", dueDate: "2025-12-21", status: "pending" },
];

const CHART_DATA = [
  { mes: "Jul", ingresos: 12500 },
  { mes: "Ago", ingresos: 15800 },
  { mes: "Sep", ingresos: 14200 },
  { mes: "Oct", ingresos: 18900 },
  { mes: "Nov", ingresos: 16700 },
  { mes: "Dic", ingresos: 22400 },
];

const STATUS_STYLES: Record<string, string> = {
  paid:    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
};
const STATUS_LABELS: Record<string, string> = {
  paid: "Pagada", pending: "Pendiente", overdue: "Vencida",
};

const FILTER_CONFIGS: FilterConfig[] = [
  {
    name: "status",
    label: "Todos los estados",
    options: [
      { label: "Pagadas", value: "paid" },
      { label: "Pendientes", value: "pending" },
      { label: "Vencidas", value: "overdue" },
    ],
  },
];

const ITEMS_PER_PAGE = 5;

export default function InvoicingPage() {
  const { brandName, config } = useAffiliate();
  const currency = config?.settings.currency === "USD" ? "$" : "RD$";

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [showNewSalePanel, setShowNewSalePanel] = useState(false);

  const filteredInvoices = useMemo(() => {
    let result = [...MOCK_INVOICES];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.customerName.toLowerCase().includes(q) ||
          inv.id.toLowerCase().includes(q) ||
          inv.amount.toString().includes(q)
      );
    }
    if (filters.status && filters.status !== "all") {
      result = result.filter((inv) => inv.status === filters.status);
    }
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = String((a as Record<string, unknown>)[sortConfig.key] ?? "");
        const bVal = String((b as Record<string, unknown>)[sortConfig.key] ?? "");
        const cmp = aVal.localeCompare(bVal);
        return sortConfig.direction === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [search, filters, sortConfig]);

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const columns: TableColumn<Invoice>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      render: (inv) => <span className="font-mono text-sm font-medium">{inv.id}</span>,
    },
    {
      key: "customerName",
      header: "Cliente",
      sortable: true,
      render: (inv) => inv.customerName,
    },
    {
      key: "amount",
      header: "Monto",
      sortable: true,
      render: (inv) => (
        <span className="font-semibold tabular-nums">
          {currency}{inv.amount.toFixed(2)}
        </span>
      ),
    },
    {
      key: "date",
      header: "Emitida",
      sortable: true,
      hideOnMobile: true,
      render: (inv) => new Date(inv.date).toLocaleDateString(),
    },
    {
      key: "dueDate",
      header: "Vence",
      sortable: true,
      render: (inv) => new Date(inv.dueDate).toLocaleDateString(),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (inv) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[inv.status]}`}>
          {STATUS_LABELS[inv.status]}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (inv) => (
        <TableActions>
          <TableActionButton variant="primary" onClick={() => {}} icon="👁️">Ver</TableActionButton>
          {inv.status !== "paid" && (
            <TableActionButton variant="success" onClick={() => {}} icon="✅">Cobrar</TableActionButton>
          )}
        </TableActions>
      ),
    },
  ];

  const paidCount = MOCK_INVOICES.filter((i) => i.status === "paid").length;
  const pendingCount = MOCK_INVOICES.filter((i) => i.status === "pending").length;
  const overdueCount = MOCK_INVOICES.filter((i) => i.status === "overdue").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Facturación
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Facturas, pagos y reportes financieros de {brandName}
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowNewSalePanel(true)}>
          + Nueva Venta
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Mes Actual", value: `${currency}18,750`, icon: "💰", color: "green", change: { value: 12.5, type: "increase" as const } },
          { label: "Pendientes", value: pendingCount.toString(), icon: "⏳", color: "yellow" },
          { label: "Pagadas", value: paidCount.toString(), icon: "✅", color: "blue" },
          { label: "Vencidas", value: overdueCount.toString(), icon: "⚠️", color: "red" },
        ].map((stat, index) => (
          <div key={stat.label} className="animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <ChartCard title="Evolución de Ingresos" icon="📈" timeRanges={["6m", "12m"]}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CHART_DATA}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors[1]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColors[1]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid.stroke} strokeOpacity={chartTheme.grid.strokeOpacity} />
            <XAxis dataKey="mes" stroke={chartTheme.axis.stroke} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke={chartTheme.axis.stroke} fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
            <Area type="monotone" dataKey="ingresos" stroke={chartColors[1]} fill="url(#incomeGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Table */}
      <DashboardCard title="Registro de Facturas" icon="💰">
        <FilterBar
          searchPlaceholder="Buscar por cliente, ID o monto..."
          filters={FILTER_CONFIGS}
          onSearch={(q) => { setSearch(q); setCurrentPage(1); }}
          onFilter={(name, value) => { setFilters((prev) => ({ ...prev, [name]: value })); setCurrentPage(1); }}
          onClear={() => { setSearch(""); setFilters({}); setCurrentPage(1); }}
          activeFilters={filters}
          searchValue={search}
        />

        {paginatedInvoices.length > 0 ? (
          <>
            <ResponsiveTable
              data={paginatedInvoices}
              columns={columns}
              getRowKey={(inv) => inv.id}
              sortConfig={sortConfig}
              onSort={(key) =>
                setSortConfig((prev) =>
                  prev?.key === key
                    ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
                    : { key, direction: "asc" }
                )
              }
            />
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredInvoices.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon="💰"
            title="No se encontraron facturas"
            description="Ajusta los filtros o crea una nueva venta para comenzar."
            action={{ label: "Nueva Venta", onClick: () => setShowNewSalePanel(true) }}
          />
        )}
      </DashboardCard>

      {showNewSalePanel && (
        <NewSalePanel
          onClose={() => setShowNewSalePanel(false)}
          onSave={(data) => {
            console.log("Factura guardada:", data);
            setShowNewSalePanel(false);
          }}
        />
      )}
    </div>
  );
}
