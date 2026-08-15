'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';

export interface Appointment {
  id: string;
  date: string;
  time: string;
  status: string;
  notes?: string | null;
  customer?: { id: string; name: string } | null;
  service?: { id: string; name: string; durationMinutes: number } | null;
  assignedTo?: { id: string; name: string } | null;
}

export interface ServiceOption {
  id: string;
  name: string;
  durationMinutes: number;
}

export interface PersonalOption {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
}

interface HorarioDay {
  dia: string;
  abre: string;
  cierra: string;
  cerrado: boolean;
}

interface Props {
  slug: string;
  canManage: boolean;
  initialAppointments: Appointment[];
  services: ServiceOption[];
  personal: PersonalOption[];
  /** Horario configurado en Identidad — sin esto, cae a 9am–6pm todos los días. */
  horario?: HorarioDay[] | null;
}

const STATUS_OPTIONS = ['Scheduled', 'Confirmed', 'InProgress', 'Completed', 'Cancelled', 'NoShow'];

const STATUS_LABELS: Record<string, { es: string; en: string }> = {
  Scheduled: { es: 'Agendada', en: 'Scheduled' },
  Confirmed: { es: 'Confirmada', en: 'Confirmed' },
  InProgress: { es: 'En curso', en: 'In progress' },
  Completed: { es: 'Completada', en: 'Completed' },
  Cancelled: { es: 'Cancelada', en: 'Cancelled' },
  NoShow: { es: 'No se presentó', en: 'No-show' },
};

