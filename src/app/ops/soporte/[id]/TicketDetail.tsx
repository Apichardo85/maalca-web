'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useOpsCanManage } from '../../OpsRoleContext';
import type { OpsTeamMember } from '../../types';
import { dueLabel } from '../SupportInbox';
import { ChangeHistoryList, type ChangeSet } from '@/components/space/support/ChangeHistoryList';
import {
  OPS_STATUS_LABELS,
  PLAN_LABELS,
  PRIORITY_LABELS,
  STATUS_STYLES,
  apiErrorMessage,
  type SupportPriority,
  type SupportStatus,
  type SupportTicketDetail,
} from '@/lib/support/types';

const STATUS_ACTIONS: { status: SupportStatus; label: string }[] = [
  { status: 'in_progress', label: 'En curso' },
  { status: 'waiting_customer', label: 'Esperar al cliente' },
  { status: 'resolved', label: 'Resuelta' },
];

export function TicketDetail({ id }: { id: string }) {
  const router = useRouter();
  const isOwner = useOpsCanManage();
  const [detail, setDetail] = useState<SupportTicketDetail | null>(null);
  const [team, setTeam] = useState<OpsTeamMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState('');
  const [internal, setInternal] = useState(false);
  const [weight, setWeight] = useState<number | ''>('');
  const [entering, setEntering] = useState(false);

  const base = `/api/ops/support/tickets/${id}`;

  const load = useCallback(async () => {
    const res = await fetch(base, { cache: 'no-store' });
    const data = await res.json().catch(() => null);
    if (!res.ok) { setError(apiErrorMessage(data, 'No se encontró la solicitud.')); return; }
    setDetail(data);
    setWeight(data.ticket.weight);
  }, [base]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetch('/api/ops/team', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : [])).then((t: OpsTeamMember[]) => setTeam(t.filter((m) => !m.pending))).catch(() => {});
  }, []);

  async function act(path: string, body?: unknown): Promise<boolean> {
    if (busy) return false;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body ?? {}),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) { setError(apiErrorMessage(data, res.status === 403 ? 'Esto lo aprueba el Owner.' : 'No se pudo guardar.')); return false; }
      setDetail(data);
      setWeight(data.ticket.weight);
      return true;
    } catch {
      setError('Revisa tu conexión.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  /** Entra al espacio del negocio en modo soporte, directo a la pantalla desde donde se pidió. */
  async function enterSpace() {
    if (!detail?.ticket.affiliateSlug) return;
    setEntering(true);
    setError(null);
    try {
      // ?ticketId: lo que se cambie en esta sesión queda ligado a la solicitud (historial y revertir).
      const res = await fetch(`/api/ops/impersonate/${detail.ticket.affiliateId}?ticketId=${detail.ticket.id}`, { method: 'POST' });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(apiErrorMessage(data, 'No se pudo entrar como soporte.'));
      const slug = detail.ticket.affiliateSlug;
      const path = detail.contextPath && detail.contextPath.startsWith(`/space/${slug}`) ? detail.contextPath : `/space/${slug}`;
      router.push(path);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
      setEntering(false);
    }
  }

  if (error && !detail) return <p className="text-sm text-red-600">{error}</p>;
  if (!detail) return <p className="text-sm text-gray-500">Cargando…</p>;

  const t = detail.ticket;
  const u = detail.usage;
  const due = dueLabel(t);
  const card = 'rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900';
  const field = 'rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100';

  return (
    <div className="space-y-4">
      <Link href="/ops/soporte" className="text-sm text-gray-500 hover:text-gray-800 dark:text-neutral-400">← Bandeja</Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            #{t.number} · <Link href={`/ops/negocios/${t.affiliateId}`} className="font-medium text-gray-700 hover:underline dark:text-neutral-200">{t.affiliateName}</Link> · {t.typeNameEs} · vía {t.channel}
          </p>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">{t.subject}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full px-2 py-0.5 font-medium ${STATUS_STYLES[t.status]}`}>{OPS_STATUS_LABELS[t.status]}</span>
            {due && <span className={due.overdue ? 'font-medium text-red-600' : 'text-gray-500 dark:text-neutral-400'}>{due.text}</span>}
          </div>
        </div>
        <button
          type="button"
          onClick={enterSpace}
          disabled={entering || !t.affiliateSlug}
          className="rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-hover disabled:opacity-50"
          title={detail.contextPath ?? undefined}
        >
          {entering ? 'Entrando…' : 'Entrar como soporte'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Conversación */}
        <div className="space-y-3">
          <div className={card}>
            <p className="whitespace-pre-wrap text-sm text-gray-900 dark:text-neutral-100">{detail.description}</p>
            <p className="mt-2 text-xs text-gray-500 dark:text-neutral-400">
              {detail.requestedByEmail ?? 'Registrada por soporte'} · {new Date(t.createdAt).toLocaleString('es-DO')}
              {detail.contextPath && <> · desde <code className="rounded bg-gray-100 px-1 dark:bg-neutral-800">{detail.contextPath}</code></>}
            </p>
          </div>

          {detail.messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl p-3 text-sm ${
                m.authorKind === 'system'
                  ? 'border border-dashed border-gray-200 text-xs text-gray-500 dark:border-neutral-800 dark:text-neutral-400'
                  : m.internal
                    ? 'border border-amber-200 bg-amber-50 text-gray-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-neutral-100'
                    : m.authorKind === 'staff'
                      ? 'ml-8 bg-blue-50 text-gray-900 dark:bg-blue-500/10 dark:text-neutral-100'
                      : 'mr-8 border border-gray-200 bg-white text-gray-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.body}</p>
              {m.authorKind !== 'system' && (
                <p className="mt-1 text-[11px] text-gray-500 dark:text-neutral-400">
                  {m.internal ? 'Nota interna · ' : ''}{m.authorEmail ?? ''} · {new Date(m.createdAt).toLocaleString('es-DO')}
                </p>
              )}
            </div>
          ))}

          {t.status !== 'cancelled' && (
            <form
              className={`${card} space-y-2`}
              onSubmit={async (e) => {
                e.preventDefault();
                if (!reply.trim()) return;
                if (await act('/messages', { body: reply, internal })) { setReply(''); setInternal(false); }
              }}
            >
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                maxLength={4000}
                placeholder={internal ? 'Nota para el equipo (el negocio no la ve)…' : 'Respuesta al negocio…'}
                className={`min-h-[90px] w-full rounded-lg border px-3 py-2 text-sm text-gray-900 dark:text-neutral-100 ${internal ? 'border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10' : 'border-gray-300 bg-white dark:border-neutral-700 dark:bg-neutral-900'}`}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-neutral-300">
                  <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />
                  Nota interna
                </label>
                <button type="submit" disabled={busy || !reply.trim()} className="rounded-full bg-brand-primary px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50">
                  {internal ? 'Guardar nota' : 'Responder'}
                </button>
              </div>
            </form>
          )}
          <TicketChanges ticketId={t.id} affiliateId={t.affiliateId} onReverted={load} />
        </div>

        {/* Panel lateral */}
        <aside className="space-y-3">
          <div className={`${card} space-y-2`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-neutral-400">Estado</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_ACTIONS.filter((a) => a.status !== t.status).map((a) => (
                <button key={a.status} type="button" disabled={busy} onClick={() => act('/status', { status: a.status })} className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:border-gray-400 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300">
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className={`${card} space-y-2`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-neutral-400">Asignada a</p>
            <select
              className={`${field} w-full`}
              value={t.assignedAdminId ?? ''}
              disabled={busy}
              onChange={(e) => act('/assign', { adminId: e.target.value || null })}
            >
              <option value="">Sin asignar</option>
              {team.map((m) => <option key={m.id} value={m.id}>{m.email}</option>)}
            </select>
            <button type="button" disabled={busy} onClick={() => act('/assign', { toMe: true })} className="text-xs font-medium text-brand-primary hover:underline">
              Asignármela
            </button>
          </div>

          <div className={`${card} space-y-2`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-neutral-400">Prioridad y peso</p>
            <select className={`${field} w-full`} value={t.priority} disabled={busy} onChange={(e) => act('/priority', { priority: e.target.value as SupportPriority })}>
              {(Object.keys(PRIORITY_LABELS) as SupportPriority[]).map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
            </select>
            {t.isQuote ? (
              <p className="text-xs text-gray-500 dark:text-neutral-400">Funcionalidad nueva: no lleva puntos, se cotiza aparte.</p>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <input type="number" min={0} max={100} className={`${field} w-20`} value={weight} onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))} />
                  <span className="text-xs text-gray-500">puntos</span>
                  <button
                    type="button"
                    disabled={busy || weight === '' || weight === t.weight}
                    onClick={() => act('/weight', { weight })}
                    className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300"
                  >
                    Guardar
                  </button>
                </div>
                {!isOwner && <p className="text-[11px] text-gray-500 dark:text-neutral-400">Subir el peso es directo; bajarlo lo aprueba el Owner.</p>}
              </>
            )}
            {t.proposedWeight !== null && (
              <div className="rounded-lg bg-amber-50 p-2 text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-300">
                {detail.proposedWeightBy ?? 'Soporte'} propone bajar a <strong>{t.proposedWeight}</strong> pts.
                {isOwner && (
                  <div className="mt-1.5 flex gap-2">
                    <button type="button" disabled={busy} onClick={() => act('/weight/approve')} className="rounded-full bg-amber-600 px-3 py-1 font-medium text-white">Aprobar</button>
                    <button type="button" disabled={busy} onClick={() => act('/weight/reject')} className="rounded-full border border-amber-400 px-3 py-1 font-medium">Rechazar</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={`${card} space-y-1`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-neutral-400">Consumo del negocio ({u.period})</p>
            <p className="text-sm text-gray-900 dark:text-neutral-100">
              <strong>{u.usedPoints}</strong> de {u.monthlyPoints} puntos · {PLAN_LABELS[u.plan]}{u.hasAddOn ? ' + add-on' : ''}
            </p>
            <p className="text-xs text-gray-500 dark:text-neutral-400">Respuesta comprometida: {u.responseHours} h</p>
            {t.overQuota && (
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Entró pasado el tope: ofrécele un punto extra o el add-on de soporte.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * Cambios hechos en el espacio del negocio desde esta solicitud (modo soporte abierto con "Entrar como
 * soporte"), con revertir. "Todo el negocio" muestra el historial completo, de cualquiera.
 */
function TicketChanges({ ticketId, affiliateId, onReverted }: { ticketId: string; affiliateId: string; onReverted: () => void }) {
  const [scope, setScope] = useState<'ticket' | 'affiliate'>('ticket');
  const [sets, setSets] = useState<ChangeSet[] | null>(null);

  const load = useCallback(async () => {
    const url = scope === 'ticket' ? `/api/ops/support/tickets/${ticketId}/changes` : `/api/ops/changes?affiliateId=${affiliateId}&take=30`;
    const res = await fetch(url, { cache: 'no-store' });
    setSets(res.ok ? await res.json() : []);
  }, [scope, ticketId, affiliateId]);

  useEffect(() => { load(); }, [load]);

  return (
    <section className="space-y-2 pt-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">Cambios en el espacio</h2>
        <div className="flex gap-1 text-xs">
          {(['ticket', 'affiliate'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setScope(k)}
              className={`rounded-full px-2.5 py-1 font-medium ${scope === k ? 'bg-gray-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'text-gray-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800'}`}
            >
              {k === 'ticket' ? 'De esta solicitud' : 'Todo el negocio'}
            </button>
          ))}
        </div>
      </div>
      {sets === null ? (
        <p className="text-xs text-gray-500">Cargando…</p>
      ) : (
        <ChangeHistoryList
          sets={sets}
          canRevert
          showTicket={scope === 'affiliate'}
          revertUrl={(id) => `/api/ops/changes/${id}/revert`}
          onReverted={() => { load(); onReverted(); }}
        />
      )}
      {scope === 'ticket' && sets?.length === 0 && (
        <p className="text-[11px] text-gray-500 dark:text-neutral-400">Los cambios quedan ligados aquí cuando entras con &quot;Entrar como soporte&quot; desde esta solicitud.</p>
      )}
    </section>
  );
}
