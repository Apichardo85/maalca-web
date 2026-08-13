'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface OpsOverview {
  totalAffiliates: number;
  entrepreneurCount: number;
  freeCount: number;
  mrrUsd: number;
  newThisMonth: number;
  publishedCount: number;
}

export interface OpsAffiliate {
  id: string;
  name: string;
  slug: string;
  businessType: string;
  plan: string;
  planStatus: string;
  published: boolean;
  createdAt: string;
  ordersLast30Days: number;
  stripeConnectChargesEnabled: boolean;
  alerts: string[];
}

interface Props {
  overview: OpsOverview | null;
  initialAffiliates: OpsAffiliate[];
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

export function OpsContent({ overview, initialAffiliates }: Props) {
  const router = useRouter();
  const [affiliates] = useState(initialAffiliates);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onlyAlerts, setOnlyAlerts] = useState(false);

  async function impersonate(a: OpsAffiliate) {
    setBusyId(a.id);
    setError(null);
    try {
      const res = await fetch(`/api/ops/impersonate/${a.id}`, { method: 'POST' });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error?.message ?? 'No se pudo entrar como soporte.');
      }
      router.push(`/space/${a.slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
      setBusyId(null);
    }
  }

  async function endSupportMode() {
    setError(null);
    try {
      await fetch('/api/ops/impersonate', { method: 'DELETE' });
    } catch {
      // silencioso — es una limpieza best-effort
    }
  }

  const visible = onlyAlerts ? affiliates.filter((a) => a.alerts.length > 0) : affiliates;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
              MaalCa · Plataforma
            </p>
            <h1 className="mt-1 text-2xl font-bold">Panel de operaciones</h1>
          </div>
          <button
            onClick={endSupportMode}
            className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-500"
            title="Termina cualquier sesión de soporte activa en otro negocio"
          >
            Salir de modo soporte
          </button>
        </div>

        {overview && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Kpi label="Negocios" value={String(overview.totalAffiliates)} />
            <Kpi label="Emprendedor" value={String(overview.entrepreneurCount)} />
            <Kpi label="Gratis" value={String(overview.freeCount)} />
            <Kpi label="MRR" value={`$${overview.mrrUsd.toLocaleString()}`} />
            <Kpi label="Nuevos este mes" value={String(overview.newThisMonth)} />
            <Kpi label="Publicados" value={String(overview.publishedCount)} />
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Negocios</h2>
          <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-400">
            <input type="checkbox" checked={onlyAlerts} onChange={(e) => setOnlyAlerts(e.target.checked)} />
            Solo con alertas
          </label>
        </div>

        <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-neutral-800 text-left text-xs uppercase tracking-wide text-gray-400 dark:text-neutral-500">
                <th className="px-4 py-3">Negocio</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Pedidos 30d</th>
                <th className="px-4 py-3">Alertas</th>
                <th className="px-4 py-3">Creado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {visible.map((a) => (
                <tr key={a.id} className="border-b border-gray-100 dark:border-neutral-800/60 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{a.name}</p>
                    <p className="text-xs text-gray-400 dark:text-neutral-500">/{a.slug} · {a.businessType}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.plan === 'Entrepreneur'
                          ? 'bg-[#C8102E]/10 text-[#C8102E]'
                          : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400'
                      }`}
                    >
                      {a.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{a.ordersLast30Days}</td>
                  <td className="px-4 py-3">
                    {a.alerts.length === 0 ? (
                      <span className="text-xs text-gray-300 dark:text-neutral-600">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {a.alerts.map((alert) => (
                          <span
                            key={alert}
                            className="inline-block rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 text-[11px] font-medium text-yellow-700 dark:text-yellow-400"
                          >
                            {alert}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 dark:text-neutral-500">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => impersonate(a)}
                      disabled={busyId === a.id}
                      className="rounded-full bg-[#C8102E] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                    >
                      {busyId === a.id ? 'Entrando…' : 'Entrar como soporte'}
                    </button>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400 dark:text-neutral-500">
                    Nada que mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-gray-400 dark:text-neutral-500">
          Entrar como soporte da acceso completo (nivel Owner) al negocio por 2 horas y queda
          registrado en la auditoría interna.
        </p>
      </div>
    </div>
  );
}
