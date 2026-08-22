'use client';

import { useMemo, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';

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

interface CustomerHistory {
  customer: CustomerRow;
  appointments: HistoryAppointment[];
  invoices: HistoryInvoice[];
  reservations: HistoryReservation[];
  queueVisits: HistoryQueueVisit[];
  proposals: HistoryProposal[];
}

interface Props {
  slug: string;
  initialCustomers: CustomerRow[];
}

// Clientes (tarea #249) — lista + ficha con historial real. Reusa el backend Customer.cs que ya
// existía (CRUD completo) desde antes de esta tarea, y el vínculo por teléfono con
// Appointment/Invoice/QueueEntry/TableReservation/Proposal cableado en la tarea #244.
export function ClientesContent({ slug, initialCustomers }: Props) {
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
    setSaving(true);
    try {
      const res = await fetch(`/api/space/${slug}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
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

  const dateFmt = (d: string) =>
    new Date(d).toLocaleDateString(language === 'es' ? 'es-DO' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });

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
          className="flex min-h-11 flex-shrink-0 items-center justify-center rounded-full bg-[#C8102E] px-4 text-sm font-medium text-white transition hover:bg-[#A00D26]"
        >
          + {getText('Cliente', 'Customer')}
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={getText('Buscar por nombre, teléfono o email...', 'Search by name, phone, or email...')}
        className="mb-4 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[#C8102E] focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
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
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#C8102E] focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={getText('Teléfono', 'Phone')}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#C8102E] focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={getText('Email (opcional)', 'Email (optional)')}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#C8102E] focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!name.trim() || saving}
            className="w-full rounded-lg bg-[#C8102E] py-2.5 text-sm font-medium text-white transition hover:bg-[#A00D26] disabled:opacity-50"
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
                <a href={`tel:${selected.phone}`} className="hover:text-[#C8102E]">
                  📞 {selected.phone}
                </a>
              )}
              {selected.email && <span>✉️ {selected.email}</span>}
              <span>
                {getText('Total de visitas', 'Total visits')}: <strong className="text-gray-900 dark:text-white">{selected.totalVisits}</strong>
              </span>
            </div>

            {loadingHistory && (
              <p className="py-8 text-center text-sm text-gray-400">{getText('Cargando historial...', 'Loading history...')}</p>
            )}

            {!loadingHistory && history && (
              <div className="space-y-5">
                <HistorySection
                  title={getText('Citas', 'Appointments')}
                  empty={getText('Sin citas.', 'No appointments.')}
                  items={history.appointments}
                  render={(a) => `${dateFmt(a.date)} · ${a.time} — ${a.serviceName ?? ''}${a.staffName ? ` (${a.staffName})` : ''} · ${a.status}`}
                />
                <HistorySection
                  title={getText('Facturas', 'Invoices')}
                  empty={getText('Sin facturas.', 'No invoices.')}
                  items={history.invoices}
                  render={(i) => `${i.invoiceNumber} — $${i.total.toFixed(2)} · ${i.status}`}
                />
                <HistorySection
                  title={getText('Reservas', 'Reservations')}
                  empty={getText('Sin reservas.', 'No reservations.')}
                  items={history.reservations}
                  render={(r) => `${dateFmt(r.date)} · ${r.time} — ${r.partySize} ${getText('personas', 'guests')} · ${r.status}`}
                />
                <HistorySection
                  title={getText('Fila de espera', 'Waiting queue')}
                  empty={getText('Sin visitas a la fila.', 'No queue visits.')}
                  items={history.queueVisits}
                  render={(q) => `${dateFmt(q.createdAt)} — ${q.channel} · ${q.status}`}
                />
                <HistorySection
                  title={getText('Propuestas', 'Proposals')}
                  empty={getText('Sin propuestas.', 'No proposals.')}
                  items={history.proposals}
                  render={(p) => `${p.title} — ${p.currency} ${p.amount.toFixed(2)} · ${p.status}`}
                />
              </div>
            )}

            {!loadingHistory && !history && (
              <p className="py-8 text-center text-sm text-gray-400">{getText('No se pudo cargar el historial.', "Couldn't load the history.")}</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function HistorySection<T extends { id: string }>({
  title,
  empty,
  items,
  render,
}: {
  title: string;
  empty: string;
  items: T[];
  render: (item: T) => string;
}) {
  return (
    <div>
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-neutral-500">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-neutral-600">{empty}</p>
      ) : (
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
