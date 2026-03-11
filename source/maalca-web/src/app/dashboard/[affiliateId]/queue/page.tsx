"use client";

import { useState, useMemo } from "react";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { DashboardCard, StatCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/buttons";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import type { QueueEntry, QueueStatus, QueueChannel, Barber } from "@/lib/types/queue.types";

export default function QueuePage() {
  const { brandName } = useAffiliate();

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterChannel, setFilterChannel] = useState<string>("all");

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Estado para modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    displayName: "",
    phone: "",
    service: "",
    preferredBarberId: "",
    notes: ""
  });

  // Mock data - Barberos
  const barbers: Barber[] = [
    { id: "B001", name: "Carlos Méndez", avatar: "👨‍🦱", specialty: "Corte clásico", isAvailable: true },
    { id: "B002", name: "José Ramírez", avatar: "👨‍🦲", specialty: "Fade & diseños", isAvailable: true },
    { id: "B003", name: "Miguel Torres", avatar: "👨", specialty: "Barba & afeitado", isAvailable: false },
    { id: "B004", name: "David Sánchez", avatar: "👱‍♂️", specialty: "Color & tratamientos", isAvailable: true }
  ];

  // Mock data - Fila virtual (15 entradas)
  const allQueueEntries: QueueEntry[] = [
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
    { id: "Q011", displayName: "Manuel Díaz", phone: "809-555-0111", service: "Fade + Barba", preferredBarberId: "B002", preferredBarberName: "José Ramírez", createdAt: "2025-12-08T09:50:00", estimatedTimeMinutes: 40, status: "waiting", channel: "walk_in", position: 8 },
    { id: "Q012", displayName: "Isabel Vargas", service: "Corte Bob", preferredBarberId: "B004", preferredBarberName: "David Sánchez", createdAt: "2025-12-08T08:20:00", status: "done", channel: "walk_in", position: 0 },
    { id: "Q013", displayName: "Andrés Pichardo", phone: "809-555-0113", service: "Rapado Total", createdAt: "2025-12-08T09:55:00", estimatedTimeMinutes: 15, status: "waiting", channel: "web", position: 9 },
    { id: "Q014", displayName: "Valentina Cruz", phone: "809-555-0114", service: "Mechas + Corte", preferredBarberId: "B004", preferredBarberName: "David Sánchez", createdAt: "2025-12-08T10:00:00", estimatedTimeMinutes: 120, status: "waiting", channel: "qr", position: 10 },
    { id: "Q015", displayName: "Gabriel Núñez", service: "Barba Express", createdAt: "2025-12-08T10:05:00", estimatedTimeMinutes: 20, status: "called", channel: "walk_in", position: 11 }
  ];

  // Filtrado con useMemo
  const filteredQueue = useMemo(() => {
    return allQueueEntries.filter(entry => {
      const matchesSearch = entry.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || entry.status === filterStatus;
      const matchesChannel = filterChannel === "all" || entry.channel === filterChannel;
      return matchesSearch && matchesStatus && matchesChannel;
    });
  }, [searchTerm, filterStatus, filterChannel]);

  // Paginación
  const paginatedQueue = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredQueue.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQueue, currentPage]);

  const totalPages = Math.ceil(filteredQueue.length / itemsPerPage);

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleChannelChange = (value: string) => {
    setFilterChannel(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterChannel("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || filterStatus !== "all" || filterChannel !== "all";

  const handleAddToQueue = () => {
    console.log("Agregar a fila:", newEntry);
    setIsModalOpen(false);
    setNewEntry({ displayName: "", phone: "", service: "", preferredBarberId: "", notes: "" });
  };

  const handleChangeStatus = (entryId: string, newStatus: QueueStatus) => {
    console.log(`Cambiar estado de ${entryId} a ${newStatus}`);
    // Aquí iría la lógica real de actualización
  };

  // KPIs calculados
  const waitingCount = allQueueEntries.filter(e => e.status === "waiting").length;
  const avgWaitTime = Math.round(allQueueEntries
    .filter(e => e.status === "waiting" && e.estimatedTimeMinutes)
    .reduce((acc, e) => acc + (e.estimatedTimeMinutes || 0), 0) / waitingCount || 0);
  const noShowsToday = allQueueEntries.filter(e => e.status === "no_show").length;
  const servedToday = allQueueEntries.filter(e => e.status === "done").length;

  const getStatusBadge = (status: QueueStatus) => {
    const styles = {
      waiting: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      called: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      in_service: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      done: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      no_show: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    };
    const labels = {
      waiting: "En Espera",
      called: "Llamado",
      in_service: "En Servicio",
      done: "Finalizado",
      no_show: "No Asistió"
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
  };

  const getChannelBadge = (channel: QueueChannel) => {
    const icons = {
      walk_in: "🚶",
      web: "🌐",
      qr: "📱"
    };
    const labels = {
      walk_in: "Walk-in",
      web: "Web",
      qr: "QR Code"
    };
    return (
      <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
        <span>{icons[channel]}</span>
        <span>{labels[channel]}</span>
      </span>
    );
  };

  const getWaitTime = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);
    return `${diffMinutes} min`;
  };

  return (
    <div className="space-y-8">
      <div className="fade-in-up flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fila Virtual</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gestiona la cola de espera de {brandName}</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setIsModalOpen(true)}>
          + Agregar a Fila
        </Button>
      </div>

      {/* KPIs */}
      <div className="fade-in-up delay-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="En Espera" value={waitingCount.toString()} icon="⏳" color="yellow" />
        <StatCard label="Tiempo Medio Espera" value={`${avgWaitTime} min`} icon="⏱️" color="blue" />
        <StatCard label="No-shows Hoy" value={noShowsToday.toString()} icon="❌" color="red" />
        <StatCard label="Atendidos Hoy" value={servedToday.toString()} icon="✅" change={{ value: 15, type: "increase" }} color="green" />
      </div>

      {/* Filtros */}
      <div className="fade-in-up delay-200">
        <DashboardCard>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Buscar por nombre, servicio o ID..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={filterStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">Todos los estados</option>
                <option value="waiting">En Espera</option>
                <option value="called">Llamados</option>
                <option value="in_service">En Servicio</option>
                <option value="done">Finalizados</option>
                <option value="no_show">No Asistieron</option>
              </select>
              <select
                value={filterChannel}
                onChange={(e) => handleChannelChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">Todos los canales</option>
                <option value="walk_in">Walk-in</option>
                <option value="web">Web</option>
                <option value="qr">QR Code</option>
              </select>
            </div>
            {hasActiveFilters && (
              <div className="flex justify-end">
                <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* Tabla de Fila */}
      <div className="fade-in-up delay-300">
        <DashboardCard title="Cola de Espera" icon="👥">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Posición</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Cliente</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Servicio</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Barbero Preferido</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Tiempo Espera</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Canal</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedQueue.length > 0 ? (
                  paginatedQueue.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold">
                          {entry.position || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{entry.displayName}</p>
                          {entry.phone && <p className="text-sm text-gray-500 dark:text-gray-400">{entry.phone}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">{entry.service}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {entry.preferredBarberName || <span className="text-gray-400">Sin preferencia</span>}
                      </td>
                      <td className="px-4 py-4">
                        {entry.status === "waiting" || entry.status === "called" ? (
                          <span className="font-medium text-gray-900 dark:text-white">{getWaitTime(entry.createdAt)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">{getChannelBadge(entry.channel)}</td>
                      <td className="px-4 py-4">{getStatusBadge(entry.status)}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          {entry.status === "waiting" && (
                            <button
                              onClick={() => handleChangeStatus(entry.id, "called")}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                            >
                              Llamar
                            </button>
                          )}
                          {entry.status === "called" && (
                            <button
                              onClick={() => handleChangeStatus(entry.id, "in_service")}
                              className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium"
                            >
                              Iniciar
                            </button>
                          )}
                          {entry.status === "in_service" && (
                            <button
                              onClick={() => handleChangeStatus(entry.id, "done")}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
                            >
                              Finalizar
                            </button>
                          )}
                          {(entry.status === "waiting" || entry.status === "called") && (
                            <button
                              onClick={() => handleChangeStatus(entry.id, "no_show")}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                            >
                              No-show
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                      No hay personas en la fila
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      </div>

      {filteredQueue.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredQueue.length}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Modal Agregar a Fila */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar Cliente a la Fila" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Cliente
              </label>
              <input
                type="text"
                value={newEntry.displayName}
                onChange={(e) => setNewEntry({ ...newEntry, displayName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teléfono (Opcional)
              </label>
              <input
                type="tel"
                value={newEntry.phone}
                onChange={(e) => setNewEntry({ ...newEntry, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="809-555-0000"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Servicio
              </label>
              <select
                value={newEntry.service}
                onChange={(e) => setNewEntry({ ...newEntry, service: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar servicio</option>
                <option value="Corte Clásico">Corte Clásico</option>
                <option value="Corte + Barba">Corte + Barba</option>
                <option value="Fade">Fade</option>
                <option value="Afeitado Tradicional">Afeitado Tradicional</option>
                <option value="Diseño + Fade">Diseño + Fade</option>
                <option value="Corte Niño">Corte Niño</option>
                <option value="Color">Color</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Barbero Preferido (Opcional)
              </label>
              <select
                value={newEntry.preferredBarberId}
                onChange={(e) => setNewEntry({ ...newEntry, preferredBarberId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin preferencia</option>
                {barbers.filter(b => b.isAvailable).map(barber => (
                  <option key={barber.id} value={barber.id}>
                    {barber.avatar} {barber.name} - {barber.specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas (Opcional)
            </label>
            <textarea
              value={newEntry.notes}
              onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Ej: Cliente VIP, necesita silla especial..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleAddToQueue}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              Agregar a Fila
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
