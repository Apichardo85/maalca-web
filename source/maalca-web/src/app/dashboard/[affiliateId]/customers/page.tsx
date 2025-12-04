"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/buttons";

/**
 * Página de gestión de clientes (CRM)
 */
export default function CustomersPage() {
  const { brandName } = useAffiliate();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data de clientes
  const customers = [
    {
      id: "C001",
      name: "María González",
      email: "maria@email.com",
      phone: "(809) 555-0123",
      totalSpent: "$1,245",
      visits: 12,
      lastVisit: "2025-12-01",
      status: "active"
    },
    {
      id: "C002",
      name: "Juan Pérez",
      email: "juan@email.com",
      phone: "(809) 555-0456",
      totalSpent: "$890",
      visits: 8,
      lastVisit: "2025-11-28",
      status: "active"
    },
    {
      id: "C003",
      name: "Ana Martínez",
      email: "ana@email.com",
      phone: "(809) 555-0789",
      totalSpent: "$2,150",
      visits: 15,
      lastVisit: "2025-12-03",
      status: "vip"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Clientes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Base de datos de clientes de {brandName}
          </p>
        </div>
        <Button variant="primary" size="lg">
          + Nuevo Cliente
        </Button>
      </motion.div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Clientes</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">1,248</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Nuevos Este Mes</p>
          <p className="text-2xl font-bold text-green-600 mt-1">+42</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Clientes VIP</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">156</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Valor Promedio</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">$324</p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <DashboardCard>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
              <option>Todos los estados</option>
              <option>Activos</option>
              <option>VIP</option>
              <option>Inactivos</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white">
              Filtros
            </button>
          </div>
        </div>
      </DashboardCard>

      {/* Tabla de clientes */}
      <DashboardCard title="Lista de Clientes" icon="👥">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Cliente</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Contacto</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Total Gastado</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Visitas</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Última Visita</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{customer.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      <p className="text-gray-900 dark:text-white">{customer.email}</p>
                      <p className="text-gray-500 dark:text-gray-400">{customer.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-900 dark:text-white font-semibold">
                    {customer.totalSpent}
                  </td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                    {customer.visits}
                  </td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                    {new Date(customer.lastVisit).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      customer.status === "vip"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                        : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    }`}>
                      {customer.status === "vip" ? "VIP" : "Activo"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
}
