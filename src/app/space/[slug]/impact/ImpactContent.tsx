'use client';

// src/app/space/[slug]/impact/ImpactContent.tsx
// Insumos -> Recetas -> Combos -> Servir, en ese orden porque cada paso depende del
// anterior (una receta necesita insumos con costo, un combo necesita al menos una
// receta con costo, "servir" necesita un combo con CostPerPlate > 0). Esto es lo que
// alimenta "comidas servidas este mes" / "costo promedio por plato" en la vitrina
// publica (Community.tsx, Calculadora de impacto) via /community-metrics y
// /public/affiliates/{slug}/community-metrics — ver CommunityService.cs.
import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import type {
  CommunityInventoryItem,
  CommunityRecipe,
  CommunityCombo,
  CommunityMetrics,
  ServeComboResponse,
} from './types';

interface Props {
  slug: string;
  initialInventoryItems: CommunityInventoryItem[];
  initialRecipes: CommunityRecipe[];
  initialCombos: CommunityCombo[];
  initialMetrics: CommunityMetrics | null;
}

const UNIT_OPTIONS = ['lb', 'kg', 'g', 'litro', 'ml', 'unidad', 'caja', 'paquete', 'docena'];

const inputClass =
  'w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm';
const cardClass =
  'rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4';
const primaryBtn =
  'rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-neutral-300';

async function api<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; data: T | null; error?: string }> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
    if (res.status === 204) return { ok: true, data: null };
    const data = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, data: null, error: data?.error?.message ?? data?.error ?? `HTTP ${res.status}` };
    return { ok: true, data };
  } catch {
    return { ok: false, data: null, error: 'network' };
  }
}

