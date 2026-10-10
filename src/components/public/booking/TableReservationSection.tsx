'use client';

import { formatPhoneInput, isValidPhone, normalizePhone, PHONE_INPUT_PROPS } from '@/lib/phone';
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
  /** IANA del negocio (ej. "America/New_York"). "Hoy" y "ahora" se miden ahí, no en el reloj del visitante. */
  timezone?: string | null;
}

// Mismos tokens (español, sin acento) que Affiliate.Horario — antes eran en inglés y nunca
// coincidían con horario.dia, así que el horario configurado se ignoraba.
const WEEKDAY_KEYS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const DEFAULT_HOURS = { abre: '09:00', cierra: '18:00' };
const DAYS_AHEAD = 14;

/** Fecha y hora actuales tal como se ven en la zona del negocio (sin timezone: la del navegador). */
function nowInZone(timezone?: string | null): { y: number; m: number; d: number; minutes: number } {
  const fallback = () => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate(), minutes: n.getHours() * 60 + n.getMinutes() };
  };
  if (!timezone) return fallback();
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(new Date());
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
    const y = get('year');
    const m = get('month');
    const d = get('day');
    const minutes = (get('hour') % 24) * 60 + get('minute');
    if ([y, m, d, minutes].some((n) => Number.isNaN(n))) return fallback();
    return { y, m, d, minutes };
  } catch {
    return fallback();
  }
}

function generateTimeSlots(abre: string, cierra: string, nowMinutes: number | null): string[] {
  const [openH, openM] = abre.split(':').map(Number);
  const [closeH, closeM] = cierra.split(':').map(Number);
  if ([openH, openM, closeH, closeM].some((n) => Number.isNaN(n))) return [];

  const slots: string[] = [];
  for (let mins = openH * 60 + openM; mins < closeH * 60 + closeM; mins += 30) {
    if (nowMinutes !== null && mins <= nowMinutes + 15) continue;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
  return slots;
}

/**
 * Los próximos N días a partir de "hoy" EN LA ZONA DEL NEGOCIO. Cada día se ancla a medianoche UTC
 * del calendario (Date.UTC) y se lee siempre con getUTC*: así dateStr/día de la semana no dependen
 * de la zona del navegador ni caen en el día equivocado (el bug anterior usaba toISOString(), que
 * pasa a "mañana" después de las ~8pm en Nueva York).
 */
function nextDays(count: number, today: { y: number; m: number; d: number }): { dateStr: string; date: Date }[] {
  const out: { dateStr: string; date: Date }[] = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(Date.UTC(today.y, today.m - 1, today.d + i));
    out.push({ dateStr: date.toISOString().slice(0, 10), date });
  }
  return out;
}

