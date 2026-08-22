'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { useQueueRealtime } from '@/hooks/useQueueRealtime';
import { buildInvoiceLink } from '@/lib/invoice-link';

export interface QueueEntryRow {
  id: string;
  displayName: string;
  phone: string | null;
  serviceId: string | null;
  preferredBarberId: string | null;
  notes: string | null;
  channel: string;
  position: number;
  status: 'waiting' | 'in_service' | 'completed' | 'no_show';
  assignedToId: string | null;
  calledAt: string | null;
  /** CRM (tarea #244) — solo presente si se resolvió/creó un Customer por teléfono. Sin esto no
   *  se puede generar factura (Invoice.CustomerId es obligatorio). */
  customerId: string | null;
  service?: { id: string; name: string; price?: number } | null;
  assignedTo?: { id: string; name: string } | null;
}

interface ServiceOption {
  id: string;
  name: string;
}

interface BarberOption {
  id: string;
  name: string;
}

interface Props {
  slug: string;
  affiliateId: string;
  initialEntries: QueueEntryRow[];
  services: ServiceOption[];
  barbers: BarberOption[];
}

export function QueueContent({ slug, affiliateId, initialEntries, services, barbers }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();
  const router = useRouter();

  const [entries, setEntries] = useState<QueueEntryRow[]>(initialEntries);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [barberId, setBarberId] = useState('');
  const [saving, setSaving] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);

  // El servidor manda la lista completa (solo "waiting", ver QueueService.GetQueueAsync) cada
  // vez que algo cambia — no hay merge parcial acá, se reemplaza entero.
  useQueueRealtime(affiliateId, (queue) => {
    if (Array.isArray(queue)) setEntries(queue as QueueEntryRow[]);
  });

  const waiting = entries.filter((e) => e.status === 'waiting').sort((a, b) => a.position - b.position);

  async function handleAdd() {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/space/${slug}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: name.trim(),
          phone: phone.trim() || null,
          serviceId: serviceId || null,
          preferredBarberId: barberId || null,
          channel: 'in-person',
        }),
      });
      if (!res.ok) throw new Error('add failed');
      setName('');
      setPhone('');
      setServiceId('');
      setBarberId('');
      setShowForm(false);
      toast.success(getText('Agregado a la fila.', 'Added to the queue.'));
      // El realtime ya empuja la lista actualizada — no hace falta refetch manual.
    } catch {
      toast.error(getText('No se pudo agregar. Intenta de nuevo.', "Couldn't add them. Try again."));
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: string, assignBarberId?: string) {
    if (actingOn) return;
    setActingOn(id);
    try {
      const qs = new URLSearchParams({ status });
      if (assignBarberId) qs.set('barberId', assignBarberId);
      const res = await fetch(`/api/space/${slug}/queue/${id}?${qs.toString()}`, { method: 'PATCH' });
      if (!res.ok) throw new Error('update failed');
    } catch {
      toast.error(getText('No se pudo actualizar. Intenta de nuevo.', "Couldn't update. Try again."));
    } finally {
      setActingOn(null);
    }
  }

  // Completar + ir directo a Facturación con el cliente/servicio ya prefilled — evita que el
  // dueño tenga que volver a buscar al cliente en el dropdown de Facturación. Solo disponible si
  // la entrada tiene CustomerId (requiere teléfono, ver comentario en QueueEntryRow).
  async function completeAndInvoice(entry: QueueEntryRow) {
    if (actingOn || !entry.customerId) return;
    setActingOn(entry.id);
    try {
      const res = await fetch(`/api/space/${slug}/queue/${entry.id}?${new URLSearchParams({ status: 'completed' }).toString()}`, { method: 'PATCH' });
      if (!res.ok) throw new Error('update failed');
      router.push(buildInvoiceLink(slug, { customerId: entry.customerId, desc: entry.service?.name, amount: entry.service?.price }));
    } catch {
      toast.error(getText('No se pudo completar. Intenta de nuevo.', "Couldn't complete. Try again."));
      setActingOn(null);
    }
  }

  const statusLabel = (n: number) =>
    n === 1 ? getText('Siguiente', 'Next') : getText(`#${n} en fila`, `#${n} in line`);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
              {getText('Tu espacio', 'Your space')}
            </p>
            <h1 className="mt-1 text-2xl font-bold">{getText('Fila de espera', 'Waiting queue')}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
              {getText(
                `${waiting.length} esperando ahora`,
                `${waiting.length} waiting now`,
              )}
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
              placeholder={getText('Teléfono (opcional)', 'Phone (optional)')}
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
            {services.length > 0 && (
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              >
                <option value="">{getText('Servicio (opcional)', 'Service (optional)')}</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
            {barbers.length > 0 && (
              <select
                value={barberId}
                onChange={(e) => setBarberId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              >
                <option value="">{getText('Barbero preferido (opcional)', 'Preferred barber (optional)')}</option>
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={handleAdd}
              disabled={!name.trim() || saving}
              className="w-full rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              style={{ backgroundColor: 'var(--brand-primary, #C8102E)' }}
            >
              {saving ? getText('Agregando…', 'Adding…') : getText('Agregar a la fila', 'Add to queue')}
            </button>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {waiting.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-neutral-500">
              {getText('Nadie esperando por ahora.', 'No one waiting right now.')}
            </p>
          )}
          {waiting.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-neutral-500">
                  {statusLabel(entry.position)}
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold">{entry.displayName}</p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
                  {[entry.phone, entry.service?.name, entry.assignedTo?.name].filter(Boolean).join(' · ') || '—'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateStatus(entry.id, 'in_service', entry.preferredBarberId ?? undefined)}
                  disabled={actingOn === entry.id}
                  className="flex min-h-11 items-center justify-center rounded-full px-3 text-xs font-semibold text-white disabled:opacity-40"
                  style={{ backgroundColor: 'var(--brand-primary, #C8102E)' }}
                >
                  {getText('Llamar', 'Call')}
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(entry.id, 'no_show')}
                  disabled={actingOn === entry.id}
                  className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-3 text-xs font-semibold text-gray-600 dark:text-neutral-300 disabled:opacity-40"
                >
                  {getText('No llegó', 'No-show')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {entries.some((e) => e.status === 'in_service') && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
              {getText('Atendiendo ahora', 'Being served now')}
            </h2>
            <div className="mt-3 space-y-2">
              {entries
                .filter((e) => e.status === 'in_service')
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-200/70 dark:border-neutral-800 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{entry.displayName}</p>
                      <p className="text-xs text-gray-400 dark:text-neutral-500">
                        {entry.assignedTo?.name ?? getText('Sin asignar', 'Unassigned')}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {entry.customerId && (
                        <button
                          type="button"
                          onClick={() => completeAndInvoice(entry)}
                          disabled={actingOn === entry.id}
                          className="flex min-h-11 items-center justify-center rounded-full px-3 text-xs font-semibold text-white disabled:opacity-40"
                          style={{ backgroundColor: 'var(--brand-primary, #C8102E)' }}
                        >
                          {getText('Completar y facturar', 'Complete & invoice')}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => updateStatus(entry.id, 'completed')}
                        disabled={actingOn === entry.id}
                        className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-3 text-xs font-semibold disabled:opacity-40"
                      >
                        {getText('Completar', 'Complete')}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
