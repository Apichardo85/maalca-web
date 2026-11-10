'use client';

// src/app/space/[slug]/vehicles/leads/LeadsContent.tsx
// Dealer: interesados que llegan de la vitrina (financiamiento, vendo mi carro, prueba de manejo, consulta).
// El dueno los atiende aca: cambia el estado, deja notas internas y contacta por WhatsApp/llamada/correo.
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { formatPrice } from '@/lib/currency';
import type { Currency } from '@/lib/dealer';
import type { LeadKind, LeadStatus, VehicleLead } from '../types';

interface Props {
  slug: string;
  currency: Currency;
  initialLeads: VehicleLead[];
}

const inputClass =
  'w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm';
const cardClass =
  'rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4';
const secondaryBtn =
  'rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-neutral-300';

const KIND_LABELS: Record<LeadKind, { es: string; en: string }> = {
  financing: { es: 'Financiamiento', en: 'Financing' },
  tradein: { es: 'Vendo mi carro', en: 'Trade-in' },
  testdrive: { es: 'Prueba de manejo', en: 'Test drive' },
  inquiry: { es: 'Consulta', en: 'Inquiry' },
};
const STATUS_LABELS: Record<LeadStatus, { es: string; en: string }> = {
  new: { es: 'Nuevo', en: 'New' },
  contacted: { es: 'Contactado', en: 'Contacted' },
  won: { es: 'Vendido', en: 'Won' },
  lost: { es: 'Perdido', en: 'Lost' },
};
const CONDITION_LABELS: Record<string, { es: string; en: string }> = {
  excellent: { es: 'Excelente', en: 'Excellent' },
  good: { es: 'Bueno', en: 'Good' },
  fair: { es: 'Regular', en: 'Fair' },
  poor: { es: 'Necesita trabajo', en: 'Needs work' },
};
const STATUSES = Object.keys(STATUS_LABELS) as LeadStatus[];
const KINDS = Object.keys(KIND_LABELS) as LeadKind[];

async function api<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; data: T | null; error?: string }> {
  try {
    const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
    if (res.status === 204) return { ok: true, data: null };
    const data = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, data: null, error: data?.error?.message ?? data?.message ?? `HTTP ${res.status}` };
    return { ok: true, data };
  } catch {
    return { ok: false, data: null, error: 'network' };
  }
}

function waLink(phone: string): string {
  const d = phone.replace(/\D/g, '');
  return `https://wa.me/${d.length === 10 ? `1${d}` : d}`;
}

