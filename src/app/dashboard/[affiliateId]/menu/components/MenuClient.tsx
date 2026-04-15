"use client";

import { useState } from "react";
import {
  MOCK_DISHES,
  MENU_CATEGORIES,
  FEATURED_DISHES,
  type MenuItem,
} from "@/app/the-little-dominican/_data";
import type { AffiliateConfig } from "@/config/affiliates-config";
import { StatCard, DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/buttons";

// ─── Static data ─────────────────────────────────────────────────────────────

const INVENTORY_ALERTS = [
  { name: "Plátanos verdes",  unit: "12 lbs restantes", pct: 15, critical: true  },
  { name: "Snapper fresco",   unit: "8 lbs restantes",  pct: 25, critical: true  },
  { name: "Cerdo (pernil)",   unit: "22 lbs restantes", pct: 45, critical: false },
  { name: "Arroz largo",      unit: "40 lbs restantes", pct: 60, critical: false },
];

const PILLS = ["Todos", "Popular", ...MENU_CATEGORIES];

const FALLBACK_IMG =
  "data:image/svg+xml;base64," +
  btoa(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">' +
    '<rect width="600" height="400" fill="#f3f4f6"/>' +
    '<text x="300" y="230" text-anchor="middle" fill="#9ca3af" ' +
    'font-size="24" font-family="sans-serif">Sin imagen</text>' +
    "</svg>"
  );

// ─── Flag chip ────────────────────────────────────────────────────────────────

const FLAG_COLORS = {
  green:  "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  blue:   "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
} as const;

function FlagChip({ label, color }: { label: string; color: keyof typeof FLAG_COLORS }) {
  return (
    <span
      className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${FLAG_COLORS[color]}`}
    >
      {label}
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface MenuClientProps {
  affiliateId: string;
  config: AffiliateConfig;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MenuClient({ config }: MenuClientProps) {
  const currency = config.settings.currency === "DOP" ? "RD$" : "$";

  // Editable state (overrides _data.ts in memory)
  const [images, setImages]     = useState<Record<string, string>>(() =>
    Object.fromEntries(MOCK_DISHES.map((d) => [d.id, d.image]))
  );
  const [prices, setPrices]     = useState<Record<string, number>>(() =>
    Object.fromEntries(MOCK_DISHES.map((d) => [d.id, d.price]))
  );
  const [availability, setAvail] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MOCK_DISHES.map((d) => [d.id, d.available]))
  );
  const [isPopular, setPopular]  = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MOCK_DISHES.map((d) => [d.id, d.popular ?? false]))
  );
  const [isFeatured, setFeatured] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MOCK_DISHES.map((d) => [d.id, FEATURED_DISHES.includes(d.id)]))
  );

  // UI state
  const [activeCategory, setActive] = useState("Todos");
  const [search, setSearch]         = useState("");
  const [editItem, setEditItem]     = useState<MenuItem | null>(null);

  // Edit modal state
  const [editUrl, setEditUrl]         = useState("");
  const [editPrice, setEditPrice]     = useState(0);
  const [editToggles, setEditToggles] = useState({
    available: true,
    popular: false,
    featured: false,
  });

  // Open edit modal — sync state at the moment of opening
  const openEdit = (item: MenuItem) => {
    setEditUrl(images[item.id] ?? "");
    setEditPrice(prices[item.id] ?? item.price);
    setEditToggles({
      available: availability[item.id],
      popular:   isPopular[item.id],
      featured:  isFeatured[item.id],
    });
    setEditItem(item);
  };

  const handleSaveEdit = () => {
    if (!editItem) return;
    setImages((p)   => ({ ...p, [editItem.id]: editUrl }));
    setPrices((p)   => ({ ...p, [editItem.id]: editPrice }));
    setAvail((p)    => ({ ...p, [editItem.id]: editToggles.available }));
    setPopular((p)  => ({ ...p, [editItem.id]: editToggles.popular }));
    setFeatured((p) => ({ ...p, [editItem.id]: editToggles.featured }));
    setEditItem(null);
  };

  // Filtering
  const filtered = MOCK_DISHES.filter((d) => {
    if (activeCategory === "Popular" && !isPopular[d.id]) return false;
    if (
      activeCategory !== "Todos" &&
      activeCategory !== "Popular" &&
      d.category !== activeCategory
    )
      return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Status helpers (close over state)
  const getStatusColor = (id: string) => {
    if (!availability[id]) return "text-gray-400";
    if (isPopular[id])     return "text-green-600 dark:text-green-400";
    return "text-blue-500 dark:text-blue-400";
  };
  const getStatusLabel = (id: string) => {
    if (!availability[id]) return "Inactivo";
    if (isPopular[id])     return "Popular";
    return "Activo";
  };

  // Stats
  const activeCount   = MOCK_DISHES.filter((d) => availability[d.id]).length;
  const inactiveCount = MOCK_DISHES.filter((d) => !availability[d.id]).length;
  const featuredCount = MOCK_DISHES.filter((d) => isFeatured[d.id]).length;

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-1">
            Gestión de Carta
          </p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Menú</h2>
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

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Platos Activos" value={activeCount}      icon="✅" color="green" />
        <StatCard label="Inactivos"       value={inactiveCount}   icon="❌" color="red"   />
        <StatCard label="Destacados"      value={featuredCount}   icon="⭐" color="yellow"/>
        <StatCard label="Total Platos"    value={MOCK_DISHES.length} icon="🍽️" color="blue" />
      </div>

      {/* ── Filter row ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Category pills — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 max-w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PILLS.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-colors ${
                activeCategory === cat
                  ? "text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              style={
                activeCategory === cat
                  ? { backgroundColor: "var(--brand-primary)" }
                  : undefined
              }
            >
              {cat === "Popular" ? "🔥 Popular" : cat}
            </button>
          ))}
        </div>
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar plato..."
          className="bg-gray-100 dark:bg-gray-800 border-none rounded-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none w-full sm:w-auto sm:max-w-[220px]"
        />
      </div>

      {/* ── Main grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">

        {/* Dish cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex sm:flex-col ${
                !availability[item.id] ? "opacity-60" : ""
              }`}
            >
              {/* Image — 96×96 on mobile (flex row), full 4:3 on sm+ (flex col) */}
              <div className="relative w-24 h-24 sm:w-full sm:h-auto sm:aspect-[4/3] flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[item.id]}
                  alt={item.name}
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
                  }}
                  className="w-full h-full object-cover"
                />
                {isPopular[item.id] && (
                  <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    🔥
                  </span>
                )}
                {isFeatured[item.id] && (
                  <span
                    className="absolute bottom-1.5 right-1.5 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                    style={{ backgroundColor: "var(--brand-primary)" }}
                  >
                    ⭐
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-3 sm:p-4 flex flex-col gap-1.5 min-w-0">
                {/* Name + status */}
                <div className="flex justify-between items-start gap-2">
                  <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight truncate">
                    {item.name}
                  </p>
                  <span className={`text-xs font-semibold flex-shrink-0 ${getStatusColor(item.id)}`}>
                    {getStatusLabel(item.id)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 sm:line-clamp-3">
                  {item.description}
                </p>

                {/* Dietary flags */}
                {(item.flags.vegetarian || item.flags.glutenFree || item.flags.spicy) && (
                  <div className="flex flex-wrap gap-1">
                    {item.flags.vegetarian && <FlagChip label="🌿 Veg" color="green" />}
                    {item.flags.glutenFree  && <FlagChip label="🌾 GF"  color="blue"  />}
                    {item.flags.spicy       && <FlagChip label="🌶 Pic" color="orange" />}
                  </div>
                )}

                {/* Price + actions */}
                <div className="flex items-center justify-between mt-auto pt-1 gap-2">
                  <span className="text-base font-bold text-gray-900 dark:text-white tabular-nums">
                    {currency}{prices[item.id].toFixed(2)}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title="Editar plato"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() =>
                        setAvail((a) => ({ ...a, [item.id]: !a[item.id] }))
                      }
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                        availability[item.id]
                          ? "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
                          : "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                      }`}
                    >
                      {availability[item.id] ? "Ocultar" : "Activar"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                icon="🍽️"
                title="No se encontraron platos"
                description="Ajusta los filtros o agrega un nuevo plato al menú."
                action={{ label: "+ Nuevo Plato", onClick: () => {} }}
              />
            </div>
          )}
        </div>

        {/* Inventory sidebar */}
        <DashboardCard title="Inventario Crítico" icon="📦">
          <div className="space-y-3 px-1">
            {INVENTORY_ALERTS.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.name}
                  </p>
                  {item.critical && (
                    <span className="text-xs font-bold text-rose-600">Crítico</span>
                  )}
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.pct < 30
                        ? "bg-rose-500"
                        : item.pct < 50
                        ? "bg-amber-500"
                        : "bg-green-500"
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

      {/* ── Edit modal ───────────────────────────────────────────────── */}
      {editItem && (
        <Modal
          isOpen
          onClose={() => setEditItem(null)}
          title={`Editar: ${editItem.name}`}
        >
          <div className="space-y-4 p-4 overflow-y-auto">
            {/* Image preview */}
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={editUrl || FALLBACK_IMG}
                alt="Preview"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
                }}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                URL de imagen
              </label>
              <input
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Precio ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                value={editPrice}
                onChange={(e) =>
                  setEditPrice(parseFloat(e.target.value) || 0)
                }
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Toggles */}
            <div className="flex flex-col gap-3">
              {(
                [
                  ["available", "Disponible en menú"],
                  ["popular",   "Popular 🔥"],
                  ["featured",  "Destacado ⭐"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editToggles[key]}
                    onChange={(e) =>
                      setEditToggles((t) => ({ ...t, [key]: e.target.checked }))
                    }
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {label}
                  </span>
                </label>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <Button variant="ghost" size="sm" onClick={() => setEditItem(null)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                Guardar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
