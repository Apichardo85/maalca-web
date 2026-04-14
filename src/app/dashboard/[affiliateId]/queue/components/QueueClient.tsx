"use client";

import { useState, useMemo } from "react";
import { DashboardCard, StatCard } from "@/components/dashboard/DashboardCard";
import { ResponsiveTable, type TableColumn, type SortConfig } from "@/components/ui/ResponsiveTable";
import { FilterBar, type FilterConfig } from "@/components/dashboard/shared/FilterBar";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/buttons";
import type { AffiliateConfig } from "@/config/affiliates-config";
import type { QueueEntry, QueueStatus, QueueChannel } from "@/lib/types/queue.types";

// Mock data — outside component
const MOCK_BARBERS = [
  { id: "B001", name: "Carlos Méndez", avatar: "👨‍🦱", specialty: "Corte clásico", isAvailable: true },
  { id: "B002", name: "José Ramírez", avatar: "👨‍🦲", specialty: "Fade & diseños", isAvailable: true },
  { id: "B003", name: "Miguel Torres", avatar: "👨", specialty: "Barba & afeitado", isAvailable: false },
  { id: "B004", name: "David Sánchez", avatar: "👱‍♂️", specialty: "Color & tratamientos", isAvailable: true },
];

const MOCK_QUEUE: QueueEntry[] = [
  { id: "Q001", displayName: "Roberto García", phone: "809-555-0101", service: "Corte + Barba", preferredBarberId: "B001", preferredBarberName: "Carlos Méndez", createdAt: "2025-12-08T09:15:00", estimatedTimeMinutes: 45, status: "waiting", channel: "walk_in", position: 1 },
  { id: "Q002", displayName: "Ana Martínez", phone: "809-555-0102", service: "Corte Mujer", preferredBarberId: "B004", preferredBarberName: "David Sánchez", createdAt: "2025-12-08T09:20:00", estimatedTimeMinutes: 60, status: "waiting", channel: "web", position: 2 },
  { id: "Q003", displayName: "Luis Fernández", phone: "809-555-0103", service: "Fade Clásico", createdAt: "2025-12-08T09:25:00", estimatedTimeMinutes: 30, status: "called", channel: "qr", position: 3 },
  { id: "Q004", displayName: "María González", phone: "809-555-0104", service: "Corte + Color", preferredBarberId: "B004", preferredBarberName: "David Sánchez", createdAt: "2025-12-08T09:30:00", estimatedTimeMinutes: 90, status: "waiting", channel: "walk_in", position: 4 },
  { id: "Q005", displayName: "Pedro Jiménez", service: "Afeitado Tradicional", preferredBarberId: "B003", preferredBarberName: "Miguel Torres", createdAt: "2025-12-08T08:45:00", estimatedTimeMinutes: 25, status: "in_service", channel: "walk_in", position: 0, notes: "Cliente VIP" },
  { id: "Q006", displayName: "Carmen López", phone: "809-555-0106", service: "Corte Niño", createdAt: "2025-12-08T09:35:00", estimatedTimeMinutes: 20, status: "waiting", channel: "web", position: 5 },
  { id: "Q007", displayName: "Javier Ruiz", service: "Diseño + Fade", preferredBarberId: "B002", preferredBarberName: "José Ramírez", createdAt: "2025-12-08T08:30:00", status: "done", channel: "qr", position: 0 },
  { id: "Q008", displayName: "Laura Torres", phone: "809-555-0108", service: "Tratamiento Capilar", preferredBarberId: "B004", preferredBarberName: "David Sánchez", createdAt: "2025-12-08T09:40:00", estimatedTimeMinutes: 75, status: "waiting", channel: "walk_in", position: 6 },
  { id: "Q009", displayName: "Diego Castro", service: "Corte Clásico", createdAt: "2025-12-08T08:00:00", status: "no_show", channel: "web", position: 0 },
  { id: "Q010", displayName: "Sofía Morales", phone: "809-555-0110", service: "Corte + Peinado", createdAt: "2025-12-08T09:45:00", estimatedTimeMinutes: 50, status: "waiting", channel: "qr", position: 7 },
];

