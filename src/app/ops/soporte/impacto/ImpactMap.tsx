'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { IMPACT_LABELS, IMPACT_STYLES, apiErrorMessage, type ImpactEntity, type ImpactLevel, type ImpactRule } from '@/lib/support/types';

const FIELD_HINT = 'Campos que pesan distinto al resto del dato';

function RuleView({ rule }: { rule: ImpactRule }) {
  return (
    <div className="space-y-1">
      <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${IMPACT_STYLES[rule.level]}`}>
        {IMPACT_LABELS[rule.level].es} · {IMPACT_LABELS[rule.level].hintEs}
      </span>
      {rule.surfacesEs.length > 0 && <p className="text-xs text-gray-600 dark:text-neutral-300">Se ve en: {rule.surfacesEs.join(' · ')}</p>}
      {rule.noteEs && <p className="text-xs text-gray-500 dark:text-neutral-400">{rule.noteEs}</p>}
    </div>
  );
}

/**
 * Referencia para soporte: cada tipo de dato del negocio, dónde se nota si se cambia y de qué nivel es.
 * Sale del ImpactRegistry del API (lo mismo que decide si un guardado se bloquea), así que no se desactualiza.
 */
export function ImpactMap() {
  const [map, setMap] = useState<ImpactEntity[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [level, setLevel] = useState<ImpactLevel | 'all'>('all');

  useEffect(() => {
    fetch('/api/ops/support/impact-map', { cache: 'no-store' })
      .then(async (r) => {
        const data = await r.json().catch(() => null);
        if (!r.ok) throw new Error(apiErrorMessage(data, 'No se pudo cargar el mapa.'));
        setMap(data);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar el mapa.'));
  }, []);

  const filtered = useMemo(() => {
    if (!map) return [];
    const term = q.trim().toLowerCase();
    return map
      .map((e) => ({
        ...e,
        fields: e.fields.filter((f) => (level === 'all' || f.rule.level === level) && (!term || f.field.toLowerCase().includes(term) || e.labelEs.toLowerCase().includes(term))),
      }))
      .filter((e) => (level === 'all' || e.default.level === level || e.fields.length > 0) && (!term || e.labelEs.toLowerCase().includes(term) || e.fields.length > 0));
  }, [map, q, level]);

  const card = 'rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900';

  return (
    <div className="space-y-5">
      <div>
        <Link href="/ops/soporte" className="text-sm text-gray-500 hover:text-gray-800 dark:text-neutral-400">← Bandeja</Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-neutral-100">Mapa de impacto</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          Antes de cambiar algo en el espacio de un negocio, mira aquí qué implica. <strong>Verde</strong>: lo resuelves tú.{' '}
          <strong>Amarillo</strong>: confírmalo con el cliente. <strong>Rojo</strong>: lo aprueba el admin; si lo intentas guardar en modo soporte, se bloquea y se escala solo.
          Borrar algo siempre es mínimo amarillo.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar (ej. logo, precio, horario)…" className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100" />
        {(['all', 'green', 'yellow', 'red'] as const).map((l) => (
          <button key={l} type="button" onClick={() => setLevel(l)} className={`rounded-full px-3 py-1 text-xs font-medium ${level === l ? 'bg-gray-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'text-gray-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800'}`}>
            {l === 'all' ? 'Todos' : IMPACT_LABELS[l].es}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!map && !error && <p className="text-sm text-gray-500">Cargando…</p>}

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((e) => (
          <section key={e.entityType} className={card}>
            <h2 className="mb-2 text-sm font-semibold text-gray-900 dark:text-neutral-100">{e.labelEs}</h2>
            <RuleView rule={e.default} />
            {e.fields.length > 0 && (
              <div className="mt-3 border-t border-gray-100 pt-2 dark:border-neutral-800">
                <p className="mb-1 text-[11px] uppercase tracking-wide text-gray-400" title={FIELD_HINT}>Campos especiales</p>
                <ul className="space-y-2">
                  {e.fields.map((f) => (
                    <li key={f.field}>
                      <p className="text-xs font-medium text-gray-800 dark:text-neutral-200"><code>{f.field}</code></p>
                      <RuleView rule={f.rule} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
