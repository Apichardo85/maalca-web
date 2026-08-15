'use client';

import { useEffect, useState } from 'react';

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

interface Props {
  slug: string;
  language: 'es' | 'en';
  /** Hex de acento (business.primary_color) — cae a un rojo neutro si no viene. */
  accent?: string | null;
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
export function PublicBookingSection({ slug, language, accent }: Props) {
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

  function openBooking(member: PublicTeamMember | null) {
    setSelectedMember(member);
    setStatus('ready');
    setErrorMsg(null);
    setModalOpen(true);
  }

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

  if (loadStatus === 'loading') return null;
  if (services.length === 0) return null;

  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedService = services.find((s) => s.id === serviceId);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden="true"
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              aria-label={getText('Cerrar', 'Close')}
            >
              ✕
            </button>

            {status === 'success' ? (
              <div className="py-6 text-center">
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
              <>
                <div className="mb-5 flex items-center gap-3 pr-8">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                    style={{ background: `linear-gradient(135deg, ${color}, ${colorDark})` }}
                  >
                    {selectedMember ? initials(selectedMember.name) : '🕐'}
                  </div>
                  <div>
                    <p className="text-base font-black text-gray-900">
                      {selectedMember ? selectedMember.name : getText('Cualquiera disponible', 'Anyone available')}
                    </p>
                    {selectedMember && <p className="text-xs text-gray-500">{selectedMember.role}</p>}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-3.5">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                      {getText('Servicio', 'Service')}
                    </label>
                    <select
                      required
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-500 focus:outline-none"
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

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                        {getText('Fecha', 'Date')}
                      </label>
                      <input
                        type="date"
                        required
                        min={todayStr}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                        {getText('Hora', 'Time')}
                      </label>
                      <input
                        type="time"
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                      {getText('Tu nombre', 'Your name')}
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-500 focus:outline-none"
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
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-500 focus:outline-none"
                    />
                  </div>

                  <details className="text-sm text-gray-500">
                    <summary className="cursor-pointer select-none font-medium">
                      {getText('Agregar una nota (opcional)', 'Add a note (optional)')}
                    </summary>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-500 focus:outline-none"
                    />
                  </details>

                  {errorMsg && (
                    <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="mt-1 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
                    style={{ background: `linear-gradient(135deg, ${color}, ${colorDark})` }}
                  >
                    {status === 'submitting'
                      ? getText('Enviando...', 'Sending...')
                      : getText('Confirmar reserva', 'Confirm booking')}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
