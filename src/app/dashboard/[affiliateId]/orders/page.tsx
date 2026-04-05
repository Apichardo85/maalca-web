"use client";

import { useState } from "react";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { DashboardCard, StatCard } from "@/components/dashboard/DashboardCard";

// ─── Types & mock data ───────────────────────────────────────────────────────

type TableStatus = "occupied" | "attention" | "bill" | "available" | "cleaning";

interface TableEntry {
  id: string;
  status: TableStatus;
  party?: number;
  server?: string;
  duration?: string;
  ticket?: number;
  order?: string;
  vip?: boolean;
}

const TABLES: TableEntry[] = [
  { id: "T-01", status: "occupied", party: 4, server: "Marisol", duration: "0h 42m", ticket: 112.0, order: "Pernil + Sancocho + 2x Morir Sonando" },
  { id: "T-02", status: "available" },
  { id: "T-03", status: "cleaning" },
  { id: "T-04", status: "bill", party: 2, server: "Carlos", duration: "1h 28m", ticket: 74.5, order: "Pescado frito + Mofongo" },
  { id: "T-05", status: "attention", party: 6, server: "Yira", duration: "0h 18m", ticket: 0, order: "Esperando orden", vip: true },
  { id: "T-06", status: "occupied", party: 3, server: "Marisol", duration: "0h 55m", ticket: 88.0, order: "Chicharron + 3x Pollo Guisado" },
  { id: "T-07", status: "available" },
  { id: "T-08", status: "occupied", party: 2, server: "Carlos", duration: "0h 30m", ticket: 56.0, order: "Camarones + Arroz con leche" },
  { id: "T-09", status: "attention", party: 4, server: "Yira", duration: "1h 05m", ticket: 145.0, order: "Mesa lleva 65 min sin atencion" },
  { id: "T-10", status: "bill", party: 5, server: "Marisol", duration: "1h 50m", ticket: 198.75, order: "Solicitud de cuenta pendiente" },
  { id: "T-11", status: "cleaning" },
  { id: "T-12", status: "occupied", party: 2, server: "Carlos", duration: "0h 12m", ticket: 48.0, order: "Yaniqueques + Tres Leches + 2 bebidas" },
];

