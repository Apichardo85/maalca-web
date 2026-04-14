"use client";

import { useState, useMemo } from "react";
import { DashboardCard, StatCard } from "@/components/dashboard/DashboardCard";
import {
  ResponsiveTable,
  type TableColumn,
  type SortConfig,
} from "@/components/ui/ResponsiveTable";
import { FilterBar, type FilterConfig } from "@/components/dashboard/shared/FilterBar";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/buttons";
import { ChartCard, chartColors, chartTheme } from "@/components/dashboard/shared/ChartCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AffiliateConfig } from "@/config/affiliates-config";

// Types
type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "pending";

interface Appointment {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  status: AppointmentStatus;
  notes?: string;
}

// Mock data — outside component
const MOCK_APPOINTMENTS: Appointment[] = [
  { id: "A001", customerName: "María González", service: "Corte y Peinado", date: "2025-12-08", time: "10:00 AM", duration: "60 min", status: "scheduled", notes: "Cliente prefiere estilista Ana" },
  { id: "A002", customerName: "Juan Pérez", service: "Consulta General", date: "2025-12-08", time: "11:30 AM", duration: "30 min", status: "scheduled" },
  { id: "A003", customerName: "Ana Martínez", service: "Tratamiento Completo", date: "2025-12-08", time: "02:00 PM", duration: "90 min", status: "pending" },
  { id: "A004", customerName: "Carlos Rodríguez", service: "Corte Rápido", date: "2025-12-07", time: "09:00 AM", duration: "30 min", status: "completed" },
  { id: "A005", customerName: "Laura Fernández", service: "Manicure y Pedicure", date: "2025-12-07", time: "03:00 PM", duration: "60 min", status: "cancelled", notes: "Cliente canceló por enfermedad" },
  { id: "A006", customerName: "Pedro Sánchez", service: "Corte Clásico", date: "2025-12-06", time: "10:00 AM", duration: "45 min", status: "completed" },
  { id: "A007", customerName: "Sofia Ramírez", service: "Coloración", date: "2025-12-06", time: "02:00 PM", duration: "120 min", status: "completed" },
  { id: "A008", customerName: "Miguel Torres", service: "Afeitado", date: "2025-12-05", time: "11:00 AM", duration: "30 min", status: "completed" },
  { id: "A009", customerName: "Carmen López", service: "Peinado Especial", date: "2025-12-09", time: "09:00 AM", duration: "90 min", status: "pending" },
  { id: "A010", customerName: "Roberto Díaz", service: "Tratamiento Capilar", date: "2025-12-09", time: "03:00 PM", duration: "60 min", status: "scheduled" },
];

const CHART_DATA = [
  { name: "Lun", citas: 8 },
  { name: "Mar", citas: 12 },
  { name: "Mié", citas: 10 },
  { name: "Jue", citas: 15 },
  { name: "Vie", citas: 18 },
  { name: "Sáb", citas: 14 },
  { name: "Dom", citas: 6 },
];

const ITEMS_PER_PAGE = 5;

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Programada",
  completed: "Completada",
  cancelled: "Cancelada",
  pending: "Pendiente",
};

interface Props {
  affiliateId: string;
  config: AffiliateConfig;
}

