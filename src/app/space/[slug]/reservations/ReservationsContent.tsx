'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { CustomerPicker } from '@/components/ui/CustomerPicker';
import { Toast } from '@/components/ui/Toast';
import { buildInvoiceLink } from '@/lib/invoice-link';
import { formatPhoneInput, isValidPhone, normalizePhone, PHONE_INPUT_PROPS } from '@/lib/phone';

export interface ReservationRow {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  date: string;
  time: string;
  partySize: number;
  status: 'Requested' | 'Confirmed' | 'Seated' | 'Completed' | 'Cancelled' | 'NoShow';
  notes: string | null;
  /** CRM (tarea #244) — sin esto no se puede generar factura (Invoice.CustomerId requerido). */
  customerId: string | null;
}

interface CustomerOption {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface Props {
  slug: string;
  affiliateId: string;
  initialReservations: ReservationRow[];
  customers: CustomerOption[];
}

// Mismo criterio que Propuestas (tarea #330): un sentinel para "cliente nuevo" en vez de un
// customerId real, así el <select> puede convivir con los inputs editables de siempre.
const NEW_CUSTOMER = '__new__';

const STATUS_STYLES: Record<ReservationRow['status'], string> = {
  Requested: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  Seated: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  Completed: 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  NoShow: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
};

const STATUS_LABELS: Record<ReservationRow['status'], { es: string; en: string }> = {
  Requested: { es: 'Solicitada', en: 'Requested' },
  Confirmed: { es: 'Confirmada', en: 'Confirmed' },
  Seated: { es: 'Sentados', en: 'Seated' },
  Completed: { es: 'Completada', en: 'Completed' },
  Cancelled: { es: 'Cancelada', en: 'Cancelled' },
  NoShow: { es: 'No llegó', en: 'No-show' },
};

type DateFilter = 'today' | 'tomorrow' | 'week' | 'all';

// La fecha llega como 'YYYY-MM-DD' (o ISO con hora). Se compara por texto y se formatea con el
// calendario local: `new Date('2026-10-02')` se interpreta en UTC y en América muestra el día anterior.
const dayKey = (iso: string) => iso.slice(0, 10);
const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (d: Date, n: number) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};

