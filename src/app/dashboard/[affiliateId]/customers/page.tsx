"use client";

import { useState, useMemo } from "react";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { DashboardCard, StatCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/buttons";
import { ResponsiveTable, type TableColumn, type SortConfig } from "@/components/ui/ResponsiveTable";
import { TableActionButton, TableActions } from "@/components/ui/TableActionButton";
import { FilterBar, type FilterConfig } from "@/components/dashboard/shared/FilterBar";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { TLD_AFFILIATE_ID, TLD_CUSTOMERS } from "@/lib/mock/tld-dashboard";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: string;
  visits: number;
  lastVisit: string;
  status: "active" | "vip" | "inactive";
}

const MOCK_CUSTOMERS: Customer[] = [
  { id: "C001", name: "María González", email: "maria@email.com", phone: "(809) 555-0123", totalSpent: "$1,245", visits: 12, lastVisit: "2025-12-01", status: "active" },
  { id: "C002", name: "Juan Pérez", email: "juan@email.com", phone: "(809) 555-0456", totalSpent: "$890", visits: 8, lastVisit: "2025-11-28", status: "active" },
  { id: "C003", name: "Ana Martínez", email: "ana@email.com", phone: "(809) 555-0789", totalSpent: "$2,150", visits: 15, lastVisit: "2025-12-03", status: "vip" },
  { id: "C004", name: "Carlos López", email: "carlos@email.com", phone: "(809) 555-0321", totalSpent: "$450", visits: 5, lastVisit: "2025-10-15", status: "inactive" },
  { id: "C005", name: "Laura Fernández", email: "laura@email.com", phone: "(809) 555-0654", totalSpent: "$3,200", visits: 22, lastVisit: "2025-12-05", status: "vip" },
];

const STATUS_STYLES: Record<string, string> = {
  active:   "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  vip:      "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
};
const STATUS_LABELS: Record<string, string> = {
  active: "Activo", vip: "VIP", inactive: "Inactivo",
};

const filterConfigs: FilterConfig[] = [
  {
    name: "status",
    label: "Todos los estados",
    options: [
      { label: "Activos", value: "active" },
      { label: "VIP", value: "vip" },
      { label: "Inactivos", value: "inactive" },
    ],
  },
];

export default function CustomersPage() {
  const { brandName, config } = useAffiliate();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>();

  const isTld = config?.id === TLD_AFFILIATE_ID;
  const customersSource: Customer[] = isTld ? TLD_CUSTOMERS : MOCK_CUSTOMERS;

  const filteredCustomers = useMemo(() => {
    let result = [...customersSource];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }
    if (filters.status && filters.status !== "all") {
      result = result.filter((c) => c.status === filters.status);
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
  }, [search, filters, sortConfig, customersSource]);

  const columns: TableColumn<Customer>[] = [
    {
      key: "name",
      header: "Cliente",
      sortable: true,
      render: (c) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{c.name}</p>
          <p className="text-xs text-gray-400">{c.id}</p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Contacto",
      render: (c) => (
        <div className="text-sm">
          <p className="text-gray-900 dark:text-white">{c.email}</p>
          <p className="text-gray-400">{c.phone}</p>
        </div>
      ),
    },
    {
      key: "totalSpent",
      header: "Total Gastado",
      sortable: true,
      render: (c) => <span className="font-semibold tabular-nums">{c.totalSpent}</span>,
    },
    {
      key: "visits",
      header: "Visitas",
      sortable: true,
      hideOnMobile: true,
      render: (c) => <span className="tabular-nums">{c.visits}</span>,
    },
    {
      key: "lastVisit",
      header: "Última Visita",
      sortable: true,
      render: (c) => new Date(c.lastVisit).toLocaleDateString(),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (c) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[c.status]}`}>
          {STATUS_LABELS[c.status]}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (c) => (
        <TableActions>
          <TableActionButton variant="primary" onClick={() => {}} icon="👁️">Ver</TableActionButton>
          <TableActionButton variant="secondary" onClick={() => {}} icon="✏️">Editar</TableActionButton>
        </TableActions>
      ),
    },
  ];

  const vipCount = customersSource.filter((c) => c.status === "vip").length;
  const activeCount = customersSource.filter((c) => c.status === "active").length;
  const totalCustomersLabel = isTld ? "842" : "1,248";
  const newThisMonthLabel = isTld ? "+58" : "+42";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Clientes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Base de datos de clientes de {brandName}
          </p>
        </div>
        <Button variant="primary">+ Nuevo Cliente</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Clientes", value: totalCustomersLabel, icon: "👥", color: "blue" },
          { label: "Nuevos Este Mes", value: newThisMonthLabel, icon: "✨", color: "green", change: { value: isTld ? 14 : 12, type: "increase" as const } },
          { label: "Clientes VIP", value: vipCount.toString(), icon: "⭐", color: "purple" },
          { label: "Activos", value: activeCount.toString(), icon: "🟢", color: "teal" },
        ].map((stat, index) => (
          <div key={stat.label} className="animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Table */}
      <DashboardCard title="Lista de Clientes" icon="👥">
        <FilterBar
          searchPlaceholder="Buscar por nombre, email o teléfono..."
          filters={filterConfigs}
          onSearch={setSearch}
          onFilter={(name, value) => setFilters((prev) => ({ ...prev, [name]: value }))}
          onClear={() => { setSearch(""); setFilters({}); }}
          activeFilters={filters}
          searchValue={search}
        />

        {filteredCustomers.length > 0 ? (
          <ResponsiveTable
            data={filteredCustomers}
            columns={columns}
            getRowKey={(c) => c.id}
            sortConfig={sortConfig}
            onSort={(key) =>
              setSortConfig((prev) =>
                prev?.key === key
                  ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
                  : { key, direction: "asc" }
              )
            }
          />
        ) : (
          <EmptyState
            icon="👥"
            title="No se encontraron clientes"
            description="Ajusta los filtros de búsqueda o agrega un nuevo cliente."
            action={{ label: "Nuevo cliente", onClick: () => {} }}
          />
        )}
      </DashboardCard>
    </div>
  );
}
