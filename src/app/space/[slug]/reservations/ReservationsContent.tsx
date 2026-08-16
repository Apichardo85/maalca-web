'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';

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
}

interface Props {
  slug: string;
  affiliateId: string;
  initialReservations: ReservationRow[];
}

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

// Reservas de mesa — deliberadamente separado de Agenda (Appointment). Aquí no hay "servicio" ni
// "quién atiende": lo que importa es cuántas personas, a qué hora, y a qué mesa sentarlas. Ver
// docs/audits/business-type-flows-audit.md.
export function ReservationsContent({ slug, initialReservations }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();

  const [reservations, setReservations] = useState<ReservationRow[]>(initialReservations);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);

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
    if (!name.trim() || !phone.trim() || !date || !time || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/space/${slug}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: phone.trim(),
          customerEmail: email.trim() || null,
          date,
          time,
          partySize,
          status: 'Confirmed', // el dueño la agrega directo desde el dashboard — ya está confirmada
          notes: notes.trim() || null,
        }),
      });
      if (!res.ok) throw new Error('add failed');
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

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(language === 'es' ? 'es-DO' : 'en-US', { month: 'short', day: 'numeric' });

  const upcoming = reservations
    .filter((r) => !['Completed', 'Cancelled', 'NoShow'].includes(r.status))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const past = reservations
    .filter((r) => ['Completed', 'Cancelled', 'NoShow'].includes(r.status))
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

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
              {getText(`${upcoming.length} próximas`, `${upcoming.length} upcoming`)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--brand-primary, #C8102E)' }}
          >
            {showForm ? getText('Cancelar', 'Cancel') : getText('+ Agregar', '+ Add')}
          </button>
        </div>

        {showForm && (
          <div className="mt-4 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={getText('Nombre del cliente', "Customer's name")}
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={getText('Teléfono', 'Phone')}
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
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
              disabled={!name.trim() || !phone.trim() || !date || !time || saving}
              className="w-full rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              style={{ backgroundColor: 'var(--brand-primary, #C8102E)' }}
            >
              {saving ? getText('Agregando…', 'Adding…') : getText('Agregar reserva', 'Add reservation')}
            </button>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {upcoming.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-neutral-500">
              {getText('No hay reservas próximas.', 'No upcoming reservations.')}
            </p>
          )}
          {upcoming.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[r.status]}`}>
                    {STATUS_LABELS[r.status][language]}
                  </span>
                  <p className="truncate text-sm font-semibold">{r.customerName}</p>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                  {fmtDate(r.date)} · {r.time} · {getText(`${r.partySize} personas`, `party of ${r.partySize}`)}
                  {r.notes ? ` · ${r.notes}` : ''}
                </p>
                <a href={`tel:${r.customerPhone}`} className="mt-0.5 block text-xs text-gray-400 dark:text-neutral-500 underline">
                  {r.customerPhone}
                </a>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {r.status === 'Requested' && (
                  <button
                    type="button"
                    onClick={() => updateStatus(r.id, 'Confirmed')}
                    disabled={actingOn === r.id}
                    className="rounded-full px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                    style={{ backgroundColor: 'var(--brand-primary, #C8102E)' }}
                  >
                    {getText('Confirmar', 'Confirm')}
                  </button>
                )}
                {r.status === 'Confirmed' && (
                  <button
                    type="button"
                    onClick={() => updateStatus(r.id, 'Seated')}
                    disabled={actingOn === r.id}
                    className="rounded-full px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                    style={{ backgroundColor: 'var(--brand-primary, #C8102E)' }}
                  >
                    {getText('Sentar', 'Seat')}
                  </button>
                )}
                {r.status === 'Seated' && (
                  <button
                    type="button"
                    onClick={() => updateStatus(r.id, 'Completed')}
                    disabled={actingOn === r.id}
                    className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-2 text-xs font-semibold disabled:opacity-40"
                  >
                    {getText('Completar', 'Complete')}
                  </button>
                )}
                {(r.status === 'Requested' || r.status === 'Confirmed') && (
                  <button
                    type="button"
                    onClick={() => updateStatus(r.id, 'NoShow')}
                    disabled={actingOn === r.id}
                    className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-neutral-300 disabled:opacity-40"
                  >
                    {getText('No llegó', 'No-show')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {past.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
              {getText('Historial', 'History')}
            </h2>
            <div className="mt-3 space-y-2">
              {past.slice(0, 20).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200/70 dark:border-neutral-800 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.customerName}</p>
                    <p className="text-xs text-gray-400 dark:text-neutral-500">
                      {fmtDate(r.date)} · {r.time} · {getText(`${r.partySize} personas`, `party of ${r.partySize}`)}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[r.status]}`}>
                    {STATUS_LABELS[r.status][language]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
