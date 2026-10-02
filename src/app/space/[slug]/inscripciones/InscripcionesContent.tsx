'use client';

// src/app/space/[slug]/inscripciones/InscripcionesContent.tsx
// Voluntarios y registros a eventos de Comunidad en una sola lista: contactar (WhatsApp / llamar /
// correo), cambiar estado (Nueva → Confirmada, Cancelada libera el cupo) y borrar.
import { useMemo, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import type { EventSummary, Signup } from './types';

interface Props {
  slug: string;
  canManage: boolean;
  initialSignups: Signup[];
  events: EventSummary[];
}

const cardClass = 'rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4';
const chipBase = 'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors';
const contactBtn =
  'inline-flex min-h-9 items-center gap-1 rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-neutral-300 hover:border-brand-primary hover:text-brand-primary';

const STATUS_LABELS: Record<Signup['status'], { es: string; en: string }> = {
  New: { es: 'Nueva', en: 'New' },
  Confirmed: { es: 'Confirmada', en: 'Confirmed' },
  Cancelled: { es: 'Cancelada', en: 'Cancelled' },
};
const STATUS_STYLES: Record<Signup['status'], string> = {
  New: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  Confirmed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  Cancelled: 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400',
};

async function api<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; data: T | null; error?: string }> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
    if (res.status === 204) return { ok: true, data: null };
    const data = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, data: null, error: data?.error?.message ?? data?.error ?? `HTTP ${res.status}` };
    return { ok: true, data };
  } catch {
    return { ok: false, data: null, error: 'network' };
  }
}

function digitsOnly(v: string): string {
  return v.replace(/\D/g, '');
}

