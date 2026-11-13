'use client';

import { useState } from 'react';
import { useOpsCanManage } from '../OpsRoleContext';
import type { AgentAdminState, AgentDefinition, AgentJob, AgentModel } from './types';

const INPUT =
  'rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5 text-xs disabled:opacity-60';
const BTN = 'rounded-md bg-brand-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50';
const CARD = 'rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4';
const H = 'text-sm font-semibold text-gray-700 dark:text-neutral-300';

const usd = (n: number) => `$${n.toFixed(n < 1 ? 4 : 2)}`;

export function AgentsPanel({ initialState, initialJobs }: { initialState: AgentAdminState; initialJobs: AgentJob[] }) {
  const canManage = useOpsCanManage();
  const [state, setState] = useState(initialState);
  const [jobs, setJobs] = useState(initialJobs);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function refresh() {
    const [s, j] = await Promise.all([fetch('/api/ops/agents'), fetch('/api/ops/agents/jobs?limit=25')]);
    if (s.ok) setState(await s.json());
    if (j.ok) setJobs(await j.json());
  }

  /** PUT genérico: guarda, recarga el estado y muestra el error del API tal cual. */
  async function save(path: string, body: unknown, okMsg: string): Promise<boolean> {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/ops/agents/${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudo guardar.');
      await refresh();
      setNotice(okMsg);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  const globalPause = state.pauses.find((p) => p.scope === 'global');
  const provider = state.providers[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className={H}>Orquestador de agentes</h2>
        <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
          Todo se configura aquí: cada agente tiene su ficha, su nivel de modelo y sus herramientas. Los precios son
          USD por millón de tokens y sirven para calcular el costo de cada ejecución.
          {!canManage && ' Solo un Owner puede cambiar la configuración.'}
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      {notice && (
        <p className="rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-2 text-xs text-green-700 dark:text-green-400">
          {notice}
        </p>
      )}

      {/* Estado, consumo y pausa */}
      <div className={CARD}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-gray-600 dark:text-neutral-400">
            <p className="font-semibold text-gray-800 dark:text-neutral-200">Este mes</p>
            <p className="mt-1">
              {state.usageThisMonth.jobs} ejecuciones · {state.usageThisMonth.failed} con error ·{' '}
              <span className="font-semibold">{usd(state.usageThisMonth.costUsd)}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                globalPause?.paused
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              }`}
            >
              {globalPause?.paused ? 'Pausados' : 'Activos'}
            </span>
            {canManage && (
              <button
                disabled={busy}
                className={BTN}
                onClick={() => {
                  const pausing = !globalPause?.paused;
                  if (pausing && !confirm('¿Pausar TODOS los agentes? El chat y las tareas en cola se detienen.')) return;
                  save('pause', { scope: 'global', paused: pausing, reason: pausing ? 'Pausa manual desde /ops' : null },
                    pausing ? 'Agentes pausados.' : 'Agentes reanudados.');
                }}
              >
                {globalPause?.paused ? 'Reanudar todos' : 'Pausar todos'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Proveedor y llave */}
      {provider && <ProviderCard provider={provider} canManage={canManage} busy={busy} save={save} />}

      {/* Modelos */}
      <div className={CARD}>
        <h3 className={H}>Modelos por nivel</h3>
        <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
          Los agentes piden un nivel (fast, standard, premium), no un modelo: cambiar el modelo de un nivel aquí cambia
          a todos los agentes que lo usan.
        </p>
        <div className="mt-3 space-y-2">
          {state.models.map((m) => (
            <ModelRow key={m.tier} model={m} canManage={canManage} busy={busy} save={save} />
          ))}
        </div>
      </div>

      {/* Agentes */}
      <div className="space-y-4">
        <h3 className={H}>Agentes</h3>
        {state.agents.map((a) => (
          <AgentCard key={a.key} agent={a} state={state} canManage={canManage} busy={busy} save={save} />
        ))}
      </div>

      {/* Bitácora */}
      <div className={CARD}>
        <div className="flex items-center justify-between">
          <h3 className={H}>Últimas ejecuciones</h3>
          <button className="text-xs text-brand-primary" onClick={refresh}>
            Actualizar
          </button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-gray-400 dark:text-neutral-500">
              <tr>
                <th className="py-1 pr-3">Fecha</th>
                <th className="pr-3">Agente</th>
                <th className="pr-3">Tipo</th>
                <th className="pr-3">Estado</th>
                <th className="pr-3">Tokens</th>
                <th className="pr-3">Costo</th>
                <th>Quién</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-neutral-300">
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-3 text-gray-400">
                    Sin ejecuciones todavía.
                  </td>
                </tr>
              )}
              {jobs.map((j) => (
                <tr key={j.id} className="border-t border-gray-100 dark:border-neutral-800" title={j.error ?? ''}>
                  <td className="py-1.5 pr-3 whitespace-nowrap">{new Date(j.createdAt).toLocaleString()}</td>
                  <td className="pr-3">{j.agentKey}</td>
                  <td className="pr-3">{j.kind}</td>
                  <td className={`pr-3 ${j.status === 'Failed' || j.errorCode ? 'text-red-600' : ''}`}>
                    {j.errorCode ?? j.status}
                  </td>
                  <td className="pr-3">{j.tokensInput + j.tokensOutput}</td>
                  <td className="pr-3">{usd(j.costUsd)}</td>
                  <td>{j.requestedBy ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

type Save = (path: string, body: unknown, okMsg: string) => Promise<boolean>;

function ProviderCard({
  provider, canManage, busy, save,
}: { provider: AgentAdminState['providers'][number]; canManage: boolean; busy: boolean; save: Save }) {
  const [apiKey, setApiKey] = useState('');
  const source =
    provider.keySource === 'ops' ? `guardada aquí (…${provider.apiKeyLast4 ?? '????'})`
    : provider.keySource === 'env' ? 'variable de entorno del API'
    : 'sin llave';

  return (
    <div className={CARD}>
      <h3 className={H}>Proveedor: {provider.key}</h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
        Llave:{' '}
        <span className={provider.hasKey ? 'text-green-600' : 'text-red-600 font-medium'}>{source}</span> · {provider.baseUrl}
      </p>
      {canManage && (
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Pegar llave nueva (sk-ant-…)"
            className={`${INPUT} w-72`}
          />
          <button
            disabled={busy || !apiKey.trim()}
            className={BTN}
            onClick={async () => {
              if (await save(`providers/${provider.key}`, { apiKey: apiKey.trim() }, 'Llave guardada (cifrada).')) setApiKey('');
            }}
          >
            Guardar llave
          </button>
        </div>
      )}
    </div>
  );
}

function ModelRow({
  model, canManage, busy, save,
}: { model: AgentModel; canManage: boolean; busy: boolean; save: Save }) {
  const [m, setM] = useState(model);
  const dirty = JSON.stringify(m) !== JSON.stringify(model);
  const num = (v: string) => (v === '' ? 0 : Number(v));
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="w-20 font-semibold text-gray-700 dark:text-neutral-300">{m.tier}</span>
      <input disabled={!canManage} value={m.modelId} onChange={(e) => setM({ ...m, modelId: e.target.value })} className={`${INPUT} w-52`} />
      <label className="flex items-center gap-1 text-gray-400">
        in
        <input disabled={!canManage} type="number" step="0.01" min="0" value={m.inputPricePerMTok}
          onChange={(e) => setM({ ...m, inputPricePerMTok: num(e.target.value) })} className={`${INPUT} w-20`} />
      </label>
      <label className="flex items-center gap-1 text-gray-400">
        out
        <input disabled={!canManage} type="number" step="0.01" min="0" value={m.outputPricePerMTok}
          onChange={(e) => setM({ ...m, outputPricePerMTok: num(e.target.value) })} className={`${INPUT} w-20`} />
      </label>
      {canManage && (
        <button disabled={busy || !dirty} className={BTN}
          onClick={() => save(`models/${m.tier}`, {
            providerKey: m.providerKey, modelId: m.modelId.trim(),
            inputPricePerMTok: m.inputPricePerMTok, outputPricePerMTok: m.outputPricePerMTok, isActive: m.isActive,
          }, `Nivel ${m.tier} guardado.`)}>
          Guardar
        </button>
      )}
    </div>
  );
}

function AgentCard({
  agent, state, canManage, busy, save,
}: { agent: AgentDefinition; state: AgentAdminState; canManage: boolean; busy: boolean; save: Save }) {
  const [a, setA] = useState(agent);
  const dirty = JSON.stringify(a) !== JSON.stringify(agent);
  const tools = state.tools.filter((t) => a.visibility === 'internal' || !t.internalOnly);

  function toggleTool(name: string) {
    setA({ ...a, tools: a.tools.includes(name) ? a.tools.filter((t) => t !== name) : [...a.tools, name] });
  }

  return (
    <div className={CARD}>
      <div className="flex flex-wrap items-center gap-2">
        <input disabled={!canManage} value={a.name} onChange={(e) => setA({ ...a, name: e.target.value })} className={`${INPUT} w-56 font-semibold`} />
        <code className="text-[11px] text-gray-400">{a.key}</code>
        <select disabled={!canManage} value={a.modelTier} onChange={(e) => setA({ ...a, modelTier: e.target.value })} className={INPUT}>
          {state.models.map((m) => (
            <option key={m.tier} value={m.tier}>{m.tier} · {m.modelId}</option>
          ))}
        </select>
        <select disabled={!canManage} value={a.visibility}
          onChange={(e) => setA({ ...a, visibility: e.target.value as 'internal' | 'client' })} className={INPUT}>
          <option value="internal">Interno (staff)</option>
          <option value="client">Cliente (dueño)</option>
        </select>
        <label className="flex items-center gap-1 text-xs text-gray-500">
          máx. respuesta
          <input disabled={!canManage} type="number" min={64} max={16000} value={a.maxOutputTokens}
            onChange={(e) => setA({ ...a, maxOutputTokens: Number(e.target.value) })} className={`${INPUT} w-20`} />
        </label>
        <label className="flex items-center gap-1 text-xs text-gray-500">
          <input disabled={!canManage} type="checkbox" checked={a.isActive} onChange={(e) => setA({ ...a, isActive: e.target.checked })} />
          activo
        </label>
      </div>

      <textarea disabled={!canManage} value={a.systemPrompt} onChange={(e) => setA({ ...a, systemPrompt: e.target.value })}
        rows={8} className={`${INPUT} mt-3 w-full font-mono leading-relaxed`} />

      <div className="mt-3">
        <p className="text-xs font-medium text-gray-500">Herramientas</p>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
          {tools.map((t) => (
            <label key={t.name} className="flex items-center gap-1 text-xs text-gray-600 dark:text-neutral-400" title={t.description}>
              <input disabled={!canManage} type="checkbox" checked={a.tools.includes(t.name)} onChange={() => toggleTool(t.name)} />
              {t.name}{t.internalOnly && <span className="text-[10px] text-amber-600">interna</span>}
            </label>
          ))}
        </div>
      </div>

      {canManage && (
        <div className="mt-3">
          <button disabled={busy || !dirty} className={BTN}
            onClick={() => save(`definitions/${a.key}`, {
              name: a.name, description: a.description, systemPrompt: a.systemPrompt, modelTier: a.modelTier,
              tools: a.tools, visibility: a.visibility, maxOutputTokens: a.maxOutputTokens, isActive: a.isActive,
            }, `Agente ${a.name} guardado.`)}>
            Guardar agente
          </button>
        </div>
      )}
    </div>
  );
}
