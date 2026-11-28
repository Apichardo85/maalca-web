'use client';

import { useEffect, useState } from 'react';

// Extras que MaalCa cobra aparte (Soporte 24/7, redes…). Cuentan en el MRR de /ops y Soporte 24/7 le da al
// negocio los puntos y el tiempo de respuesta del add-on en el helpdesk. Lo que se cobra en la suscripción de
// Stripe (pantallas) no se registra aquí. /ops es admin-only y en español.
interface AddOnItem {
  id: string;
  key: string;
  nameEs: string;
  quantity: number;
  monthlyUsd: number;
  totalMonthlyUsd: number;
  startedAt: string;
  endedAt: string | null;
  notes: string | null;
  createdBy: string | null;
  endedBy: string | null;
}

interface CatalogItem {
  id: string;
  key: string;
  nameEs: string;
  listUsd: number;
  suggestedUsd: number;
}

interface AddOnsData {
  items: AddOnItem[];
  catalog: CatalogItem[];
}

const fmt = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const date = (s: string) => new Date(s).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });

export function AddOnsControl({ affiliateId }: { affiliateId: string }) {
  const [data, setData] = useState<AddOnsData | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [addOnId, setAddOnId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [showEnded, setShowEnded] = useState(false);

  async function load() {
    try {
      const res = await fetch(`/api/ops/affiliates/${affiliateId}/addons`, { cache: 'no-store' });
      if (!res.ok) return;
      setData(await res.json());
    } catch { /* sin datos: no se muestra */ }
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [affiliateId]);

  async function call(path: string, body?: unknown) {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/ops/affiliates/${affiliateId}/addons${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body ?? {}),
      });
      const d = await res.json().catch(() => null);
      if (!res.ok) throw new Error(d?.error?.message ?? 'No se pudo guardar.');
      setData(d);
      return true;
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Algo salió mal.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  function pick(id: string) {
    setAddOnId(id);
    const c = data?.catalog.find((x) => x.id === id);
    setPrice(c ? String(c.suggestedUsd) : '');
  }

  async function add() {
    const monthlyUsd = Number(price);
    if (!addOnId || !Number.isFinite(monthlyUsd) || monthlyUsd < 0) {
      setErr('Elige el extra y pon el precio mensual pactado.');
      return;
    }
    const ok = await call('', { platformAddOnId: addOnId, quantity, monthlyUsd, notes: notes.trim() || null });
    if (ok) {
      setAddOnId('');
      setQuantity(1);
      setPrice('');
      setNotes('');
    }
  }

  async function end(item: AddOnItem) {
    if (!window.confirm(`¿Terminar "${item.nameEs}"? Deja de contar en el MRR${item.key === 'support-247' ? ' y el negocio pierde el add-on de soporte' : ''}.`)) return;
    await call(`/${item.id}/end`);
  }

  if (!data) return null;
  const active = data.items.filter((i) => !i.endedAt);
  const ended = data.items.filter((i) => i.endedAt);
  const activeIds = new Set(active.map((i) => i.key));
  const available = data.catalog.filter((c) => !activeIds.has(c.key));
  const total = active.reduce((s, i) => s + i.totalMonthlyUsd, 0);
  const selected = data.catalog.find((c) => c.id === addOnId);

  return (
    <div className="mt-8">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Extras contratados</h3>
        {active.length > 0 && <span className="text-xs text-gray-500 dark:text-neutral-400">{fmt(total)}/mes</span>}
      </div>
      <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
        Lo que MaalCa cobra aparte del plan. Cuenta en el MRR. &quot;Soporte 24/7&quot; le da al negocio los puntos y el
        tiempo de respuesta del add-on de soporte. Las pantallas se cobran en la suscripción de Stripe y no van aquí.
      </p>

      <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        {active.length === 0 ? (
          <p className="px-4 py-4 text-xs text-gray-400 dark:text-neutral-500">Sin extras activos.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-neutral-800">
            {active.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
                <span className="font-medium text-gray-900 dark:text-white">{i.nameEs}</span>
                <span className="text-gray-600 dark:text-neutral-300">
                  {i.quantity > 1 ? `${i.quantity} × ${fmt(i.monthlyUsd)} = ` : ''}{fmt(i.totalMonthlyUsd)}/mes
                </span>
                <span className="text-xs text-gray-400 dark:text-neutral-500">desde {date(i.startedAt)}{i.createdBy ? ` · ${i.createdBy}` : ''}</span>
                {i.notes && <span className="w-full text-xs text-gray-500 dark:text-neutral-400">{i.notes}</span>}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => end(i)}
                  className="ml-auto rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1 text-xs text-gray-600 dark:text-neutral-300 hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                >
                  Terminar
                </button>
              </li>
            ))}
          </ul>
        )}

        {available.length > 0 && (
          <div className="flex flex-wrap items-end gap-2 border-t border-gray-100 dark:border-neutral-800 px-4 py-3 text-xs">
            <label className="flex flex-col gap-1 text-gray-600 dark:text-neutral-300">
              Extra
              <select
                value={addOnId}
                disabled={busy}
                onChange={(e) => pick(e.target.value)}
                className="rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5"
              >
                <option value="">Elegir…</option>
                {available.map((c) => (
                  <option key={c.id} value={c.id}>{c.nameEs} · {fmt(c.suggestedUsd)}/mes</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-gray-600 dark:text-neutral-300">
              Cantidad
              <input
                type="number" min={1} max={50} value={quantity} disabled={busy}
                onChange={(e) => setQuantity(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-16 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5"
              />
            </label>
            <label className="flex flex-col gap-1 text-gray-600 dark:text-neutral-300">
              Precio pactado / mes
              <input
                type="number" min={0} step="0.01" value={price} disabled={busy}
                onChange={(e) => setPrice(e.target.value)}
                className="w-24 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5"
              />
            </label>
            <label className="flex min-w-40 flex-1 flex-col gap-1 text-gray-600 dark:text-neutral-300">
              Nota (opcional)
              <input
                value={notes} maxLength={500} disabled={busy}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. pago anual por transferencia"
                className="rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5"
              />
            </label>
            <button
              type="button"
              disabled={busy || !addOnId}
              onClick={add}
              className="rounded-full bg-brand-primary px-4 py-1.5 font-medium text-white hover:bg-brand-primary-hover disabled:opacity-50"
            >
              Contratar
            </button>
            {selected && selected.suggestedUsd !== selected.listUsd && (
              <span className="w-full text-gray-400 dark:text-neutral-500">
                Lista {fmt(selected.listUsd)}; sugerido con el nivel del país del negocio.
              </span>
            )}
          </div>
        )}
        {err && <p className="border-t border-gray-100 dark:border-neutral-800 px-4 py-2 text-xs text-red-500">{err}</p>}
      </div>

      {ended.length > 0 && (
        <div className="mt-2">
          <button type="button" onClick={() => setShowEnded(!showEnded)} className="text-xs text-gray-500 dark:text-neutral-400 hover:underline">
            {showEnded ? 'Ocultar terminados' : `Ver terminados (${ended.length})`}
          </button>
          {showEnded && (
            <ul className="mt-1 space-y-1 text-xs text-gray-500 dark:text-neutral-400">
              {ended.map((i) => (
                <li key={i.id}>
                  {i.nameEs} · {fmt(i.totalMonthlyUsd)}/mes · {date(i.startedAt)} → {date(i.endedAt!)}{i.endedBy ? ` · ${i.endedBy}` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