export function InscripcionesContent({ slug, canManage, initialSignups, events }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();
  const base = `/api/space/${slug}/signups`;

  const [signups, setSignups] = useState<Signup[]>(initialSignups);
  const [kind, setKind] = useState<'all' | 'volunteer' | 'event'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Signup['status']>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const locale = language === 'es' ? 'es-DO' : 'en-US';
  const dateFmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  const eventFmt = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' });

  const counts = useMemo(
    () => ({
      all: signups.length,
      volunteer: signups.filter((s) => s.kind === 'volunteer').length,
      event: signups.filter((s) => s.kind === 'event').length,
    }),
    [signups],
  );

  // Resumen por evento próximo: inscritos (no cancelados, suma de personas) / cupo.
  const eventSummaries = useMemo(() => {
    const now = Date.now();
    return events
      .filter((e) => new Date(e.startsAt).getTime() >= now - 24 * 3600 * 1000)
      .map((e) => ({
        ...e,
        taken: signups.filter((s) => s.activityId === e.id && s.status !== 'Cancelled').reduce((n, s) => n + s.partySize, 0),
      }))
      .filter((e) => e.taken > 0 || e.capacity != null)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }, [events, signups]);

  const visible = signups.filter(
    (s) => (kind === 'all' || s.kind === kind) && (statusFilter === 'all' || s.status === statusFilter),
  );

  async function changeStatus(id: string, status: Signup['status']) {
    setBusyId(id);
    const res = await api<Signup>(`${base}/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    setBusyId(null);
    if (!res.ok || !res.data) {
      toast.error(res.error && res.error !== 'network' && !res.error.startsWith('HTTP') ? res.error : getText('No se pudo cambiar el estado.', 'Could not change the status.'));
      return;
    }
    setSignups((prev) => prev.map((s) => (s.id === id ? { ...s, status: res.data!.status } : s)));
  }

  async function remove(id: string) {
    setBusyId(id);
    const res = await api(`${base}/${id}`, { method: 'DELETE' });
    setBusyId(null);
    if (!res.ok) {
      toast.error(getText('No se pudo eliminar.', 'Could not delete.'));
      return;
    }
    setSignups((prev) => prev.filter((s) => s.id !== id));
    setConfirmingDeleteId(null);
    toast.success(getText('Inscripción eliminada.', 'Sign-up deleted.'));
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />

      <div className="mb-6">
        <h1 className="text-xl font-bold">{getText('Inscripciones', 'Sign-ups')}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
          {getText(
            'Personas que quieren ser voluntarias y quienes se anotaron a tus eventos desde la página pública.',
            'People who want to volunteer and those who signed up for your events from the public page.',
          )}
        </p>
      </div>

      {eventSummaries.length > 0 && (
        <div className="mb-5 grid gap-2 sm:grid-cols-2">
          {eventSummaries.map((e) => {
            const full = e.capacity != null && e.taken >= e.capacity;
            return (
              <div key={e.id} className={cardClass}>
                <p className="truncate text-sm font-medium">{e.title}</p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">{eventFmt.format(new Date(e.startsAt))}</p>
                <p className="mt-2 text-sm font-semibold">
                  {e.taken}
                  {e.capacity != null ? ` / ${e.capacity}` : ''} {getText('personas', 'people')}
                  {full && (
                    <span className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                      {getText('Cupo lleno', 'Full')}
                    </span>
                  )}
                </p>
                {e.capacity != null && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800">
                    <div
                      className="h-full rounded-full bg-brand-primary"
                      style={{ width: `${Math.min(100, Math.round((e.taken / e.capacity) * 100))}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        {(
          [
            ['all', getText('Todas', 'All'), counts.all],
            ['volunteer', getText('Voluntarios', 'Volunteers'), counts.volunteer],
            ['event', getText('Eventos', 'Events'), counts.event],
          ] as ['all' | 'volunteer' | 'event', string, number][]
        ).map(([key, label, count]) => (
          <button
            key={key}
            type="button"
            onClick={() => setKind(key)}
            aria-pressed={kind === key}
            className={`${chipBase} ${
              kind === key
                ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                : 'border-gray-300 text-gray-600 dark:border-neutral-700 dark:text-neutral-300'
            }`}
          >
            {label} ({count})
          </button>
        ))}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | Signup['status'])}
          aria-label={getText('Filtrar por estado', 'Filter by status')}
          className="ml-auto rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-xs"
        >
          <option value="all">{getText('Todos los estados', 'All statuses')}</option>
          {(Object.keys(STATUS_LABELS) as Signup['status'][]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s][language]}</option>
          ))}
        </select>
      </div>

      {signups.length === 0 && (
        <div className={`${cardClass} text-center text-sm text-gray-500 dark:text-neutral-400`}>
          {getText(
            'Todavía no hay inscripciones. Cuando alguien se anote como voluntario o a un evento desde tu página, aparece aquí y te avisamos.',
            'No sign-ups yet. When someone volunteers or signs up for an event from your page, it shows up here and we notify you.',
          )}
        </div>
      )}

      {signups.length > 0 && visible.length === 0 && (
        <div className={`${cardClass} text-center text-sm text-gray-500 dark:text-neutral-400`}>
          {getText('Ninguna inscripción coincide con los filtros.', 'No sign-ups match the filters.')}
        </div>
      )}

      <div className="space-y-2">
        {visible.map((s) => {
          const wa = s.phone ? digitsOnly(s.phone) : '';
          return (
            <div key={s.id} className={cardClass}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{s.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[s.status]}`}>
                      {STATUS_LABELS[s.status][language]}
                    </span>
                    <span className="rounded-full bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:text-neutral-300">
                      {s.kind === 'event' ? `📅 ${getText('Evento', 'Event')}` : `🙋 ${getText('Voluntario', 'Volunteer')}`}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-700 dark:text-neutral-200">
                    {s.targetTitle}
                    {s.kind === 'event' && s.partySize > 1 ? ` · ${s.partySize} ${getText('personas', 'people')}` : ''}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400 dark:text-neutral-500">{dateFmt.format(new Date(s.createdAt))}</p>
                </div>
              </div>

              {s.notes && (
                <p className="mt-2 rounded-lg bg-gray-50 dark:bg-neutral-800/60 px-3 py-2 text-xs text-gray-600 dark:text-neutral-300">
                  {s.notes}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {wa && (
                  <a
                    href={`https://wa.me/${wa.length === 10 ? `1${wa}` : wa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={contactBtn}
                  >
                    💬 WhatsApp
                  </a>
                )}
                {s.phone && (
                  <a href={`tel:${s.phone}`} className={contactBtn}>
                    📞 {s.phone}
                  </a>
                )}
                {s.email && (
                  <a href={`mailto:${s.email}`} className={contactBtn}>
                    ✉️ {s.email}
                  </a>
                )}
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <select
                    value={s.status}
                    disabled={busyId === s.id}
                    onChange={(e) => changeStatus(s.id, e.target.value as Signup['status'])}
                    aria-label={getText('Estado', 'Status')}
                    className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-xs"
                  >
                    {(Object.keys(STATUS_LABELS) as Signup['status'][]).map((st) => (
                      <option key={st} value={st}>{STATUS_LABELS[st][language]}</option>
                    ))}
                  </select>
                  {canManage &&
                    (confirmingDeleteId === s.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => remove(s.id)}
                          disabled={busyId === s.id}
                          className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                        >
                          {getText('Confirmar', 'Confirm')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingDeleteId(null)}
                          className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-neutral-300"
                        >
                          {getText('Cancelar', 'Cancel')}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteId(s.id)}
                        className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-500"
                      >
                        {getText('Eliminar', 'Delete')}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
