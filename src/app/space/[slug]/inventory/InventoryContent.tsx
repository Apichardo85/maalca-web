'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';

export interface InventoryItemRow {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  quantity: number;
  minStock: number;
  unitPrice: number;
  status: string;
}

interface Props {
  slug: string;
  affiliateId: string;
  initialItems: InventoryItemRow[];
}

const emptyForm = { name: '', category: '', quantity: '0', minStock: '0', unitPrice: '0' };

export function InventoryContent({ slug, initialItems }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();

  const [items, setItems] = useState<InventoryItemRow[]>(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [movementFor, setMovementFor] = useState<InventoryItemRow | null>(null);
  const [movementType, setMovementType] = useState<'in' | 'out'>('in');
  const [movementQty, setMovementQty] = useState('1');
  const [movementNotes, setMovementNotes] = useState('');
  const [actingOn, setActingOn] = useState<string | null>(null);

  async function refetch() {
    const res = await fetch(`/api/space/${slug}/inventory`, { cache: 'no-store' });
    if (res.ok) {
      const page = await res.json();
      setItems(page?.data ?? []);
    }
  }

  function startEdit(item: InventoryItemRow) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category ?? '',
      quantity: String(item.quantity),
      minStock: String(item.minStock),
      unitPrice: String(item.unitPrice),
    });
    setShowForm(true);
  }

  function startNew() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm((v) => !v);
  }

  async function handleSave() {
    if (!form.name.trim() || saving) return;
    setSaving(true);
    const body = {
      name: form.name.trim(),
      category: form.category.trim() || null,
      quantity: Number(form.quantity) || 0,
      minStock: Number(form.minStock) || 0,
      unitPrice: Number(form.unitPrice) || 0,
      status: 'Active',
    };
    try {
      const res = await fetch(
        editingId ? `/api/space/${slug}/inventory/${editingId}` : `/api/space/${slug}/inventory`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) throw new Error('save failed');
      toast.success(editingId ? getText('Item actualizado.', 'Item updated.') : getText('Item agregado.', 'Item added.'));
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await refetch();
    } catch {
      toast.error(getText('No se pudo guardar. Intenta de nuevo.', "Couldn't save. Try again."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (actingOn) return;
    if (!confirm(getText('¿Eliminar este item del inventario?', 'Delete this inventory item?'))) return;
    setActingOn(id);
    try {
      const res = await fetch(`/api/space/${slug}/inventory/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete failed');
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success(getText('Item eliminado.', 'Item deleted.'));
    } catch {
      toast.error(getText('No se pudo eliminar. Intenta de nuevo.', "Couldn't delete. Try again."));
    } finally {
      setActingOn(null);
    }
  }

  function openMovement(item: InventoryItemRow, type: 'in' | 'out') {
    setMovementFor(item);
    setMovementType(type);
    setMovementQty('1');
    setMovementNotes('');
  }

  async function handleMovement() {
    if (!movementFor || saving) return;
    const qty = Number(movementQty);
    if (!qty || qty <= 0) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/space/${slug}/inventory/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryItemId: movementFor.id,
          type: movementType,
          quantity: qty,
          notes: movementNotes.trim() || null,
        }),
      });
      if (!res.ok) throw new Error('movement failed');
      toast.success(
        movementType === 'in'
          ? getText('Entrada registrada.', 'Stock in recorded.')
          : getText('Salida registrada.', 'Stock out recorded.'),
      );
      setMovementFor(null);
      await refetch();
    } catch {
      toast.error(getText('No se pudo registrar el movimiento.', "Couldn't record the movement."));
    } finally {
      setSaving(false);
    }
  }

  const lowStockCount = items.filter((i) => i.quantity <= i.minStock).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
              {getText('Tu espacio', 'Your space')}
            </p>
            <h1 className="mt-1 text-2xl font-bold">{getText('Inventario', 'Inventory')}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
              {lowStockCount > 0
                ? getText(`${lowStockCount} item(s) con stock bajo`, `${lowStockCount} item(s) low on stock`)
                : getText(`${items.length} items`, `${items.length} items`)}
            </p>
          </div>
          <button
            type="button"
            onClick={startNew}
            className="shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--brand-primary, #C8102E)' }}
          >
            {showForm && !editingId ? getText('Cancelar', 'Cancel') : getText('+ Agregar', '+ Add')}
          </button>
        </div>

        {showForm && (
          <div className="mt-4 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-3">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={getText('Nombre del insumo', 'Supply name')}
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
            <input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder={getText('Categoría (opcional)', 'Category (optional)')}
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-neutral-400">{getText('Cantidad', 'Quantity')}</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-neutral-400">{getText('Mínimo', 'Min stock')}</label>
                <input
                  type="number"
                  value={form.minStock}
                  onChange={(e) => setForm((f) => ({ ...f, minStock: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-neutral-400">{getText('Costo unit.', 'Unit cost')}</label>
                <input
                  type="number"
                  value={form.unitPrice}
                  onChange={(e) => setForm((f) => ({ ...f, unitPrice: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={!form.name.trim() || saving}
              className="w-full rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              style={{ backgroundColor: 'var(--brand-primary, #C8102E)' }}
            >
              {saving
                ? getText('Guardando…', 'Saving…')
                : editingId
                  ? getText('Guardar cambios', 'Save changes')
                  : getText('Agregar al inventario', 'Add to inventory')}
            </button>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-neutral-500">
              {getText('Todavía no hay items en el inventario.', 'No inventory items yet.')}
            </p>
          )}
          {items.map((item) => {
            const lowStock = item.quantity <= item.minStock;
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{item.name}</p>
                      {lowStock && (
                        <span className="shrink-0 rounded-full bg-amber-100 dark:bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                          {getText('Stock bajo', 'Low stock')}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
                      {[item.category, getText(`${item.quantity} en stock (mín. ${item.minStock})`, `${item.quantity} in stock (min ${item.minStock})`)]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openMovement(item, 'in')}
                      className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-2.5 text-xs font-semibold text-gray-600 dark:text-neutral-300"
                    >
                      {getText('+ Entrada', '+ In')}
                    </button>
                    <button
                      type="button"
                      onClick={() => openMovement(item, 'out')}
                      className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-2.5 text-xs font-semibold text-gray-600 dark:text-neutral-300"
                    >
                      {getText('− Salida', '− Out')}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-2.5 text-xs font-semibold text-gray-600 dark:text-neutral-300"
                    >
                      {getText('Editar', 'Edit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={actingOn === item.id}
                      className="flex min-h-11 items-center justify-center rounded-full border border-red-200 dark:border-red-900/50 px-2.5 text-xs font-semibold text-red-600 dark:text-red-400 disabled:opacity-40"
                    >
                      {getText('Eliminar', 'Delete')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {movementFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setMovementFor(null)}>
          <div
            className="max-h-[90vh] w-full max-w-sm space-y-3 overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold">
              {movementType === 'in'
                ? getText('Registrar entrada', 'Record stock in')
                : getText('Registrar salida', 'Record stock out')}
            </h2>
            <p className="text-xs text-gray-500 dark:text-neutral-400">{movementFor.name}</p>
            <div>
              <label className="text-xs text-gray-500 dark:text-neutral-400">{getText('Cantidad', 'Quantity')}</label>
              <input
                type="number"
                min={1}
                value={movementQty}
                onChange={(e) => setMovementQty(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <input
              value={movementNotes}
              onChange={(e) => setMovementNotes(e.target.value)}
              placeholder={getText('Nota (opcional)', 'Note (optional)')}
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setMovementFor(null)}
                className="flex-1 rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-neutral-300"
              >
                {getText('Cancelar', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleMovement}
                disabled={saving || !Number(movementQty)}
                className="flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                style={{ backgroundColor: 'var(--brand-primary, #C8102E)' }}
              >
                {saving ? getText('Guardando…', 'Saving…') : getText('Confirmar', 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
