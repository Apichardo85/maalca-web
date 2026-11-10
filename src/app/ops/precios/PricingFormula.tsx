'use client';

import { useCallback, useEffect, useState } from 'react';

// Fórmula de precios por módulo (maalca-api: PricingEngine). Aquí se editan los pesos de cada
// módulo, los niveles de precio por país y los ajustes generales. El cotizador y /servicios
// leen todo de aquí: ningún precio de módulo se escribe a mano.

interface Mod {
  token: string;
  es: string;
  en: string;
  tier: string;
  weight: number;
  shareUsd: number;
  soloUsd: number;
  setupUsd: number;
}
interface Tier { tier: number; name: string; factor: number; roundTo: number }
interface Country { country: string; tier: number }
interface Settings {
  growthUsd: number; professionalUsd: number; soloMarkup: number; corporateMinUsd: number;
  setupBaseUsd: number; setupGrowthPerWeightUsd: number; setupProPerWeightUsd: number;
  includedUsers: number; includedClients: number; extraLocationFactor: number;
}
interface Config { modules: Mod[]; tiers: Tier[]; countries: Country[]; settings: Settings }

const input =
  'w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 text-sm';
const label = 'text-xs font-medium text-gray-500 dark:text-neutral-400';
const money = (n: number) => `$${n.toFixed(2)}`;

const SETTING_LABELS: [keyof Settings, string][] = [
  ['growthUsd', 'Bolsa Growth (US$/mes)'],
  ['professionalUsd', 'Bolsa Professional (US$/mes)'],
  ['soloMarkup', 'Recargo módulo suelto (×)'],
  ['corporateMinUsd', 'Mínimo corporativo (US$/mes)'],
  ['setupBaseUsd', 'Setup base (US$)'],
  ['setupGrowthPerWeightUsd', 'Setup por peso Growth (US$)'],
  ['setupProPerWeightUsd', 'Setup por peso Professional (US$)'],
  ['includedUsers', 'Usuarios incluidos'],
  ['includedClients', 'Clientes incluidos'],
  ['extraLocationFactor', 'Local extra (fracción de la base)'],
];

