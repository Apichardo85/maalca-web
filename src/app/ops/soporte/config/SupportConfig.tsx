'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useOpsCanManage } from '../../OpsRoleContext';
import { IMPACT_LABELS, IMPACT_STYLES, PLAN_LABELS, apiErrorMessage, type ImpactLevel, type SupportCatalog, type SupportQuota, type SupportRequestType } from '@/lib/support/types';

type TypeDraft = Omit<SupportRequestType, 'id'> & { id?: string };

const EMPTY_TYPE: TypeDraft = { key: '', nameEs: '', nameEn: '', descEs: '', descEn: '', weight: 1, isQuote: false, sortOrder: 100, active: true, impactLevel: 'green', estimatedTokens: 0 };

/** Tipos de solicitud (peso en puntos) y topes mensuales por plan. Solo el Owner guarda; Support solo ve. */
export function SupportConfig() {
  const isOwner = useOpsCanManage();
  const [catalog, setCatalog] = useState<SupportCatalog | null>(null);
  const [quotas, setQuotas] = useState<SupportQuota[]>([]);
  const [editing, setEditing] = useState<TypeDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function load() {
    const res = await fetch('/api/ops/support/catalog', { cache: 'no-store' });
    const data = await res.json().catch(() => null);
    if (!res.ok) { setMsg({ ok: false, text: apiErrorMessage(data, 'No se pudo cargar.') }); return; }
    setCatalog(data);
    setQuotas(data.quotas);
  }

  useEffect(() => { load(); }, []);

  async function saveQuotas() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/ops/support/quotas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotas }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(apiErrorMessage(data, 'No se pudo guardar.'));
      setQuotas(data);
      setMsg({ ok: true, text: 'Topes guardados.' });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'No se pudo guardar.' });
    } finally {
      setBusy(false);
    }
  }

  async function saveType(draft: TypeDraft) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/ops/support/types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(apiErrorMessage(data, 'No se pudo guardar.'));
      setEditing(null);
      setMsg({ ok: true, text: `Tipo "${data.nameEs}" guardado.` });
      await load();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'No se pudo guardar.' });
    } finally {
      setBusy(false);
    }
  }

  const card = 'rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900';
  const field = 'rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100';

  return (
    <div className="space-y-5">
      <div>
        <Link href="/ops/soporte" className="text-sm text-gray-500 hover:text-gray-800 dark:text-neutral-400">← Bandeja</Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-neutral-100">Tipos de solicitud y topes</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          Cada solicitud consume los puntos de su tipo. Pasar el tope no bloquea: entra con prioridad baja y sin tiempo garantizado.
          {!isOwner && ' Solo el Owner puede cambiar esto.'}
        </p>
      </div>

      {msg && <p className={`text-sm ${msg.ok ? 'text-green-700 dark:text-green-400' : 'text-red-600'}`}>{msg.text}</p>}
      {!catalog && !msg && <p className="text-sm text-gray-500">Cargando…</p>}

      {catalog && (
        <>
          <section className={card}>
            <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-neutral-100">Topes mensuales</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-neutral-400">
                    <th className="py-1 pr-3 font-medium">Plan</th>
                    <th className="py-1 pr-3 font-medium">Puntos al mes</th>
                    <th className="py-1 font-medium">Respuesta (horas)</th>
                  </tr>
                </thead>
                <tbody>
                  {quotas.map((q, i) => (
                    <tr key={q.key} className="border-t border-gray-100 dark:border-neutral-800">
                      <td className="py-2 pr-3 text-gray-900 dark:text-neutral-100">
                        {PLAN_LABELS[q.key]}
                        {q.key === 'addon' && <span className="block text-[11px] text-gray-500">Suma puntos al plan y reemplaza el tiempo de respuesta</span>}
                      </td>
                      <td className="py-2 pr-3">
                        <input type="number" min={0} max={1000} disabled={!isOwner} className={`${field} w-24`} value={q.monthlyPoints}
                          onChange={(e) => setQuotas(quotas.map((x, j) => (j === i ? { ...x, monthlyPoints: Number(e.target.value) } : x)))} />
                      </td>
                      <td className="py-2">
                        <input type="number" min={1} max={720} disabled={!isOwner} className={`${field} w-24`} value={q.responseHours}
                          onChange={(e) => setQuotas(quotas.map((x, j) => (j === i ? { ...x, responseHours: Number(e.target.value) } : x)))} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {isOwner && (
              <button type="button" disabled={busy} onClick={saveQuotas} className="mt-3 rounded-full bg-brand-primary px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50">
                Guardar topes
              </button>
            )}
            <p className="mt-2 text-[11px] text-gray-500 dark:text-neutral-400">El add-on se activa al contratarle &quot;Soporte 24/7&quot; al negocio en Negocios → detalle → Extras contratados (precio en /ops/precios). Un negocio corporativo ya lo trae.</p>
          </section>

          <section className={card}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">Tipos de solicitud</h2>
              {isOwner && (
                <button type="button" onClick={() => setEditing({ ...EMPTY_TYPE })} className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 dark:border-neutral-700 dark:text-neutral-300">
                  + Nuevo tipo
                </button>
              )}
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-neutral-800">
              {catalog.types.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${t.active ? 'text-gray-900 dark:text-neutral-100' : 'text-gray-400 line-through'}`}>{t.nameEs}</p>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">{t.key} · {t.nameEn}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${IMPACT_STYLES[t.impactLevel ?? 'green']}`}>{IMPACT_LABELS[t.impactLevel ?? 'green'].es}</span>
                    <span className="text-sm text-gray-700 dark:text-neutral-300">{t.isQuote ? 'Cotizar' : `${t.weight} pts`}</span>
                    {isOwner && (
                      <button type="button" onClick={() => setEditing({ ...t })} className="text-xs font-medium text-brand-primary hover:underline">Editar</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => { e.preventDefault(); saveType(editing); }}
            className="w-full max-w-lg space-y-3 rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-900"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">{editing.id ? 'Editar tipo' : 'Nuevo tipo'}</h2>
            <label className="block text-xs text-gray-600 dark:text-neutral-300">
              Clave (no cambia después)
              <input className={`${field} mt-1 w-full`} value={editing.key} disabled={!!editing.id} onChange={(e) => setEditing({ ...editing, key: e.target.value })} required />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-gray-600 dark:text-neutral-300">Nombre (ES)<input className={`${field} mt-1 w-full`} value={editing.nameEs} onChange={(e) => setEditing({ ...editing, nameEs: e.target.value })} required /></label>
              <label className="text-xs text-gray-600 dark:text-neutral-300">Name (EN)<input className={`${field} mt-1 w-full`} value={editing.nameEn} onChange={(e) => setEditing({ ...editing, nameEn: e.target.value })} required /></label>
              <label className="text-xs text-gray-600 dark:text-neutral-300">Descripción (ES)<input className={`${field} mt-1 w-full`} value={editing.descEs ?? ''} onChange={(e) => setEditing({ ...editing, descEs: e.target.value })} /></label>
              <label className="text-xs text-gray-600 dark:text-neutral-300">Description (EN)<input className={`${field} mt-1 w-full`} value={editing.descEn ?? ''} onChange={(e) => setEditing({ ...editing, descEn: e.target.value })} /></label>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="text-xs text-gray-600 dark:text-neutral-300">Puntos
                <input type="number" min={0} max={100} disabled={editing.isQuote} className={`${field} ml-2 w-20`} value={editing.weight} onChange={(e) => setEditing({ ...editing, weight: Number(e.target.value) })} />
              </label>
              <label className="text-xs text-gray-600 dark:text-neutral-300">Orden
                <input type="number" className={`${field} ml-2 w-20`} value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} />
              </label>
              <label className="text-xs text-gray-600 dark:text-neutral-300">Impacto
                <select className={`${field} ml-2`} value={editing.impactLevel ?? 'green'} onChange={(e) => setEditing({ ...editing, impactLevel: e.target.value as ImpactLevel })}>
                  {(Object.keys(IMPACT_LABELS) as ImpactLevel[]).map((l) => <option key={l} value={l}>{IMPACT_LABELS[l].es} · {IMPACT_LABELS[l].hintEs}</option>)}
                </select>
              </label>
              <label className="text-xs text-gray-600 dark:text-neutral-300">Tokens de IA estimados
                <input type="number" min={0} className={`${field} ml-2 w-24`} value={editing.estimatedTokens ?? 0} onChange={(e) => setEditing({ ...editing, estimatedTokens: Number(e.target.value) })} />
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-neutral-300">
                <input type="checkbox" checked={editing.isQuote} onChange={(e) => setEditing({ ...editing, isQuote: e.target.checked })} /> Se cotiza aparte
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-neutral-300">
                <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Activo
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded-full px-4 py-2 text-sm text-gray-600 dark:text-neutral-300">Cancelar</button>
              <button type="submit" disabled={busy} className="rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
