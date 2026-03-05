"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { DashboardCard, StatCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/buttons";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "active" | "inactive" | "vacation";
  joinDate: string;
  avatar: string;
}

export default function TeamPage() {
  const { brandName } = useAffiliate();

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Estado para modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "",
    department: ""
  });

  // Mock data expandido a 12 miembros
  const allMembers: TeamMember[] = [
    { id: "EMP001", name: "María González", email: "maria@empresa.com", role: "Gerente", department: "Administración", status: "active", joinDate: "2024-01-15", avatar: "👩‍💼" },
    { id: "EMP002", name: "Juan Pérez", email: "juan@empresa.com", role: "Especialista", department: "Operaciones", status: "active", joinDate: "2024-03-20", avatar: "👨‍💻" },
    { id: "EMP003", name: "Ana Martínez", email: "ana@empresa.com", role: "Coordinadora", department: "Marketing", status: "vacation", joinDate: "2023-11-10", avatar: "👩‍🎨" },
    { id: "EMP004", name: "Carlos López", email: "carlos@empresa.com", role: "Técnico", department: "Soporte", status: "active", joinDate: "2024-05-08", avatar: "👨‍🔧" },
    { id: "EMP005", name: "Laura Fernández", email: "laura@empresa.com", role: "Asistente", department: "Ventas", status: "inactive", joinDate: "2023-09-15", avatar: "👩‍💼" },
    { id: "EMP006", name: "Roberto Silva", email: "roberto@empresa.com", role: "Analista", department: "Marketing", status: "active", joinDate: "2024-02-12", avatar: "👨‍💼" },
    { id: "EMP007", name: "Patricia Ruiz", email: "patricia@empresa.com", role: "Supervisor", department: "Operaciones", status: "active", joinDate: "2023-12-05", avatar: "👩‍💼" },
    { id: "EMP008", name: "Fernando Castro", email: "fernando@empresa.com", role: "Desarrollador", department: "Soporte", status: "active", joinDate: "2024-04-18", avatar: "👨‍💻" },
    { id: "EMP009", name: "Gabriela Torres", email: "gabriela@empresa.com", role: "Diseñadora", department: "Marketing", status: "vacation", joinDate: "2024-01-22", avatar: "👩‍🎨" },
    { id: "EMP010", name: "Miguel Díaz", email: "miguel@empresa.com", role: "Ejecutivo", department: "Ventas", status: "active", joinDate: "2023-10-30", avatar: "👨‍💼" },
    { id: "EMP011", name: "Sofía Mendoza", email: "sofia@empresa.com", role: "Asistente", department: "Administración", status: "active", joinDate: "2024-06-14", avatar: "👩‍💼" },
    { id: "EMP012", name: "Diego Morales", email: "diego@empresa.com", role: "Consultor", department: "Ventas", status: "active", joinDate: "2024-03-08", avatar: "👨‍💼" }
  ];

  // Data para gráfico por departamento
  const chartData = [
    { departamento: "Marketing", empleados: 3 },
    { departamento: "Operaciones", empleados: 2 },
    { departamento: "Ventas", empleados: 3 },
    { departamento: "Administración", empleados: 2 },
    { departamento: "Soporte", empleados: 2 }
  ];

  // Filtrado con useMemo
  const filteredMembers = useMemo(() => {
    return allMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = filterDepartment === "all" || member.department === filterDepartment;
      const matchesStatus = filterStatus === "all" || member.status === filterStatus;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [searchTerm, filterDepartment, filterStatus]);

  // Paginación con useMemo
  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMembers, currentPage]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  // Handlers para filtros
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (value: string) => {
    setFilterDepartment(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("all");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || filterDepartment !== "all" || filterStatus !== "all";

  const handleCreateMember = () => {
    console.log("Nuevo miembro:", newMember);
    setIsModalOpen(false);
    setNewMember({ name: "", email: "", role: "", department: "" });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
      vacation: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
    };
    const labels = { active: "Activo", inactive: "Inactivo", vacation: "De Vacaciones" };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>{labels[status as keyof typeof labels]}</span>;
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Equipo</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Administra empleados, roles y permisos de {brandName}</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setIsModalOpen(true)}>+ Nuevo Miembro</Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Empleados" value="24" icon="👥" color="blue" />
        <StatCard label="Activos" value="18" icon="✅" color="green" />
        <StatCard label="Departamentos" value="6" icon="🏢" color="purple" />
        <StatCard label="Nuevos Este Mes" value="2" icon="🆕" color="orange" />
      </motion.div>

      {/* Gráfico por Departamento */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <DashboardCard title="Empleados por Departamento" icon="📊">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="departamento" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "none", borderRadius: "8px" }}
                labelStyle={{ color: "#F9FAFB" }}
              />
              <Bar dataKey="empleados" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <DashboardCard>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Buscar por nombre, email o rol..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={filterDepartment}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">Todos los departamentos</option>
                <option value="Administración">Administración</option>
                <option value="Operaciones">Operaciones</option>
                <option value="Marketing">Marketing</option>
                <option value="Ventas">Ventas</option>
                <option value="Soporte">Soporte</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="vacation">De Vacaciones</option>
              </select>
            </div>
            {hasActiveFilters && (
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </DashboardCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <DashboardCard title="Miembros del Equipo" icon="👨‍💼">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Empleado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Correo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Rol</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Departamento</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Fecha Ingreso</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedMembers.length > 0 ? (
                  paginatedMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-xl">
                            {member.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{member.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600 dark:text-gray-400">{member.email}</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">{member.role}</td>
                      <td className="px-4 py-4 text-gray-600 dark:text-gray-400">{member.department}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(member.joinDate).toLocaleDateString()}</td>
                      <td className="px-4 py-4">{getStatusBadge(member.status)}</td>
                      <td className="px-4 py-4">
                        <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">Editar</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                      No se encontraron miembros del equipo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      </motion.div>

      {filteredMembers.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredMembers.length}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Modal para Nuevo Miembro */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuevo Miembro del Equipo"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="juan@empresa.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rol
              </label>
              <input
                type="text"
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Desarrollador"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Departamento
              </label>
              <select
                value={newMember.department}
                onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar departamento</option>
                <option value="Administración">Administración</option>
                <option value="Operaciones">Operaciones</option>
                <option value="Marketing">Marketing</option>
                <option value="Ventas">Ventas</option>
                <option value="Soporte">Soporte</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCreateMember}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              Agregar Miembro
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
