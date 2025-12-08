"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/buttons";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

// Mock data extendido con más citas
const allAppointments: Appointment[] = [
  { id: "A001", customerName: "María González", service: "Corte y Peinado", date: "2025-12-08", time: "10:00 AM", duration: "60 min", status: "scheduled", notes: "Cliente prefiere estilista Ana" },
  { id: "A002", customerName: "Juan Pérez", service: "Consulta General", date: "2025-12-08", time: "11:30 AM", duration: "30 min", status: "scheduled" },
  { id: "A003", customerName: "Ana Martínez", service: "Tratamiento Completo", date: "2025-12-08", time: "02:00 PM", duration: "90 min", status: "pending" },
  { id: "A004", customerName: "Carlos Rodríguez", service: "Corte Rápido", date: "2025-12-07", time: "09:00 AM", duration: "30 min", status: "completed" },
  { id: "A005", customerName: "Laura Fernández", service: "Manicure y Pedicure", date: "2025-12-07", time: "03:00 PM", duration: "60 min", status: "cancelled", notes: "Cliente canceló por enfermedad" },
  { id: "A006", customerName: "Pedro Sánchez", service: "Corte Clásico", date: "2025-12-06", time: "10:00 AM", duration: "45 min", status: "completed" },
  { id: "A007", customerName: "Sofia Ramírez", service: "Coloración", date: "2025-12-06", time: "02:00 PM", duration: "120 min", status: "completed" },
  { id: "A008", customerName: "Miguel Torres", service: "Afeitado", date: "2025-12-05", time: "11:00 AM", duration: "30 min", status: "completed" },
  { id: "A009", customerName: "Carmen López", service: "Peinado Especial", date: "2025-12-09", time: "09:00 AM", duration: "90 min", status: "pending" },
  { id: "A010", customerName: "Roberto Díaz", service: "Tratamiento Capilar", date: "2025-12-09", time: "03:00 PM", duration: "60 min", status: "scheduled" }
];

// Datos para el gráfico
const chartData = [
  { name: "Lun", citas: 8 },
  { name: "Mar", citas: 12 },
  { name: "Mié", citas: 10 },
  { name: "Jue", citas: 15 },
  { name: "Vie", citas: 18 },
  { name: "Sáb", citas: 14 },
  { name: "Dom", citas: 6 }
];

export default function AppointmentsPage() {
  const { brandName } = useAffiliate();

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState("");

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Estados para modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    customerName: "",
    service: "",
    date: "",
    time: ""
  });

  // Filtrado de citas
  const filteredAppointments = useMemo(() => {
    return allAppointments.filter(apt => {
      const matchesSearch = apt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           apt.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           apt.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
      const matchesDate = !filterDate || apt.date === filterDate;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [searchTerm, filterStatus, filterDate]);

  // Paginación
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAppointments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAppointments, currentPage]);

  const getStatusBadge = (status: AppointmentStatus) => {
    const styles = {
      scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    };

    const labels = {
      scheduled: "Programada",
      completed: "Completada",
      cancelled: "Cancelada",
      pending: "Pendiente"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Nueva cita:", newAppointment);
    setIsModalOpen(false);
    setNewAppointment({ customerName: "", service: "", date: "", time: "" });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sistema de Citas</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gestiona reservas y agenda de {brandName}</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setIsModalOpen(true)}>
          + Nueva Cita
        </Button>
      </motion.div>

      {/* Stats rápidas */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Citas Hoy</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">3</p>
          <p className="text-xs text-gray-500 mt-1">+2 desde ayer</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Este Mes</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">127</p>
          <p className="text-xs text-green-600 mt-1">↑ 15% vs mes anterior</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Completadas</p>
          <p className="text-2xl font-bold text-green-600 mt-1">94%</p>
          <p className="text-xs text-gray-500 mt-1">119 de 127</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Cancelaciones</p>
          <p className="text-2xl font-bold text-red-600 mt-1">8</p>
          <p className="text-xs text-gray-500 mt-1">6% del total</p>
        </div>
      </motion.div>

      {/* Gráfico */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <DashboardCard title="Tendencia Semanal" icon="📈">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "none", borderRadius: "8px" }} />
              <Line type="monotone" dataKey="citas" stroke="#3B82F6" strokeWidth={2} dot={{ fill: "#3B82F6" }} />
            </LineChart>
          </ResponsiveContainer>
        </DashboardCard>
      </motion.div>

      {/* Filtros */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <DashboardCard>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Buscar por cliente, servicio o ID..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">Todos los estados</option>
              <option value="scheduled">Programadas</option>
              <option value="pending">Pendientes</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            {(searchTerm || filterStatus !== "all" || filterDate) && (
              <button
                onClick={() => { setSearchTerm(""); setFilterStatus("all"); setFilterDate(""); setCurrentPage(1); }}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </DashboardCard>
      </motion.div>

      {/* Tabla de citas */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <DashboardCard title="Agenda de Citas" icon="📅">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Cliente</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Servicio</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Fecha y Hora</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Duración</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedAppointments.length > 0 ? (
                  paginatedAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">{appointment.id}</td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{appointment.customerName}</p>
                          {appointment.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{appointment.notes}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">{appointment.service}</td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900 dark:text-white">{new Date(appointment.date).toLocaleDateString()}</p>
                          <p className="text-gray-500 dark:text-gray-400">{appointment.time}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600 dark:text-gray-400">{appointment.duration}</td>
                      <td className="px-4 py-4">{getStatusBadge(appointment.status)}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">Editar</button>
                          {appointment.status === "scheduled" && (
                            <button className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium">Completar</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No se encontraron citas que coincidan con los filtros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredAppointments.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredAppointments.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </DashboardCard>
      </motion.div>

      {/* Modal Nueva Cita */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Cita" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre del Cliente</label>
            <input
              type="text"
              required
              value={newAppointment.customerName}
              onChange={(e) => setNewAppointment({ ...newAppointment, customerName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Servicio</label>
            <select
              required
              value={newAppointment.service}
              onChange={(e) => setNewAppointment({ ...newAppointment, service: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar servicio</option>
              <option value="Corte y Peinado">Corte y Peinado</option>
              <option value="Consulta General">Consulta General</option>
              <option value="Tratamiento Completo">Tratamiento Completo</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha</label>
              <input
                type="date"
                required
                value={newAppointment.date}
                onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hora</label>
              <input
                type="time"
                required
                value={newAppointment.time}
                onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" size="md" className="flex-1">Crear Cita</Button>
            <Button type="button" variant="secondary" size="md" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