export function AppointmentsClient({ config }: Props) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    customerName: "",
    service: "",
    date: "",
    time: "",
  });

  const filterConfigs: FilterConfig[] = [
    {
      name: "status",
      label: "Todos los estados",
      options: [
        { label: "Programadas", value: "scheduled" },
        { label: "Pendientes", value: "pending" },
        { label: "Completadas", value: "completed" },
        { label: "Canceladas", value: "cancelled" },
      ],
    },
  ];

  // Filter + sort
  const processedData = useMemo(() => {
    let result = [...MOCK_APPOINTMENTS];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.customerName.toLowerCase().includes(q) ||
          a.service.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== "all") {
      result = result.filter((a) => a.status === filters.status);
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

  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
  const paginatedData = processedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const columns: TableColumn<Appointment>[] = [
    {
      key: "id",
      header: "ID",
      hideOnMobile: true,
      render: (item) => (
        <span className="font-mono text-sm text-gray-500 dark:text-gray-400">{item.id}</span>
      ),
    },
    {
      key: "customerName",
      header: "Cliente",
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{item.customerName}</p>
          {item.notes && (
            <p className="text-xs text-gray-400 mt-0.5">{item.notes}</p>
          )}
        </div>
      ),
    },
    {
      key: "service",
      header: "Servicio",
      sortable: true,
      render: (item) => item.service,
    },
    {
      key: "date",
      header: "Fecha y Hora",
      sortable: true,
      render: (item) => (
        <div className="text-sm">
          <p className="text-gray-900 dark:text-white">{item.date}</p>
          <p className="text-gray-400">{item.time}</p>
        </div>
      ),
    },
    {
      key: "duration",
      header: "Duración",
      hideOnMobile: true,
      render: (item) => item.duration,
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (item) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[item.status]}`}>
          {item.status === "pending" && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse-soft" />}
          {item.status === "scheduled" && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse-soft" />}
          {STATUS_LABELS[item.status]}
        </span>
      ),
    },
  ];

  const handleSort = (key: string) => {
    setSortConfig((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const handleClearFilters = () => {
    setSearch("");
    setFilters({});
    setCurrentPage(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Replace with appointmentService.create() when backend is ready
    console.log("Nueva cita:", newAppointment);
    setIsModalOpen(false);
    setNewAppointment({ customerName: "", service: "", date: "", time: "" });
  };

  // Stats
  const todayCount = MOCK_APPOINTMENTS.filter((a) => a.date === "2025-12-08").length;
  const completedCount = MOCK_APPOINTMENTS.filter((a) => a.status === "completed").length;
  const cancelledCount = MOCK_APPOINTMENTS.filter((a) => a.status === "cancelled").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sistema de Citas
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona reservas y agenda de {config.branding.name}
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Nueva Cita
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Citas Hoy", value: todayCount, icon: "📅", color: "blue", change: { value: 15, type: "increase" as const } },
          { label: "Total del Mes", value: MOCK_APPOINTMENTS.length, icon: "📊", color: "purple" },
          { label: "Completadas", value: `${Math.round((completedCount / MOCK_APPOINTMENTS.length) * 100)}%`, icon: "✅", color: "green", change: { value: 5, type: "increase" as const } },
          { label: "Cancelaciones", value: cancelledCount, icon: "❌", color: "red" },
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

      {/* Chart */}
      <ChartCard title="Tendencia Semanal" icon="📈" timeRanges={["7d", "30d"]}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={CHART_DATA}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={chartTheme.grid.stroke}
              strokeOpacity={chartTheme.grid.strokeOpacity}
            />
            <XAxis dataKey="name" stroke={chartTheme.axis.stroke} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke={chartTheme.axis.stroke} fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
            <Line type="monotone" dataKey="citas" stroke={chartColors[0]} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Table */}
      <DashboardCard title="Agenda de Citas" icon="📅">
        <FilterBar
          searchPlaceholder="Buscar por cliente, servicio o ID..."
          filters={filterConfigs}
          onSearch={(q) => { setSearch(q); setCurrentPage(1); }}
          onFilter={(name, value) => { setFilters((prev) => ({ ...prev, [name]: value })); setCurrentPage(1); }}
          onClear={handleClearFilters}
          activeFilters={filters}
          searchValue={search}
        />

        {paginatedData.length > 0 ? (
          <>
            <ResponsiveTable
              data={paginatedData}
              columns={columns}
              getRowKey={(item) => item.id}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={processedData.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon="📅"
            title="No se encontraron citas"
            description="Ajusta los filtros o crea una nueva cita para comenzar."
            action={{ label: "Crear primera cita", onClick: () => setIsModalOpen(true) }}
          />
        )}
      </DashboardCard>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Cita" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Nombre del Cliente
            </label>
            <input
              type="text"
              required
              value={newAppointment.customerName}
              onChange={(e) => setNewAppointment({ ...newAppointment, customerName: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Servicio
            </label>
            <select
              required
              value={newAppointment.service}
              onChange={(e) => setNewAppointment({ ...newAppointment, service: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              <option value="">Seleccionar servicio</option>
              <option value="Corte y Peinado">Corte y Peinado</option>
              <option value="Consulta General">Consulta General</option>
              <option value="Tratamiento Completo">Tratamiento Completo</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Fecha</label>
              <input
                type="date"
                required
                value={newAppointment.date}
                onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hora</label>
              <input
                type="time"
                required
                value={newAppointment.time}
                onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button type="submit" variant="primary" className="flex-1">
              Crear Cita
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