const STATUS_STYLES: Record<string, string> = {
  Scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  InProgress: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Completed: 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-300',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  NoShow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

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

export function AgendaContent({ slug, canManage, initialAppointments, services, personal, horario }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();

  const [appointments, setAppointments] = useState(initialAppointments);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '');
  const [assignedToId, setAssignedToId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function hoursFor(dateObj: Date): { abre: string; cierra: string; cerrado: boolean } {
    const key = WEEKDAY_KEYS[dateObj.getDay()];
    const entry = horario?.find((h) => h.dia === key);
    if (!entry) return { ...DEFAULT_HOURS, cerrado: false };
    return entry;
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const dayOptions = nextDays(14);
  const selectedDateObj = date ? new Date(`${date}T00:00:00`) : null;
  const selectedDayHours = selectedDateObj ? hoursFor(selectedDateObj) : null;
  const timeSlots =
    selectedDateObj && selectedDayHours && !selectedDayHours.cerrado
      ? generateTimeSlots(selectedDayHours.abre, selectedDayHours.cierra, date === todayStr)
      : [];

  async function createAppointment() {
    if (!customerName.trim() || !serviceId || !date || !time) return;
    setSaving(true);
    setError(null);
    try {
      const customerRes = await fetch(`/api/space/${slug}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: customerName.trim(), phone: customerPhone.trim() || null }),
      });
      const customer = await customerRes.json().catch(() => null);
      if (!customerRes.ok) {
        throw new Error(customer?.error?.message ?? getText('No pudimos guardar el cliente.', "We couldn't save the customer."));
      }

      const apptRes = await fetch(`/api/space/${slug}/agenda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          serviceId,
          assignedToId: assignedToId || null,
          date,
          time,
          status: 'Scheduled',
        }),
      });
      const appt = await apptRes.json().catch(() => null);
      if (!apptRes.ok) {
        throw new Error(appt?.error?.message ?? getText('No pudimos crear la cita.', "We couldn't create the appointment."));
      }
      setAppointments((prev) => [...prev, appt].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)));
      toast.success(getText('Cita creada.', 'Appointment created.'));
      setCustomerName('');
      setCustomerPhone('');
      setDate('');
      setTime('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(id: string, status: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/agenda/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? getText('No se pudo actualizar.', "Couldn't update."));
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      toast.success(getText('Estado actualizado.', 'Status updated.'));
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      setError(msg);
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    const confirmed = window.confirm(
      getText('¿Cancelar y quitar esta cita? Esta acción no se puede deshacer.', "Cancel and remove this appointment? This can't be undone."),
    );
    if (!confirmed) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/agenda/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? getText('No se pudo cancelar.', "Couldn't cancel."));
      }
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      toast.success(getText('Cita cancelada.', 'Appointment cancelled.'));
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      setError(msg);
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <div className="px-6 py-12">
        <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
          {getText('Tu espacio', 'Your space')}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{getText('Agenda', 'Agenda')}</h1>
        <p className="mt-2 max-w-lg text-sm text-gray-500 dark:text-neutral-400">
          {getText(
            'Citas agendadas manualmente (por teléfono, walk-in, etc.). La reserva pública desde tu página todavía no está conectada aquí.',
            "Appointments booked manually (phone, walk-in, etc.). Public booking from your page isn't wired here yet.",
          )}
        </p>

        {error && (
          <p className="mt-3 max-w-2xl rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {services.length === 0 ? (
          <p className="mt-6 max-w-2xl text-sm text-gray-400 dark:text-neutral-500">
            {getText(
              'Todavía no tienes servicios en tu catálogo — agrega uno primero para poder agendar citas.',
              "You don't have any services in your catalog yet — add one first to book appointments.",
            )}
          </p>
        ) : (
          canManage && (
            <div className="mt-6 max-w-2xl rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
              <h2 className="text-sm font-semibold">{getText('Nueva cita', 'New appointment')}</h2>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={getText('Nombre del cliente', 'Customer name')}
                  className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={getText('Teléfono (opcional)', 'Phone (optional)')}
                  className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.durationMinutes}min)
                    </option>
                  ))}
                </select>
                <select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">{getText('Sin asignar', 'Unassigned')}</option>
                  {personal.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3">
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
                        onClick={() => {
                          setDate(dateStr);
                          setTime('');
                        }}
                        className={`flex shrink-0 flex-col items-center rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                          active
                            ? 'border-[#C8102E] bg-[#C8102E] text-white'
                            : closed
                              ? 'border-gray-200 text-gray-300 dark:border-neutral-800 dark:text-neutral-600'
                              : 'border-gray-300 text-gray-700 dark:border-neutral-700 dark:text-neutral-300'
                        }`}
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
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">
                    {getText('Hora', 'Time')}
                  </label>
                  {selectedDayHours?.cerrado ? (
                    <p className="rounded-xl bg-gray-50 dark:bg-neutral-800/60 px-3 py-2.5 text-sm text-gray-500 dark:text-neutral-400">
                      {getText('Cerrado ese día — elige otra fecha.', "Closed that day — pick another date.")}
                    </p>
                  ) : timeSlots.length === 0 ? (
                    <p className="rounded-xl bg-gray-50 dark:bg-neutral-800/60 px-3 py-2.5 text-sm text-gray-500 dark:text-neutral-400">
                      {getText('No quedan horarios disponibles ese día.', 'No time slots left that day.')}
                    </p>
                  ) : (
                    <div className="grid max-h-40 grid-cols-4 gap-1.5 overflow-y-auto sm:grid-cols-6">
                      {timeSlots.map((slot) => {
                        const active = time === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setTime(slot)}
                            className={`rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors ${
                              active
                                ? 'border-[#C8102E] bg-[#C8102E] text-white'
                                : 'border-gray-300 text-gray-700 dark:border-neutral-700 dark:text-neutral-300'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={createAppointment}
                disabled={saving || !customerName.trim() || !serviceId || !date || !time}
                className="mt-4 rounded-full bg-[#C8102E] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving
                  ? getText('Agendando…', 'Booking…')
                  : !date || !time
                    ? getText('Elige día y hora', 'Pick a day and time')
                    : getText('Agendar', 'Book')}
              </button>
            </div>
          )
        )}

        <div className="mt-6 max-w-3xl space-y-2">
          {appointments.map((a) => (
            <div
              key={a.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">
                    {a.customer?.name ?? getText('Cliente', 'Customer')} · {a.service?.name ?? '—'}
                  </p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[a.status] ?? 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400'}`}>
                    {STATUS_LABELS[a.status]?.[language] ?? a.status}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-neutral-500">
                  {new Date(a.date).toLocaleDateString(language === 'es' ? 'es-DO' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })} · {a.time}
                  {a.assignedTo && ` · ${a.assignedTo.name}`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                {canManage ? (
                  <select
                    value={a.status}
                    disabled={busyId === a.id}
                    onChange={(e) => changeStatus(a.id, e.target.value)}
                    className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-xs"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s][language]}
                      </option>
                    ))}
                  </select>
                ) : null}
                {canManage && (
                  <button
                    onClick={() => remove(a.id)}
                    disabled={busyId === a.id}
                    className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                  >
                    {getText('Cancelar', 'Cancel')}
                  </button>
                )}
              </div>
            </div>
          ))}
          {appointments.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-neutral-500">
              {getText('No hay citas agendadas todavía.', 'No appointments booked yet.')}
            </p>
          )}
        </div>
      </div>
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
    </div>
  );
}
