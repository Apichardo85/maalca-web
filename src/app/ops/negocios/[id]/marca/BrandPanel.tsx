'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useOpsCanManage } from '../../../OpsRoleContext';
import { NETWORKS, type AgentAffiliatePlan, type BrandProfile } from './types';

const INPUT =
  'w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5 text-xs disabled:opacity-60';
const BTN = 'rounded-md bg-brand-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50';
const CARD = 'rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4';
const H = 'text-sm font-semibold text-gray-700 dark:text-neutral-300';
const LABEL = 'block text-xs font-medium text-gray-500 dark:text-neutral-400';

const BRAND_FIELDS: { key: keyof BrandProfile; label: string; hint: string; rows: number }[] = [
  { key: 'voice', label: 'Voz de la marca', hint: 'Cómo habla: tono, palabras que usa, formal o cercano.', rows: 3 },
  { key: 'audience', label: 'Público', hint: 'A quién le habla.', rows: 2 },
  { key: 'offer', label: 'Qué ofrece', hint: 'Qué vende y qué lo hace distinto. Los precios NO van aquí: el agente los lee del catálogo.', rows: 3 },
  { key: 'dos', label: 'Qué sí hacer', hint: 'Lo que siempre debe aparecer o cuidarse.', rows: 2 },
  { key: 'donts', label: 'Qué nunca decir o mostrar', hint: 'Temas, promesas o imágenes prohibidas.', rows: 2 },
  { key: 'specialDates', label: 'Fechas y temporadas', hint: 'Una por línea. Ej: Día de los Muertos (2 nov), Halloween.', rows: 4 },
  { key: 'hashtags', label: 'Hashtags', hint: 'Los que usa la marca.', rows: 2 },
  { key: 'notes', label: 'Notas para el agente', hint: 'Cualquier otro contexto útil.', rows: 3 },
];

export function BrandPanel({
  affiliateId, initialBrand, initialPlan,
}: { affiliateId: string; initialBrand: BrandProfile; initialPlan: AgentAffiliatePlan }) {
  const canManage = useOpsCanManage();
  const [brand, setBrand] = useState(initialBrand);
  const [plan, setPlan] = useState(initialPlan);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const base = `/api/ops/agents/affiliates/${affiliateId}`;

  async function put<T>(path: 'brand' | 'plan', body: unknown, okMsg: string): Promise<T | null> {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`${base}/${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudo guardar.');
      setNotice(okMsg);
      return data as T;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function saveBrand() {
    const saved = await put<BrandProfile>('brand', brand, 'Perfil de marca guardado.');
    if (saved) setBrand(saved);
  }

  async function savePlan() {
    const saved = await put<AgentAffiliatePlan>('plan', plan, 'Plan guardado.');
    if (saved) setPlan(saved);
  }

  const pct = plan.monthlyTokenCap > 0 ? Math.min(100, Math.round((plan.tokensUsedThisMonth / plan.monthlyTokenCap) * 100)) : 0;

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/ops/negocios/${affiliateId}`} className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300">
          ← Negocio
        </Link>
        <h2 className="mt-3 text-xl font-bold">Marca y marketing</h2>
        <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
          Lo que los agentes saben de este negocio. Los precios, el menú y el horario los leen en vivo de la base de datos;
          aquí solo va lo que el sistema no puede deducir.
        </p>
      </div>

      {error && <p className="rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
      {notice && <p className="rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-2 text-xs text-green-700 dark:text-green-400">{notice}</p>}

      {/* Plan de agentes */}
      <div className={CARD}>
        <h3 className={H}>Plan de agentes</h3>
        <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
          Son límites duros que aplica el código. {!canManage && 'Solo un Owner puede cambiarlos.'}
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className={LABEL}>
            Publicaciones por mes
            <input type="number" min={0} max={200} disabled={!canManage} className={`${INPUT} mt-1`} value={plan.postsPerMonth}
              onChange={(e) => setPlan({ ...plan, postsPerMonth: Number(e.target.value) })} />
          </label>
          <div>
            <span className={LABEL}>Redes incluidas</span>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {NETWORKS.map((n) => (
                <label key={n.key} className="flex items-center gap-1 text-xs text-gray-600 dark:text-neutral-400">
                  <input type="checkbox" disabled={!canManage} checked={plan.networks.includes(n.key)}
                    onChange={() => setPlan({
                      ...plan,
                      networks: plan.networks.includes(n.key) ? plan.networks.filter((x) => x !== n.key) : [...plan.networks, n.key],
                    })} />
                  {n.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-gray-100 dark:border-neutral-800 pt-3">
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-neutral-300">
            <input type="checkbox" disabled={!canManage} checked={plan.assistantEnabled}
              onChange={(e) => setPlan({ ...plan, assistantEnabled: e.target.checked })} />
            Add-on: asistente para el dueño
          </label>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <label className={LABEL}>
              Tope mensual de tokens (entrada + salida)
              <input type="number" min={0} step={10000} disabled={!canManage} className={`${INPUT} mt-1`} value={plan.monthlyTokenCap}
                onChange={(e) => setPlan({ ...plan, monthlyTokenCap: Number(e.target.value) })} />
            </label>
            <div className="text-xs text-gray-500 dark:text-neutral-400">
              <p className="mt-5">Usado este mes: {plan.tokensUsedThisMonth.toLocaleString()} {plan.monthlyTokenCap > 0 && `(${pct}%)`}</p>
              {plan.monthlyTokenCap > 0 && (
                <div className="mt-1 h-1.5 w-full rounded bg-gray-200 dark:bg-neutral-800">
                  <div className={`h-1.5 rounded ${pct >= 90 ? 'bg-red-500' : 'bg-brand-primary'}`} style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {canManage && (
          <div className="mt-3">
            <button disabled={busy} className={BTN} onClick={savePlan}>Guardar plan</button>
          </div>
        )}
      </div>

      {/* Perfil de marca */}
      <div className={CARD}>
        <h3 className={H}>Perfil de marca</h3>
        <div className="mt-3 space-y-3">
          {BRAND_FIELDS.map((f) => (
            <label key={f.key} className={LABEL}>
              {f.label}
              <textarea rows={f.rows} className={`${INPUT} mt-1`} placeholder={f.hint}
                value={(brand[f.key] as string | null) ?? ''}
                onChange={(e) => setBrand({ ...brand, [f.key]: e.target.value })} />
            </label>
          ))}
          <label className={LABEL}>
            Idioma de las publicaciones
            <select className={`${INPUT} mt-1 w-48`} value={brand.language} onChange={(e) => setBrand({ ...brand, language: e.target.value })}>
              <option value="es">Español</option>
              <option value="en">Inglés</option>
              <option value="es,en">Español e inglés</option>
            </select>
          </label>
        </div>
        <div className="mt-3">
          <button disabled={busy} className={BTN} onClick={saveBrand}>Guardar perfil</button>
        </div>
      </div>
    </div>
  );
}
