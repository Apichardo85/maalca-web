'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOpsCanManage } from '../../OpsRoleContext';
import type { OpsAffiliate, OpsNote } from '../../types';
import { MODULE_CATALOG, isModuleRelevant } from '@/lib/module-catalog';

// Mismo catálogo que ModulesContent.tsx (la vitrina del dueño en /space) — un módulo nuevo se
// define una sola vez en src/lib/module-catalog.ts y aparece acá automáticamente, con
// descripción incluida. /ops es admin-only y siempre en español, por eso usa mod.es/descEs
// directo en vez de getText. Por defecto SÍ se filtra por tipo de negocio (igual que la
// vitrina) para no mostrar ruido tipo "Cocina" en un afiliado de Servicios — pero el admin
// puede tocar "Mostrar todos" para ver y prender cualquier token por encima de lo que el
// plan/tipo normalmente daría (override deliberado, no un bug).
// Dashboard/Diseñar/Identidad/Módulos no están acá — siempre visibles en el sidebar, no son
// apagables.
const MODULE_TOKENS = MODULE_CATALOG;

export function NegocioDetail({
  initialAffiliate,
  initialNotes,
}: {
  initialAffiliate: OpsAffiliate;
  initialNotes: OpsNote[];
}) {
  const router = useRouter();
  const canManage = useOpsCanManage();
  const [a, setA] = useState(initialAffiliate);
  const [notes, setNotes] = useState(initialNotes);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [selectedModules, setSelectedModules] = useState<Set<string>>(
    new Set(initialAffiliate.modulosActivos ?? []),
  );
  const [savingModules, setSavingModules] = useState(false);
  const [modulesDirty, setModulesDirty] = useState(false);
  const [showAllModules, setShowAllModules] = useState(false);

  const businessTypeKey = (a.businessType ?? '').toLowerCase();
  const visibleModules = showAllModules
    ? MODULE_TOKENS
    : MODULE_TOKENS.filter((mod) => isModuleRelevant(mod, businessTypeKey));
  const hiddenCount = MODULE_TOKENS.length - visibleModules.length;

  function toggleModule(token: string) {
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(token)) next.delete(token);
      else next.add(token);
      return next;
    });
    setModulesDirty(true);
  }

  async function saveModules() {
    setSavingModules(true);
    setError(null);
    try {
      const res = await fetch(`/api/ops/affiliates/${a.id}/modules`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules: Array.from(selectedModules) }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudieron guardar los módulos.');
      setA(data);
      setSelectedModules(new Set(data.modulosActivos ?? []));
      setModulesDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
    } finally {
      setSavingModules(false);
    }
  }

  async function setStatus(patch: { published?: boolean; active?: boolean }) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/ops/affiliates/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudo actualizar el negocio.');
      setA(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
    } finally {
      setBusy(false);
    }
  }

  async function impersonate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/ops/impersonate/${a.id}`, { method: 'POST' });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudo entrar como soporte.');
      router.push(`/space/${a.slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
      setBusy(false);
    }
  }

  async function addNote() {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/ops/affiliates/${a.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: noteText }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        setNotes((prev) => [data, ...prev]);
        setNoteText('');
      }
    } finally {
      setSavingNote(false);
    }
  }

  return (
    <div>
      <Link href="/ops/negocios" className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300">
        ← Negocios
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{a.name}</h2>
          <p className="text-sm text-gray-400 dark:text-neutral-500">/{a.slug} · {a.businessType}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {canManage && (
            <>
              <button
                onClick={() => setStatus({ published: !a.published })}
                disabled={busy}
                className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-neutral-300 hover:border-gray-400 disabled:opacity-50"
              >
                {a.published ? 'Despublicar' : 'Publicar'}
              </button>
              <button
                onClick={() => setStatus({ active: !a.isActive })}
                disabled={busy}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
                  a.isActive
                    ? 'border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-neutral-300 hover:border-red-400 hover:text-red-500'
                    : 'border-yellow-400 text-yellow-600 dark:text-yellow-400'
                }`}
              >
                {a.isActive ? 'Pausar' : 'Reactivar'}
              </button>
            </>
          )}
          <button
            onClick={impersonate}
            disabled={busy}
            className="rounded-full bg-[#C8102E] px-3.5 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            Entrar como soporte
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3">
          <p className="text-xs text-gray-400 dark:text-neutral-500">Plan</p>
          <p className="mt-1 text-sm font-semibold">{a.plan}</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3">
          <p className="text-xs text-gray-400 dark:text-neutral-500">Estado de pago</p>
          <p className="mt-1 text-sm font-semibold">{a.planStatus}</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3">
          <p className="text-xs text-gray-400 dark:text-neutral-500">Pedidos 30d</p>
          <p className="mt-1 text-sm font-semibold">{a.ordersLast30Days}</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3">
          <p className="text-xs text-gray-400 dark:text-neutral-500">Creado</p>
          <p className="mt-1 text-sm font-semibold">{new Date(a.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {a.alerts.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {a.alerts.map((alert) => (
            <span
              key={alert}
              className="inline-block rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400"
            >
              {alert}
            </span>
          ))}
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Módulos</h3>
          {canManage && modulesDirty && (
            <button
              onClick={saveModules}
              disabled={savingModules}
              className="rounded-full bg-[#C8102E] px-3.5 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {savingModules ? 'Guardando…' : 'Guardar cambios'}
            </button>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-gray-400 dark:text-neutral-500">
            Lo que este negocio ve en su sidebar — puedes prender o apagar cualquiera, por encima
            de lo que su plan normalmente incluiría.
          </p>
          <button
            type="button"
            onClick={() => setShowAllModules((v) => !v)}
            className="shrink-0 text-xs font-medium text-gray-500 dark:text-neutral-400 underline decoration-dotted underline-offset-2 hover:text-[#C8102E]"
          >
            {showAllModules
              ? 'Mostrar solo relevantes'
              : `Mostrar todos los módulos${hiddenCount > 0 ? ` (+${hiddenCount})` : ''}`}
          </button>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {visibleModules.map((mod) => {
            const active = selectedModules.has(mod.token);
            return (
              <button
                key={mod.token}
                type="button"
                disabled={!canManage}
                onClick={() => toggleModule(mod.token)}
                title={mod.descEs}
                className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  active
                    ? 'border-[#C8102E] bg-[#C8102E]/10 text-[#C8102E]'
                    : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-500 dark:text-neutral-400'
                }`}
              >
                <span className="text-base">{mod.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block">{mod.es}</span>
                  <span className="mt-0.5 block truncate text-[10px] font-normal opacity-70">{mod.descEs}</span>
                </span>
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${active ? 'bg-[#C8102E]' : 'bg-gray-300 dark:bg-neutral-700'}`} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Notas CRM</h3>
        <div className="mt-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <div className="flex gap-2">
            <input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Nueva nota…"
              className="flex-1 rounded-md border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && addNote()}
            />
            <button
              onClick={addNote}
              disabled={savingNote || !noteText.trim()}
              className="rounded-md bg-[#C8102E] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Agregar
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {notes.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-neutral-500">Sin notas todavía.</p>
            )}
            {notes.map((n) => (
              <div key={n.id} className="border-b border-gray-100 dark:border-neutral-800/60 pb-3 last:border-0 last:pb-0">
                <p className="text-sm text-gray-700 dark:text-neutral-200">{n.text}</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
                  {n.authorEmail} · {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
