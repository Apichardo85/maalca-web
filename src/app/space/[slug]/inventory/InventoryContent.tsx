'use client';

import { useRef, useState } from 'react';
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
  unit: string;
  status: string;
}

interface InventoryMovementRow {
  id: string;
  type: 'in' | 'out';
  quantity: number;
  notes?: string | null;
  createdAt: string;
}

interface LowStockItem {
  id: string;
  name: string;
  quantity: number;
  minStock: number;
  unit: string;
}

interface InventorySummary {
  totalValue: number;
  totalItems: number;
  lowStockCount: number;
  lowStockItems: LowStockItem[];
}

interface Props {
  slug: string;
  affiliateId: string;
  initialItems: InventoryItemRow[];
  initialTotal?: number;
  initialTotalPages?: number;
  initialSummary?: InventorySummary | null;
}

const UNIT_OPTIONS = ['unidad', 'kg', 'lb', 'g', 'litro', 'ml', 'caja', 'paquete', 'docena'];

const emptyForm = { name: '', category: '', quantity: '0', minStock: '0', unitPrice: '0', unit: 'unidad' };

export function InventoryContent({ slug, initialItems, initialTotal, initialTotalPages, initialSummary }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<InventoryItemRow[]>(initialItems);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages ?? 1);
  const [total, setTotal] = useState(initialTotal ?? initialItems.length);
  const [loadingPage, setLoadingPage] = useState(false);
  const [summary, setSummary] = useState<InventorySummary | null>(initialSummary ?? null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [movementFor, setMovementFor] = useState<InventoryItemRow | null>(null);
  const [movementType, setMovementType] = useState<'in' | 'out'>('in');
  const [movementQty, setMovementQty] = useState('1');
  const [movementNotes, setMovementNotes] = useState('');
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [historyFor, setHistoryFor] = useState<InventoryItemRow | null>(null);
  const [historyRows, setHistoryRows] = useState<InventoryMovementRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  async function fetchSummary() {
    try {
      const res = await fetch(`/api/space/${slug}/inventory/summary`, { cache: 'no-store' });
      if (res.ok) setSummary(await res.json());
    } catch {
      // silencioso — la tarjeta de resumen simplemente no se actualiza.
    }
  }

  async function refetch(targetPage = page) {
    setLoadingPage(true);
    try {
      const res = await fetch(`/api/space/${slug}/inventory?page=${targetPage}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setItems(data?.data ?? []);
        setTotal(data?.total ?? 0);
        setTotalPages(data?.totalPages ?? 1);
        setPage(targetPage);
      }
    } finally {
      setLoadingPage(false);
    }
    fetchSummary();
  }

  function startEdit(item: InventoryItemRow) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category ?? '',
      quantity: String(item.quantity),
      minStock: String(item.minStock),
      unitPrice: String(item.unitPrice),
      unit: item.unit || 'unidad',
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
      unit: form.unit,
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
      await refetch(editingId ? page : 1);
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
      if (res.status === 409) {
        const data = await res.json().catch(() => null);
        const message = data?.error?.message;
        toast.error(
          message ??
            getText(
              'No se puede eliminar: está en la receta de un plato. Quítalo de esa receta primero.',
              "Can't delete: it's used in a dish recipe. Remove it from that recipe first.",
            ),
        );
        return;
      }
      if (!res.ok) throw new Error('delete failed');
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success(getText('Item eliminado.', 'Item deleted.'));
      fetchSummary();
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
      await refetch(page);
    } catch {
      toast.error(getText('No se pudo registrar el movimiento.', "Couldn't record the movement."));
    } finally {
      setSaving(false);
    }
  }

  async function openHistory(item: InventoryItemRow) {
    setHistoryFor(item);
    setHistoryLoading(true);
    setHistoryRows([]);
    try {
      const res = await fetch(`/api/space/${slug}/inventory/${item.id}/movements`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setHistoryRows(data?.data ?? []);
      }
    } finally {
      setHistoryLoading(false);
    }
  }

  function handleExport() {
    window.location.href = `/api/space/${slug}/inventory/export`;
  }

  function triggerImport() {
    fileInputRef.current?.click();
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImporting(true);
    try {
      const csvContent = await file.text();
      const res = await fetch(`/api/space/${slug}/inventory/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent }),
      });
      if (!res.ok) throw new Error('import failed');
      const result = await res.json();
      const created = result?.created ?? 0;
      const errorCount = result?.errorCount ?? 0;
      if (created > 0) {
        toast.success(
          errorCount > 0
            ? getText(`${created} items importados, ${errorCount} con error.`, `${created} items imported, ${errorCount} with errors.`)
            : getText(`${created} items importados.`, `${created} items imported.`),
        );
      } else {
        toast.error(getText('No se importó ningún item. Revisa el formato del CSV.', "No items were imported. Check the CSV format."));
      }
      await refetch(1);
    } catch {
      toast.error(getText('No se pudo importar el archivo.', "Couldn't import the file."));
    } finally {
      setImporting(false);
    }
  }

  const lowStockCount = summary?.lowStockCount ?? items.filter((i) => i.quantity <= i.minStock).length;
  const totalValue = summary?.totalValue;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImportFile} />
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
                : getText(`${total} items`, `${total} items`)}
              {typeof totalValue === 'number' && (
                <> · {getText('valor total', 'total value')}: ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
              )}
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

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-3 text-xs font-semibold text-gray-600 dark:text-neutral-300"
          >
            {getText('Exportar CSV', 'Export CSV')}
          </button>
          <button
            type="button"
            onClick={triggerImport}
            disabled={importing}
            className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-3 text-xs font-semibold text-gray-600 dark:text-neutral-300 disabled:opacity-40"
          >
            {importing ? getText('Importando…', 'Importing…') : getText('Importar CSV', 'Import CSV')}
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                <label className="text-xs text-gray-500 dark:text-neutral-400">{getText('Unidad', 'Unit')}</label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  className="mt-1 w-full min-h-11 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold">{item.name}</p>
                      {lowStock && (
                        <span className="shrink-0 rounded-full bg-amber-100 dark:bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                          {getText('Stock bajo', 'Low stock')}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
                      {[
                        item.category,
                        getText(
                          `${item.quantity} ${item.unit || 'unidad'} en stock (mín. ${item.minStock})`,
                          `${item.quantity} ${item.unit || 'unit'} in stock (min ${item.minStock})`,
                        ),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:shrink-0">
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
                      onClick={() => openHistory(item)}
                      className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-2.5 text-xs font-semibold text-gray-600 dark:text-neutral-300"
                    >
                      {getText('Historial', 'History')}
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

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => refetch(page - 1)}
              disabled={page <= 1 || loadingPage}
              className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-4 text-xs font-semibold text-gray-600 dark:text-neutral-300 disabled:opacity-40"
            >
              {getText('Anterior', 'Previous')}
            </button>
            <p className="text-xs text-gray-500 dark:text-neutral-400">
              {getText(`Página ${page} de ${totalPages}`, `Page ${page} of ${totalPages}`)}
            </p>
            <button
              type="button"
              onClick={() => refetch(page + 1)}
              disabled={page >= totalPages || loadingPage}
              className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-4 text-xs font-semibold text-gray-600 dark:text-neutral-300 disabled:opacity-40"
            >
              {getText('Siguiente', 'Next')}
            </button>
          </div>
        )}
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

      {historyFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setHistoryFor(null)}>
          <div
            className="max-h-[80vh] w-full max-w-md space-y-3 overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold">{getText('Historial de movimientos', 'Movement history')}</h2>
              <button type="button" onClick={() => setHistoryFor(null)} className="text-sm text-gray-400">
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-neutral-400">{historyFor.name}</p>
            {historyLoading ? (
              <p className="text-sm text-gray-400 dark:text-neutral-500">{getText('Cargando…', 'Loading…')}</p>
            ) : historyRows.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-neutral-500">
                {getText('Sin movimientos registrados todavía.', 'No movements recorded yet.')}
              </p>
            ) : (
              <div className="space-y-2">
                {historyRows.map((m) => (
                  <div key={m.id} className="flex items-start justify-between gap-3 rounded-lg border border-gray-200/70 dark:border-neutral-800 px-3 py-2 text-xs">
                    <div className="min-w-0">
                      <p className={m.type === 'in' ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'font-semibold text-red-600 dark:text-red-400'}>
                        {m.type === 'in' ? getText('+ Entrada', '+ In') : getText('− Salida', '− Out')} · {m.quantity}
                      </p>
                      {m.notes && <p className="mt-0.5 truncate text-gray-500 dark:text-neutral-400">{m.notes}</p>}
                    </div>
                    <p className="shrink-0 text-gray-400 dark:text-neutral-500">
                      {new Date(m.createdAt).toLocaleDateString(language === 'es' ? 'es-DO' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