// Reservas de mesa — deliberadamente separado de Agenda (Appointment). Aquí no hay "servicio" ni
// "quién atiende": lo que importa es cuántas personas, a qué hora, y a qué mesa sentarlas. Ver
// docs/audits/business-type-flows-audit.md.
export function ReservationsContent({ slug, initialReservations, customers }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();

  const [reservations, setReservations] = useState<ReservationRow[]>(initialReservations);
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(NEW_CUSTOMER);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Requested' | 'Confirmed' | 'Seated'>('all');
  const [query, setQuery] = useState('');

  function selectCustomer(id: string) {
    setSelectedCustomerId(id);
    if (id === NEW_CUSTOMER) return;
    const c = customers.find((cust) => cust.id === id);
    if (!c) return;
    setName(c.name);
    setEmail(c.email ?? '');
    setPhone(formatPhoneInput(c.phone ?? ''));
  }

  async function refetch() {
    try {
      const res = await fetch(`/api/space/${slug}/reservations`, { cache: 'no-store' });
      if (!res.ok) return;
      const paginated = await res.json();
      setReservations(paginated.data ?? []);
    } catch {
      // Deja la lista como estaba — no rompemos la pantalla por un refetch fallido.
    }
  }

  async function handleAdd() {
    if (!name.trim() || !isValidPhone(phone) || !date || !time || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/space/${slug}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: normalizePhone(phone),
          customerEmail: email.trim() || null,
          date,
          time,
          partySize,
          status: 'Confirmed', // el dueño la agrega directo desde el dashboard — ya está confirmada
          notes: notes.trim() || null,
        }),
      });
      if (!res.ok) throw new Error('add failed');
      setSelectedCustomerId(NEW_CUSTOMER);
      setName('');
      setPhone('');
      setEmail('');
      setDate('');
      setTime('');
      setPartySize(2);
      setNotes('');
      setShowForm(false);
      toast.success(getText('Reserva agregada.', 'Reservation added.'));
      await refetch();
    } catch {
      toast.error(getText('No se pudo agregar. Intenta de nuevo.', "Couldn't add it. Try again."));
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: ReservationRow['status']) {
    if (actingOn) return;
    setActingOn(id);
    try {
      const qs = new URLSearchParams({ status });
      const res = await fetch(`/api/space/${slug}/reservations/${id}?${qs.toString()}`, { method: 'PATCH' });
      if (!res.ok) throw new Error('update failed');
      setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch {
      toast.error(getText('No se pudo actualizar. Intenta de nuevo.', "Couldn't update. Try again."));
    } finally {
      setActingOn(null);
    }
  }

  const fmtDate = (iso: string) => {
    const [y, m, d] = dayKey(iso).split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString(language === 'es' ? 'es-DO' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const now = new Date();
  const todayKey = toKey(now);
  const tomorrowKey = toKey(addDays(now, 1));
  const weekEndKey = toKey(addDays(now, 7));

  const isClosed = (r: ReservationRow) => ['Completed', 'Cancelled', 'NoShow'].includes(r.status);
  const q = query.trim().toLowerCase();
  const qDigits = q.replace(/\D/g, '');
  const matchesQuery = (r: ReservationRow) =>
    !q ||
    r.customerName.toLowerCase().includes(q) ||
    (qDigits.length >= 3 && r.customerPhone.replace(/\D/g, '').includes(qDigits)) ||
    (r.customerEmail ?? '').toLowerCase().includes(q);
  const matchesDate = (r: ReservationRow) => {
    const k = dayKey(r.date);
    if (dateFilter === 'today') return k === todayKey;
    if (dateFilter === 'tomorrow') return k === tomorrowKey;
    if (dateFilter === 'week') return k >= todayKey && k <= weekEndKey;
    return true;
  };

  const open = useMemo(
    () => reservations.filter((r) => !isClosed(r)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [reservations],
  );
  // Los contadores de estado respetan fecha y búsqueda, para que el número coincida con lo que se verá.
  const baseFiltered = open.filter((r) => matchesDate(r) && matchesQuery(r));
  const statusCount = (st: 'Requested' | 'Confirmed' | 'Seated') => baseFiltered.filter((r) => r.status === st).length;
  const upcoming = baseFiltered.filter((r) => statusFilter === 'all' || r.status === statusFilter);
  const past = reservations
    .filter((r) => isClosed(r) && matchesQuery(r))
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const todayCount = open.filter((r) => dayKey(r.date) === todayKey).length;
  const pendingCount = open.filter((r) => r.status === 'Requested').length;
  const filtering = dateFilter !== 'all' || statusFilter !== 'all' || q !== '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
              {getText('Tu espacio', 'Your space')}
            </p>
            <h1 className="mt-1 text-2xl font-bold">{getText('Reservas de mesa', 'Table reservations')}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
              {getText(
                `${open.length} próximas · ${todayCount} hoy${pendingCount ? ` · ${pendingCount} por confirmar` : ''}`,
                `${open.length} upcoming · ${todayCount} today${pendingCount ? ` · ${pendingCount} to confirm` : ''}`,
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--brand-primary, #045AFE)' }}
          >
            {showForm ? getText('Cancelar', 'Cancel') : getText('+ Agregar', '+ Add')}
          </button>
        </div>

        {showForm && (
          <div className="mt-4 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-3">
            {customers.length > 0 && (
              <div>
                <label className="text-xs text-gray-500 dark:text-neutral-400">
                  {getText('Cliente', 'Customer')}
                </label>
                <CustomerPicker
                  className="mt-1"
                  customers={customers}
                  selectedId={selectedCustomerId === NEW_CUSTOMER ? null : selectedCustomerId}
                  onSelect={(c) => selectCustomer(c ? c.id : NEW_CUSTOMER)}
                  placeholder={getText('Buscar por nombre, teléfono o correo…', 'Search by name, phone or email…')}
                  newLabel={getText('+ Cliente nuevo', '+ New customer')}
                  noResultsLabel={getText('Sin resultados', 'No results')}
                />
              </div>
            )}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={getText('Nombre del cliente', "Customer's name")}
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
            <div>
              <input
                {...PHONE_INPUT_PROPS}
                value={phone}
                onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                placeholder={getText('Teléfono (809) 555-1234', 'Phone (809) 555-1234')}
                aria-invalid={phone.length > 0 && !isValidPhone(phone)}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm aria-[invalid=true]:border-red-400"
              />
              {phone.length > 0 && !isValidPhone(phone) && (
                <p className="mt-1 text-xs text-red-500">
                  {getText('Escribe 10 dígitos (o +código de país).', 'Enter 10 digits (or +country code).')}
                </p>
              )}
            </div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={getText('Correo (opcional)', 'Email (optional)')}
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
            <div className="flex gap-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-500 dark:text-neutral-400">
                {getText('Personas', 'Party size')}
              </label>
              <input
                type="number"
                min={1}
                value={partySize}
                onChange={(e) => setPartySize(Math.max(1, Number(e.target.value) || 1))}
                className="w-20 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={getText('Notas (ej. mesa junto a ventana)', 'Notes (e.g. window table)')}
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!name.trim() || !isValidPhone(phone) || !date || !time || saving}
              className="w-full rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              style={{ backgroundColor: 'var(--brand-primary, #045AFE)' }}
            >
              {saving ? getText('Agregando…', 'Adding…') : getText('Agregar reserva', 'Add reservation')}
            </button>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={getText('Buscar por nombre, teléfono o correo…', 'Search by name, phone or email…')}
            className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['all', getText('Todas', 'All')],
                ['today', getText('Hoy', 'Today')],
                ['tomorrow', getText('Mañana', 'Tomorrow')],
                ['week', getText('7 días', 'Next 7 days')],
              ] as [DateFilter, string][]
            ).map(([key, label]) => (
              <FilterChip key={key} active={dateFilter === key} onClick={() => setDateFilter(key)}>
                {label}
              </FilterChip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
              {getText('Todos los estados', 'Any status')} ({baseFiltered.length})
            </FilterChip>
            {(['Requested', 'Confirmed', 'Seated'] as const).map((st) => (
              <FilterChip key={st} active={statusFilter === st} onClick={() => setStatusFilter(st)}>
                {STATUS_LABELS[st][language]} ({statusCount(st)})
              </FilterChip>
            ))}
          </div>
          {upcoming.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-neutral-500">
              {filtering
                ? getText('Ninguna reserva coincide con los filtros.', 'No reservations match the filters.')
                : getText('No hay reservas próximas.', 'No upcoming reservations.')}
              {filtering && (
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter('all');
                    setStatusFilter('all');
                    setQuery('');
                  }}
                  className="ml-2 underline"
                >
                  {getText('Quitar filtros', 'Clear filters')}
                </button>
              )}
            </p>
          )}
          {upcoming.map((r) => (
            <ReservationCard
              key={r.id}
              r={r}
              acting={actingOn === r.id}
              onStatus={updateStatus}
              fmtDate={fmtDate}
              getText={getText}
              language={language}
              isToday={dayKey(r.date) === todayKey}
              expanded={expandedId === r.id}
              onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
            />
          ))}
        </div>

        {past.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
              {getText('Historial', 'History')}
            </h2>
            <div className="mt-3 space-y-2">
              {past.slice(0, 20).map((r) => (
                <ReservationCard
                  key={r.id}
                  r={r}
                  acting={actingOn === r.id}
                  onStatus={updateStatus}
                  fmtDate={fmtDate}
                  getText={getText}
                  language={language}
                  isToday={false}
                  expanded={expandedId === r.id}
                  onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  invoiceHref={
                    r.status === 'Completed' && r.customerId
                      ? buildInvoiceLink(slug, {
                          customerId: r.customerId,
                          desc: getText(`Mesa · ${r.partySize} personas · ${fmtDate(r.date)}`, `Table · party of ${r.partySize} · ${fmtDate(r.date)}`),
                        })
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReservationCard({
  r,
  acting,
  onStatus,
  fmtDate,
  getText,
  language,
  isToday,
  expanded,
  onToggle,
  invoiceHref,
}: {
  r: ReservationRow;
  acting: boolean;
  onStatus: (id: string, status: ReservationRow['status']) => void;
  fmtDate: (iso: string) => string;
  getText: (es: string, en: string) => string;
  language: 'es' | 'en';
  isToday: boolean;
  expanded: boolean;
  onToggle: () => void;
  invoiceHref?: string;
}) {
  const closed = ['Completed', 'Cancelled', 'NoShow'].includes(r.status);
  const primary = 'var(--brand-primary, #045AFE)';
  const ghost =
    'rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-neutral-300 disabled:opacity-40';
  const phoneDigits = r.customerPhone.replace(/\D/g, '');

  return (
    <div
      className={`rounded-2xl border bg-white dark:bg-neutral-900 ${
        isToday ? 'border-[var(--brand-primary,#045AFE)]' : 'border-gray-200/70 dark:border-neutral-800'
      } ${closed ? 'opacity-80' : ''}`}
    >
      <button type="button" onClick={onToggle} aria-expanded={expanded} className="flex w-full items-start gap-3 p-4 text-left">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[r.status]}`}>
              {STATUS_LABELS[r.status][language]}
            </span>
            {isToday && (
              <span className="shrink-0 rounded-full bg-gray-900 px-2 py-0.5 text-[11px] font-semibold text-white dark:bg-white dark:text-gray-900">
                {getText('Hoy', 'Today')}
              </span>
            )}
            <span className="text-sm font-semibold">
              {fmtDate(r.date)} · {r.time}
            </span>
            <span className="text-xs text-gray-500 dark:text-neutral-400">
              · {getText(`${r.partySize} personas`, `party of ${r.partySize}`)}
            </span>
          </div>
          <p className="mt-1.5 break-words text-base font-semibold leading-snug">{r.customerName}</p>
          {r.notes && !expanded && (
            <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-neutral-400">{r.notes}</p>
          )}
        </div>
        <span className={`mt-1 shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden>
          ▾
        </span>
      </button>

      {expanded && (
        <dl className="space-y-2 border-t border-gray-100 dark:border-neutral-800 px-4 py-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500 dark:text-neutral-400">{getText('Teléfono', 'Phone')}</dt>
            <dd className="font-medium">
              <a href={`tel:${r.customerPhone}`} className="underline">{r.customerPhone}</a>
            </dd>
          </div>
          {r.customerEmail && (
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500 dark:text-neutral-400">{getText('Correo', 'Email')}</dt>
              <dd className="min-w-0 break-all text-right font-medium">
                <a href={`mailto:${r.customerEmail}`} className="underline">{r.customerEmail}</a>
              </dd>
            </div>
          )}
          {r.notes && (
            <div>
              <dt className="text-gray-500 dark:text-neutral-400">{getText('Notas', 'Notes')}</dt>
              <dd className="mt-0.5 whitespace-pre-wrap break-words">{r.notes}</dd>
            </div>
          )}
          {phoneDigits.length >= 7 && (
            <a
              href={`https://wa.me/${phoneDigits.length === 10 ? `1${phoneDigits}` : phoneDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-semibold underline"
            >
              {getText('Escribir por WhatsApp', 'Message on WhatsApp')}
            </a>
          )}
        </dl>
      )}

      {(!closed || invoiceHref) && (
        <div className="flex flex-wrap gap-2 border-t border-gray-100 dark:border-neutral-800 px-4 py-3">
          {r.status === 'Requested' && (
            <button type="button" onClick={() => onStatus(r.id, 'Confirmed')} disabled={acting} className="rounded-full px-4 py-2 text-xs font-semibold text-white disabled:opacity-40" style={{ backgroundColor: primary }}>
              {getText('Confirmar', 'Confirm')}
            </button>
          )}
          {r.status === 'Confirmed' && (
            <button type="button" onClick={() => onStatus(r.id, 'Seated')} disabled={acting} className="rounded-full px-4 py-2 text-xs font-semibold text-white disabled:opacity-40" style={{ backgroundColor: primary }}>
              {getText('Sentar', 'Seat')}
            </button>
          )}
          {r.status === 'Seated' && (
            <button type="button" onClick={() => onStatus(r.id, 'Completed')} disabled={acting} className={ghost}>
              {getText('Completar', 'Complete')}
            </button>
          )}
          {(r.status === 'Requested' || r.status === 'Confirmed') && (
            <>
              <button type="button" onClick={() => onStatus(r.id, 'NoShow')} disabled={acting} className={ghost}>
                {getText('No llegó', 'No-show')}
              </button>
              <button type="button" onClick={() => onStatus(r.id, 'Cancelled')} disabled={acting} className={`${ghost} !text-red-600 dark:!text-red-400`}>
                {getText('Cancelar', 'Cancel')}
              </button>
            </>
          )}
          {invoiceHref && (
            <Link href={invoiceHref} className={ghost}>
              {getText('Generar factura', 'Generate invoice')}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
          : 'border-gray-300 text-gray-600 dark:border-neutral-700 dark:text-neutral-300'
      }`}
    >
      {children}
    </button>
  );
}
