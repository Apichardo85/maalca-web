"use client";

import { useState, useMemo } from "react";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { DashboardCard, StatCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/buttons";
import { Pagination } from "@/components/ui/Pagination";
import { ResponsiveTable, TableColumn } from "@/components/ui/ResponsiveTable";
import { TableActionButton, TableActions } from "@/components/ui/TableActionButton";
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

export default function InvoicingPage() {
  const { brandName, config } = useAffiliate();
  const currency = config?.settings.currency === "USD" ? "$" : "RD$";

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMonth, setFilterMonth] = useState("");

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Estado para panel Nueva Venta
  const [showNewSalePanel, setShowNewSalePanel] = useState(false);

  // Mock data expandido a 12 facturas
  const allInvoices: Invoice[] = [
    { id: "FAC-001", customerName: "María González", amount: 450.00, date: "2025-12-01", dueDate: "2025-12-15", status: "paid" },
    { id: "FAC-002", customerName: "Juan Pérez", amount: 890.00, date: "2025-12-03", dueDate: "2025-12-17", status: "pending" },
    { id: "FAC-003", customerName: "Ana Martínez", amount: 2150.00, date: "2025-11-28", dueDate: "2025-12-12", status: "pending" },
    { id: "FAC-004", customerName: "Carlos López", amount: 325.00, date: "2025-11-20", dueDate: "2025-12-04", status: "overdue" },
    { id: "FAC-005", customerName: "Laura Fernández", amount: 1200.00, date: "2025-12-05", dueDate: "2025-12-19", status: "paid" },
    { id: "FAC-006", customerName: "Roberto Silva", amount: 675.00, date: "2025-12-02", dueDate: "2025-12-16", status: "paid" },
    { id: "FAC-007", customerName: "Patricia Ruiz", amount: 1890.00, date: "2025-11-25", dueDate: "2025-12-09", status: "pending" },
    { id: "FAC-008", customerName: "Fernando Castro", amount: 420.00, date: "2025-11-18", dueDate: "2025-12-02", status: "overdue" },
    { id: "FAC-009", customerName: "Gabriela Torres", amount: 3200.00, date: "2025-12-06", dueDate: "2025-12-20", status: "pending" },
    { id: "FAC-010", customerName: "Miguel Ángel Díaz", amount: 540.00, date: "2025-12-04", dueDate: "2025-12-18", status: "paid" },
    { id: "FAC-011", customerName: "Sofía Mendoza", amount: 980.00, date: "2025-11-22", dueDate: "2025-12-06", status: "overdue" },
    { id: "FAC-012", customerName: "Diego Morales", amount: 1560.00, date: "2025-12-07", dueDate: "2025-12-21", status: "pending" }
  ];

  // Data para gráfico de ingresos
  const chartData = [
    { mes: "Jul", ingresos: 12500 },
    { mes: "Ago", ingresos: 15800 },
    { mes: "Sep", ingresos: 14200 },
    { mes: "Oct", ingresos: 18900 },
    { mes: "Nov", ingresos: 16700 },
    { mes: "Dic", ingresos: 22400 }
  ];

  // Filtrado con useMemo
  const filteredInvoices = useMemo(() => {
    return allInvoices.filter(invoice => {
      const matchesSearch = invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.amount.toString().includes(searchTerm);
      const matchesStatus = filterStatus === "all" || invoice.status === filterStatus;
      const matchesMonth = !filterMonth || invoice.date.startsWith(filterMonth);
      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [searchTerm, filterStatus, filterMonth]);

  // Paginación con useMemo
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInvoices, currentPage]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  // Handlers para filtros
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleMonthChange = (value: string) => {
    setFilterMonth(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterMonth("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || filterStatus !== "all" || filterMonth;

  const handleSaveInvoice = (invoiceData: Record<string, unknown>) => {
    console.log("Factura guardada:", invoiceData);
    // Aquí integrarías con tu backend
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      paid: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      overdue: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    };
    const labels = { paid: "Pagada", pending: "Pendiente", overdue: "Vencida" };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>{labels[status as keyof typeof labels]}</span>;
  };

  // Definir columnas para ResponsiveTable
  const columns: TableColumn<Invoice>[] = [
    {
      key: "id",
      header: "ID Factura",
      mobileLabel: "Factura",
      render: (invoice) => (
        <span className="font-medium">{invoice.id}</span>
      )
    },
    {
      key: "customer",
      header: "Cliente",
      mobileLabel: "Cliente",
      render: (invoice) => (
        <span>{invoice.customerName}</span>
      )
    },
    {
      key: "amount",
      header: "Monto",
      mobileLabel: "Monto",
      render: (invoice) => (
        <span className="font-semibold">{currency}{invoice.amount.toFixed(2)}</span>
      )
    },
    {
      key: "date",
      header: "Fecha Emisión",
      mobileLabel: "Emitida",
      hideOnMobile: true,
      render: (invoice) => (
        <span className="text-gray-600 dark:text-gray-400">
          {new Date(invoice.date).toLocaleDateString()}
        </span>
      )
    },
    {
      key: "dueDate",
      header: "Fecha Vencimiento",
      mobileLabel: "Vence",
      render: (invoice) => (
        <span className="text-gray-600 dark:text-gray-400">
          {new Date(invoice.dueDate).toLocaleDateString()}
        </span>
      )
    },
    {
      key: "status",
      header: "Estado",
      mobileLabel: "Estado",
      render: (invoice) => getStatusBadge(invoice.status)
    },
    {
      key: "actions",
      header: "Acciones",
      mobileLabel: "Acciones",
      render: (invoice) => (
        <TableActions>
          <TableActionButton
            variant="primary"
            onClick={() => console.log("Ver", invoice.id)}
            icon="👁️"
          >
            Ver
          </TableActionButton>
          {invoice.status !== "paid" && (
            <TableActionButton
              variant="success"
              onClick={() => console.log("Marcar pagada", invoice.id)}
              icon="✅"
            >
              Cobrar
            </TableActionButton>
          )}
        </TableActions>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sistema de Facturación</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gestiona facturas, pagos y reportes financieros de {brandName}</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowNewSalePanel(true)}>
          + Nueva Venta
        </Button>
      </div>

      <div className="animate-fade-in-up grid grid-cols-1 md:grid-cols-4 gap-4" style={{ animationDelay: '0.1s' }}>
        <StatCard label="Facturación del Mes" value={`${currency}18,750`} icon="💰" change={{ value: 12.5, type: "increase" }} color="green" />
        <StatCard label="Facturas Pendientes" value="12" icon="⏳" color="yellow" />
        <StatCard label="Facturas Pagadas" value="45" icon="✅" color="blue" />
        <StatCard label="Vencidas" value="3" icon="⚠️" color="red" />
      </div>

      {/* Gráfico de Ingresos */}
      <div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <DashboardCard title="Evolución de Ingresos" icon="📈">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="mes" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "none", borderRadius: "8px" }}
                labelStyle={{ color: "#F9FAFB" }}
              />
              <Area type="monotone" dataKey="ingresos" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardCard>
      </div>

      <div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <DashboardCard>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Buscar por cliente, ID o monto..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={filterStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">Todos los estados</option>
                <option value="paid">Pagadas</option>
                <option value="pending">Pendientes</option>
                <option value="overdue">Vencidas</option>
              </select>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
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
      </div>

      <div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <DashboardCard title="Registro de Facturas" icon="💰">
          <ResponsiveTable
            data={paginatedInvoices}
            columns={columns}
            getRowKey={(invoice) => invoice.id}
            emptyMessage="No se encontraron facturas"
          />
        </DashboardCard>
      </div>

      {filteredInvoices.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredInvoices.length}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Panel de Nueva Venta */}
      
        {showNewSalePanel && (
          <NewSalePanel
            onClose={() => setShowNewSalePanel(false)}
            onSave={handleSaveInvoice}
          />
        )}
      
    </div>
  );
}
