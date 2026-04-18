"use client";

/**
 * MenuClientV2 — versión gated al afiliado piloto (the-little-dominican).
 *
 * Diferencias vs MenuClient legacy:
 *  - Editor de periodos (breakfast/lunch/dinner/late_night/all_day) por plato
 *  - Filtro por periodo
 *  - Resumen con conteo por periodo en el header
 *  - Modal de edición incluye MealPeriodEditor
 *
 * Persistencia: de momento in-memory (como el legacy). El DTO del servicio
 * real tendrá que extenderse con `periods` cuando se enganche Umbraco/API.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MOCK_DISHES,
  MENU_CATEGORIES,
  FEATURED_DISHES,
  type MenuItem,
} from "@/app/the-little-dominican/_data";

// Slugify helper for generating dish IDs from a name
function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Map DB dish row → UI MenuItem
interface DbDish {
  id: string; name: string; description: string | null; price: number | string;
  category: string; image_url: string | null; periods: string[] | null;
  available: boolean; featured: boolean; popular: boolean;
  flags: { vegetarian?: boolean; spicy?: boolean; glutenFree?: boolean } | null;
}
function mapDbDish(r: DbDish & { featured?: boolean }): MenuItem & { _featured?: boolean } {
  return {
    id: r.id, name: r.name, description: r.description ?? "",
    price: typeof r.price === "string" ? parseFloat(r.price) : r.price,
    image: r.image_url ?? "", category: r.category, flags: r.flags ?? {},
    popular: r.popular, available: r.available,
    periods: (r.periods && r.periods.length > 0 ? r.periods : undefined) as MenuItem["periods"],
    _featured: r.featured,
  };
}
import type { AffiliateConfig } from "@/config/affiliates-config";
import { StatCard, DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/buttons";
import { MealPeriodEditor } from "./MealPeriodEditor";
import { ImageCropper } from "./ImageCropper";
import {
  MEAL_PERIOD_LABELS,
  MEAL_PERIOD_ORDER,
  getCurrentPeriod,
  currentPeriodEndLabel,
} from "@/lib/menu-availability";
import type { MealPeriod } from "@/lib/types";

// ─── Static data ─────────────────────────────────────────────────────────────

const INVENTORY_ALERTS = [
  { name: "Plátanos verdes", unit: "12 lbs restantes", pct: 15, critical: true },
  { name: "Snapper fresco",  unit: "8 lbs restantes",  pct: 25, critical: true },
  { name: "Cerdo (pernil)",  unit: "22 lbs restantes", pct: 45, critical: false },
  { name: "Arroz largo",     unit: "40 lbs restantes", pct: 60, critical: false },
];

const CATEGORY_PILLS = ["Todos", "Popular", ...MENU_CATEGORIES];

const PERIOD_PILLS: Array<{ key: "all" | MealPeriod; label: string }> = [
  { key: "all", label: "Todos los periodos" },
  ...MEAL_PERIOD_ORDER.map((p) => ({ key: p, label: MEAL_PERIOD_LABELS[p] })),
];

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
    <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${FLAG_COLORS[color]}`}>
      {label}
    </span>
  );
}

function PeriodChips({ periods }: { periods: MealPeriod[] }) {
  const display = periods.length === 0 ? (["all_day"] as MealPeriod[]) : periods;
  return (
    <div className="flex flex-wrap gap-1">
      {display.map((p) => (
        <span
          key={p}
          className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
        >
          {MEAL_PERIOD_LABELS[p]}
        </span>
      ))}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface MenuClientV2Props {
  affiliateId: string;
  config: AffiliateConfig;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MenuClientV2({ affiliateId, config }: MenuClientV2Props) {
  const currency = config.settings.currency === "DOP" ? "RD$" : "$";
  const mealPeriodHours = config.mealPeriodHours;

  // ── Live dishes from API (Supabase) ────────────────────────────────────────
  // Seed initial state from MOCK_DISHES so SSR/first-paint has content; replaced on fetch.
  const [dishes, setDishes] = useState<MenuItem[]>(MOCK_DISHES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Editable state — mirrors what's in `dishes`; updated optimistically then confirmed on PATCH.
  const [images, setImages] = useState<Record<string, string>>(() =>
    Object.fromEntries(MOCK_DISHES.map((d) => [d.id, d.image]))
  );
  const [prices, setPrices] = useState<Record<string, number>>(() =>
    Object.fromEntries(MOCK_DISHES.map((d) => [d.id, d.price]))
  );
  const [availability, setAvail] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MOCK_DISHES.map((d) => [d.id, d.available]))
  );
  const [isPopular, setPopular] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MOCK_DISHES.map((d) => [d.id, d.popular ?? false]))
  );
  const [isFeatured, setFeatured] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MOCK_DISHES.map((d) => [d.id, FEATURED_DISHES.includes(d.id)]))
  );
  const [itemPeriods, setItemPeriods] = useState<Record<string, MealPeriod[]>>(() =>
    Object.fromEntries(MOCK_DISHES.map((d) => [d.id, d.periods ?? []]))
  );

  // Load real dishes from Supabase via the API route
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/dashboard/${affiliateId}/dishes`, { cache: "no-store" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const { dishes: rows } = (await res.json()) as { dishes: DbDish[] };
        if (cancelled) return;
        if (rows.length === 0) {
          setLoadError("La base de datos no devolvió platos para este afiliado. Mostrando datos de ejemplo (MOCK).");
        } else {
          setLoadError(null);
          const mapped = rows.map(mapDbDish);
          setDishes(mapped);
          setImages(Object.fromEntries(mapped.map((d) => [d.id, d.image])));
          setPrices(Object.fromEntries(mapped.map((d) => [d.id, d.price])));
          setAvail(Object.fromEntries(mapped.map((d) => [d.id, d.available])));
          setPopular(Object.fromEntries(mapped.map((d) => [d.id, d.popular ?? false])));
          setFeatured(Object.fromEntries(mapped.map((d) => [d.id, !!(d as MenuItem & { _featured?: boolean })._featured])));
          setItemPeriods(Object.fromEntries(mapped.map((d) => [d.id, (d.periods ?? []) as MealPeriod[]])));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[MenuClientV2] failed to load dishes from API:", msg);
        if (!cancelled) setLoadError(`No se pudo cargar el menú desde la base de datos: ${msg}. Mostrando datos de ejemplo (MOCK) — los cambios NO se guardarán. Revisa /api/dashboard/health.`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [affiliateId]);

  // Persist a field change to the API (optimistic local update already done by caller)
  const patchDish = async (dishId: string, patch: Record<string, unknown>) => {
    const res = await fetch(`/api/dashboard/${affiliateId}/dishes/${dishId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `PATCH failed (${res.status})`);
    }
  };

  // Toggle availability with persistence + optimistic rollback
  const toggleAvailability = async (dishId: string) => {
    const prev = availability[dishId];
    const next = !prev;
    setAvail((a) => ({ ...a, [dishId]: next }));
    try {
      await patchDish(dishId, { available: next });
    } catch (err) {
      setAvail((a) => ({ ...a, [dishId]: prev }));
      alert(`No se pudo ${next ? "activar" : "ocultar"} el plato: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // UI state
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [activePeriod, setActivePeriod] = useState<"all" | MealPeriod>("all");
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<MenuItem | null>(null);

  // New dish modal state
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newCategory, setNewCategory] = useState<string>(MENU_CATEGORIES[0]);
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const newFileRef = useRef<HTMLInputElement | null>(null);

  // Cropper state — shared between edit and new flows
  // `cropFor` tracks which flow should receive the cropped result
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropFor, setCropFor] = useState<"edit" | "new" | null>(null);

  const resetNewForm = () => {
    setNewName("");
    setNewDescription("");
    setNewPrice(0);
    setNewCategory(MENU_CATEGORIES[0]);
    setNewImageUrl("");
  };

  // Read a File into a dataURL so the cropper can load it without CORS
  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(r.error ?? new Error("No se pudo leer el archivo"));
      r.readAsDataURL(file);
    });

  // Edit flow — file picked → open cropper → on crop → upload blob
  const handleEditFilePicked = async (file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setCropSrc(dataUrl);
      setCropFor("edit");
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  const uploadBlob = async (blob: Blob, dishId: string): Promise<string> => {
    const form = new FormData();
    const file = new File([blob], `${dishId}.jpg`, { type: "image/jpeg" });
    form.append("file", file);
    form.append("dishId", dishId);
    const res = await fetch(`/api/dashboard/${affiliateId}/dishes/upload-image`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Upload failed (${res.status})`);
    }
    const { url } = (await res.json()) as { url: string };
    return url;
  };

  const handleCropDone = async (blob: Blob) => {
    if (cropFor === "edit" && editItem) {
      setSaving(true);
      try {
        const url = await uploadBlob(blob, editItem.id);
        setEditUrl(url);
      } catch (err) {
        alert(`No se pudo subir la foto: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setSaving(false);
        setCropSrc(null);
        setCropFor(null);
      }
      return;
    }
    if (cropFor === "new") {
      setSaving(true);
      try {
        // Use a temp id for the storage path; the dish row will be created after
        const tempId = slugify(newName) || `new-${Date.now()}`;
        const url = await uploadBlob(blob, tempId);
        setNewImageUrl(url);
      } catch (err) {
        alert(`No se pudo subir la foto: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setSaving(false);
        setCropSrc(null);
        setCropFor(null);
      }
      return;
    }
    setCropSrc(null);
    setCropFor(null);
  };

  // New-dish flow — file picked → open cropper
  const handleNewFilePicked = async (file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setCropSrc(dataUrl);
      setCropFor("new");
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  // Re-crop from an existing URL (edit flow)
  const recropExistingImage = async (url: string, target: "edit" | "new") => {
    if (!url) return;
    // Convert URL → blob → dataURL (avoids cross-origin canvas taint later since
    // the cropper loads via <img crossOrigin>)
    try {
      const res = await fetch(url, { cache: "no-store" });
      const blob = await res.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = () => reject(r.error);
        r.readAsDataURL(blob);
      });
      setCropSrc(dataUrl);
      setCropFor(target);
    } catch (err) {
      alert(`No se pudo abrir la imagen para recortar: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const openNewDish = () => {
    resetNewForm();
    setNewOpen(true);
  };

  const handleCreateDish = async () => {
    const name = newName.trim();
    if (!name) {
      alert("El nombre es obligatorio.");
      return;
    }
    if (newPrice <= 0) {
      alert("El precio debe ser mayor que 0.");
      return;
    }
    const baseId = slugify(name) || `plato-${Date.now()}`;
    // Ensure uniqueness if duplicate
    let id = baseId;
    let suffix = 2;
    const existingIds = new Set(dishes.map((d) => d.id));
    while (existingIds.has(id)) {
      id = `${baseId}-${suffix++}`;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/dashboard/${affiliateId}/dishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name,
          description: newDescription.trim() || null,
          price: newPrice,
          category: newCategory,
          image_url: newImageUrl || null,
          periods: [],
          available: true,
          featured: false,
          popular: false,
          flags: {},
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `POST failed (${res.status})`);
      }
      const { dish } = (await res.json()) as { dish: DbDish };
      const mapped = mapDbDish(dish);
      // Append to local state
      setDishes((ds) => [...ds, mapped]);
      setImages((p) => ({ ...p, [mapped.id]: mapped.image }));
      setPrices((p) => ({ ...p, [mapped.id]: mapped.price }));
      setAvail((p) => ({ ...p, [mapped.id]: mapped.available }));
      setPopular((p) => ({ ...p, [mapped.id]: mapped.popular ?? false }));
      setFeatured((p) => ({ ...p, [mapped.id]: !!(mapped as MenuItem & { _featured?: boolean })._featured }));
      setItemPeriods((p) => ({ ...p, [mapped.id]: (mapped.periods ?? []) as MealPeriod[] }));
      setNewOpen(false);
      resetNewForm();
    } catch (err) {
      alert(`No se pudo crear el plato: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  // Edit modal state
  const [editUrl, setEditUrl] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editPeriods, setEditPeriods] = useState<MealPeriod[]>([]);
  const [editToggles, setEditToggles] = useState({
    available: true,
    popular: false,
    featured: false,
  });

  const openEdit = (item: MenuItem) => {
    setEditUrl(images[item.id] ?? "");
    setEditPrice(prices[item.id] ?? item.price);
    setEditPeriods(itemPeriods[item.id] ?? []);
    setEditToggles({
      available: availability[item.id],
      popular: isPopular[item.id],
      featured: isFeatured[item.id],
    });
    setEditItem(item);
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    // Snapshot previous values for rollback
    const prev = {
      image: images[editItem.id],
      price: prices[editItem.id],
      available: availability[editItem.id],
      popular: isPopular[editItem.id],
      featured: isFeatured[editItem.id],
      periods: itemPeriods[editItem.id],
    };
    // Optimistic update
    setImages((p) => ({ ...p, [editItem.id]: editUrl }));
    setPrices((p) => ({ ...p, [editItem.id]: editPrice }));
    setAvail((p) => ({ ...p, [editItem.id]: editToggles.available }));
    setPopular((p) => ({ ...p, [editItem.id]: editToggles.popular }));
    setFeatured((p) => ({ ...p, [editItem.id]: editToggles.featured }));
    setItemPeriods((p) => ({ ...p, [editItem.id]: editPeriods }));

    try {
      await patchDish(editItem.id, {
        image_url: editUrl,
        price: editPrice,
        available: editToggles.available,
        popular: editToggles.popular,
        featured: editToggles.featured,
        periods: editPeriods,
      });
      setEditItem(null);
    } catch (err) {
      // Rollback
      setImages((p) => ({ ...p, [editItem.id]: prev.image }));
      setPrices((p) => ({ ...p, [editItem.id]: prev.price }));
      setAvail((p) => ({ ...p, [editItem.id]: prev.available }));
      setPopular((p) => ({ ...p, [editItem.id]: prev.popular }));
      setFeatured((p) => ({ ...p, [editItem.id]: prev.featured }));
      setItemPeriods((p) => ({ ...p, [editItem.id]: prev.periods }));
      alert(`No se pudo guardar: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  // Filtering
  const filtered = dishes.filter((d) => {
    if (activeCategory === "Popular" && !isPopular[d.id]) return false;
    if (
      activeCategory !== "Todos" &&
      activeCategory !== "Popular" &&
      d.category !== activeCategory
    ) {
      return false;
    }
    if (activePeriod !== "all") {
      const p = itemPeriods[d.id] ?? [];
      const effective = p.length === 0 ? (["all_day"] as MealPeriod[]) : p;
      if (!effective.includes(activePeriod)) return false;
    }
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Stats
  const activeCount = dishes.filter((d) => availability[d.id]).length;
  const inactiveCount = dishes.filter((d) => !availability[d.id]).length;
  const featuredCount = dishes.filter((d) => isFeatured[d.id]).length;

  // Period summary
  const periodSummary = useMemo(() => {
    const counts: Record<MealPeriod, number> = {
      breakfast: 0, lunch: 0, dinner: 0, late_night: 0, all_day: 0,
    };
    for (const d of dishes) {
      const p = itemPeriods[d.id] ?? [];
      const effective = p.length === 0 ? (["all_day"] as MealPeriod[]) : p;
      for (const period of effective) counts[period]++;
    }
    return counts;
  }, [itemPeriods, dishes]);

  const now = new Date();
  const currentPeriod = getCurrentPeriod(mealPeriodHours, now);
  const endLabel = currentPeriodEndLabel(mealPeriodHours, now);

  const getStatusColor = (id: string) => {
    if (!availability[id]) return "text-gray-400";
    if (isPopular[id]) return "text-green-600 dark:text-green-400";
    return "text-blue-500 dark:text-blue-400";
  };
  const getStatusLabel = (id: string) => {
    if (!availability[id]) return "Inactivo";
    if (isPopular[id]) return "Popular";
    return "Activo";
  };

  return (
    <div className="space-y-6">
      {/* ── Load/config error banner ─────────────────────────────────── */}
      {loadError && !loading && (
        <div
          role="alert"
          className="rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/40 p-4 flex items-start gap-3"
        >
          <span aria-hidden="true" className="text-2xl leading-none">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
              Menú no conectado a base de datos
            </p>
            <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
              {loadError}
            </p>
            <a
              href="/api/dashboard/health"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs font-semibold underline text-red-800 dark:text-red-200"
            >
              Abrir diagnóstico →
            </a>
          </div>
        </div>
      )}
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-1">
            Gestión de Carta · Piloto con periodos
          </p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Menú</h2>
          {mealPeriodHours && currentPeriod !== "all_day" && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Ahora sirviendo{" "}
              <span className="font-semibold" style={{ color: "var(--brand-primary)" }}>
                {MEAL_PERIOD_LABELS[currentPeriod]}
              </span>
              {endLabel && <> · hasta las {endLabel}</>}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Importar CSV
          </button>
          <button
            onClick={openNewDish}
            className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            + Nuevo Plato
          </button>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Platos Activos" value={activeCount} icon="✅" color="green" />
        <StatCard label="Inactivos" value={inactiveCount} icon="❌" color="red" />
        <StatCard label="Destacados" value={featuredCount} icon="⭐" color="yellow" />
        <StatCard label="Total Platos" value={dishes.length} icon="🍽️" color="blue" />
      </div>

      {/* ── Period summary row ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Distribución por periodo
        </p>
        <div className="flex flex-wrap gap-3">
          {MEAL_PERIOD_ORDER.map((p) => (
            <div key={p} className="flex items-center gap-2">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: "var(--brand-primary)" }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-bold">{periodSummary[p]}</span>{" "}
                <span className="text-gray-500 dark:text-gray-400">
                  {MEAL_PERIOD_LABELS[p]}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────── */}
      <div className="space-y-2">
        {/* Category pills */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORY_PILLS.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
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
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar plato..."
            className="bg-gray-100 dark:bg-gray-800 border-none rounded-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none w-full sm:w-auto sm:max-w-[220px]"
          />
        </div>
        {/* Period pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 max-w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PERIOD_PILLS.map((p) => (
            <button
              key={p.key}
              onClick={() => setActivePeriod(p.key)}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 border transition-colors ${
                activePeriod === p.key
                  ? "text-white border-transparent"
                  : "bg-transparent border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              style={
                activePeriod === p.key
                  ? { backgroundColor: "var(--brand-primary)" }
                  : undefined
              }
            >
              {p.label}
            </button>
          ))}
        </div>
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
              {/* Image */}
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
                <div className="flex justify-between items-start gap-2">
                  <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight truncate">
                    {item.name}
                  </p>
                  <span className={`text-xs font-semibold flex-shrink-0 ${getStatusColor(item.id)}`}>
                    {getStatusLabel(item.id)}
                  </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 sm:line-clamp-3">
                  {item.description}
                </p>

                {/* Period chips */}
                <PeriodChips periods={itemPeriods[item.id] ?? []} />

                {/* Dietary flags */}
                {(item.flags.vegetarian || item.flags.glutenFree || item.flags.spicy) && (
                  <div className="flex flex-wrap gap-1">
                    {item.flags.vegetarian && <FlagChip label="🌿 Veg" color="green" />}
                    {item.flags.glutenFree && <FlagChip label="🌾 GF" color="blue" />}
                    {item.flags.spicy && <FlagChip label="🌶 Pic" color="orange" />}
                  </div>
                )}

                {/* Price + actions */}
                <div className="flex items-center justify-between mt-auto pt-1 gap-2">
                  <span className="text-base font-bold text-gray-900 dark:text-white tabular-nums">
                    {currency}
                    {prices[item.id].toFixed(2)}
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
                      onClick={() => toggleAvailability(item.id)}
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
                action={{ label: "+ Nuevo Plato", onClick: openNewDish }}
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
        <Modal isOpen onClose={() => setEditItem(null)} title={`Editar: ${editItem.name}`}>
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

            {/* Image upload + URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Foto del plato
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleEditFilePicked(f);
                    e.currentTarget.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  📷 {saving ? "Subiendo..." : "Subir foto"}
                </button>
                {editUrl && (
                  <button
                    type="button"
                    onClick={() => recropExistingImage(editUrl, "edit")}
                    disabled={saving}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    title="Recortar / ajustar enfoque de la foto actual"
                  >
                    ✂️ Recortar actual
                  </button>
                )}
              </div>
              <input
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="...o pega una URL"
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
                onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Periods */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                Se sirve en
              </label>
              <MealPeriodEditor value={editPeriods} onChange={setEditPeriods} />
              <p className="text-[11px] text-gray-400 mt-2">
                Deja vacío o marca <strong>Todo el día</strong> para que esté siempre disponible.
              </p>
            </div>

            {/* Toggles */}
            <div className="flex flex-col gap-3">
              {(
                [
                  ["available", "Disponible en menú"],
                  ["popular", "Popular 🔥"],
                  ["featured", "Destacado ⭐"],
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
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <Button variant="ghost" size="sm" onClick={() => setEditItem(null)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveEdit} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── New dish modal ───────────────────────────────────────────── */}
      {newOpen && (
        <Modal isOpen onClose={() => setNewOpen(false)} title="Nuevo plato">
          <div className="space-y-4 p-4 overflow-y-auto">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Nombre, precio y categoría son obligatorios. Puedes añadir la foto ahora
              y recortarla como quieras; el resto (periodos, destacados) se edita luego.
            </p>

            {/* Foto del plato */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Foto del plato
              </label>
              {newImageUrl ? (
                <div className="space-y-2">
                  <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => recropExistingImage(newImageUrl, "new")}
                      disabled={saving}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      ✂️ Recortar de nuevo
                    </button>
                    <button
                      type="button"
                      onClick={() => newFileRef.current?.click()}
                      disabled={saving}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      🔁 Reemplazar
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewImageUrl("")}
                      disabled={saving}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors disabled:opacity-50"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => newFileRef.current?.click()}
                  disabled={saving}
                  className="w-full px-3 py-4 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  📷 {saving ? "Subiendo..." : "Subir foto (recortable)"}
                </button>
              )}
              <input
                ref={newFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleNewFilePicked(f);
                  e.currentTarget.value = "";
                }}
              />
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Nombre <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Sancocho dominicano"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Descripción corta
              </label>
              <textarea
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Qué trae, cómo se sirve..."
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Precio + Categoría */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Precio ({currency}) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPrice}
                  onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Categoría <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MENU_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <Button variant="ghost" size="sm" onClick={() => setNewOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreateDish} disabled={saving}>
                {saving ? "Creando..." : "Crear plato"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Cropper modal (compartido entre edit + new) ──────────────── */}
      {cropSrc && (
        <Modal
          isOpen
          onClose={() => {
            setCropSrc(null);
            setCropFor(null);
          }}
          title="Ajustar foto"
        >
          <div className="p-4">
            <ImageCropper
              src={cropSrc}
              aspect={4 / 3}
              busy={saving}
              onCancel={() => {
                setCropSrc(null);
                setCropFor(null);
              }}
              onCropped={handleCropDone}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