const STATUS_CONFIG: Record<TableStatus, { label: string; color: string; bg: string; dot: string }> = {
  occupied:  { label: "Ocupada",   color: "text-gray-900 dark:text-white",   bg: "bg-gray-100 dark:bg-gray-800",      dot: "bg-gray-900 dark:bg-white" },
  attention: { label: "Atencion",  color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", dot: "bg-amber-500" },
  bill:      { label: "Cuenta",    color: "text-blue-700 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-950/30",   dot: "bg-blue-500" },
  available: { label: "Libre",     color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30", dot: "bg-green-500" },
  cleaning:  { label: "Limpieza",  color: "text-gray-500",                      bg: "bg-gray-50 dark:bg-gray-800/50",   dot: "bg-gray-400" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LiveOrders() {
  const { config } = useAffiliate();
  const currency = config?.settings.currency === "DOP" ? "RD$" : "$";
  const [selected, setSelected] = useState<string | null>("T-05");

  const selectedTable = TABLES.find((t) => t.id === selected);

  const counts = Object.fromEntries(
    Object.keys(STATUS_CONFIG).map((s) => [s, TABLES.filter((t) => t.status === s).length])
  ) as Record<TableStatus, number>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-1">
            Monitor en Vivo
          </p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mesas & Ordenes
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-wider uppercase text-gray-400">
            Feed en vivo
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Ventas del Turno" value={`${currency}634.25`} icon="💰" />
        <StatCard label="Mesas Ocupadas" value={`${counts.occupied + counts.attention + counts.bill}/12`} icon="🍽️" />
        <StatCard label="Ticket Promedio" value={`${currency}88.40`} icon="🧾" />
        <StatCard label="Ord. Completadas" value={14} icon="✅" />
        <StatCard label="Tiempo Prom." value="52 min" icon="⏱️" />
      </div>

      {/* Legend pills */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(STATUS_CONFIG) as [TableStatus, typeof STATUS_CONFIG[TableStatus]][]).map(([status, cfg]) => (
          <div
            key={status}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}
          >
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            {cfg.label}
            <span className="font-extrabold">{counts[status]}</span>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
        {/* Table grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TABLES.map((table) => {
            const cfg = STATUS_CONFIG[table.status];
            const isSelected = selected === table.id;
            return (
              <div
                key={table.id}
                onClick={() => setSelected(table.id)}
                className={`rounded-xl p-4 cursor-pointer transition-all border-2 ${cfg.bg} ${
                  isSelected ? "ring-2 ring-offset-1" : ""
                } ${isSelected ? "border-gray-400 dark:border-gray-500" : "border-transparent"}`}
                style={isSelected ? { ringColor: "var(--brand-primary)" } : undefined}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-extrabold text-sm ${cfg.color}`}>{table.id}</span>
                  <div className="flex items-center gap-1">
                    {table.vip && (
                      <span className="text-[10px] font-extrabold bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-1.5 py-0.5 rounded uppercase">
                        VIP
                      </span>
                    )}
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  </div>
                </div>

                <p className={`text-[10px] font-bold tracking-wider uppercase mb-1 ${cfg.color}`}>
                  {cfg.label}
                </p>

                {table.party && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                    <span className="block">👥 {table.party} personas</span>
                    {table.server && <span className="block">🏷️ {table.server}</span>}
                    {table.duration && <span className="block">⏱️ {table.duration}</span>}
                    {table.ticket && table.ticket > 0 && (
                      <span className="block font-bold text-gray-900 dark:text-white mt-1">
                        {currency}{table.ticket.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}

                {table.status === "available" && (
                  <p className="text-xs text-green-600 font-semibold">Lista para recibir</p>
                )}
                {table.status === "cleaning" && (
                  <p className="text-xs text-gray-400 font-semibold">Preparando mesa...</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Right panel — selected table detail */}
        <div className="space-y-4">
          {selectedTable ? (
            <>
              <DashboardCard
                title={`${selectedTable.id} ${selectedTable.vip ? "— VIP" : ""}`}
                icon={STATUS_CONFIG[selectedTable.status].label}
              >
                <div className="space-y-3">
                  {selectedTable.party && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Comensales</span>
                      <span className="font-bold text-gray-900 dark:text-white">{selectedTable.party} personas</span>
                    </div>
                  )}
                  {selectedTable.server && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Mesero/a</span>
                      <span className="font-bold text-gray-900 dark:text-white">{selectedTable.server}</span>
                    </div>
                  )}
                  {selectedTable.duration && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tiempo activo</span>
                      <span className="font-bold text-gray-900 dark:text-white">{selectedTable.duration}</span>
                    </div>
                  )}
                  {selectedTable.ticket && selectedTable.ticket > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Ticket actual</span>
                      <span className="font-bold text-lg text-gray-900 dark:text-white">
                        {currency}{selectedTable.ticket.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {selectedTable.order && (
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-[10px] font-bold tracking-wider uppercase text-gray-400 mb-1">Orden</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{selectedTable.order}</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  {(selectedTable.status === "occupied" || selectedTable.status === "attention") && (
                    <div className="space-y-2 pt-2">
                      <button
                        className="w-full py-2.5 rounded-full text-white text-sm font-bold transition-colors"
                        style={{ backgroundColor: "var(--brand-primary)" }}
                      >
                        + Agregar item
                      </button>
                      <button className="w-full py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-bold transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
                        Generar cuenta
                      </button>
                    </div>
                  )}
                  {selectedTable.status === "bill" && (
                    <button className="w-full py-2.5 rounded-full bg-blue-500 text-white text-sm font-bold transition-colors hover:bg-blue-600 mt-2">
                      Procesar Pago
                    </button>
                  )}
                  {selectedTable.status === "available" && (
                    <button className="w-full py-2.5 rounded-full bg-green-500 text-white text-sm font-bold transition-colors hover:bg-green-600 mt-2">
                      Asignar Mesa
                    </button>
                  )}
                </div>
              </DashboardCard>

              {/* Attention alerts */}
              {TABLES.filter((t) => t.status === "attention").length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <p className="text-xs font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1">
                    ⚠️ Requieren Atencion
                  </p>
                  {TABLES.filter((t) => t.status === "attention").map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelected(t.id)}
                      className="w-full text-left p-1.5 text-sm font-bold text-amber-700 dark:text-amber-400 flex justify-between items-center hover:bg-amber-100 dark:hover:bg-amber-950/30 rounded transition-colors"
                    >
                      <span>{t.id} {t.vip ? "— VIP" : ""}</span>
                      <span className="font-normal text-xs text-amber-600">{t.duration}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-12 text-center text-gray-400">
              <p className="text-4xl mb-2">🍽️</p>
              <p className="text-sm">Selecciona una mesa para ver el detalle</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