function darken(hex: string, amount: number): string {
  // El acento puede llegar como var(--…) o color-mix(…): solo se oscurece un #rrggbb real.
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const clean = hex.replace('#', '');
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
/** Evento que abre el formulario de reserva desde cualquier parte de la página. */
export const OPEN_TABLE_RESERVATION_EVENT = 'maalca:open-table-reservation';

/** 24h "HH:mm" → "9:30 AM" en inglés (negocios en EE. UU.); en español se deja en 24 h. */
function formatSlotLabel(slot: string, language: 'es' | 'en'): string {
  if (language !== 'en') return slot;
  const [h, m] = slot.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return slot;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function TableReservationSection({ slug, language, accent, horario, timezone }: Props) {
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const color = accent || '#045AFE';
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

  // Los botones "Reservar" de arriba (hero) abren el formulario directo en vez de mandar al
  // visitante a bajar hasta esta sección y volver a pulsar.
  useEffect(() => {
    const onOpen = () => {
      setStatus('ready');
      setErrorMsg(null);
      setModalOpen(true);
    };
    window.addEventListener(OPEN_TABLE_RESERVATION_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_TABLE_RESERVATION_EVENT, onOpen);
  }, []);

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
          customerPhone: normalizePhone(customerPhone),
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

  // Se recalcula en cada render (barato) para que el modal abierto un rato no use una "hora actual"
  // vieja. Solo se usa dentro del modal, que no se renderiza en el servidor: sin riesgo de hidratación.
  const nowInfo = nowInZone(timezone);
  const todayStr = new Date(Date.UTC(nowInfo.y, nowInfo.m - 1, nowInfo.d)).toISOString().slice(0, 10);

  function hoursFor(dateObj: Date): { abre: string; cierra: string; cerrado: boolean } {
    const key = WEEKDAY_KEYS[dateObj.getUTCDay()];
    const entry = horario?.find((h) => h.dia === key);
    if (!entry) return { ...DEFAULT_HOURS, cerrado: false };
    return entry;
  }

  const dayOptions = nextDays(DAYS_AHEAD, nowInfo);
  const selectedDateObj = date ? new Date(`${date}T00:00:00Z`) : null;
  const selectedDayHours = selectedDateObj ? hoursFor(selectedDateObj) : null;
  const timeSlots =
    selectedDateObj && selectedDayHours && !selectedDayHours.cerrado
      ? generateTimeSlots(selectedDayHours.abre, selectedDayHours.cierra, date === todayStr ? nowInfo.minutes : null)
      : [];

  return (
    <section className="mx-auto max-w-public-content" style={{ padding: '56px 24px' }} id="reservar">
      <div className="mx-auto max-w-xl text-center">
        <span
          className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 10.2%, transparent)`, color }}
        >
          {getText('Reservas online', 'Online booking')}
        </span>
        <h2 className="text-3xl font-black text-gray-900 dark:text-neutral-100 md:text-4xl">
          {getText('Reserva tu mesa', 'Reserve your table')}
        </h2>
        <p className="mt-2 text-gray-500 dark:text-neutral-400">
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
        <div className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} aria-hidden="true" />
          <div className="relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white dark:bg-neutral-900 shadow-2xl sm:max-h-[90vh] sm:max-w-md sm:rounded-3xl">
            <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-gray-300 dark:bg-neutral-600 sm:hidden" />

            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              aria-label={getText('Cerrar', 'Close')}
            >
              ✕
            </button>

            {status === 'success' ? (
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 py-8 text-center sm:p-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl dark:bg-green-900/40 dark:text-green-300">
                  ✓
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-neutral-100">{getText('¡Reserva enviada!', 'Reservation sent!')}</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400">
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
                {/* overflow-x-hidden explícito — sin esto, el spec de CSS promueve overflow-x a
                    "auto" en cuanto overflow-y es "auto", y cualquier pixel de más adentro (el
                    grid de horas, el padding) mete un scroll horizontal fantasma que corta los
                    inputs y el botón por la derecha. Reportado en producción 2026-08-16. */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 pt-8 sm:p-6">
                  <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3.5">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">
                        {getText('Personas', 'Party size')}
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPartySize((n) => Math.max(1, n - 1))}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-300 text-lg font-bold text-gray-600 dark:border-neutral-600 dark:text-neutral-300"
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-lg font-bold text-gray-900 dark:text-neutral-100">{partySize}</span>
                        <button
                          type="button"
                          onClick={() => setPartySize((n) => Math.min(20, n + 1))}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-300 text-lg font-bold text-gray-600 dark:border-neutral-600 dark:text-neutral-300"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">
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
                              disabled={closed}
                              onClick={() => {
                                setDate(dateStr);
                                setTime('');
                              }}
                              className={`flex min-h-[52px] shrink-0 flex-col items-center justify-center rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                                active
                                  ? ''
                                  : closed
                                    ? 'border-[#e5e7eb] text-[#c1c5cc] dark:border-neutral-700 dark:text-neutral-600'
                                    : 'border-[#e5e7eb] text-[#374151] dark:border-neutral-700 dark:text-neutral-200'
                              }`}
                              style={active ? { backgroundColor: color, borderColor: color, color: '#fff' } : undefined}
                            >
                              <span className="uppercase tracking-wide">
                                {d.toLocaleDateString(language === 'es' ? 'es' : 'en-US', { weekday: 'short', timeZone: 'UTC' })}
                              </span>
                              <span className="mt-0.5 text-sm">{d.getUTCDate()}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {date && (
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">
                          {getText('Hora', 'Time')}
                        </label>
                        {selectedDayHours?.cerrado ? (
                          <p className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">
                            {getText('Cerrado ese día — elige otra fecha.', 'Closed that day — pick another date.')}
                          </p>
                        ) : timeSlots.length === 0 ? (
                          <p className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">
                            {getText('No quedan horarios disponibles ese día.', 'No time slots left that day.')}
                          </p>
                        ) : (
                          <div className="grid max-h-44 grid-cols-3 gap-1.5 overflow-y-auto overflow-x-hidden pr-0.5 sm:grid-cols-4">
                            {timeSlots.map((slot) => {
                              const active = time === slot;
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setTime(slot)}
                                  className={`min-h-[40px] rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors ${
                                    active ? '' : 'border-[#e5e7eb] text-[#374151] dark:border-neutral-700 dark:text-neutral-200'
                                  }`}
                                  style={active ? { backgroundColor: color, borderColor: color, color: '#fff' } : undefined}
                                >
                                  {formatSlotLabel(slot, language)}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">
                        {getText('Tu nombre', 'Your name')}
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">
                        {getText('Teléfono', 'Phone')}
                      </label>
                      <input
                        {...PHONE_INPUT_PROPS}
                        required
                        placeholder="(555) 555-1234"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(formatPhoneInput(e.target.value))}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-400"
                      />
                      {customerPhone.length > 0 && !isValidPhone(customerPhone) && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{getText('Escribe 10 dígitos (o +código de país).', 'Enter 10 digits (or +country code).')}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">
                        {getText('Correo (opcional)', 'Email (optional)')}
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder={getText('Para enviarte la confirmación', 'So we can email you a confirmation')}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-400"
                      />
                    </div>

                    <details className="text-sm text-gray-500 dark:text-neutral-400">
                      <summary className="cursor-pointer select-none py-1 font-medium">
                        {getText('Agregar una nota (opcional)', 'Add a note (optional)')}
                      </summary>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        placeholder={getText('Ej. mesa junto a la ventana, alergias, ocasión especial', 'E.g. window table, allergies, special occasion')}
                        className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-400"
                      />
                    </details>
                  </div>
                </div>

                <div className="shrink-0 border-t border-gray-100 p-4 dark:border-neutral-800 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5">
                  {errorMsg && (
                    <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{errorMsg}</p>
                  )}
                  <button
                    type="submit"
                    disabled={status === 'submitting' || !date || !time || !isValidPhone(customerPhone)}
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
