'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOpsCanManage } from '../OpsRoleContext';
import type { OpsAffiliate } from '../types';

export function NegociosTable({ initialAffiliates }: { initialAffiliates: OpsAffiliate[] }) {
  const router = useRouter();
  const canManage = useOpsCanManage();
  const [affiliates, setAffiliates] = useState(initialAffiliates);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onlyAlerts, setOnlyAlerts] = useState(false);

  async function setStatus(a: OpsAffiliate, patch: { published?: boolean; active?: boolean }) {
    setBusyId(a.id);
    setError(null);
    try {
      const res = await fetch(`/api/ops/affiliates/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudo actualizar el negocio.');
      setAffiliates((prev) => prev.map((x) => (x.id === a.id ? data : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
    } finally {
      setBusyId(null);
    }
  }

  async function impersonate(a: OpsAffiliate) {
    setBusyId(a.id);
    setError(null);
    try {
      const res = await fetch(`/api/ops/impersonate/${a.id}`, { method: 'POST' });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudo entrar como soporte.');
      router.push(`/space/${a.slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
      setBusyId(null);
    }
  }

  const visible = onlyAlerts ? affiliates.filter((a) => a.alerts.length > 0) : affiliates;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Negocios</h2>
        <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-400">
          <input type="checkbox" checked={onlyAlerts} onChange={(e) => setOnlyAlerts(e.target.checked)} />
          Solo con alertas
        </label>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-neutral-800 text-left text-xs uppercase tracking-wide text-gray-400 dark:text-neutral-500">
              <th className="px-4 py-3">Negocio</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Pedidos 30d</th>
              <th className="px-4 py-3">Alertas</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {visible.map((a) => (
              <tr key={a.id} className="border-b border-gray-100 dark:border-neutral-800/60 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/ops/negocios/${a.id}`} className="font-medium hover:underline">
                    {a.name}
                  </Link>
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
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <Link
                      href={`/ops/negocios/${a.id}`}
                      className="rounded-full border border-gray-300 dark:border-neutral-700 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-neutral-300 hover:border-gray-400"
                    >
                      Detalle
                    </Link>
                    {canManage && (
                      <>
                        <button
                          onClick={() => setStatus(a, { published: !a.published })}
                          disabled={busyId === a.id}
                          className="rounded-full border border-gray-300 dark:border-neutral-700 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-neutral-300 hover:border-gray-400 disabled:opacity-50"
                        >
                          {a.published ? 'Despublicar' : 'Publicar'}
                        </button>
                        <button
                          onClick={() => setStatus(a, { active: !a.isActive })}
                          disabled={busyId === a.id}
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${
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
                      onClick={() => impersonate(a)}
                      disabled={busyId === a.id}
                      className="rounded-full bg-[#C8102E] px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                    >
                      {busyId === a.id ? '…' : 'Soporte'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400 dark:text-neutral-500">
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
  );
}
