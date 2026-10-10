'use client';

import { formatPhoneInput, isValidPhone, normalizePhone, PHONE_INPUT_PROPS } from '@/lib/phone';
import { useMemo, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { DangerZoneDelete } from '@/components/space/DangerZoneDelete';

export interface CustomerRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  status: 'Active' | 'Inactive';
  lastVisit: string | null;
  totalVisits: number;
  createdAt: string;
}

interface HistoryAppointment {
  id: string;
  date: string;
  time: string;
  status: string;
  serviceName: string | null;
  staffName: string | null;
}

interface HistoryInvoice {
  id: string;
  invoiceNumber: string;
  total: number;
  status: string;
  issueDate: string;
}

interface HistoryReservation {
  id: string;
  date: string;
  time: string;
  partySize: number;
  status: string;
}

interface HistoryQueueVisit {
  id: string;
  createdAt: string;
  status: string;
  channel: string;
}

interface HistoryProposal {
  id: string;
  title: string;
  amount: number;
  currency: string;
  status: string;
}

interface HistoryOrder {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  tableNumber?: string | null;
  channel: string;
  paymentMethod?: string | null;
  collectedAt?: string | null;
}

interface CustomerHistory {
  customer: CustomerRow;
  appointments: HistoryAppointment[];
  invoices: HistoryInvoice[];
  reservations: HistoryReservation[];
  queueVisits: HistoryQueueVisit[];
  proposals: HistoryProposal[];
  orders?: HistoryOrder[];
}

// Los estados llegan del backend en inglés (Paid, NoShow…); en la ficha se muestran traducidos.
const STATUS_ES: Record<string, string> = {
  Pending: 'Pendiente', Paid: 'Pagada', Overdue: 'Vencida', Cancelled: 'Cancelada', Canceled: 'Cancelada',
  Requested: 'Solicitada', Confirmed: 'Confirmada', Seated: 'Sentados', Completed: 'Completada', NoShow: 'No llegó',
  Scheduled: 'Agendada', Preparing: 'En preparación', Ready: 'Lista', Fulfilled: 'Entregado', Draft: 'Borrador',
  Sent: 'Enviada', Accepted: 'Aceptada', Rejected: 'Rechazada', Waiting: 'En espera', Served: 'Atendido',
  Active: 'Activo', Inactive: 'Inactivo',
};

interface Props {
  slug: string;
  initialCustomers: CustomerRow[];
  // Solo true cuando quien mira la página es un admin de plataforma en modo soporte (ver
  // isImpersonation en layout.tsx) — el gate real (platform_admin + platform_role Owner) vive
  // en el backend, esto solo decide si se muestra el botón.
  canHardDelete?: boolean;
}