export default function PricingFormula({ canManage }: { canManage: boolean }) {
  const [cfg, setCfg] = useState<Config | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/ops/pricing', { cache: 'no-store' });
      if (!res.ok) throw new Error('No se pudo cargar la fórmula.');
      setCfg(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(part: 'modules' | 'tiers' | 'countries' | 'settings', body: unknown) {
    setBusy(part);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch(`/api/ops/pricing/${part}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudo guardar.');
      setMsg('Guardado. Los precios se recalculan solos (cache de ~10 min en /servicios).');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
    } finally {
      setBusy(null);
    }
  }

  if (!cfg) {
    return error ? (
      <p className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
    ) : null;
  }

  const setMod = (token: string, weight: number) =>
    setCfg({ ...cfg, modules: cfg.modules.map((m) => (m.token === token ? { ...m, weight } : m)) });
  const setTier = (tier: number, patch: Partial<Tier>) =>
    setCfg({ ...cfg, tiers: cfg.tiers.map((t) => (t.tier === tier ? { ...t, ...patch } : t)) });
  const setSetting = (k: keyof Settings, v: number) => setCfg({ ...cfg, settings: { ...cfg.settings, [k]: v } });

  const sum = (tier: string) => cfg.modules.filter((m) => m.tier.toLowerCase() === tier).reduce((a, m) => a + m.weight, 0);

  return (
    <section className="mb-8 rounded-xl border border-gray-200 dark:border-neutral-800 p-4">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-left">
        <div>
          <h2 className="text-xl font-bold">Fórmula por módulo</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
            Peso de cada módulo dentro de su bolsa (Growth US${cfg.settings.growthUsd} / Professional US$
            {cfg.settings.professionalUsd}). De ahí salen el precio suelto, el setup y el nivel por país.
          </p>
        </div>
        <span className="text-sm text-brand-primary">{open ? 'Ocultar' : 'Abrir'}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-6">
          {msg && <p className="rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-2 text-sm text-green-700 dark:text-green-400">{msg}</p>}
          {error && <p className="rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-neutral-400">
                  <th className="py-1 pr-2">Módulo</th>
                  <th className="pr-2">Plan</th>
                  <th className="pr-2 w-24">Peso</th>
                  <th className="pr-2">Parte de la bolsa</th>
                  <th className="pr-2">Suelto</th>
                  <th>Setup</th>
                </tr>
              </thead>
              <tbody>
                {cfg.modules.map((m) => (
                  <tr key={m.token} className="border-t border-gray-100 dark:border-neutral-800">
                    <td className="py-1 pr-2">{m.es} <span className="text-xs text-gray-400">{m.token}</span></td>
                    <td className="pr-2">{m.tier}</td>
                    <td className="pr-2">
                      <input
                        className={input}
                        type="number"
                        step="0.5"
                        min="0"
                        value={m.weight}
                        disabled={!canManage}
                        onChange={(e) => setMod(m.token, Number(e.target.value))}
                      />
                    </td>
                    <td className="pr-2">{money(m.shareUsd)}</td>
                    <td className="pr-2">{money(m.soloUsd)}</td>
                    <td>{money(m.setupUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-500 dark:text-neutral-400">
              Suma de pesos: Growth {sum('growth')} · Professional {sum('professional')}. El precio de cada módulo es su
              peso entre la suma, por el precio de la bolsa.
            </p>
            {canManage && (
              <button
                disabled={busy === 'modules'}
                onClick={() => save('modules', { items: cfg.modules.map((m) => ({ token: m.token, weight: m.weight })) })}
                className="mt-2 rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {busy === 'modules' ? 'Guardando…' : 'Guardar pesos'}
              </button>
            )}
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Niveles de precio</h3>
            <div className="grid gap-2 sm:grid-cols-3">
              {cfg.tiers.map((t) => (
                <div key={t.tier} className="rounded-lg border border-gray-200 dark:border-neutral-800 p-3">
                  <p className="text-sm font-medium">Nivel {t.tier}</p>
                  <label className={label}>Nombre
                    <input className={input} value={t.name} disabled={!canManage} onChange={(e) => setTier(t.tier, { name: e.target.value })} />
                  </label>
                  <label className={label}>Factor
                    <input className={input} type="number" step="0.05" value={t.factor} disabled={!canManage} onChange={(e) => setTier(t.tier, { factor: Number(e.target.value) })} />
                  </label>
                  <label className={label}>Redondeo a (US$)
                    <input className={input} type="number" step="0.01" value={t.roundTo} disabled={!canManage} onChange={(e) => setTier(t.tier, { roundTo: Number(e.target.value) })} />
                  </label>
                </div>
              ))}
            </div>
            {canManage && (
              <button disabled={busy === 'tiers'} onClick={() => save('tiers', { tiers: cfg.tiers })}
                className="mt-2 rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {busy === 'tiers' ? 'Guardando…' : 'Guardar niveles'}
              </button>
            )}
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Países por nivel</h3>
            <p className="mb-2 text-xs text-gray-500 dark:text-neutral-400">
              Se usa el país del negocio (no la IP del visitante). Un país que no esté aquí paga el nivel 1.
            </p>
            <div className="flex flex-wrap gap-2">
              {cfg.countries.map((c, i) => (
                <div key={c.country} className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-neutral-800 px-2 py-1 text-sm">
                  <span className="font-mono">{c.country}</span>
                  <select
                    className={input + ' !w-16'}
                    value={c.tier}
                    disabled={!canManage}
                    onChange={(e) => setCfg({ ...cfg, countries: cfg.countries.map((x, j) => (j === i ? { ...x, tier: Number(e.target.value) } : x)) })}
                  >
                    {cfg.tiers.map((t) => <option key={t.tier} value={t.tier}>{t.tier}</option>)}
                  </select>
                  {canManage && (
                    <button aria-label="Quitar" className="text-gray-400" onClick={() => setCfg({ ...cfg, countries: cfg.countries.filter((_, j) => j !== i) })}>×</button>
                  )}
                </div>
              ))}
            </div>
            {canManage && (
              <div className="mt-2 flex gap-2">
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    const code = String(f.get('code') ?? '').trim().toUpperCase();
                    if (code.length !== 2 || cfg.countries.some((c) => c.country === code)) return;
                    setCfg({ ...cfg, countries: [...cfg.countries, { country: code, tier: 2 }] });
                    e.currentTarget.reset();
                  }}
                >
                  <input name="code" maxLength={2} placeholder="ISO2 (MX)" className={input + ' !w-28'} />
                  <button className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1 text-sm">Añadir</button>
                </form>
                <button disabled={busy === 'countries'} onClick={() => save('countries', { countries: cfg.countries })}
                  className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  {busy === 'countries' ? 'Guardando…' : 'Guardar países'}
                </button>
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Ajustes generales</h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SETTING_LABELS.map(([k, text]) => (
                <label key={k} className={label}>{text}
                  <input className={input} type="number" step="0.01" value={cfg.settings[k]} disabled={!canManage}
                    onChange={(e) => setSetting(k, Number(e.target.value))} />
                </label>
              ))}
            </div>
            {canManage && (
              <button disabled={busy === 'settings'} onClick={() => save('settings', cfg.settings)}
                className="mt-2 rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {busy === 'settings' ? 'Guardando…' : 'Guardar ajustes'}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
