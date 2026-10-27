'use client';

import { useEffect, useState } from 'react';
import { MODULE_CATALOG, PLAN_TIERS, type PlanTier } from '@/lib/module-catalog';
import { useOpsCanManage } from '../OpsRoleContext';

// Catálogo de módulos + plan mínimo de cada uno. El plan mínimo vive en maalca-api
// (ModulePlanRules; sin fila = default de ModuleCatalog.cs) y es la ÚNICA regla que decide qué
// ve un negocio junto con su tipo y sus cortesías (ModuleAccess). Cambiarlo aquí aplica a todos
// los negocios en máx. ~10 min, sin desplegar. Solo Owner edita.
//
// Iconos y textos salen de src/lib/module-catalog.ts — mantener tokens sincronizados con el API.
function appliesTo(mod: (typeof MODULE_CATALOG)[number]): string {
  const cap = (t: string) => t[0].toUpperCase() + t.slice(1);
  if (mod.businessTypes) return mod.businessTypes.map(cap).join(', ');
  if (mod.excludeBusinessTypes) return `Todos excepto ${mod.excludeBusinessTypes.map(cap).join(', ')}`;
  return 'Todos los tipos de negocio';
}

const TIER_HINT: Record<PlanTier, string> = {
  Starter: 'Incluido desde Starter',
  Growth: 'Desde Growth',
  Professional: 'Solo Professional',
};

export default function OpsModulosPage() {
  const canManage = useOpsCanManage();
  const [tiers, setTiers] = useState<Record<string, PlanTier>>(() =>
    Object.fromEntries(MODULE_CATALOG.map((m) => [m.token, m.minTier])),
  );
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/ops/module-rules')
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: { token: string; minTier: PlanTier }[]) => {
        if (Array.isArray(rows) && rows.length) {
          setTiers((prev) => ({ ...prev, ...Object.fromEntries(rows.map((r) => [r.token, r.minTier])) }));
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  async function save(token: string, minTier: PlanTier) {
    const prev = tiers[token];
    setTiers((t) => ({ ...t, [token]: minTier }));
    setSaving(token);
    setMsg(null);
    try {
      const res = await fetch(`/api/ops/module-rules/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minTier }),
      });
      if (!res.ok) throw new Error();
      setMsg('Guardado. Llega a todos los negocios en máx. 10 min.');
    } catch {
      setTiers((t) => ({ ...t, [token]: prev }));
      setMsg('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Módulos por plan</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
          Qué ve un negocio = lo prendido para su tipo (detalle del negocio) ∩ lo que su plan incluye, más sus
          cortesías. El trial cuenta como Professional por 30 días. Facturación no es módulo: siempre se ve.
        </p>
        <p className="mt-2 text-xs text-gray-400 dark:text-neutral-500">
          Eventos, Causas e Impacto (Comunidad) no están en esta lista — son parte fija del tipo Community.
        </p>
        {msg && <p className="mt-2 text-xs font-medium text-brand-primary">{msg}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODULE_CATALOG.map((mod) => {
          const tier = tiers[mod.token] ?? mod.minTier;
          return (
            <div
              key={mod.token}
              className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{mod.icon}</span>
                <span className="font-semibold">{mod.es}</span>
                <code className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400 dark:bg-neutral-800 dark:text-neutral-500">
                  {mod.token}
                </code>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-neutral-400">{mod.descEs}</p>
              <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-neutral-500">
                Aplica a
              </p>
              <p className="text-xs text-gray-600 dark:text-neutral-300">{appliesTo(mod)}</p>
              <div className="mt-3 flex items-center gap-2">
                <label className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-neutral-500">
                  Plan mínimo
                </label>
                {canManage ? (
                  <select
                    value={tier}
                    disabled={!loaded || saving === mod.token}
                    onChange={(e) => save(mod.token, e.target.value as PlanTier)}
                    className="ml-auto rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    {PLAN_TIERS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="ml-auto text-xs font-semibold">{TIER_HINT[tier]}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
