"use client";

import { useState, useMemo } from "react";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/buttons";
import { ResponsiveTable, TableColumn } from "@/components/ui/ResponsiveTable";
import { TableActionButton, TableActions } from "@/components/ui/TableActionButton";

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

/**
 * Página de gestión de clientes (CRM)
 */
export default function CustomersPage() {
  const { brandName } = useAffiliate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data de clientes ampliado
  const allCustomers: Customer[] = [
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
    },
    {
      id: "C004",
      name: "Carlos López",
      email: "carlos@email.com",
      phone: "(809) 555-0321",
      totalSpent: "$450",
      visits: 5,
      lastVisit: "2025-10-15",
      status: "inactive"
    },
    {
      id: "C005",
      name: "Laura Fernández",
      email: "laura@email.com",
      phone: "(809) 555-0654",
      totalSpent: "$3,200",
      visits: 22,
      lastVisit: "2025-12-05",
      status: "vip"
    }
  ];

  // Filtrado con useMemo
  const filteredCustomers = useMemo(() => {
    return allCustomers.filter(customer => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm);
      const matchesStatus = filterStatus === "all" || customer.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus]);

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      vip: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    };
    const labels = { active: "Activo", vip: "VIP", inactive: "Inactivo" };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  // Definir columnas para ResponsiveTable
  const columns: TableColumn<Customer>[] = [
    {
      key: "customer",
      header: "Cliente",
      mobileLabel: "Cliente",
      render: (customer) => (
        <div>
          <p className="font-medium">{customer.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{customer.id}</p>
        </div>
      )
    },
    {
      key: "contact",
      header: "Contacto",
      mobileLabel: "Contacto",
      render: (customer) => (
        <div className="text-sm">
          <p>{customer.email}</p>
          <p className="text-gray-500 dark:text-gray-400">{customer.phone}</p>
        </div>
      )
    },
    {
      key: "totalSpent",
      header: "Total Gastado",
      mobileLabel: "Total",
      render: (customer) => (
        <span className="font-semibold">{customer.totalSpent}</span>
      )
    },
    {
      key: "visits",
      header: "Visitas",
      mobileLabel: "Visitas",
      hideOnMobile: true,
      render: (customer) => (
        <span className="text-gray-600 dark:text-gray-400">{customer.visits}</span>
      )
    },
    {
      key: "lastVisit",
      header: "Última Visita",
      mobileLabel: "Última Visita",
      render: (customer) => (
        <span className="text-gray-600 dark:text-gray-400">
          {new Date(customer.lastVisit).toLocaleDateString()}
        </span>
      )
    },
    {
      key: "status",
      header: "Estado",
      mobileLabel: "Estado",
      render: (customer) => getStatusBadge(customer.status)
    },
    {
      key: "actions",
      header: "Acciones",
      mobileLabel: "Acciones",
      render: (customer) => (
        <TableActions>
          <TableActionButton
            variant="primary"
            onClick={() => console.log("Ver", customer.id)}
            icon="👁️"
          >
            Ver
          </TableActionButton>
          <TableActionButton
            variant="secondary"
            onClick={() => console.log("Editar", customer.id)}
            icon="✏️"
          >
            Editar
          </TableActionButton>
        </TableActions>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div
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
      </div>

      {/* Stats rápidas */}
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
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
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
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
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="vip">VIP</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Tabla de clientes con ResponsiveTable */}
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DashboardCard title="Lista de Clientes" icon="👥">
          <ResponsiveTable
            data={filteredCustomers}
            columns={columns}
            getRowKey={(customer) => customer.id}
            emptyMessage="No se encontraron clientes"
          />
        </DashboardCard>
      </div>
    </div>
  );
}
