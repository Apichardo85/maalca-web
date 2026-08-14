'use client';

import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface PublicTeamMember {
  id: string;
  name: string;
  role: string;
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

/**
 * Widget de reserva público (sin login) — usado por las plantillas Restaurant/Barber/Service.
 * Se auto-oculta si el negocio no tiene servicios configurados en Agenda todavía (nada que
 * reservar). El equipo (team) es opcional: sin miembros activos, igual se puede reservar sin
 * asignar a nadie específico — el negocio decide luego quién atiende, desde /space/{slug}/agenda.
 */
export function PublicBookingSection({ slug, language, accent }: Props) {
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const color = accent || '#C8102E';

  const [status, setStatus] = useState<Status>('loading');
  const [team, setTeam] = useState<PublicTeamMember[]>([]);
  const [services, setServices] = useState<PublicService[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [serviceId, setServiceId] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
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
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

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
          assignedToId: assignedToId || null,
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

  // Sin servicios configurados = nada que reservar todavía. No mostrar nada (evita una
  // sección vacía/rota en negocios que aún no activaron Agenda).
  if (status === 'loading') return null;
  if (services.length === 0) return null;

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <section className="mx-auto max-w-public-content" style={{ padding: '48px 24px' }} id="reservar">
      <h2 className="mb-2 text-center text-2xl font-black text-gray-900 md:text-3xl">
        {getText('Reserva tu cita', 'Book your appointment')}
      </h2>
      <p className="mb-8 text-center text-gray-500">
        {getText('Elige un servicio, fecha y hora — te confirmamos en el negocio.', 'Pick a service, date and time — the business will confirm it.')}
      </p>

      {status === 'success' ? (
        <div className="mx-auto max-w-md rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
          <p className="text-lg font-bold text-green-800">
            {getText('¡Reserva enviada!', 'Booking sent!')}
          </p>
          <p className="mt-2 text-sm text-green-700">
            {getText(
              'Quedó agendada para revisión del negocio. Te contactarán al número que dejaste.',
              "It's been scheduled for the business to review. They'll reach out at the number you left.",
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              setStatus('ready');
              setCustomerName('');
              setCustomerPhone('');
              setNotes('');
              setDate('');
              setTime('');
            }}
            className="mt-4 text-sm font-semibold underline"
            style={{ color }}
          >
            {getText('Hacer otra reserva', 'Book another')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mx-auto grid max-w-xl gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              {getText('Servicio', 'Service')}
            </label>
            <select
              required
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.durationMinutes ? `(${s.durationMinutes} min)` : ''}
                </option>
              ))}
            </select>
          </div>

          {team.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                {getText('Con quién (opcional)', 'With whom (optional)')}
              </label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">{getText('Cualquiera disponible', 'Whoever is available')}</option>
                {team.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.role}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                {getText('Fecha', 'Date')}
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                {getText('Hora', 'Time')}
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              {getText('Tu nombre', 'Your name')}
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              {getText('Teléfono', 'Phone')}
            </label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              {getText('Notas (opcional)', 'Notes (optional)')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {errorMsg && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="rounded-lg px-6 py-3 text-sm font-bold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: color }}
          >
            {status === 'submitting'
              ? getText('Enviando...', 'Sending...')
              : getText('Reservar', 'Book now')}
          </button>
        </form>
      )}
    </section>
  );
}
