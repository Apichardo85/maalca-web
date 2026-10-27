'use client';

import { useCallback, useEffect, useState } from 'react';
import { useOpsCanManage } from '../OpsRoleContext';

// Extras de MaalCa (PlatformAddOns en maalca-api). /servicios los lee del API, así que un
// cambio aquí llega a la página pública en máx. ~10 min (cache del API + revalidación de la web),
// sin desplegar. Solo Owner edita; Support solo mira.

type Unit = 'OneTime' | 'Monthly' | 'PerLocationMonthly' | 'Block5h';

interface AddOn {
  id: string;
  key: string;
  nameEs: string;
  nameEn: string;
  descEs: string;
  descEn: string;
  price: number;
  volumePrice: number | null;
  volumeFromQty: number | null;
  unit: Unit;
  sortOrder: number;
  active: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
}

type Draft = Omit<AddOn, 'id' | 'updatedAt' | 'updatedBy'>;

const UNIT_LABEL: Record<Unit, string> = {
  OneTime: 'Pago único',
  Monthly: 'Por mes',
  PerLocationMonthly: 'Por local, por mes',
  Block5h: 'Bloque de 5 h',
};

const EMPTY: Draft = {
  key: '',
  nameEs: '',
  nameEn: '',
  descEs: '',
  descEn: '',
  price: 0,
  volumePrice: null,
  volumeFromQty: null,
  unit: 'Monthly',
  sortOrder: 99,
  active: true,
};

const input =
  'w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm';
const label = 'text-xs font-medium text-gray-500 dark:text-neutral-400';

export default function OpsPreciosPage() {
  const canManage = useOpsCanManage();
  const [items, setItems] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null); // '__new' = alta
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ops/platform-addons', { cache: 'no-store' });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudieron cargar los extras.');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(item: AddOn) {
    const { id: _id, updatedAt: _u, updatedBy: _b, ...rest } = item;
    setDraft(rest);
    setEditingKey(item.key);
    setSavedAt(null);
  }

  function startNew() {
    setDraft(EMPTY);
    setEditingKey('__new');
    setSavedAt(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const isNew = editingKey === '__new';
      const body = {
        ...draft,
        price: Number(draft.price),
        volumePrice: draft.volumePrice === null || String(draft.volumePrice) === '' ? null : Number(draft.volumePrice),
        volumeFromQty:
          draft.volumeFromQty === null || String(draft.volumeFromQty) === '' ? null : Number(draft.volumeFromQty),
        sortOrder: Number(draft.sortOrder),
      };
      const res = await fetch(isNew ? '/api/ops/platform-addons' : `/api/ops/platform-addons/${editingKey}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudo guardar.');
      setEditingKey(null);
      setSavedAt(new Date().toLocaleTimeString());
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
    } finally {
      setSaving(false);
    }
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Precios</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
            Extras que se muestran en /servicios. Los cambios aparecen ahí en unos 10 minutos, sin desplegar.
          </p>
        </div>
        {canManage && (
          <button
            onClick={startNew}
            className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Nuevo extra
          </button>
        )}
      </div>

      {savedAt && (
        <p className="mb-3 rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-2 text-sm text-green-700 dark:text-green-400">
          Guardado a las {savedAt}.
        </p>
      )}
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <p className="mb-3 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 text-xs text-yellow-800 dark:text-yellow-300">
        La pantalla extra se cobra con su precio escalonado en Stripe. Si cambias su monto aquí, cámbialo también en
        Stripe.
      </p>

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-neutral-400">Cargando…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-neutral-800 text-left text-xs text-gray-500 dark:text-neutral-400">
                <th className="px-4 py-3 font-medium">Orden</th>
                <th className="px-4 py-3 font-medium">Extra</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Volumen</th>
                <th className="px-4 py-3 font-medium">Unidad</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.key} className="border-b border-gray-100 dark:border-neutral-800 last:border-0">
                  <td className="px-4 py-3 text-gray-500 dark:text-neutral-400">{item.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{item.nameEs}</div>
                    <code className="text-[11px] text-gray-400 dark:text-neutral-500">{item.key}</code>
                  </td>
                  <td className="px-4 py-3 font-semibold">${item.price}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-neutral-300">
                    {item.volumePrice !== null && item.volumeFromQty !== null
                      ? `$${item.volumePrice} desde la ${item.volumeFromQty}.ª`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-neutral-300">{UNIT_LABEL[item.unit] ?? item.unit}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.active
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}
                    >
                      {item.active ? 'Visible' : 'Oculto'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canManage && (
                      <button
                        onClick={() => startEdit(item)}
                        className="text-sm font-semibold text-brand-primary"
                      >
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500 dark:text-neutral-400">
                    No hay extras todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingKey && (
        <div className="mt-6 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
          <h3 className="text-base font-bold">
            {editingKey === '__new' ? 'Nuevo extra' : `Editar · ${draft.nameEs || editingKey}`}
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {editingKey === '__new' && (
              <label className="flex flex-col gap-1">
                <span className={label}>Key (minúsculas y guiones, ej. screen-kit)</span>
                <input className={input} value={draft.key} onChange={(e) => set('key', e.target.value)} />
              </label>
            )}
            <label className="flex flex-col gap-1">
              <span className={label}>Nombre (ES)</span>
              <input className={input} value={draft.nameEs} onChange={(e) => set('nameEs', e.target.value)} />
            </label>
            <label className="flex flex-col gap-1">
              <span className={label}>Nombre (EN)</span>
              <input className={input} value={draft.nameEn} onChange={(e) => set('nameEn', e.target.value)} />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className={label}>Descripción (ES)</span>
              <textarea rows={2} className={input} value={draft.descEs} onChange={(e) => set('descEs', e.target.value)} />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className={label}>Descripción (EN)</span>
              <textarea rows={2} className={input} value={draft.descEn} onChange={(e) => set('descEn', e.target.value)} />
            </label>
            <label className="flex flex-col gap-1">
              <span className={label}>Precio (USD)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                className={input}
                value={draft.price}
                onChange={(e) => set('price', e.target.value as unknown as number)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={label}>Unidad</span>
              <select className={input} value={draft.unit} onChange={(e) => set('unit', e.target.value as Unit)}>
                {(Object.keys(UNIT_LABEL) as Unit[]).map((u) => (
                  <option key={u} value={u}>
                    {UNIT_LABEL[u]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={label}>Precio por volumen (opcional)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                className={input}
                value={draft.volumePrice ?? ''}
                onChange={(e) => set('volumePrice', (e.target.value === '' ? null : e.target.value) as number | null)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={label}>…desde la unidad número</span>
              <input
                type="number"
                min={2}
                className={input}
                value={draft.volumeFromQty ?? ''}
                onChange={(e) => set('volumeFromQty', (e.target.value === '' ? null : e.target.value) as number | null)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={label}>Orden en la página</span>
              <input
                type="number"
                className={input}
                value={draft.sortOrder}
                onChange={(e) => set('sortOrder', e.target.value as unknown as number)}
              />
            </label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <input type="checkbox" checked={draft.active} onChange={(e) => set('active', e.target.checked)} />
              Visible en /servicios
            </label>
          </div>
          <div className="mt-5 flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              onClick={() => setEditingKey(null)}
              disabled={saving}
              className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
