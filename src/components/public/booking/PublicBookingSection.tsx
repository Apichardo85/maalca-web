'use client';

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface PublicTeamMember {
  id: string;
  name: string;
  role: string;
  photoUrl?: string | null;
}

interface PublicService {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
}

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
  /** Muestra el CTA "Ahora mismo" (walk-in → Fila, no Agenda) — solo Barbería tiene módulo
   *  "queue" hoy. Ver POST /api/public/affiliates/{slug}/queue. */
  enableWalkIn?: boolean;
}

/** Handle imperativo — permite que un "Reservar" en la tarjeta de un servicio, más
 *  arriba en la página, abra este modal con ese servicio pre-seleccionado en vez de
 *  duplicar el flujo de reserva por WhatsApp. */
export interface PublicBookingSectionHandle {
  openWithService: (serviceId: string) => void;
}

// getDay() indexa 0=domingo..6=sábado; Horario.dia usa claves en minúscula en inglés.
const WEEKDAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const DEFAULT_HOURS = { abre: '09:00', cierra: '18:00' };

/** Slots de 30 en 30 min entre abre y cierra, excluyendo los ya pasados si es hoy. */
function generateTimeSlots(abre: string, cierra: string, isToday: boolean): string[] {
  const [openH, openM] = abre.split(':').map(Number);
  const [closeH, closeM] = cierra.split(':').map(Number);
  if ([openH, openM, closeH, closeM].some((n) => Number.isNaN(n))) return [];

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const slots: string[] = [];
  for (let mins = openH * 60 + openM; mins < closeH * 60 + closeM; mins += 30) {
    if (isToday && mins <= nowMinutes + 15) continue; // margen de 15min para reservas de último minuto
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

type Status = 'idle' | 'loading' | 'ready' | 'submitting' | 'success' | 'error';

/** Selección "cualquiera disponible" — id sintético, nunca se manda al backend como assignedToId. */
const ANYONE = '__anyone__';

function darken(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

/**
 * Widget de reserva público (sin login) — usado por las plantillas Restaurant/Barber/Service.
 * v2: cards de personal (estilo Squire/Calendly) que abren un modal de reserva pre-llenado, en
 * vez de un formulario plano suelto. Se auto-oculta si el negocio no tiene servicios
 * configurados en Agenda todavía.
 */
export const PublicBookingSection = forwardRef<PublicBookingSectionHandle, Props>(function PublicBookingSection(
  { slug, language, accent, horario, enableWalkIn },
  ref,
) {
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const color = accent || '#C8102E';
  const colorDark = darken(color, 30);

  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [team, setTeam] = useState<PublicTeamMember[]>([]);
  const [services, setServices] = useState<PublicService[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<PublicTeamMember | null>(null);

  const [status, setStatus] = useState<Status>('ready');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Task #189 — horarios ya tomados para la fecha elegida, por staffId (string, viene así del
  // backend). Antes el cliente solo se enteraba de un choque al confirmar (409); ahora se
  // ocultan del grid de horas apenas se elige la fecha, igual que ya se ocultan los que caen
  // fuera del horario del negocio.
  const [busyByStaff, setBusyByStaff] = useState<Record<string, string[]>>({});

  // "Ahora mismo" — walk-in a la Fila (QueueEntry), flujo separado del modal de Agenda de
  // arriba: sin día/hora, solo nombre + teléfono + servicio opcional.
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInStatus, setWalkInStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [walkInError, setWalkInError] = useState<string | null>(null);
  const [walkInPosition, setWalkInPosition] = useState<number | null>(null);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInServiceId, setWalkInServiceId] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [teamRes, servicesRes] = await Promise.all([
          fetch(`${API_BASE}/api/public/affiliates/${slug}/team`, { cache: 'no-store' }),
          fetch(`${API_BASE}/api/public/affiliates/${slug}/services`, { cache: 'no-store' }),
        ]);
        if (cancelled) return;
        const teamData = teamRes.ok ? await teamRes.json() : [];
        const servicesData = servicesRes.ok ? await servicesRes.json() : [];
        setTeam(teamData);
        setServices(servicesData);
        if (servicesData.length > 0) setServiceId(servicesData[0].id);
        setLoadStatus('ready');
      } catch {
        if (!cancelled) setLoadStatus('error');
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  useEffect(() => {
    if (!date) {
      setBusyByStaff({});
      return;
    }
    let cancelled = false;
    fetch(`${API_BASE}/api/public/affiliates/${slug}/busy-times?date=${date}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setBusyByStaff(data?.busyByStaff ?? {});
      })
      .catch(() => {
        if (!cancelled) setBusyByStaff({});
      });
    return () => {
      cancelled = true;
    };
  }, [slug, date]);

  function openBooking(member: PublicTeamMember | null) {
    setSelectedMember(member);
    setStatus('ready');
    setErrorMsg(null);
    setModalOpen(true);
  }

  useImperativeHandle(ref, () => ({
    openWithService(id: string) {
      setServiceId(id);
      setSelectedMember(null);
      setStatus('ready');
      setErrorMsg(null);
      setModalOpen(true);
    },
  }));

  function closeModal() {
    setModalOpen(false);
    if (status === 'success') {
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
      setDate('');
      setTime('');
      setStatus('ready');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setStatus('submitting');
    try {
      const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          assignedToId: selectedMember?.id ?? null,
          date,
          time,
          customerName,
          customerPhone,
          notes: notes || null,
        }),
      });
      if (res.status === 409) {
        const body = await res.json().catch(() => null);
        setErrorMsg(body?.error?.message ?? getText('Ese horario ya no está disponible — elige otro.', 'That time slot is no longer available — pick another.'));
        setStatus('ready');
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErrorMsg(body?.error?.message ?? getText('No pudimos procesar tu reserva.', "We couldn't process your booking."));
        setStatus('ready');
        return;
      }
      setStatus('success');
    } catch {
      setErrorMsg(getText('No pudimos procesar tu reserva.', "We couldn't process your booking."));
      setStatus('ready');
    }
  }

  function openWalkIn() {
    setWalkInStatus('idle');
    setWalkInError(null);
    setWalkInOpen(true);
  }

  function closeWalkIn() {
    setWalkInOpen(false);
    if (walkInStatus === 'success') {
      setWalkInName('');
      setWalkInPhone('');
      setWalkInServiceId('');
      setWalkInPosition(null);
      setWalkInStatus('idle');
    }
  }

  async function submitWalkIn(e: React.FormEvent) {
    e.preventDefault();
    setWalkInError(null);
    setWalkInStatus('submitting');
    try {
      const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: walkInName,
          customerPhone: walkInPhone || null,
          serviceId: walkInServiceId || null,
          notes: null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setWalkInError(body?.error?.message ?? getText('No pudimos agregarte a la fila.', "We couldn't add you to the queue."));
        setWalkInStatus('idle');
        return;
      }
      const data = await res.json();
      setWalkInPosition(data.position ?? null);
      setWalkInStatus('success');
    } catch {
      setWalkInError(getText('No pudimos agregarte a la fila.', "We couldn't add you to the queue."));
      setWalkInStatus('idle');
    }
  }

  if (loadStatus === 'loading') return null;
  if (services.length === 0) return null;

  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedService = services.find((s) => s.id === serviceId);

  function hoursFor(dateObj: Date): { abre: string; cierra: string; cerrado: boolean } {
    const key = WEEKDAY_KEYS[dateObj.getDay()];
    const entry = horario?.find((h) => h.dia === key);
    if (!entry) return { ...DEFAULT_HOURS, cerrado: false };
    return entry;
  }

  const dayOptions = nextDays(14);
  const selectedDateObj = date ? new Date(`${date}T00:00:00`) : null;
  const selectedDayHours = selectedDateObj ? hoursFor(selectedDateObj) : null;
  const rawTimeSlots =
    selectedDateObj && selectedDayHours && !selectedDayHours.cerrado
      ? generateTimeSlots(selectedDayHours.abre, selectedDayHours.cierra, date === todayStr)
      : [];

  // Task #189 — con un profesional elegido, se oculta cualquier hora ya tomada por él/ella. Con
  // "Cualquiera disponible" (selectedMember === null), una hora solo se oculta si TODO el
  // personal está ocupado a esa hora — si al menos uno está libre, el negocio puede asignarlo.
  const isSlotTaken = (slot: string): boolean => {
    if (selectedMember) return (busyByStaff[selectedMember.id] ?? []).includes(slot);
    if (team.length === 0) return false;
    return team.every((m) => (busyByStaff[m.id] ?? []).includes(slot));
  };
  const timeSlots = rawTimeSlots.filter((slot) => !isSlotTaken(slot));

  return (
    <section className="mx-auto max-w-public-content" style={{ padding: '56px 24px' }} id="reservar">
      <div className="mx-auto mb-10 max-w-xl text-center">
        <span
          className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
          style={{ backgroundColor: `${color}1a`, color }}
        >
          {getText('Reservas online', 'Online booking')}
        </span>
        <h2 className="text-3xl font-black text-gray-900 md:text-4xl">
          {getText('Reserva tu cita', 'Book your appointment')}
        </h2>
        <p className="mt-2 text-gray-500">
          {getText('Elige con quién quieres tu cita y a qué hora.', 'Pick who you want your appointment with and when.')}
        </p>
        {enableWalkIn && (
          <button
            type="button"
            onClick={openWalkIn}
            className="mt-4 inline-flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-bold transition-colors hover:text-white"
            style={{ borderColor: color, color }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = color)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            🕐 {getText('Ahora mismo (sin cita)', 'Right now (walk-in)')}
          </button>
        )}
      </div>

      {team.length > 0 ? (
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {team.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => openBooking(member)}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              {member.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="h-16 w-16 rounded-full object-cover shadow-inner"
                />
              ) : (
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-black text-white shadow-inner"
                  style={{ background: `linear-gradient(135deg, ${color}, ${colorDark})` }}
                >
                  {initials(member.name)}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-gray-900">{member.name}</p>
                <p className="text-xs text-gray-500">{member.role}</p>
              </div>
              <span
                className="mt-1 rounded-full px-3 py-1 text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100"
                style={{ backgroundColor: color, color: '#fff' }}
              >
                {getText('Reservar', 'Book')}
              </span>
            </button>
          ))}
          {/* Con un solo miembro en el equipo, "cualquiera" y esa persona son la misma opción —
              mostrar ambas es redundante y confunde. Con 2+ sí tiene sentido ofrecerla. */}
          {team.length > 1 && (
            <button
              type="button"
              onClick={() => openBooking(null)}
              className="group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 bg-white/50 p-5 text-center transition-all hover:-translate-y-1 hover:border-gray-400 hover:shadow-lg"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-400">
                🕐
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700">{getText('Cualquiera', 'Anyone')}</p>
                <p className="text-xs text-gray-500">{getText('Sin preferencia', 'No preference')}</p>
              </div>
            </button>
          )}
        </div>
      ) : (
        <div className="mx-auto max-w-sm text-center">
          <button
            type="button"
            onClick={() => openBooking(null)}
            className="rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${color}, ${colorDark})` }}
          >
            {getText('Reservar ahora', 'Book now')}
          </button>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden="true"
          />
          {/* Mobile: bottom sheet a pantalla completa (rounded solo arriba, sin margen lateral).
              Desktop (sm+): modal centrado clásico, como antes. */}
          <div className="relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-md sm:rounded-3xl">
            {/* handle visual de bottom-sheet — solo mobile */}
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
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 py-8 text-center sm:p-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
                  ✓
                </div>
                <p className="text-lg font-bold text-gray-900">{getText('¡Reserva enviada!', 'Booking sent!')}</p>
                <p className="mt-2 text-sm text-gray-500">
                  {getText(
                    'Quedó agendada para revisión del negocio. Te contactarán al número que dejaste.',
                    "It's been scheduled for the business to review. They'll reach out at the number you left.",
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
                {/* overflow-x-hidden explícito — sin esto, overflow-y-auto promueve overflow-x a
                    "auto" por spec de CSS y cualquier pixel de más adentro mete un scroll
                    horizontal fantasma que corta inputs y botón por la derecha. Mismo fix que
                    TableReservationSection.tsx — reportado en producción 2026-08-16. */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 pt-4 sm:p-6">
                  <div className="mb-5 flex items-center gap-3 pr-8">
                    {selectedMember?.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedMember.photoUrl}
                        alt={selectedMember.name}
                        className="h-11 w-11 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                        style={{ background: `linear-gradient(135deg, ${color}, ${colorDark})` }}
                      >
                        {selectedMember ? initials(selectedMember.name) : '🕐'}
                      </div>
                    )}
                    <div>
                      <p className="text-base font-black text-gray-900">
                        {selectedMember ? selectedMember.name : getText('Cualquiera disponible', 'Anyone available')}
                      </p>
                      {selectedMember && <p className="text-xs text-gray-500">{selectedMember.role}</p>}
                    </div>
                  </div>

                  <div className="grid gap-3.5">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                        {getText('Servicio', 'Service')}
                      </label>
                      <select
                        required
                        value={serviceId}
                        onChange={(e) => setServiceId(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-gray-500 focus:outline-none"
                      >
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} — {s.durationMinutes}min
                          </option>
                        ))}
                      </select>
                      {selectedService?.price ? (
                        <p className="mt-1 text-xs text-gray-400">
                          {getText('Precio estimado', 'Estimated price')}: ${selectedService.price.toFixed(2)}
                        </p>
                      ) : null}
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
                            {getText('Cerrado ese día — elige otra fecha.', "Closed that day — pick another date.")}
                          </p>
                        ) : timeSlots.length === 0 ? (
                          <p className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
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
                        className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-500 focus:outline-none"
                      />
                    </details>
                  </div>
                </div>

                {/* Footer sticky — el submit siempre queda a la vista sin tener que
                    scrollear el formulario entero en pantallas chicas. */}
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
                        : getText('Confirmar reserva', 'Confirm booking')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {walkInOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeWalkIn}
            aria-hidden="true"
          />
          <div className="relative z-10 flex w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-sm sm:rounded-3xl">
            <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-gray-300 sm:hidden" />
            <button
              type="button"
              onClick={closeWalkIn}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              aria-label={getText('Cerrar', 'Close')}
            >
              ✕
            </button>

            {walkInStatus === 'success' ? (
              <div className="p-5 py-8 text-center sm:p-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
                  ✓
                </div>
                <p className="text-lg font-bold text-gray-900">{getText('¡Listo!', "You're in!")}</p>
                <p className="mt-2 text-sm text-gray-500">
                  {walkInPosition
                    ? getText(
                        `Estás en la fila — posición #${walkInPosition}. Te atenderán en el orden de llegada.`,
                        `You're in line — position #${walkInPosition}. You'll be seen in order of arrival.`,
                      )
                    : getText('Te agregamos a la fila del negocio.', "We've added you to the business's queue.")}
                </p>
                <button
                  type="button"
                  onClick={closeWalkIn}
                  className="mt-5 rounded-full px-6 py-2.5 text-sm font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {getText('Listo', 'Done')}
                </button>
              </div>
            ) : (
              <form onSubmit={submitWalkIn} className="flex flex-col">
                <div className="p-5 pt-4 sm:p-6">
                  <p className="mb-4 pr-8 text-base font-black text-gray-900">
                    {getText('Únete a la fila', 'Join the queue')}
                  </p>
                  <div className="grid gap-3.5">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                        {getText('Servicio (opcional)', 'Service (optional)')}
                      </label>
                      <select
                        value={walkInServiceId}
                        onChange={(e) => setWalkInServiceId(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-gray-500 focus:outline-none"
                      >
                        <option value="">{getText('Aún no sé', "I'm not sure yet")}</option>
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                        {getText('Tu nombre', 'Your name')}
                      </label>
                      <input
                        type="text"
                        required
                        value={walkInName}
                        onChange={(e) => setWalkInName(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-gray-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                        {getText('Teléfono (opcional)', 'Phone (optional)')}
                      </label>
                      <input
                        type="tel"
                        value={walkInPhone}
                        onChange={(e) => setWalkInPhone(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-gray-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="shrink-0 border-t border-gray-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5">
                  {walkInError && (
                    <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{walkInError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={walkInStatus === 'submitting' || !walkInName.trim()}
                    className="w-full rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
                    style={{ background: `linear-gradient(135deg, ${color}, ${colorDark})` }}
                  >
                    {walkInStatus === 'submitting'
                      ? getText('Uniéndote...', 'Joining...')
                      : getText('Unirme a la fila', 'Join the queue')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
});