export function LeadsContent({ slug, currency, initialLeads }: Props) {
  const { language } = useSimpleLanguage();
  const lang = language === 'es' ? 'es' : 'en';
  const t = (es: string, en: string) => (lang === 'es' ? es : en);
  const toast = useToast();
  const base = `/api/space/${slug}/dealer-leads`;

  const [leads, setLeads] = useState<VehicleLead[]>(initialLeads);
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [kindFilter, setKindFilter] = useState<'all' | LeadKind>('all');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const shown = useMemo(
    () => leads.filter((l) => (statusFilter === 'all' || l.status === statusFilter) && (kindFilter === 'all' || l.kind === kindFilter)),
    [leads, statusFilter, kindFilter],
  );
  const countStatus = (s: LeadStatus) => leads.filter((l) => l.status === s).length;

  const money = (n: number, c?: string | null) =>
    formatPrice(Math.round(n), c === 'DOP' ? 'DOP' : c === 'USD' ? 'USD' : currency).replace(/\.00$/, '');

  async function save(lead: VehicleLead, status: LeadStatus, internalNotes: string | null) {
    setBusyId(lead.id);
    const res = await api<VehicleLead>(`${base}/${lead.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, internalNotes }),
    });
    setBusyId(null);
    if (!res.ok || !res.data) {
      toast.error(res.error && res.error !== 'network' ? res.error : t('No se pudo guardar.', 'Could not save.'));
      return;
    }
    const saved = res.data;
    setLeads((prev) => prev.map((l) => (l.id === saved.id ? saved : l)));
    setNotes((n) => { const rest = { ...n }; delete rest[lead.id]; return rest; });
    toast.success(t('Guardado.', 'Saved.'));
  }

  async function remove(lead: VehicleLead) {
    setBusyId(lead.id);
    const res = await api(`${base}/${lead.id}`, { method: 'DELETE' });
    setBusyId(null);
    setConfirmDeleteId(null);
    if (!res.ok) {
      toast.error(t('No se pudo eliminar.', 'Could not delete.'));
      return;
    }
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    toast.success(t('Eliminado.', 'Deleted.'));
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString(lang === 'es' ? 'es-DO' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />

      <div className="mb-6">
        <Link href={`/space/${slug}/vehicles`} className="text-xs font-medium text-brand-primary hover:underline">
          ← {t('Vehículos', 'Vehicles')}
        </Link>
        <h1 className="mt-1 text-xl font-bold">{t('Interesados', 'Leads')}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
          {t('Personas que pidieron financiamiento, quieren vender su carro, probar un vehículo o dejaron una consulta en tu página.',
            'People who requested financing, want to sell their car, test drive a vehicle or left an inquiry on your page.')}
        </p>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setStatusFilter('all')} aria-pressed={statusFilter === 'all'}
          className={`${secondaryBtn} ${statusFilter === 'all' ? 'border-brand-primary text-brand-primary' : ''}`}>
          {t('Todos', 'All')} ({leads.length})
        </button>
        {STATUSES.map((s) => (
          <button key={s} type="button" onClick={() => setStatusFilter(s)} aria-pressed={statusFilter === s}
            className={`${secondaryBtn} ${statusFilter === s ? 'border-brand-primary text-brand-primary' : ''}`}>
            {STATUS_LABELS[s][lang]} ({countStatus(s)})
          </button>
        ))}
      </div>
      <div className="mb-5">
        <select className={`${inputClass} sm:w-60`} value={kindFilter} aria-label={t('Tipo', 'Type')}
          onChange={(e) => setKindFilter(e.target.value as 'all' | LeadKind)}>
          <option value="all">{t('Todos los tipos', 'All types')}</option>
          {KINDS.map((k) => <option key={k} value={k}>{KIND_LABELS[k][lang]}</option>)}
        </select>
      </div>

      {shown.length === 0 ? (
        <div className={`${cardClass} text-center`}>
          <p className="text-sm font-semibold">{leads.length === 0 ? t('Aún no hay interesados', 'No leads yet') : t('Ninguno con ese filtro', 'None match this filter')}</p>
          {leads.length === 0 && (
            <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
              {t('Activa financiamiento, "vendo mi carro" o pruebas de manejo en la configuración de la vitrina.',
                'Turn on financing, trade-in or test drives in the storefront settings.')}
            </p>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((l) => {
            const noteValue = notes[l.id] ?? l.internalNotes ?? '';
            const notesChanged = noteValue !== (l.internalNotes ?? '');
            return (
              <li key={l.id} className={cardClass}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">
                        {KIND_LABELS[l.kind]?.[lang] ?? l.kind}
                      </span>
                      {l.status === 'new' && (
                        <span className="rounded-full bg-brand-primary px-2 py-0.5 text-[11px] font-bold text-white">{t('Nuevo', 'New')}</span>
                      )}
                    </div>
                    <p className="mt-1 text-base font-semibold">{l.name}</p>
                    {l.vehicleSummary && <p className="text-sm text-gray-500 dark:text-neutral-400">{l.vehicleSummary}</p>}
                  </div>
                  <span className="text-xs text-gray-400 dark:text-neutral-500">{fmtDate(l.createdAt)}</span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {l.phone && (
                    <>
                      <a href={waLink(l.phone)} target="_blank" rel="noopener noreferrer" className={secondaryBtn}>WhatsApp · {l.phone}</a>
                      <a href={`tel:${l.phone}`} className={secondaryBtn}>{t('Llamar', 'Call')}</a>
                    </>
                  )}
                  {l.email && <a href={`mailto:${l.email}`} className={secondaryBtn}>{l.email}</a>}
                </div>

                {l.kind === 'financing' && l.monthlyEstimate != null && (
                  <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm dark:bg-neutral-800/60">
                    {t('Inicial', 'Down payment')}: <strong>{money(l.downPayment ?? 0, l.currency)}</strong> · {l.termMonths} {t('meses', 'months')} ·{' '}
                    {t('Cuota estimada', 'Estimated payment')}: <strong>{money(l.monthlyEstimate, l.currency)}</strong>
                  </p>
                )}
                {l.kind === 'tradein' && (
                  <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm dark:bg-neutral-800/60">
                    <strong>{[l.tradeYear, l.tradeMake, l.tradeModel].filter(Boolean).join(' ')}</strong>
                    {l.tradeMileage != null && <> · {l.tradeMileage.toLocaleString()} {l.tradeMileageUnit ?? 'km'}</>}
                    {l.tradeCondition && <> · {CONDITION_LABELS[l.tradeCondition]?.[lang] ?? l.tradeCondition}</>}
                  </p>
                )}
                {l.kind === 'testdrive' && l.preferredAt && (
                  <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm dark:bg-neutral-800/60">
                    {t('Horario preferido', 'Preferred time')}: <strong>{fmtDate(l.preferredAt)}</strong>
                  </p>
                )}
                {l.message && <p className="mt-2 whitespace-pre-line text-sm text-gray-600 dark:text-neutral-300">“{l.message}”</p>}

                <div className="mt-3 grid gap-2 sm:grid-cols-[170px_1fr]">
                  <select className={inputClass} value={l.status} disabled={busyId === l.id} aria-label={t('Estado', 'Status')}
                    onChange={(e) => save(l, e.target.value as LeadStatus, l.internalNotes ?? null)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s][lang]}</option>)}
                  </select>
                  <textarea className={inputClass} rows={1} maxLength={2000} value={noteValue}
                    placeholder={t('Notas internas (solo tú las ves)', 'Internal notes (only you see them)')}
                    onChange={(e) => setNotes((n) => ({ ...n, [l.id]: e.target.value }))} />
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                  {notesChanged && (
                    <button type="button" disabled={busyId === l.id} onClick={() => save(l, l.status, noteValue.trim() || null)}
                      className="rounded-full bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
                      {t('Guardar nota', 'Save note')}
                    </button>
                  )}
                  {confirmDeleteId === l.id ? (
                    <>
                      <button type="button" onClick={() => remove(l)} disabled={busyId === l.id}
                        className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
                        {t('Sí, eliminar', 'Yes, delete')}
                      </button>
                      <button type="button" onClick={() => setConfirmDeleteId(null)} className={secondaryBtn}>{t('Cancelar', 'Cancel')}</button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setConfirmDeleteId(l.id)} className={secondaryBtn}>{t('Eliminar', 'Delete')}</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