const ITEMS_PER_PAGE = 8;

const STATUS_CONFIG: Record<QueueStatus, { label: string; classes: string; pulse: boolean }> = {
  waiting:    { label: "En Espera",   classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",  pulse: true  },
  called:     { label: "Llamado",     classes: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",          pulse: true  },
  in_service: { label: "En Servicio", classes: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400", pulse: true  },
  done:       { label: "Finalizado",  classes: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",     pulse: false },
  no_show:    { label: "No Asistió",  classes: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",             pulse: false },
};

const CHANNEL_CONFIG: Record<QueueChannel, { icon: string; label: string }> = {
  walk_in: { icon: "🚶", label: "Walk-in" },
  web:     { icon: "🌐", label: "Web" },
  qr:      { icon: "📱", label: "QR Code" },
};

interface Props {
  affiliateId: string;
  config: AffiliateConfig;
}

export function QueueClient({ config }: Props) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    displayName: "", phone: "", service: "", preferredBarberId: "", notes: "",
  });

  const filterConfigs: FilterConfig[] = [
    {
      name: "status",
      label: "Todos los estados",
      options: [
        { label: "En Espera", value: "waiting" },
        { label: "Llamados", value: "called" },
        { label: "En Servicio", value: "in_service" },
        { label: "Finalizados", value: "done" },
        { label: "No Asistieron", value: "no_show" },
      ],
    },
    {
      name: "channel",
      label: "Todos los canales",
      options: [
        { label: "Walk-in", value: "walk_in" },
        { label: "Web", value: "web" },
        { label: "QR Code", value: "qr" },
      ],
    },
  ];

  const processedData = useMemo(() => {
    let result = [...MOCK_QUEUE];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.displayName.toLowerCase().includes(q) ||
          e.service.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q)
      );
    }
    if (filters.status && filters.status !== "all") {
      result = result.filter((e) => e.status === filters.status);
    }
    if (filters.channel && filters.channel !== "all") {
      result = result.filter((e) => e.channel === filters.channel);
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

  const columns: TableColumn<QueueEntry>[] = [
    {
      key: "position",
      header: "#",
      render: (item) =>
        item.position ? (
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-sm">
            {item.position}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: "displayName",
      header: "Cliente",
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{item.displayName}</p>
          {item.phone && <p className="text-xs text-gray-400">{item.phone}</p>}
          {item.notes && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">⭐ {item.notes}</p>
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
      key: "preferredBarberName",
      header: "Barbero",
      hideOnMobile: true,
      render: (item) =>
        item.preferredBarberName ? (
          <span className="text-sm">{item.preferredBarberName}</span>
        ) : (
          <span className="text-gray-400 text-sm">Sin preferencia</span>
        ),
    },
    {
      key: "channel",
      header: "Canal",
      hideOnMobile: true,
      render: (item) => {
        const ch = CHANNEL_CONFIG[item.channel];
        return (
          <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            {ch.icon} {ch.label}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (item) => {
        const cfg = STATUS_CONFIG[item.status];
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.classes}`}>
            {cfg.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-soft" />}
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Acción",
      render: (item) => (
        <div className="flex gap-2 flex-wrap">
          {item.status === "waiting" && (
            <button className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              Llamar
            </button>
          )}
          {item.status === "called" && (
            <button className="text-xs font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors">
              Iniciar
            </button>
          )}
          {item.status === "in_service" && (
            <button className="text-xs font-medium text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors">
              Finalizar
            </button>
          )}
          {(item.status === "waiting" || item.status === "called") && (
            <button className="text-xs font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors">
              No-show
            </button>
          )}
        </div>
      ),
    },
  ];

  // KPIs
  const waitingCount = MOCK_QUEUE.filter((e) => e.status === "waiting").length;
  const inServiceCount = MOCK_QUEUE.filter((e) => e.status === "in_service").length;
  const servedToday = MOCK_QUEUE.filter((e) => e.status === "done").length;
  const noShows = MOCK_QUEUE.filter((e) => e.status === "no_show").length;
  const avgWait = Math.round(
    MOCK_QUEUE.filter((e) => e.status === "waiting" && e.estimatedTimeMinutes)
      .reduce((acc, e) => acc + (e.estimatedTimeMinutes ?? 0), 0) / (waitingCount || 1)
  );

  const handleClear = () => { setSearch(""); setFilters({}); setCurrentPage(1); };

  const handleAddToQueue = () => {
    // TODO: connect to queueService.create() when backend is ready
    setIsModalOpen(false);
    setNewEntry({ displayName: "", phone: "", service: "", preferredBarberId: "", notes: "" });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fila Virtual</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Cola de espera en tiempo real — {config.branding.name}
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Agregar a Fila
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "En Espera", value: waitingCount.toString(), icon: "⏳", color: "yellow" },
          { label: "En Servicio", value: inServiceCount.toString(), icon: "✂️", color: "purple" },
          { label: "Tiempo Medio", value: `${avgWait}m`, icon: "⏱️", color: "blue" },
          { label: "Atendidos Hoy", value: servedToday.toString(), icon: "✅", color: "green", change: { value: 15, type: "increase" as const } },
        ].map((stat, index) => (
          <div key={stat.label} className="animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Live queue status bar */}
      <div className="flex items-center gap-3 px-5 py-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" />
        <span className="text-sm font-medium text-green-700 dark:text-green-300">
          Sistema activo — {waitingCount} en espera · {inServiceCount} en servicio · {noShows} no asistieron hoy
        </span>
      </div>

      {/* Table */}
      <DashboardCard title="Cola de Espera" icon="👥">
        <FilterBar
          searchPlaceholder="Buscar por nombre, servicio o ID..."
          filters={filterConfigs}
          onSearch={(q) => { setSearch(q); setCurrentPage(1); }}
          onFilter={(name, value) => { setFilters((prev) => ({ ...prev, [name]: value })); setCurrentPage(1); }}
          onClear={handleClear}
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
                  totalItems={processedData.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon="⏳"
            title="No hay nadie en la fila"
            description="Cuando los clientes se unan a la fila, aparecerán aquí."
            action={{ label: "Agregar primer cliente", onClick: () => setIsModalOpen(true) }}
          />
        )}
      </DashboardCard>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar a la Fila" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nombre *</label>
              <input
                type="text"
                required
                value={newEntry.displayName}
                onChange={(e) => setNewEntry({ ...newEntry, displayName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Teléfono</label>
              <input
                type="tel"
                value={newEntry.phone}
                onChange={(e) => setNewEntry({ ...newEntry, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="809-555-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Servicio *</label>
              <select
                value={newEntry.service}
                onChange={(e) => setNewEntry({ ...newEntry, service: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="">Seleccionar servicio</option>
                <option value="Corte Clásico">Corte Clásico</option>
                <option value="Corte + Barba">Corte + Barba</option>
                <option value="Fade">Fade</option>
                <option value="Afeitado Tradicional">Afeitado Tradicional</option>
                <option value="Diseño + Fade">Diseño + Fade</option>
                <option value="Corte Niño">Corte Niño</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Barbero preferido</label>
              <select
                value={newEntry.preferredBarberId}
                onChange={(e) => setNewEntry({ ...newEntry, preferredBarberId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="">Sin preferencia</option>
                {MOCK_BARBERS.filter((b) => b.isAvailable).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.avatar} {b.name} — {b.specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notas</label>
            <textarea
              value={newEntry.notes}
              onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              placeholder="Ej: Cliente VIP, prefiere silla especial..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button variant="primary" className="flex-1" onClick={handleAddToQueue}>
              Agregar a Fila
            </Button>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
