'use client';

import { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OpsAssistant } from './OpsAssistant';

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
  isActive: boolean;
  createdAt: string;
  ordersLast30Days: number;
  stripeConnectChargesEnabled: boolean;
  alerts: string[];
}

export interface OpsTeamMember {
  id: string;
  email: string;
  role: 'Owner' | 'Support';
  pending: boolean;
  createdAt: string;
}

interface OpsNote {
  id: string;
  authorEmail: string;
  text: string;
  createdAt: string;
}

interface Props {
  overview: OpsOverview | null;
  initialAffiliates: OpsAffiliate[];
  initialTeam: OpsTeamMember[];
  role: 'Owner' | 'Support' | null;
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function NotesPanel({ affiliateId }: { affiliateId: string }) {
  const [notes, setNotes] = useState<OpsNote[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/ops/affiliates/${affiliateId}/notes`);
      const data = await res.json().catch(() => []);
      setNotes(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  async function addNote() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/ops/affiliates/${affiliateId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        setNotes((prev) => [data, ...(prev ?? [])]);
        setText('');
      }
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [affiliateId]);

  return (
    <div className="mt-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 p-3">
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nueva nota…"
          className="flex-1 rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 text-xs"
          onKeyDown={(e) => e.key === 'Enter' && addNote()}
        />
        <button
          onClick={addNote}
          disabled={saving || !text.trim()}
          className="rounded-md bg-[#C8102E] px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          Agregar
        </button>
      </div>
      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
        {loading && <p className="text-xs text-gray-400">Cargando…</p>}
        {notes?.length === 0 && !loading && (
          <p className="text-xs text-gray-400 dark:text-neutral-500">Sin notas todavía.</p>
        )}
        {notes?.map((n) => (
          <div key={n.id} className="text-xs">
            <p className="text-gray-700 dark:text-neutral-200">{n.text}</p>
            <p className="mt-0.5 text-gray-400 dark:text-neutral-500">
              {n.authorEmail} · {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamSection({ initialTeam, canManage }: { initialTeam: OpsTeamMember[]; canManage: boolean }) {
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
    <div className="mt-10">
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

export function OpsContent({ overview, initialAffiliates, initialTeam, role }: Props) {
  const router = useRouter();
  const [affiliates, setAffiliates] = useState(initialAffiliates);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onlyAlerts, setOnlyAlerts] = useState(false);
  const [notesOpenFor, setNotesOpenFor] = useState<string | null>(null);
  const canManage = role === 'Owner';

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
      if (!res.ok) {
        throw new Error(data?.error?.message ?? 'No se pudo actualizar el negocio.');
      }
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
              MaalCa · Plataforma {role && `· ${role}`}
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
                <Fragment key={a.id}>
                  <tr className="border-b border-gray-100 dark:border-neutral-800/60 last:border-0">
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
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <button
                          onClick={() => setNotesOpenFor(notesOpenFor === a.id ? null : a.id)}
                          className="rounded-full border border-gray-300 dark:border-neutral-700 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-neutral-300 hover:border-gray-400"
                        >
                          Notas
                        </button>
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
                  {notesOpenFor === a.id && (
                    <tr className="border-b border-gray-100 dark:border-neutral-800/60 last:border-0">
                      <td colSpan={6} className="px-4 pb-3">
                        <NotesPanel affiliateId={a.id} />
                      </td>
                    </tr>
                  )}
                </Fragment>
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

        <TeamSection initialTeam={initialTeam} canManage={canManage} />

        <OpsAssistant />
      </div>
    </div>
  );
}
