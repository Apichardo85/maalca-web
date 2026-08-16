'use client';

import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface HorarioDay {
  dia: string;
  abre: string;
  cierra: string;
  cerrado: boolean;
}

interface Props {
  slug: string;
  language: 'es' | 'en';
  /** Hex de acento (business.primary_color) — cae a un rojo neutro si no viene. */
  accent?: string | null;
  /** Horario configurado en Identidad — sin esto, cae a 9am–6pm todos los días. */
  horario?: HorarioDay[] | null;
}

const WEEKDAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DEFAULT_HOURS = { abre: '09:00', cierra: '18:00' };

function generateTimeSlots(abre: string, cierra: string, isToday: boolean): string[] {
  const [openH, openM] = abre.split(':').map(Number);
  const [closeH, closeM] = cierra.split(':').map(Number);
  if ([openH, openM, closeH, closeM].some((n) => Number.isNaN(n))) return [];

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const slots: string[] = [];
  for (let mins = openH * 60 + openM; mins < closeH * 60 + closeM; mins += 30) {
    if (isToday && mins <= nowMinutes + 15) continue;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
  return slots;
}

function nextDays(count: number): { dateStr: string; date: Date }[] {
  const out: { dateStr: string; date: Date }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    out.push({ dateStr: d.toISOString().slice(0, 10), date: d });
  }
  return out;
}

