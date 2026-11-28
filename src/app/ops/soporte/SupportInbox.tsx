'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useOpsCanManage } from '../OpsRoleContext';
import type { OpsAffiliate } from '../types';
import { useAdminPush } from '@/lib/support/useAdminPush';
import {
  IMPACT_DOT,
  IMPACT_LABELS,
  OPS_STATUS_LABELS,
  PRIORITY_LABELS,
  STATUS_STYLES,
  apiErrorMessage,
  type SupportOpsList,
  type SupportRequestType,
  type SupportTicketSummary,
} from '@/lib/support/types';

type Filter = 'open' | 'mine' | 'unassigned' | 'escalated' | 'waiting_customer' | 'resolved' | 'pending_weight' | 'all';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'open', label: 'Abiertas' },
  { key: 'mine', label: 'Mías' },
  { key: 'unassigned', label: 'Sin asignar' },
  { key: 'escalated', label: 'Escaladas' },
  { key: 'waiting_customer', label: 'Esperando al cliente' },
  { key: 'pending_weight', label: 'Peso por aprobar' },
  { key: 'resolved', label: 'Resueltas' },
  { key: 'all', label: 'Todas' },
];

export function SupportInbox() {
  const canManage = useOpsCanManage();
  const push = useAdminPush();
  const [filter, setFilter] = useState<Filter>('open');
  const [data, setData] = useState<SupportOpsList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    const qs = new URLSearchParams();
    if (filter === 'mine') { qs.set('mine', 'true'); qs.set('status', 'open'); }
    else if (filter === 'unassigned') qs.set('status', 'open');
    else qs.set('status', filter);
    try {
      const res = await fetch(`/api/ops/support/tickets?${qs}`, { cache: 'no-store' });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(apiErrorMessage(json, 'No se pudo cargar la bandeja.'));
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la bandeja.');
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);
  // La bandeja se refresca sola cada minuto mientras está abierta.
  useEffect(() => {
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  const items = (data?.items ?? []).filter((t) => (filter === 'unassigned' ? !t.assignedAdminId : true));
  const c = data?.counts;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100">Soporte</h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400">Solicitudes de los negocios. Lo que vence primero va arriba.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PushToggle push={push} />
          <Link href="/ops/soporte/impacto" className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-400 dark:border-neutral-700 dark:text-neutral-300">
            Mapa de impacto
          </Link>
          {canManage && (
            <Link href="/ops/soporte/config" className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-400 dark:border-neutral-700 dark:text-neutral-300">
              Tipos y topes
            </Link>
          )}
          <button type="button" onClick={() => setShowNew(true)} className="rounded-full bg-brand-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-primary-hover">
            Registrar solicitud
          </button>
        </div>
      </div>

      {c && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Nuevas" value={c.new} />
          <Stat label="Sin asignar" value={c.unassigned} />
          <Stat label="Vencidas" value={c.overdue} tone={c.overdue > 0 ? 'bad' : undefined} />
          <Stat label={c.escalated > 0 ? 'Escaladas' : 'Mías'} value={c.escalated > 0 ? c.escalated : c.mine} tone={c.escalated > 0 ? 'bad' : undefined} />
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto pb-1">
        {FILTERS.filter((f) => f.key !== 'pending_weight' || (c?.pendingWeight ?? 0) > 0 || filter === 'pending_weight').map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
              filter === f.key ? 'bg-gray-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'text-gray-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
            }`}
          >
            {f.label}
            {f.key === 'pending_weight' && c ? ` (${c.pendingWeight})` : ''}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!data && !error && <p className="text-sm text-gray-500">Cargando…</p>}

      {data && items.length === 0 && (
        <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-neutral-700 dark:text-neutral-400">
          Nada por aquí.
        </p>
      )}

      {items.length > 0 && (
        <ul className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
          {items.map((t) => <TicketRow key={t.id} t={t} />)}
        </ul>
      )}

      {showNew && <NewTicketModal onClose={() => setShowNew(false)} />}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'bad' }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-xs text-gray-500 dark:text-neutral-400">{label}</p>
      <p className={`text-xl font-semibold ${tone === 'bad' ? 'text-red-600' : 'text-gray-900 dark:text-neutral-100'}`}>{value}</p>
    </div>
  );
}

export function dueLabel(t: Pick<SupportTicketSummary, 'dueAt' | 'status' | 'overQuota'>): { text: string; overdue: boolean } | null {
  if (t.status === 'resolved' || t.status === 'cancelled') return null;
  if (!t.dueAt) return { text: t.overQuota ? 'Sin tiempo garantizado (pasó el tope)' : 'Sin vencimiento', overdue: false };
  const ms = new Date(t.dueAt).getTime() - Date.now();
  const h = Math.round(Math.abs(ms) / 3_600_000);
  const span = h >= 48 ? `${Math.round(h / 24)} d` : `${h} h`;
  return ms < 0 ? { text: `Vencida hace ${span}`, overdue: t.status !== 'waiting_customer' } : { text: `Vence en ${span}`, overdue: false };
}

function TicketRow({ t }: { t: SupportTicketSummary }) {
  const due = dueLabel(t);
  return (
    <li>
      <Link href={`/ops/soporte/${t.id}`} className="flex flex-col gap-1 px-4 py-3 hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4 dark:hover:bg-neutral-800/60">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${IMPACT_DOT[t.typeImpactLevel ?? 'green']}`} title={`Impacto ${IMPACT_LABELS[t.typeImpactLevel ?? 'green'].es}`} />
            {t.escalated && <span className="mr-1.5 font-semibold text-red-600">ESCALADA</span>}
            #{t.number} · <span className="font-medium text-gray-700 dark:text-neutral-200">{t.affiliateName}</span> · {t.typeNameEs}
            {t.channel !== 'panel' ? ` · ${t.channel}` : ''}
          </p>
          <p className="truncate text-sm font-medium text-gray-900 dark:text-neutral-100">{t.subject}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full px-2 py-0.5 font-medium ${STATUS_STYLES[t.status]}`}>{OPS_STATUS_LABELS[t.status]}</span>
          {t.priority !== 'normal' && (
            <span className={`rounded-full px-2 py-0.5 font-medium ${t.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300' : 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400'}`}>
              {PRIORITY_LABELS[t.priority]}
            </span>
          )}
          <span className="text-gray-500 dark:text-neutral-400">{t.isQuote ? 'Cotizar' : `${t.weight} pts`}</span>
          {t.proposedWeight !== null && <span className="text-amber-600">→ {t.proposedWeight} pts?</span>}
          {due && <span className={due.overdue ? 'font-medium text-red-600' : 'text-gray-500 dark:text-neutral-400'}>{due.text}</span>}
          <span className="text-gray-500 dark:text-neutral-400">{t.assignedAdminEmail ? t.assignedAdminEmail.split('@')[0] : 'Sin asignar'}</span>
        </div>
      </Link>
    </li>
  );
}

function PushToggle({ push }: { push: ReturnType<typeof useAdminPush> }) {
  if (push.state === 'unsupported') return null;
  if (push.state === 'blocked') return <span className="text-xs text-gray-500">Avisos bloqueados en este navegador</span>;
  return push.state === 'on' ? (
    <button type="button" onClick={push.disable} className="rounded-full border border-green-300 px-3 py-1.5 text-xs font-medium text-green-700 dark:border-green-700 dark:text-green-400">
      🔔 Avisos activos
    </button>
  ) : (
    <button type="button" onClick={push.enable} className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-400 dark:border-neutral-700 dark:text-neutral-300">
      🔕 Activar avisos aquí
    </button>
  );
}

/** Registrar a mano una solicitud que llegó por otro lado (llamada, WhatsApp, correo, en persona). */
function NewTicketModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [affiliates, setAffiliates] = useState<OpsAffiliate[]>([]);
  const [types, setTypes] = useState<SupportRequestType[]>([]);
  const [affiliateId, setAffiliateId] = useState('');
  const [typeKey, setTypeKey] = useState('');
  const [channel, setChannel] = useState('whatsapp');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/ops/affiliates', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : [])).then((a: OpsAffiliate[]) => setAffiliates([...a].sort((x, y) => x.name.localeCompare(y.name)))).catch(() => {});
    fetch('/api/ops/support/catalog', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((c) => setTypes((c?.types ?? []).filter((t: SupportRequestType) => t.active))).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/ops/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateId, typeKey, channel, subject, description }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(apiErrorMessage(data, 'No se pudo registrar.'));
      router.push(`/ops/soporte/${data.ticket.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar.');
      setBusy(false);
    }
  }

  const field = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg space-y-3 rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">Registrar solicitud</h2>
        <p className="text-xs text-gray-500 dark:text-neutral-400">Para lo que llegó por llamada, WhatsApp o correo. Cuenta puntos igual que si el negocio la hubiera pedido en su panel, y queda asignada a ti.</p>
        <select className={field} value={affiliateId} onChange={(e) => setAffiliateId(e.target.value)} required>
          <option value="">Negocio…</option>
          {affiliates.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <select className={field} value={typeKey} onChange={(e) => setTypeKey(e.target.value)} required>
            <option value="">Tipo…</option>
            {types.map((t) => <option key={t.key} value={t.key}>{t.nameEs} ({t.isQuote ? 'cotizar' : `${t.weight} pts`})</option>)}
          </select>
          <select className={field} value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Correo</option>
            <option value="ops">Llamada / en persona</option>
          </select>
        </div>
        <input className={field} value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} placeholder="Resumen" required />
        <textarea className={`${field} min-h-[100px]`} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={4000} placeholder="Qué pidió el cliente" required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm text-gray-600 dark:text-neutral-300">Cancelar</button>
          <button type="submit" disabled={busy} className="rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{busy ? 'Guardando…' : 'Registrar'}</button>
        </div>
      </form>
    </div>
  );
}
