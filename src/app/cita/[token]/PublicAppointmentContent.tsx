'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export interface PublicAppointment {
  token: string;
  businessName: string;
  serviceName: string;
  staffName: string | null;
  date: string; // ISO
  time: string; // "HH:mm"
  status: 'Scheduled' | 'Confirmed' | 'Cancelled' | 'Completed' | string;
}

// Tarea #246 — mismo patrón que PublicProposalContent.tsx (task #194): llama directo al API
// (.NET), sin proxy de Next.js, porque esta página no tiene sesión/JWT — la seguridad es la
// posesión del token (GUID) en la URL. Endpoints en PublicBookingService (maalca-api).
export function PublicAppointmentContent({
  token,
  initial,
}: {
  token: string;
  initial: PublicAppointment;
}) {
  const [appointment, setAppointment] = useState(initial);
  const [loading, setLoading] = useState<'confirm' | 'cancel' | 'reschedule' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  const formattedDate = new Date(appointment.date).toLocaleDateString(
    language === 'es' ? 'es-DO' : 'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  );

  async function callAction(
    action: 'confirm' | 'cancel' | 'reschedule',
    body?: { date: string; time: string },
  ) {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/public/appointments/${token}/${action}`, {
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const code = data?.error?.code;
        if (code === 'SLOT_TAKEN') {
          setError(getText('Ese horario ya no está disponible. Elige otro.', 'That time slot is no longer available. Pick another one.'));
        } else if (res.status === 409) {
          setError(getText('Esta cita ya no se puede modificar.', 'This appointment can no longer be changed.'));
        } else {
          setError(getText('No se pudo completar la acción. Intenta de nuevo.', 'Could not complete the action. Please try again.'));
        }
        return;
      }
      setAppointment(data);
      setShowReschedule(false);
    } catch {
      setError(getText('Error de conexión. Intenta de nuevo.', 'Connection error. Please try again.'));
    } finally {
      setLoading(null);
    }
  }

  function handleReschedule() {
    if (!newDate || !newTime) {
      setError(getText('Elige una fecha y hora.', 'Pick a date and time.'));
      return;
    }
    callAction('reschedule', { date: newDate, time: newTime });
  }

  const statusLabel: Record<string, string> = {
    Scheduled: getText('Programada', 'Scheduled'),
    Confirmed: getText('Confirmada', 'Confirmed'),
    Cancelled: getText('Cancelada', 'Cancelled'),
    Completed: getText('Completada', 'Completed'),
  };

  const statusColor: Record<string, string> = {
    Scheduled: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    Confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Cancelled: 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400',
    Completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const canAct = appointment.status === 'Scheduled' || appointment.status === 'Confirmed';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 dark:bg-neutral-950">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">{appointment.businessName}</p>
        <h1 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{appointment.serviceName}</h1>

        <span
          className={`mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor[appointment.status] ?? 'bg-gray-100 text-gray-600'}`}
        >
          {statusLabel[appointment.status] ?? appointment.status}
        </span>

        <div className="mt-4 space-y-1 text-sm text-gray-700 dark:text-neutral-300">
          <p>
            📅 <span className="capitalize">{formattedDate}</span>
          </p>
          <p>🕐 {appointment.time}</p>
          {appointment.staffName && <p>👤 {appointment.staffName}</p>}
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {appointment.status === 'Cancelled' && (
          <p className="mt-4 text-sm text-gray-500 dark:text-neutral-400">
            {getText('Esta cita fue cancelada.', 'This appointment was cancelled.')}
          </p>
        )}
        {appointment.status === 'Completed' && (
          <p className="mt-4 text-sm text-gray-500 dark:text-neutral-400">
            {getText('Esta cita ya se completó. ¡Gracias por tu visita!', 'This appointment is complete. Thanks for visiting!')}
          </p>
        )}

        {canAct && !showReschedule && (
          <div className="mt-5 flex flex-col gap-2">
            {appointment.status === 'Scheduled' && (
              <button
                type="button"
                onClick={() => callAction('confirm')}
                disabled={loading !== null}
                className="rounded-lg bg-[#C8102E] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a80d26] disabled:opacity-50"
              >
                {loading === 'confirm' ? getText('Confirmando…', 'Confirming…') : getText('Confirmar cita', 'Confirm appointment')}
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowReschedule(true)}
              disabled={loading !== null}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              {getText('Reagendar', 'Reschedule')}
            </button>
            <button
              type="button"
              onClick={() => callAction('cancel')}
              disabled={loading !== null}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              {loading === 'cancel' ? getText('Cancelando…', 'Cancelling…') : getText('Cancelar cita', 'Cancel appointment')}
            </button>
          </div>
        )}

        {canAct && showReschedule && (
          <div className="mt-5 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-neutral-400">
                {getText('Nueva fecha', 'New date')}
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-neutral-400">
                {getText('Nueva hora', 'New time')}
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReschedule}
                disabled={loading !== null}
                className="flex-1 rounded-lg bg-[#C8102E] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a80d26] disabled:opacity-50"
              >
                {loading === 'reschedule' ? getText('Guardando…', 'Saving…') : getText('Guardar nueva fecha', 'Save new date')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReschedule(false);
                  setError(null);
                }}
                disabled={loading !== null}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                {getText('Cancelar', 'Cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