export function ImpactContent({ slug, initialInventoryItems, initialRecipes, initialCombos, initialMetrics }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();
  const base = `/api/space/${slug}/community`;

  const [items, setItems] = useState<CommunityInventoryItem[]>(initialInventoryItems);
  const [recipes, setRecipes] = useState<CommunityRecipe[]>(initialRecipes);
  const [combos, setCombos] = useState<CommunityCombo[]>(initialCombos);
  const [metrics, setMetrics] = useState<CommunityMetrics | null>(initialMetrics);

  async function refreshMetrics() {
    const res = await api<CommunityMetrics>(`${base}/metrics`);
    if (res.ok && res.data) setMetrics(res.data);
  }

  async function refreshRecipe(id: string) {
    const res = await api<CommunityRecipe>(`${base}/recipes/${id}`);
    if (res.ok && res.data) setRecipes((prev) => prev.map((r) => (r.id === id ? res.data! : r)));
  }

  async function refreshCombos() {
    const res = await api<CommunityCombo[]>(`${base}/combos`);
    if (res.ok && res.data) setCombos(res.data);
  }

  // ── Insumos ──────────────────────────────────────────────────────────────
  const emptyItemForm = { name: '', unit: 'lb', quantityOnHand: '0', unitCost: '0', source: '', lowStockThreshold: '' };
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [savingItem, setSavingItem] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);

  function startEditItem(item: CommunityInventoryItem) {
    setEditingItemId(item.id);
    setItemForm({
      name: item.name,
      unit: item.unit,
      quantityOnHand: String(item.quantityOnHand),
      unitCost: String(item.unitCost),
      source: item.source ?? '',
      lowStockThreshold: item.lowStockThreshold != null ? String(item.lowStockThreshold) : '',
    });
    setShowItemForm(true);
  }

  async function saveItem() {
    if (!itemForm.name.trim()) return;
    setSavingItem(true);
    const body = {
      name: itemForm.name.trim(),
      unit: itemForm.unit,
      quantityOnHand: Number(itemForm.quantityOnHand) || 0,
      unitCost: Number(itemForm.unitCost) || 0,
      source: itemForm.source.trim() || null,
      lowStockThreshold: itemForm.lowStockThreshold ? Number(itemForm.lowStockThreshold) : null,
    };
    const res = editingItemId
      ? await api<CommunityInventoryItem>(`${base}/inventory-items/${editingItemId}`, { method: 'PUT', body: JSON.stringify(body) })
      : await api<CommunityInventoryItem>(`${base}/inventory-items`, { method: 'POST', body: JSON.stringify(body) });
    setSavingItem(false);
    if (!res.ok || !res.data) {
      toast.error(res.error ?? getText('No se pudo guardar', 'Could not save'));
      return;
    }
    setItems((prev) =>
      editingItemId ? prev.map((i) => (i.id === editingItemId ? res.data! : i)) : [...prev, res.data!],
    );
    setItemForm(emptyItemForm);
    setEditingItemId(null);
    setShowItemForm(false);
    toast.success(getText('Insumo guardado', 'Item saved'));
  }

  async function deleteItem(id: string) {
    const res = await api<null>(`${base}/inventory-items/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error(res.error ?? getText('No se pudo eliminar', 'Could not delete'));
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success(getText('Insumo eliminado', 'Item deleted'));
  }

  // ── Recetas ──────────────────────────────────────────────────────────────
  const [recipeForm, setRecipeForm] = useState({ name: '', servings: '1' });
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [ingredientDraft, setIngredientDraft] = useState<{ inventoryItemId: string; quantityRequired: string }>({
    inventoryItemId: '',
    quantityRequired: '1',
  });

  async function createRecipe() {
    if (!recipeForm.name.trim()) return;
    setSavingRecipe(true);
    const res = await api<CommunityRecipe>(`${base}/recipes`, {
      method: 'POST',
      body: JSON.stringify({ name: recipeForm.name.trim(), servings: Number(recipeForm.servings) || 1 }),
    });
    setSavingRecipe(false);
    if (!res.ok || !res.data) {
      toast.error(res.error ?? getText('No se pudo crear la receta', 'Could not create recipe'));
      return;
    }
    setRecipes((prev) => [...prev, res.data!]);
    setRecipeForm({ name: '', servings: '1' });
    setShowRecipeForm(false);
    setExpandedRecipeId(res.data.id);
  }

  async function deleteRecipe(id: string) {
    const res = await api<null>(`${base}/recipes/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error(res.error ?? getText('No se pudo eliminar', 'Could not delete'));
      return;
    }
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  }

  async function addIngredient(recipeId: string) {
    if (!ingredientDraft.inventoryItemId) return;
    const res = await api<CommunityRecipe>(`${base}/recipes/${recipeId}/ingredients`, {
      method: 'POST',
      body: JSON.stringify({
        inventoryItemId: ingredientDraft.inventoryItemId,
        quantityRequired: Number(ingredientDraft.quantityRequired) || 0,
      }),
    });
    if (!res.ok) {
      toast.error(res.error ?? getText('No se pudo agregar el insumo', 'Could not add ingredient'));
      return;
    }
    await refreshRecipe(recipeId);
    setIngredientDraft({ inventoryItemId: '', quantityRequired: '1' });
  }

  async function removeIngredient(recipeId: string, ingredientId: string) {
    const res = await api<null>(`${base}/recipes/${recipeId}/ingredients/${ingredientId}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error(res.error ?? getText('No se pudo quitar', 'Could not remove'));
      return;
    }
    await refreshRecipe(recipeId);
  }

  // ── Combos ───────────────────────────────────────────────────────────────
  const [comboForm, setComboForm] = useState<{ name: string; recipeIds: string[] }>({ name: '', recipeIds: [] });
  const [savingCombo, setSavingCombo] = useState(false);
  const [showComboForm, setShowComboForm] = useState(false);
  const [serveQty, setServeQty] = useState<Record<string, string>>({});
  const [servingComboId, setServingComboId] = useState<string | null>(null);

  function toggleComboRecipe(id: string) {
    setComboForm((prev) => ({
      ...prev,
      recipeIds: prev.recipeIds.includes(id) ? prev.recipeIds.filter((r) => r !== id) : [...prev.recipeIds, id],
    }));
  }

  async function createCombo() {
    if (!comboForm.name.trim() || comboForm.recipeIds.length === 0) return;
    setSavingCombo(true);
    const res = await api<CommunityCombo>(`${base}/combos`, {
      method: 'POST',
      body: JSON.stringify({ name: comboForm.name.trim(), recipeIds: comboForm.recipeIds }),
    });
    setSavingCombo(false);
    if (!res.ok || !res.data) {
      toast.error(res.error ?? getText('No se pudo crear el combo', 'Could not create combo'));
      return;
    }
    setCombos((prev) => [...prev, res.data!]);
    setComboForm({ name: '', recipeIds: [] });
    setShowComboForm(false);
  }

  async function deleteCombo(id: string) {
    const res = await api<null>(`${base}/combos/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error(res.error ?? getText('No se pudo eliminar', 'Could not delete'));
      return;
    }
    setCombos((prev) => prev.filter((c) => c.id !== id));
  }

  async function serveCombo(combo: CommunityCombo) {
    const qty = Number(serveQty[combo.id] ?? '1');
    if (!qty || qty <= 0) return;
    setServingComboId(combo.id);
    const res = await api<ServeComboResponse>(`${base}/combos/${combo.id}/serve`, {
      method: 'POST',
      body: JSON.stringify({ quantity: qty }),
    });
    setServingComboId(null);
    if (!res.ok || !res.data) {
      toast.error(res.error ?? getText('No se pudo registrar', 'Could not log it'));
      return;
    }
    const shortages = res.data.consumption.filter((c) => c.shortage);
    if (shortages.length > 0) {
      toast.warning(
        getText(
          `Servido, pero faltó stock de: ${shortages.map((s) => s.name).join(', ')}`,
          `Served, but ran short on: ${shortages.map((s) => s.name).join(', ')}`,
        ),
      );
    } else {
      toast.success(getText(`${qty} plato(s) registrados`, `${qty} plate(s) logged`));
    }
    setServeQty((prev) => ({ ...prev, [combo.id]: '1' }));
    await Promise.all([refreshMetrics(), (async () => {
      const itemsRes = await api<CommunityInventoryItem[]>(`${base}/inventory-items`);
      if (itemsRes.ok && itemsRes.data) setItems(itemsRes.data);
    })()]);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-8">
        <div>
          <h1 className="text-xl font-bold">{getText('Calculadora de impacto', 'Impact calculator')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
            {getText(
              'Insumos -> recetas -> combos -> servir. Esto alimenta "comidas servidas este mes" y el costo promedio por plato en tu página pública.',
              'Items -> recipes -> combos -> serve. This feeds "meals served this month" and the average cost per plate on your public page.',
            )}
          </p>
        </div>

        {/* ── Métricas ── */}
        <div className="grid grid-cols-2 gap-3">
          <div className={cardClass + ' text-center'}>
            <p className="text-2xl font-bold">{metrics?.mealsServedThisMonth ?? 0}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-gray-500 dark:text-neutral-400">
              {getText('Comidas servidas este mes', 'Meals served this month')}
            </p>
          </div>
          <div className={cardClass + ' text-center'}>
            <p className="text-2xl font-bold">${(metrics?.mealsCostThisMonth ?? 0).toFixed(2)}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-gray-500 dark:text-neutral-400">
              {getText('Costo total este mes', 'Total cost this month')}
            </p>
          </div>
        </div>

        {/* ── Insumos ── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{getText('1. Insumos', '1. Items')}</h2>
            <button
              type="button"
              className={secondaryBtn}
              onClick={() => {
                setEditingItemId(null);
                setItemForm(emptyItemForm);
                setShowItemForm((v) => !v);
              }}
            >
              {showItemForm ? getText('Cancelar', 'Cancel') : getText('+ Agregar insumo', '+ Add item')}
            </button>
          </div>

          {showItemForm && (
            <div className={cardClass + ' space-y-2'}>
              <input className={inputClass} placeholder={getText('Nombre (ej. "Arroz")', 'Name (e.g. "Rice")')}
                value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <select className={inputClass} value={itemForm.unit} onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}>
                  {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <input className={inputClass} type="number" placeholder={getText('Cantidad disponible', 'Quantity on hand')}
                  value={itemForm.quantityOnHand} onChange={(e) => setItemForm({ ...itemForm, quantityOnHand: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className={inputClass} type="number" step="0.01" placeholder={getText('Costo por unidad ($)', 'Cost per unit ($)')}
                  value={itemForm.unitCost} onChange={(e) => setItemForm({ ...itemForm, unitCost: e.target.value })} />
                <input className={inputClass} type="number" placeholder={getText('Mínimo (alerta)', 'Low-stock threshold')}
                  value={itemForm.lowStockThreshold} onChange={(e) => setItemForm({ ...itemForm, lowStockThreshold: e.target.value })} />
              </div>
              <input className={inputClass} placeholder={getText('Fuente (ej. "donación", "compra", "jardín")', 'Source (e.g. "donation", "purchase", "garden")')}
                value={itemForm.source} onChange={(e) => setItemForm({ ...itemForm, source: e.target.value })} />
              <button type="button" className={primaryBtn} disabled={savingItem} onClick={saveItem}>
                {savingItem ? getText('Guardando...', 'Saving...') : getText('Guardar insumo', 'Save item')}
              </button>
            </div>
          )}

          <div className="space-y-2">
            {items.length === 0 && !showItemForm && (
              <p className="text-sm text-gray-500 dark:text-neutral-400">{getText('Aún no agregas insumos.', "You haven't added any items yet.")}</p>
            )}
            {items.map((item) => (
              <div key={item.id} className={cardClass + ' flex items-center justify-between'}>
                <div>
                  <p className="text-sm font-medium">
                    {item.name} {item.isLowStock && <span className="ml-1 text-xs text-amber-600">{getText('· stock bajo', '· low stock')}</span>}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    {item.quantityOnHand} {item.unit} · ${item.unitCost.toFixed(2)}/{item.unit}
                    {item.source ? ` · ${item.source}` : ''}
                  </p>
                </div>
                <div className="flex gap-2 text-xs">
                  <button type="button" className="text-gray-500 hover:underline" onClick={() => startEditItem(item)}>{getText('Editar', 'Edit')}</button>
                  <button type="button" className="text-red-600 hover:underline" onClick={() => deleteItem(item.id)}>{getText('Eliminar', 'Delete')}</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Recetas ── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{getText('2. Recetas', '2. Recipes')}</h2>
            <button type="button" className={secondaryBtn} onClick={() => setShowRecipeForm((v) => !v)}>
              {showRecipeForm ? getText('Cancelar', 'Cancel') : getText('+ Agregar receta', '+ Add recipe')}
            </button>
          </div>

          {showRecipeForm && (
            <div className={cardClass + ' space-y-2'}>
              <input className={inputClass} placeholder={getText('Nombre (ej. "Arroz con pollo")', 'Name (e.g. "Chicken and rice")')}
                value={recipeForm.name} onChange={(e) => setRecipeForm({ ...recipeForm, name: e.target.value })} />
              <input className={inputClass} type="number" placeholder={getText('Porciones que rinde', 'Servings it yields')}
                value={recipeForm.servings} onChange={(e) => setRecipeForm({ ...recipeForm, servings: e.target.value })} />
              <button type="button" className={primaryBtn} disabled={savingRecipe} onClick={createRecipe}>
                {savingRecipe ? getText('Guardando...', 'Saving...') : getText('Crear receta', 'Create recipe')}
              </button>
            </div>
          )}

          <div className="space-y-2">
            {recipes.length === 0 && !showRecipeForm && (
              <p className="text-sm text-gray-500 dark:text-neutral-400">{getText('Aún no agregas recetas.', "You haven't added any recipes yet.")}</p>
            )}
            {recipes.map((recipe) => {
              const expanded = expandedRecipeId === recipe.id;
              return (
                <div key={recipe.id} className={cardClass}>
                  <div className="flex items-center justify-between">
                    <button type="button" className="text-left" onClick={() => setExpandedRecipeId(expanded ? null : recipe.id)}>
                      <p className="text-sm font-medium">{recipe.name}</p>
                      <p className="text-xs text-gray-500 dark:text-neutral-400">
                        {recipe.servings} {getText('porciones', 'servings')} · ${recipe.costPerServing.toFixed(2)} {getText('por porción', 'per serving')}
                      </p>
                    </button>
                    <div className="flex gap-2 text-xs">
                      <button type="button" className="text-gray-500 hover:underline" onClick={() => setExpandedRecipeId(expanded ? null : recipe.id)}>
                        {expanded ? getText('Cerrar', 'Close') : getText('Insumos', 'Ingredients')}
                      </button>
                      <button type="button" className="text-red-600 hover:underline" onClick={() => deleteRecipe(recipe.id)}>{getText('Eliminar', 'Delete')}</button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-3 space-y-2 border-t border-gray-200/70 dark:border-neutral-800 pt-3">
                      {recipe.ingredients.length === 0 && (
                        <p className="text-xs text-gray-500 dark:text-neutral-400">{getText('Sin insumos todavía.', 'No ingredients yet.')}</p>
                      )}
                      {recipe.ingredients.map((ing) => (
                        <div key={ing.id} className="flex items-center justify-between text-xs">
                          <span>{ing.inventoryItemName} — {ing.quantityRequired} {ing.unit} (${ing.lineCost.toFixed(2)})</span>
                          <button type="button" className="text-red-600 hover:underline" onClick={() => removeIngredient(recipe.id, ing.id)}>
                            {getText('Quitar', 'Remove')}
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <select className={inputClass} value={ingredientDraft.inventoryItemId}
                          onChange={(e) => setIngredientDraft({ ...ingredientDraft, inventoryItemId: e.target.value })}>
                          <option value="">{getText('Elegir insumo...', 'Choose item...')}</option>
                          {items.map((it) => <option key={it.id} value={it.id}>{it.name}</option>)}
                        </select>
                        <input className={inputClass + ' max-w-[100px]'} type="number" step="0.01"
                          value={ingredientDraft.quantityRequired}
                          onChange={(e) => setIngredientDraft({ ...ingredientDraft, quantityRequired: e.target.value })} />
                        <button type="button" className={secondaryBtn} onClick={() => addIngredient(recipe.id)}>
                          {getText('Agregar', 'Add')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Combos ── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{getText('3. Combos y servir', '3. Combos & serve')}</h2>
            <button type="button" className={secondaryBtn} onClick={() => setShowComboForm((v) => !v)}>
              {showComboForm ? getText('Cancelar', 'Cancel') : getText('+ Agregar combo', '+ Add combo')}
            </button>
          </div>

          {showComboForm && (
            <div className={cardClass + ' space-y-2'}>
              <input className={inputClass} placeholder={getText('Nombre (ej. "Plato del día")', 'Name (e.g. "Plate of the day")')}
                value={comboForm.name} onChange={(e) => setComboForm({ ...comboForm, name: e.target.value })} />
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-neutral-400">{getText('Recetas que incluye:', 'Recipes it includes:')}</p>
                {recipes.length === 0 && (
                  <p className="text-xs text-amber-600">{getText('Crea al menos una receta primero.', 'Create at least one recipe first.')}</p>
                )}
                {recipes.map((r) => (
                  <label key={r.id} className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={comboForm.recipeIds.includes(r.id)} onChange={() => toggleComboRecipe(r.id)} />
                    {r.name} (${r.costPerServing.toFixed(2)})
                  </label>
                ))}
              </div>
              <button type="button" className={primaryBtn} disabled={savingCombo || comboForm.recipeIds.length === 0} onClick={createCombo}>
                {savingCombo ? getText('Guardando...', 'Saving...') : getText('Crear combo', 'Create combo')}
              </button>
            </div>
          )}

          <div className="space-y-2">
            {combos.length === 0 && !showComboForm && (
              <p className="text-sm text-gray-500 dark:text-neutral-400">{getText('Aún no agregas combos.', "You haven't added any combos yet.")}</p>
            )}
            {combos.map((combo) => (
              <div key={combo.id} className={cardClass}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{combo.name}</p>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">
                      {combo.recipeIds.map((id) => recipes.find((r) => r.id === id)?.name).filter(Boolean).join(', ')}
                      {' · '}${combo.costPerPlate.toFixed(2)} {getText('por plato', 'per plate')}
                    </p>
                  </div>
                  <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => deleteCombo(combo.id)}>
                    {getText('Eliminar', 'Delete')}
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2 border-t border-gray-200/70 dark:border-neutral-800 pt-3">
                  <input
                    className={inputClass + ' max-w-[90px]'}
                    type="number"
                    min={1}
                    value={serveQty[combo.id] ?? '1'}
                    onChange={(e) => setServeQty((prev) => ({ ...prev, [combo.id]: e.target.value }))}
                  />
                  <span className="text-xs text-gray-500 dark:text-neutral-400">{getText('platos servidos hoy', 'plates served today')}</span>
                  <button
                    type="button"
                    className={primaryBtn + ' ml-auto'}
                    disabled={servingComboId === combo.id || combo.costPerPlate <= 0}
                    onClick={() => serveCombo(combo)}
                    title={combo.costPerPlate <= 0 ? getText('Agrega recetas con costo primero', 'Add recipes with cost first') : undefined}
                  >
                    {servingComboId === combo.id ? getText('Registrando...', 'Logging...') : getText('Servir', 'Serve')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
