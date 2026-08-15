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

interface Props {
  slug: string;
  canManage: boolean;
  initialAppointments: Appointment[];
  services: ServiceOption[];
  personal: PersonalOption[];
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

export function AgendaContent({ slug, canManage, initialAppointments, services, personal }: Props) {
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
            <div className="mt-6 max-w-2xl rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
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
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={createAppointment}
                disabled={saving || !customerName.trim() || !serviceId || !date || !time}
                className="mt-3 rounded-full bg-[#C8102E] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? getText('Agendando…', 'Booking…') : getText('Agendar', 'Book')}
              </button>
            </div>
          )
        )}

        <div className="mt-6 max-w-3xl space-y-2">
          {appointments.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {a.customer?.name ?? getText('Cliente', 'Customer')} · {a.service?.name ?? '—'}
                </p>
                <p className="text-xs text-gray-400 dark:text-neutral-500">
                  {new Date(a.date).toLocaleDateString()} · {a.time}
                  {a.assignedTo && ` · ${a.assignedTo.name}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
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
                ) : (
                  <span className="text-xs text-gray-500 dark:text-neutral-400">{STATUS_LABELS[a.status]?.[language] ?? a.status}</span>
                )}
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