// Clientes (tarea #249) — lista + ficha con historial real. Reusa el backend Customer.cs que ya
// existía (CRUD completo) desde antes de esta tarea, y el vínculo por teléfono con
// Appointment/Invoice/QueueEntry/TableReservation/Proposal cableado en la tarea #244.
export function ClientesContent({ slug, initialCustomers, canHardDelete }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();

  const [customers, setCustomers] = useState<CustomerRow[]>(initialCustomers);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const [selected, setSelected] = useState<CustomerRow | null>(null);
  const [history, setHistory] = useState<CustomerHistory | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q),
    );
  }, [customers, search]);

  async function refetch() {
    try {
      const res = await fetch(`/api/space/${slug}/customers?limit=100`, { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      setCustomers(json?.data ?? []);
    } catch {
      // Deja la lista como estaba.
    }
  }

  async function handleAdd() {
    if (!name.trim() || saving) return;
    if (phone && !isValidPhone(phone)) {
      toast.error(getText('El teléfono no es válido: escribe 10 dígitos o déjalo vacío.', 'Invalid phone: enter 10 digits or leave it empty.'));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/space/${slug}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone ? normalizePhone(phone) : null,
          email: email.trim() || null,
          status: 'Active',
        }),
      });
      if (!res.ok) throw new Error('add failed');
      setName('');
      setPhone('');
      setEmail('');
      setShowForm(false);
      toast.success(getText('Cliente agregado.', 'Customer added.'));
      await refetch();
    } catch {
      toast.error(getText('No se pudo agregar. Intenta de nuevo.', "Couldn't add it. Try again."));
    } finally {
      setSaving(false);
    }
  }

  async function openHistory(customer: CustomerRow) {
    setSelected(customer);
    setHistory(null);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/space/${slug}/customers/${customer.id}/history`, { cache: 'no-store' });
      if (res.ok) setHistory(await res.json());
    } catch {
      // El modal muestra "sin historial" si history queda null.
    } finally {
      setLoadingHistory(false);
    }
  }

  async function hardDeleteCustomer(customer: CustomerRow) {
    try {
      const res = await fetch(`/api/space/${slug}/ops/customers/${customer.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message || 'delete failed');
      }
      toast.success(getText('Cliente borrado permanentemente.', 'Customer permanently deleted.'));
      setSelected(null);
      setHistory(null);
      await refetch();
    } catch (e) {
      const message = e instanceof Error && e.message !== 'delete failed' ? e.message : undefined;
      toast.error(message || getText('No se pudo borrar. Intenta de nuevo.', "Couldn't delete it. Try again."));
    }
  }

  const st = (v: string) => (language === 'es' ? STATUS_ES[v] ?? v : v);
  // Fechas sin hora (citas, reservas) se leen con el calendario local: `new Date('2026-10-02')` es UTC
  // y en América se mostraría el día anterior.
  const dateFmt = (d: string) => {
    const dateOnly = /^\d{4}-\d{2}-\d{2}(T00:00:00(\.0+)?Z?)?$/.test(d);
    const [y, m, day] = d.slice(0, 10).split('-').map(Number);
    return (dateOnly ? new Date(y, m - 1, day) : new Date(d)).toLocaleDateString(language === 'es' ? 'es-DO' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />

      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getText('Clientes', 'Customers')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
            {getText(
              'Historial acumulado de citas, facturas, reservas y visitas — sin importar por dónde entraron.',
              'Accumulated history of appointments, invoices, reservations, and visits — no matter which module they came through.',
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex min-h-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary px-4 text-sm font-medium text-white transition hover:bg-brand-primary-hover"
        >
          + {getText('Cliente', 'Customer')}
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={getText('Buscar por nombre, teléfono o email...', 'Search by name, phone, or email...')}
        className="mb-4 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-primary focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
      />

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center dark:border-neutral-700 dark:bg-neutral-900/50">
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            {customers.length === 0
              ? getText(
                  'Todavía no hay clientes. Se agregan solos cuando alguien reserva, entra a la fila, o crea uno manualmente.',
                  "No customers yet. They're added automatically when someone books, joins the queue, or you add one manually.",
                )
              : getText('Sin resultados para esa búsqueda.', 'No results for that search.')}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: tarjetas apiladas — la tabla de abajo se esconde por completo en vez de
              recortar columnas, así el contacto y la última visita no desaparecen de la vista
              principal (mismo criterio que la conversión tabla→tarjetas de /ops/negocios). */}
          <div className="space-y-2 sm:hidden">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => openHistory(c)}
                className="flex w-full min-h-11 flex-col gap-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-gray-900 dark:text-white">{c.name}</p>
                  <span className="shrink-0 text-sm font-medium text-gray-900 dark:text-white">
                    {c.totalVisits} {getText('visitas', 'visits')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  {[c.phone || c.email, c.lastVisit ? dateFmt(c.lastVisit) : null].filter(Boolean).join(' · ') || '—'}
                </p>
                {c.status === 'Inactive' && (
                  <span className="text-xs text-gray-400 dark:text-neutral-500">{getText('Inactivo', 'Inactive')}</span>
                )}
              </button>
            ))}
          </div>

          {/* Desktop/tablet: tabla completa */}
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 sm:block">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-neutral-900">
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-neutral-400">
                  <th className="px-4 py-3">{getText('Nombre', 'Name')}</th>
                  <th className="px-4 py-3">{getText('Contacto', 'Contact')}</th>
                  <th className="px-4 py-3 text-right">{getText('Visitas', 'Visits')}</th>
                  <th className="px-4 py-3">{getText('Última visita', 'Last visit')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => openHistory(c)}
                    className="cursor-pointer transition hover:bg-gray-50 dark:hover:bg-neutral-800/50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{c.name}</p>
                      {c.status === 'Inactive' && (
                        <span className="text-xs text-gray-400 dark:text-neutral-500">{getText('Inactivo', 'Inactive')}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-neutral-400">
                      {c.phone || c.email || '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{c.totalVisits}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-neutral-400">
                      {c.lastVisit ? dateFmt(c.lastVisit) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Nuevo cliente */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={getText('Nuevo cliente', 'New customer')} size="sm">
        <div className="space-y-3 px-6 py-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={getText('Nombre', 'Name')}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
          <input
            {...PHONE_INPUT_PROPS}
            value={phone}
            onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
            placeholder={getText('Teléfono', 'Phone')}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={getText('Email (opcional)', 'Email (optional)')}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!name.trim() || saving}
            className="w-full rounded-lg bg-brand-primary py-2.5 text-sm font-medium text-white transition hover:bg-brand-primary-hover disabled:opacity-50"
          >
            {saving ? getText('Guardando...', 'Saving...') : getText('Agregar', 'Add')}
          </button>
        </div>
      </Modal>

      {/* Ficha del cliente */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''} size="lg">
        {selected && (
          <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
            <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-neutral-400">
              {selected.phone && (
                <a href={`tel:${selected.phone}`} className="hover:text-brand-primary">
                  📞 {selected.phone}
                </a>
              )}
              {selected.email && (
                <a href={`mailto:${selected.email}`} className="break-all hover:text-brand-primary">
                  ✉️ {selected.email}
                </a>
              )}
              {selected.phone && selected.phone.replace(/\D/g, '').length >= 7 && (
                <a
                  href={`https://wa.me/${(() => {
                    const d = selected.phone!.replace(/\D/g, '');
                    return d.length === 10 ? `1${d}` : d;
                  })()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-primary"
                >
                  💬 WhatsApp
                </a>
              )}
              <span>
                {getText('Total de visitas', 'Total visits')}: <strong className="text-gray-900 dark:text-white">{selected.totalVisits}</strong>
              </span>
            </div>

            {selected.notes && (
              <p className="mb-4 whitespace-pre-wrap break-words rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-neutral-800/60 dark:text-neutral-300">
                {selected.notes}
              </p>
            )}

            {loadingHistory && (
              <p className="py-8 text-center text-sm text-gray-400">{getText('Cargando historial...', 'Loading history...')}</p>
            )}

            {!loadingHistory && history && (
              <div className="space-y-5">
                {[history.orders ?? [], history.appointments, history.invoices, history.reservations, history.queueVisits, history.proposals].every((l) => l.length === 0) && (
                  <p className="py-6 text-center text-sm text-gray-400 dark:text-neutral-500">
                    {getText('Este cliente todavía no tiene historial.', 'This customer has no history yet.')}
                  </p>
                )}
                {(history.orders?.length ?? 0) > 0 && (
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    {getText('Pedidos', 'Orders')}: <strong className="text-gray-900 dark:text-white">{history.orders!.length}</strong>
                    {' · '}
                    {getText('Gastado', 'Spent')}:{' '}
                    <strong className="text-gray-900 dark:text-white">
                      ${history.orders!
                        .filter((o) => (o.status === 'Paid' || o.status === 'Preparing' || o.status === 'Fulfilled')
                          // Pago en el local: solo cuenta como gastado cuando ya se cobró.
                          && !((o.paymentMethod === 'PayAtPickup' || o.paymentMethod === 'PayAtTable') && !o.collectedAt))
                        .reduce((sum, o) => sum + o.total, 0)
                        .toFixed(2)}
                    </strong>
                  </p>
                )}
                <HistorySection
                  title={getText('Pedidos', 'Orders')}
                  empty={getText('Sin pedidos.', 'No orders.')}
                  items={history.orders ?? []}
                  render={(o) =>
                    `${dateFmt(o.createdAt)} — $${o.total.toFixed(2)}${o.tableNumber ? ` · ${getText('Mesa', 'Table')} ${o.tableNumber}` : ''} · ${st(o.status)}`
                  }
                />
                <HistorySection
                  title={getText('Citas', 'Appointments')}
                  empty={getText('Sin citas.', 'No appointments.')}
                  items={history.appointments}
                  render={(a) => `${dateFmt(a.date)} · ${a.time} — ${a.serviceName ?? ''}${a.staffName ? ` (${a.staffName})` : ''} · ${st(a.status)}`}
                />
                <HistorySection
                  title={getText('Facturas', 'Invoices')}
                  empty={getText('Sin facturas.', 'No invoices.')}
                  items={history.invoices}
                  render={(i) => `${i.invoiceNumber} — $${i.total.toFixed(2)} · ${st(i.status)}`}
                />
                <HistorySection
                  title={getText('Reservas', 'Reservations')}
                  empty={getText('Sin reservas.', 'No reservations.')}
                  items={history.reservations}
                  render={(r) => `${dateFmt(r.date)} · ${r.time} — ${r.partySize} ${getText('personas', 'guests')} · ${st(r.status)}`}
                />
                <HistorySection
                  title={getText('Fila de espera', 'Waiting queue')}
                  empty={getText('Sin visitas a la fila.', 'No queue visits.')}
                  items={history.queueVisits}
                  render={(q) => `${dateFmt(q.createdAt)} — ${q.channel} · ${st(q.status)}`}
                />
                <HistorySection
                  title={getText('Propuestas', 'Proposals')}
                  empty={getText('Sin propuestas.', 'No proposals.')}
                  items={history.proposals}
                  render={(p) => `${p.title} — ${p.currency} ${p.amount.toFixed(2)} · ${st(p.status)}`}
                />
              </div>
            )}

            {!loadingHistory && !history && (
              <p className="py-8 text-center text-sm text-gray-400">{getText('No se pudo cargar el historial.', "Couldn't load the history.")}</p>
            )}

            {canHardDelete && (
              <DangerZoneDelete
                title={getText('Zona de peligro', 'Danger zone')}
                description={(() => {
                  const n = (l?: unknown[]) => l?.length ?? 0;
                  const parts: [number, string, string][] = history ? [
                    [n(history.appointments), 'cita(s)', 'appointment(s)'],
                    [n(history.reservations), 'reserva(s) de mesa', 'table reservation(s)'],
                    [n(history.invoices), 'factura(s) con sus líneas', 'invoice(s) with their lines'],
                    [n(history.proposals), 'propuesta(s)', 'proposal(s)'],
                    [n(history.queueVisits), 'visita(s) a la fila', 'queue visit(s)'],
                  ] : [];
                  const lost = parts.filter(([c]) => c > 0).map(([c, es, en]) => `${c} ${getText(es, en)}`);
                  const orders = n(history?.orders);
                  const contact = [selected.phone, selected.email].filter(Boolean).join(' · ');
                  return getText(
                    `Se borrará para siempre el cliente "${selected.name.trim()}"${contact ? ` (${contact})` : ''} junto con: ${lost.length ? lost.join(', ') : 'nada más (no tiene historial)'}. ${orders > 0 ? `Sus ${orders} pedido(s) NO se borran: quedan en Pedidos pero sin cliente enlazado. ` : ''}Se pierden también sus notas y su historial de visitas. No se puede deshacer — solo para limpiar datos de prueba, nunca un cliente real.`,
                    `This permanently deletes customer "${selected.name.trim()}"${contact ? ` (${contact})` : ''} together with: ${lost.length ? lost.join(', ') : 'nothing else (no history)'}. ${orders > 0 ? `Their ${orders} order(s) are NOT deleted: they stay in Orders, unlinked from the customer. ` : ''}Notes and visit history are lost too. This cannot be undone — only for test data, never a real customer.`,
                  );
                })()}
                confirmWith={selected.name}
                confirmPlaceholder={getText(`Escribe "${selected.name.trim()}" para confirmar`, `Type "${selected.name.trim()}" to confirm`)}
                buttonLabel={getText('Borrar cliente permanentemente', 'Permanently delete customer')}
                busyLabel={getText('Borrando…', 'Deleting…')}
                onConfirm={() => hardDeleteCustomer(selected)}
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function HistorySection<T extends { id: string }>({
  title,
  items,
  render,
}: {
  title: string;
  empty?: string;
  items: T[];
  render: (item: T) => string;
}) {
  // Una sección sin datos no aporta: se oculta (el aviso "sin historial" lo da la ficha si TODAS están vacías).
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-neutral-500">{title}</h3>
      {items.length === 0 ? null : (
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id} className="text-sm text-gray-700 dark:text-neutral-300">
              {render(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
