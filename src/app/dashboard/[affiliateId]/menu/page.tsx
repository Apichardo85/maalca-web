"use client";

import { useState } from "react";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { DashboardCard, StatCard } from "@/components/dashboard/DashboardCard";

// ─── Mock data ───────────────────────────────────────────────────────────────

const CATEGORIES = ["Todos", "Entradas", "Sopas", "Platos Fuertes", "Postres", "Bebidas"];

const MENU_ITEMS = [
  { id: 1, category: "Platos Fuertes", name: "Mofongo Relleno", price: 24.0, desc: "Platano verde majado con chicharron, relleno con camarones al ajillo", available: true, featured: true, stock: "high" },
  { id: 2, category: "Platos Fuertes", name: "Pernil Dominicano", price: 28.0, desc: "Pierna de cerdo marinada 24h con sazon criollo, arroz blanco y habichuelas", available: true, featured: true, stock: "low" },
  { id: 3, category: "Platos Fuertes", name: "Pescado Frito Entero", price: 32.0, desc: "Snapper entero frito, tostones, ensalada y salsa criolla", available: true, featured: true, stock: "medium" },
  { id: 4, category: "Platos Fuertes", name: "Pollo Guisado", price: 22.0, desc: "Pollo estofado con sofrito dominicano, arroz y habichuelas", available: true, featured: false, stock: "high" },
  { id: 5, category: "Entradas", name: "Chicharron de Pollo", price: 14.0, desc: "Trozos de pollo fritos crujientes con salsa rosada y tostones", available: true, featured: false, stock: "high" },
  { id: 6, category: "Entradas", name: "Yaniqueques", price: 8.0, desc: "Crackers dominicanos fritos, crujientes, con mantequilla y queso", available: false, featured: false, stock: "out" },
  { id: 7, category: "Sopas", name: "Sancocho Prieto", price: 18.0, desc: "Guiso tradicional de siete carnes, maiz y raices tropicales", available: true, featured: false, stock: "medium" },
  { id: 8, category: "Postres", name: "Tres Leches Dominicano", price: 9.0, desc: "Bizcocho empapado en tres tipos de leche, canela y coco rallado", available: true, featured: false, stock: "high" },
  { id: 9, category: "Bebidas", name: "Morir Sonando", price: 6.0, desc: "Jugo de naranja con leche evaporada y azucar, clasico dominicano", available: true, featured: false, stock: "high" },
];

const INVENTORY_ALERTS = [
  { name: "Platanos verdes", unit: "12 lbs restantes", pct: 15, critical: true },
  { name: "Snapper fresco", unit: "8 lbs restantes", pct: 25, critical: true },
  { name: "Cerdo (pernil)", unit: "22 lbs restantes", pct: 45, critical: false },
  { name: "Arroz largo", unit: "40 lbs restantes", pct: 60, critical: false },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MenuManagement() {
  const { config } = useAffiliate();
  const currency = config?.settings.currency === "DOP" ? "RD$" : "$";

  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [prices, setPrices] = useState<Record<number, number>>(
    Object.fromEntries(MENU_ITEMS.map((i) => [i.id, i.price]))
  );
  const [availability, setAvailability] = useState<Record<number, boolean>>(
    Object.fromEntries(MENU_ITEMS.map((i) => [i.id, i.available]))
  );
  const [editingPrice, setEditingPrice] = useState<number | null>(null);

  const filtered = MENU_ITEMS.filter((item) => {
    if (activeCategory !== "Todos" && item.category !== activeCategory) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stockColor = (s: string) =>
    s === "high" ? "text-green-600" : s === "medium" ? "text-amber-600" : s === "low" ? "text-rose-600" : "text-gray-400";
  const stockLabel = (s: string) =>
    s === "high" ? "Disponible" : s === "medium" ? "Moderado" : s === "low" ? "Bajo" : "Agotado";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-1">
            Gestion de Carta
          </p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Menu
          </h2>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Importar CSV
          </button>
          <button
            className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition-colors"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            + Nuevo Plato
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Platos Activos" value={MENU_ITEMS.filter((i) => i.available).length} icon="✅" />
        <StatCard label="Inactivos" value={MENU_ITEMS.filter((i) => !i.available).length} icon="❌" />
        <StatCard label="Destacados" value={MENU_ITEMS.filter((i) => i.featured).length} icon="⭐" />
        <StatCard label="Total Platos" value={MENU_ITEMS.length} icon="🍽️" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                activeCategory === cat
                  ? "text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              style={activeCategory === cat ? { backgroundColor: "var(--brand-primary)" } : undefined}
            >
              {cat}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar plato..."
          className="bg-gray-100 dark:bg-gray-800 border-none rounded-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none w-full max-w-[220px]"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
        {/* Menu items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm ${
                !availability[item.id] ? "opacity-60" : ""
              }`}
            >
              {/* Body */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                    {item.name}
                  </p>
                  <span className={`text-xs font-semibold ${stockColor(item.stock)}`}>
                    {stockLabel(item.stock)}
                  </span>
                </div>
                {item.featured && (
                  <span
                    className="inline-block text-[10px] font-bold tracking-wide uppercase text-white px-2 py-0.5 rounded mb-2"
                    style={{ backgroundColor: "var(--brand-primary)" }}
                  >
                    Destacado
                  </span>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                  {item.desc}
                </p>

                {/* Price + controls */}
                <div className="flex items-center justify-between">
                  {editingPrice === item.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">{currency}</span>
                      <input
                        type="number"
                        step="0.01"
                        value={prices[item.id]}
                        onChange={(e) =>
                          setPrices((p) => ({ ...p, [item.id]: parseFloat(e.target.value) || 0 }))
                        }
                        onBlur={() => setEditingPrice(null)}
                        autoFocus
                        className="w-16 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm font-bold text-gray-900 dark:text-white dark:bg-gray-800 outline-none"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingPrice(item.id)}
                      className="flex items-center gap-1 text-lg font-bold text-gray-900 dark:text-white hover:opacity-70 transition-opacity"
                    >
                      {currency}{prices[item.id].toFixed(2)}
                    </button>
                  )}

                  <button
                    onClick={() => setAvailability((a) => ({ ...a, [item.id]: !a[item.id] }))}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      availability[item.id]
                        ? "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
                        : "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                    }`}
                  >
                    {availability[item.id] ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🔍</p>
              <p className="text-sm">No se encontraron platos</p>
            </div>
          )}
        </div>

        {/* Right — Inventory alerts */}
        <div className="space-y-4">
          <DashboardCard title="Inventario Critico" icon="📦">
            <div className="space-y-3">
              {INVENTORY_ALERTS.map((item) => (
                <div key={item.name} className="px-1">
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
                    {item.critical && (
                      <span className="text-xs font-bold text-rose-600">Critico</span>
                    )}
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.pct < 30 ? "bg-rose-500" : item.pct < 50 ? "bg-amber-500" : "bg-green-500"
                      }`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{item.unit}</p>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