function darken(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

type Status = 'ready' | 'submitting' | 'success' | 'error';

/**
 * Widget de reserva de mesa — hermano de PublicBookingSection pero deliberadamente distinto: no
 * pide "servicio" ni "con quién", pide cuántas personas y a qué hora. Antes Restaurant.tsx
 * reutilizaba PublicBookingSection, forzando al comensal por el flujo de barbería. Ver
 * docs/audits/business-type-flows-audit.md y TableReservation.cs en maalca-api.
 */
export function TableReservationSection({ slug, language, accent, horario }: Props) {
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const color = accent || '#C8102E';
  const colorDark = darken(color, 30);

  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState<Status>('ready');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  function openModal() {
    setStatus('ready');
    setErrorMsg(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    if (status === 'success') {
      setDate('');
      setTime('');
      setPartySize(2);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setNotes('');
      setStatus('ready');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setStatus('submitting');
    try {
      const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          time,
          partySize,
          customerName,
          customerPhone,
          customerEmail: customerEmail || null,
          notes: notes || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErrorMsg(body?.error?.message ?? getText('No pudimos procesar tu reserva.', "We couldn't process your reservation."));
        setStatus('ready');
        return;
      }
      setStatus('success');
    } catch {
      setErrorMsg(getText('No pudimos procesar tu reserva.', "We couldn't process your reservation."));
      setStatus('ready');
    }
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  function hoursFor(dateObj: Date): { abre: string; cierra: string; cerrado: boolean } {
    const key = WEEKDAY_KEYS[dateObj.getDay()];
    const entry = horario?.find((h) => h.dia === key);
    if (!entry) return { ...DEFAULT_HOURS, cerrado: false };
    return entry;
  }

  const dayOptions = nextDays(14);
  const selectedDateObj = date ? new Date(`${date}T00:00:00`) : null;
  const selectedDayHours = selectedDateObj ? hoursFor(selectedDateObj) : null;
  const timeSlots =
    selectedDateObj && selectedDayHours && !selectedDayHours.cerrado
      ? generateTimeSlots(selectedDayHours.abre, selectedDayHours.cierra, date === todayStr)
      : [];

  return (
    <section className="mx-auto max-w-public-content" style={{ padding: '56px 24px' }} id="reservar">
      <div className="mx-auto max-w-xl text-center">
        <span
          className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
          style={{ backgroundColor: `${color}1a`, color }}
        >
          {getText('Reservas online', 'Online booking')}
        </span>
        <h2 className="text-3xl font-black text-gray-900 md:text-4xl">
          {getText('Reserva tu mesa', 'Reserve your table')}
        </h2>
        <p className="mt-2 text-gray-500">
          {getText('Dinos cuántos son y a qué hora, y te confirmamos.', "Tell us your party size and time, and we'll confirm.")}
        </p>
        <button
          type="button"
          onClick={openModal}
          className="mt-6 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${color}, ${colorDark})` }}
        >
          {getText('Reservar mesa', 'Reserve a table')}
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} aria-hidden="true" />
          <div className="relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-md sm:rounded-3xl">
            <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-gray-300 sm:hidden" />

            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              aria-label={getText('Cerrar', 'Close')}
            >
              ✕
            </button>

            {status === 'success' ? (
              <div className="flex-1 overflow-y-auto p-5 py-8 text-center sm:p-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
                  ✓
                </div>
                <p className="text-lg font-bold text-gray-900">{getText('¡Reserva enviada!', 'Reservation sent!')}</p>
                <p className="mt-2 text-sm text-gray-500">
                  {getText(
                    'Quedó pendiente de confirmación del restaurante. Te contactarán al número que dejaste.',
                    "It's pending confirmation from the restaurant. They'll reach out at the number you left.",
                  )}
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-5 rounded-full px-6 py-2.5 text-sm font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {getText('Listo', 'Done')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 overflow-y-auto p-5 pt-8 sm:p-6">
                  <div className="grid gap-3.5">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                        {getText('Personas', 'Party size')}
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPartySize((n) => Math.max(1, n - 1))}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-300 text-lg font-bold text-gray-600"
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-lg font-bold text-gray-900">{partySize}</span>
                        <button
                          type="button"
                          onClick={() => setPartySize((n) => Math.min(20, n + 1))}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-300 text-lg font-bold text-gray-600"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                        {getText('Día', 'Day')}
                      </label>
                      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
                        {dayOptions.map(({ dateStr, date: d }) => {
                          const active = date === dateStr;
                          const closed = hoursFor(d).cerrado;
                          return (
                            <button
                              key={dateStr}
                              type="button"
                              onClick={() => {
                                setDate(dateStr);
                                setTime('');
                              }}
                              className="flex min-h-[52px] shrink-0 flex-col items-center justify-center rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors"
                              style={
                                active
                                  ? { backgroundColor: color, borderColor: color, color: '#fff' }
                                  : { borderColor: '#e5e7eb', color: closed ? '#c1c5cc' : '#374151' }
                              }
                            >
                              <span className="uppercase tracking-wide">
                                {d.toLocaleDateString(language === 'es' ? 'es-DO' : 'en-US', { weekday: 'short' })}
                              </span>
                              <span className="mt-0.5 text-sm">{d.getDate()}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {date && (
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                          {getText('Hora', 'Time')}
                        </label>
                        {selectedDayHours?.cerrado ? (
                          <p className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
                            {getText('Cerrado ese día — elige otra fecha.', 'Closed that day — pick another date.')}
                          </p>
                        ) : timeSlots.length === 0 ? (
                          <p className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
                            {getText('No quedan horarios disponibles ese día.', 'No time slots left that day.')}
                          </p>
                        ) : (
                          <div className="grid max-h-44 grid-cols-3 gap-1.5 overflow-y-auto pr-0.5 sm:grid-cols-4">
                            {timeSlots.map((slot) => {
                              const active = time === slot;
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setTime(slot)}
                                  className="min-h-[40px] rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors"
                                  style={
                                    active
                                      ? { backgroundColor: color, borderColor: color, color: '#fff' }
                                      : { borderColor: '#e5e7eb', color: '#374151' }
                                  }
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                        {getText('Tu nombre', 'Your name')}
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-gray-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                        {getText('Teléfono', 'Phone')}
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-gray-500 focus:outline-none"
                      />
                    </div>

                    <details className="text-sm text-gray-500">
                      <summary className="cursor-pointer select-none py-1 font-medium">
                        {getText('Agregar una nota (opcional)', 'Add a note (optional)')}
                      </summary>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        placeholder={getText('Ej. mesa junto a la ventana, alergias, ocasión especial', 'E.g. window table, allergies, special occasion')}
                        className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-500 focus:outline-none"
                      />
                    </details>
                  </div>
                </div>

                <div className="shrink-0 border-t border-gray-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5">
                  {errorMsg && (
                    <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</p>
                  )}
                  <button
                    type="submit"
                    disabled={status === 'submitting' || !date || !time}
                    className="w-full rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
                    style={{ background: `linear-gradient(135deg, ${color}, ${colorDark})` }}
                  >
                    {status === 'submitting'
                      ? getText('Enviando...', 'Sending...')
                      : !date || !time
                        ? getText('Elige día y hora', 'Pick a day and time')
                        : getText('Confirmar reserva', 'Confirm reservation')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
