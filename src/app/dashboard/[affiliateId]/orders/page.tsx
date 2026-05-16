"use client";

import { useState, useEffect, useRef } from "react";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { DashboardCard, StatCard } from "@/components/dashboard/DashboardCard";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

type TableStatus = "occupied" | "attention" | "bill" | "available" | "cleaning";

interface RestaurantTable {
  id:            string;
  affiliate_id:  string;
  table_number:  string;
  status:        TableStatus;
  party_size:    number | null;
  server_name:   string | null;
  started_at:    string | null;
  ticket_amount: number;
  current_order: string | null;
  is_vip:        boolean;
  updated_at:    string;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TableStatus, { label: string; color: string; bg: string; dot: string }> = {
  occupied:  { label: "Ocupada",  color: "text-gray-900 dark:text-white",      bg: "bg-gray-100 dark:bg-gray-800",       dot: "bg-gray-900 dark:bg-white" },
  attention: { label: "Atención", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30",   dot: "bg-amber-500" },
  bill:      { label: "Cuenta",   color: "text-blue-700 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-950/30",     dot: "bg-blue-500" },
  available: { label: "Libre",    color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30",   dot: "bg-green-500" },
  cleaning:  { label: "Limpieza", color: "text-gray-500",                      bg: "bg-gray-50 dark:bg-gray-800/50",     dot: "bg-gray-400" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function elapsedLabel(startedAt: string | null): string {
  if (!startedAt) return "";
  const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000);
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

// ─── Assign modal ─────────────────────────────────────────────────────────────

function AssignModal({
  table,
  onClose,
  onConfirm,
}: {
  table: RestaurantTable;
  onClose: () => void;
  onConfirm: (party: number, server: string) => void;
}) {
  const [party,  setParty]  = useState(2);
  const [server, setServer] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">
          Asignar {table.table_number} {table.is_vip ? "— VIP" : ""}
        </h3>
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Comensales</label>
        <input
          type="number"
          min={1} max={20}
          value={party}
          onChange={e => setParty(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
        />
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Mesero/a</label>
        <input
          type="text"
          placeholder="Nombre del servidor"
          value={server}
          onChange={e => setServer(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg mb-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-bold">
            Cancelar
          </button>
          <button
            onClick={() => { if (server.trim()) onConfirm(party, server.trim()); }}
            disabled={!server.trim()}
            className="flex-1 py-2.5 rounded-full text-white text-sm font-bold disabled:opacity-40"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            Asignar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add item modal ───────────────────────────────────────────────────────────

function AddItemModal({
  table,
  onClose,
  onConfirm,
}: {
  table: RestaurantTable;
  onClose: () => void;
  onConfirm: (order: string, amount: number) => void;
}) {
  const [order,  setOrder]  = useState(table.current_order ?? "");
  const [amount, setAmount] = useState<number>(table.ticket_amount ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">
          Orden — {table.table_number}
        </h3>
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Descripción</label>
        <textarea
          value={order}
          onChange={e => setOrder(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
          placeholder="Pica Pollo + Mofongo + 2 bebidas..."
        />
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Total ($)</label>
        <input
          type="number"
          min={0}
          step={0.01}
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg mb-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-bold">
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(order, amount)}
            className="flex-1 py-2.5 rounded-full text-white text-sm font-bold"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LiveOrders() {
  const { config } = useAffiliate();
  const affiliateId = config?.id ?? "the-little-dominican";
  const currency    = config?.settings.currency === "DOP" ? "RD$" : "$";

  const [tables,     setTables]     = useState<RestaurantTable[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState<string | null>(null);
  const [modal,      setModal]      = useState<"assign" | "addItem" | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const supabase = supabaseBrowser();

  // ── Load tables + subscribe to realtime changes ──
  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase
        .from("restaurant_tables")
        .select("*")
        .eq("affiliate_id", affiliateId)
        .order("table_number");
      if (mounted && data) {
        setTables(data as RestaurantTable[]);
        if (!selected && data.length > 0) setSelected(data[0].table_number);
      }
      setLoading(false);
    }

    load();

    // Realtime subscription
    channelRef.current = supabase
      .channel(`tables:${affiliateId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "restaurant_tables", filter: `affiliate_id=eq.${affiliateId}` },
        (payload) => {
          if (!mounted) return;
          setTables(prev => {
            if (payload.eventType === "DELETE") {
              return prev.filter(t => t.id !== (payload.old as RestaurantTable).id);
            }
            const updated = payload.new as RestaurantTable;
            const exists  = prev.some(t => t.id === updated.id);
            return exists
              ? prev.map(t => t.id === updated.id ? updated : t)
              : [...prev, updated];
          });
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      channelRef.current?.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [affiliateId]);

  // ── Table update helper ──
  async function updateTable(tableNumber: string, patch: Partial<RestaurantTable>) {
    await supabase
      .from("restaurant_tables")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("affiliate_id", affiliateId)
      .eq("table_number", tableNumber);
  }

  // ── Derived stats ──
  const counts = Object.fromEntries(
    Object.keys(STATUS_CONFIG).map(s => [
      s,
      tables.filter(t => t.status === s).length,
    ]),
  ) as Record<TableStatus, number>;

  const activeTickets = tables.filter(t => t.ticket_amount > 0).map(t => t.ticket_amount);
  const shiftTotal    = activeTickets.reduce((a, b) => a + b, 0);
  const avgTicket     = activeTickets.length ? shiftTotal / activeTickets.length : 0;

  const selectedTable = tables.find(t => t.table_number === selected) ?? null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full" />
      </div>
    );
  }

  return (
    <>
      {/* Modals */}
      {modal === "assign" && selectedTable && (
        <AssignModal
          table={selectedTable}
          onClose={() => setModal(null)}
          onConfirm={async (party, server) => {
            await updateTable(selectedTable.table_number, {
              status:       "occupied",
              party_size:   party,
              server_name:  server,
              started_at:   new Date().toISOString(),
              ticket_amount: 0,
              current_order: null,
            });
            setModal(null);
          }}
        />
      )}
      {modal === "addItem" && selectedTable && (
        <AddItemModal
          table={selectedTable}
          onClose={() => setModal(null)}
          onConfirm={async (order, amount) => {
            await updateTable(selectedTable.table_number, {
              current_order: order,
              ticket_amount: amount,
            });
            setModal(null);
          }}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-1">
              Monitor en Vivo
            </p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mesas & Órdenes
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
          <StatCard label="Ventas del Turno" value={`${currency}${shiftTotal.toFixed(2)}`} icon="💰" />
          <StatCard label="Mesas Ocupadas"   value={`${counts.occupied + counts.attention + counts.bill}/${tables.length}`} icon="🍽️" />
          <StatCard label="Ticket Promedio"  value={`${currency}${avgTicket.toFixed(2)}`}  icon="🧾" />
          <StatCard label="Ord. Completadas" value={14} icon="✅" />
          <StatCard label="Tiempo Prom."     value="52 min" icon="⏱️" />
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
            {tables.map((table) => {
              const cfg        = STATUS_CONFIG[table.status];
              const isSelected = selected === table.table_number;
              const elapsed    = elapsedLabel(table.started_at);
              return (
                <div
                  key={table.id}
                  onClick={() => setSelected(table.table_number)}
                  className={`rounded-xl p-4 cursor-pointer transition-all border-2 ${cfg.bg} ${
                    isSelected ? "ring-2 ring-offset-1 border-gray-400 dark:border-gray-500" : "border-transparent"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-extrabold text-sm ${cfg.color}`}>{table.table_number}</span>
                    <div className="flex items-center gap-1">
                      {table.is_vip && (
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
                  {table.party_size && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                      <span className="block">👥 {table.party_size} personas</span>
                      {table.server_name && <span className="block">🏷️ {table.server_name}</span>}
                      {elapsed          && <span className="block">⏱️ {elapsed}</span>}
                      {table.ticket_amount > 0 && (
                        <span className="block font-bold text-gray-900 dark:text-white mt-1">
                          {currency}{table.ticket_amount.toFixed(2)}
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

          {/* Right panel */}
          <div className="space-y-4">
            {selectedTable ? (
              <>
                <DashboardCard
                  title={`${selectedTable.table_number} ${selectedTable.is_vip ? "— VIP" : ""}`}
                  icon={STATUS_CONFIG[selectedTable.status].label}
                >
                  <div className="space-y-3">
                    {selectedTable.party_size && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Comensales</span>
                        <span className="font-bold text-gray-900 dark:text-white">{selectedTable.party_size} personas</span>
                      </div>
                    )}
                    {selectedTable.server_name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Mesero/a</span>
                        <span className="font-bold text-gray-900 dark:text-white">{selectedTable.server_name}</span>
                      </div>
                    )}
                    {selectedTable.started_at && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Tiempo activo</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {elapsedLabel(selectedTable.started_at)}
                        </span>
                      </div>
                    )}
                    {selectedTable.ticket_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Ticket actual</span>
                        <span className="font-bold text-lg text-gray-900 dark:text-white">
                          {currency}{selectedTable.ticket_amount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {selectedTable.current_order && (
                      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-[10px] font-bold tracking-wider uppercase text-gray-400 mb-1">Orden</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedTable.current_order}</p>
                      </div>
                    )}

                    {/* Action buttons */}
                    {(selectedTable.status === "occupied" || selectedTable.status === "attention") && (
                      <div className="space-y-2 pt-2">
                        <button
                          onClick={() => setModal("addItem")}
                          className="w-full py-2.5 rounded-full text-white text-sm font-bold transition-colors"
                          style={{ backgroundColor: "var(--brand-primary)" }}
                        >
                          + Agregar item
                        </button>
                        <button
                          onClick={() => updateTable(selectedTable.table_number, { status: "bill" })}
                          className="w-full py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          Generar cuenta
                        </button>
                      </div>
                    )}
                    {selectedTable.status === "bill" && (
                      <button
                        onClick={() => updateTable(selectedTable.table_number, {
                          status: "cleaning",
                          ticket_amount: 0,
                          party_size: null,
                          server_name: null,
                          started_at: null,
                          current_order: null,
                        })}
                        className="w-full py-2.5 rounded-full bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 transition-colors mt-2"
                      >
                        Procesar Pago
                      </button>
                    )}
                    {selectedTable.status === "cleaning" && (
                      <button
                        onClick={() => updateTable(selectedTable.table_number, { status: "available" })}
                        className="w-full py-2.5 rounded-full bg-gray-400 text-white text-sm font-bold hover:bg-gray-500 transition-colors mt-2"
                      >
                        Mesa lista ✓
                      </button>
                    )}
                    {selectedTable.status === "available" && (
                      <button
                        onClick={() => setModal("assign")}
                        className="w-full py-2.5 rounded-full bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors mt-2"
                      >
                        Asignar Mesa
                      </button>
                    )}
                  </div>
                </DashboardCard>

                {/* Attention alerts */}
                {tables.filter(t => t.status === "attention").length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <p className="text-xs font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400 mb-2">
                      ⚠️ Requieren Atención
                    </p>
                    {tables.filter(t => t.status === "attention").map(t => (
                      <button
                        key={t.id}
                        onClick={() => setSelected(t.table_number)}
                        className="w-full text-left p-1.5 text-sm font-bold text-amber-700 dark:text-amber-400 flex justify-between items-center hover:bg-amber-100 dark:hover:bg-amber-950/30 rounded transition-colors"
                      >
                        <span>{t.table_number} {t.is_vip ? "— VIP" : ""}</span>
                        <span className="font-normal text-xs text-amber-600">{elapsedLabel(t.started_at)}</span>
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
    </>
  );
}
