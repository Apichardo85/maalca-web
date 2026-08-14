'use client';

import { useState } from 'react';
import { useOpsCanManage } from '../OpsRoleContext';
import type { OpsTeamMember } from '../types';

export function TeamSection({ initialTeam }: { initialTeam: OpsTeamMember[] }) {
  const canManage = useOpsCanManage();
  const [team, setTeam] = useState(initialTeam);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Owner' | 'Support'>('Support');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function invite() {
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/ops/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudo invitar.');
      setTeam((prev) => [...prev, data]);
      setEmail('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(memberId: string, newRole: 'Owner' | 'Support') {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/ops/team/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudo cambiar el rol.');
      setTeam((prev) => prev.map((m) => (m.id === memberId ? data : m)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(memberId: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/ops/team/${memberId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? 'No se pudo quitar.');
      }
      setTeam((prev) => prev.filter((m) => m.id !== memberId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Equipo interno de MaalCa</h2>
      <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
        Owner: control total. Support: mismo acceso de lectura + soporte, sin acciones destructivas.
      </p>

      {error && (
        <p className="mt-2 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {canManage && (
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            className="rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5 text-xs"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'Owner' | 'Support')}
            className="rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5 text-xs"
          >
            <option value="Support">Support</option>
            <option value="Owner">Owner</option>
          </select>
          <button
            onClick={invite}
            disabled={busy || !email.trim()}
            className="rounded-md bg-[#C8102E] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            Invitar
          </button>
        </div>
      )}

      <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-neutral-800 text-left text-xs uppercase tracking-wide text-gray-400 dark:text-neutral-500">
              <th className="px-4 py-2">Correo</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {team.map((m) => (
              <tr key={m.id} className="border-b border-gray-100 dark:border-neutral-800/60 last:border-0">
                <td className="px-4 py-2">{m.email}</td>
                <td className="px-4 py-2">
                  {canManage ? (
                    <select
                      value={m.role}
                      onChange={(e) => changeRole(m.id, e.target.value as 'Owner' | 'Support')}
                      disabled={busy}
                      className="rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 text-xs"
                    >
                      <option value="Support">Support</option>
                      <option value="Owner">Owner</option>
                    </select>
                  ) : (
                    m.role
                  )}
                </td>
                <td className="px-4 py-2 text-xs text-gray-400 dark:text-neutral-500">
                  {m.pending ? 'Invitación pendiente' : 'Activo'}
                </td>
                <td className="px-4 py-2 text-right">
                  {canManage && (
                    <button
                      onClick={() => remove(m.id)}
                      disabled={busy}
                      className="text-xs font-medium text-gray-400 hover:text-red-500 disabled:opacity-50"
                    >
                      Quitar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {team.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-xs text-gray-400 dark:text-neutral-500">
                  Sin miembros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
