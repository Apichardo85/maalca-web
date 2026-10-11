'use client';

import { useMemo, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { DangerZoneDelete } from '@/components/space/DangerZoneDelete';
import { isPaidPlan } from '@/lib/plan-limits';
import { formatScheduledFor, printTicket, type OrderRow } from '@/lib/orderTicket';

// OrderRow/formatScheduledFor/printTicket viven en @/lib/orderTicket (la Estación de pedidos,
// /space/{slug}/station, los necesita igual que acá) — re-exportados para no tocar a quienes
// ya los importan desde este archivo (KitchenContent, orders/page.tsx).
export type { OrderRow };
export { formatScheduledFor };

interface Props {
  slug: string;
  businessName?: string;
  timezone?: string;
  plan: 'free' | 'entrepreneur' | 'enterprise';
  initialOrders: OrderRow[];
  // Solo true en modo soporte de plataforma (ver isImpersonation en layout.tsx) — el gate real
  // vive en el backend, esto solo decide si se muestra el botón de borrar.
  canHardDelete?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Preparing: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Ready: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Fulfilled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Canceled: 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400',
};

const STATUS_LABELS: Record<string, { es: string; en: string }> = {
  Pending: { es: 'Pendiente', en: 'Pending' },
  Paid: { es: 'Pagado', en: 'Paid' },
  Preparing: { es: 'En preparación', en: 'Preparing' },
  Ready: { es: 'Listo', en: 'Ready' },
  Fulfilled: { es: 'Entregado', en: 'Fulfilled' },
  Canceled: { es: 'Cancelado', en: 'Canceled' },
};

export function OrdersContent({ slug, businessName, timezone, plan, initialOrders, canHardDelete }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [orders, setOrders] = useState(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [collectingId, setCollectingId] = useState<string | null>(null);
  // Referencia libre al cobro real en el POS del negocio (ej. número de orden en Toast) — opcional,
  // solo para poder conciliar después; MaalCa no procesa ese cobro.
  const [collectRef, setCollectRef] = useState('');
  // Minutos estimados que se envían al aceptar un pedido (el cliente los ve en su enlace de seguimiento).
  const [acceptEta, setAcceptEta] = useState(15);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderRow['status']>('all');

  const q = query.trim().toLowerCase();
  const searched = useMemo(
    () =>
      !q
        ? orders
        : orders.filter((o) =>
            [o.customerName, o.customerPhone, o.customerEmail, o.tableNumber, o.id]
              .filter(Boolean)
              .some((v) => String(v).toLowerCase().includes(q)),
          ),
    [orders, q],
  );
  const statusCount = (st: OrderRow['status']) => searched.filter((o) => o.status === st).length;
  const visibleOrders = statusFilter === 'all' ? searched : searched.filter((o) => o.status === statusFilter);
  const filtering = !!q || statusFilter !== 'all';

  async function updateStatus(orderId: string, status: string, estimatedMinutes?: number) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/space/${slug}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, estimatedMinutes }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: updated.status, estimatedReadyAt: updated.estimatedReadyAt ?? o.estimatedReadyAt } : o)));
        toast.success(getText('Pedido actualizado.', 'Order updated.'));
      } else {
        toast.error(getText('No se pudo actualizar. Intenta de nuevo.', "Couldn't update. Try again."));
      }
    } catch {
      toast.error(getText('No se pudo actualizar. Intenta de nuevo.', "Couldn't update. Try again."));
    } finally {
      setUpdatingId(null);
    }
  }

  async function setEta(orderId: string, minutes: number) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/space/${slug}/orders/${orderId}/eta`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, estimatedReadyAt: updated.estimatedReadyAt } : o)));
        toast.success(getText('Tiempo estimado actualizado.', 'Estimated time updated.'));
      } else {
        toast.error(getText('No se pudo actualizar el tiempo.', "Couldn't update the time."));
      }
    } catch {
      toast.error(getText('No se pudo actualizar el tiempo.', "Couldn't update the time."));
    } finally {
      setUpdatingId(null);
    }
  }

  async function collectPayment(orderId: string, method: 'Cash' | 'Card' | 'Other', reference?: string) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/space/${slug}/orders/${orderId}/collect`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, reference: reference?.trim() || undefined }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, collectedAt: updated.collectedAt, collectedMethod: updated.collectedMethod, collectedReference: updated.collectedReference } : o)));
        setCollectingId(null);
        setCollectRef('');
        toast.success(getText('Cobro registrado.', 'Payment recorded.'));
      } else {
        toast.error(getText('No se pudo registrar el cobro.', "Couldn't record the payment."));
      }
    } catch {
      toast.error(getText('No se pudo registrar el cobro.', "Couldn't record the payment."));
    } finally {
      setUpdatingId(null);
    }
  }

  async function hardDeleteOrder(orderId: string) {
    try {
      const res = await fetch(`/api/space/${slug}/ops/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      });
      if (!res.ok && res.status !== 204) throw new Error('delete failed');
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setDeleteTargetId(null);
      toast.success(getText('Orden borrada.', 'Order deleted.'));
    } catch {
      // El botón se queda visible — el admin puede reintentar.
      toast.error(getText('No se pudo borrar. Intenta de nuevo.', "Couldn't delete. Try again."));
    }
  }

  const fmt = (n: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
          {getText('Tu espacio', 'Your space')}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{getText('Pedidos', 'Orders')}</h1>

        {!isPaidPlan(plan) && (
          <p className="mt-3 max-w-3xl text-sm text-gray-500 dark:text-neutral-400">
            {getText(
              'Los pedidos online con cobro por tarjeta son parte del plan Emprendedor. Con el plan gratis, tus clientes siguen pidiendo por WhatsApp.',
              'Online orders with card payment are part of the Entrepreneur plan. On the free plan, customers still order via WhatsApp.',
            )}
          </p>
        )}

        {orders.length === 0 ? (
          <div className="mt-8 max-w-3xl rounded-2xl border border-dashed border-gray-300 dark:border-neutral-700 p-10 text-center">
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              {getText('Todavía no hay pedidos.', 'No orders yet.')}
            </p>
          </div>
        ) : (
          <>
          <div className="mt-6 max-w-3xl space-y-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={getText('Buscar por nombre, teléfono, correo o mesa…', 'Search by name, phone, email or table…')}
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
                {getText('Todos', 'All')} ({searched.length})
              </FilterChip>
              {(['Pending', 'Paid', 'Preparing', 'Ready', 'Fulfilled', 'Canceled'] as const).map((st) => (
                <FilterChip key={st} active={statusFilter === st} onClick={() => setStatusFilter(st)}>
                  {st === 'Paid' ? getText('Aceptado / pagado', 'Accepted / paid') : STATUS_LABELS[st][language]} ({statusCount(st)})
                </FilterChip>
              ))}
            </div>
          </div>
          {visibleOrders.length === 0 && (
            <p className="mt-4 text-sm text-gray-400 dark:text-neutral-500">
              {getText('Ningún pedido coincide con los filtros.', 'No orders match the filters.')}
              {filtering && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); setStatusFilter('all'); }}
                  className="ml-2 font-semibold text-brand-primary"
                >
                  {getText('Limpiar filtros', 'Clear filters')}
                </button>
              )}
            </p>
          )}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visibleOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {order.customerName ||
                        (order.tableNumber
                          ? getText(`Mesa ${order.tableNumber}`, `Table ${order.tableNumber}`)
                          : getText('Cliente sin nombre', 'Unnamed customer'))}
                    </p>
                    {order.customerPhone && (
                      <p className="truncate text-xs text-gray-500 dark:text-neutral-400">{order.customerPhone}</p>
                    )}
                    {order.customerEmail && (
                      <p className="truncate text-xs text-gray-500 dark:text-neutral-400">{order.customerEmail}</p>
                    )}
                    {order.paymentMethod === 'PayAtPickup' && (
                      <p className="mt-1 text-xs font-semibold text-brand-primary">
                        🛍️ {getText('Para recoger', 'Pickup')}
                        <span className="ml-1 font-normal text-gray-500 dark:text-neutral-400">
                          · {getText('paga al recoger', 'pays at pickup')}
                        </span>
                      </p>
                    )}
                    {order.tableNumber && (
                      <p className="mt-1 text-xs font-semibold text-brand-primary">
                        {getText(`Mesa ${order.tableNumber}`, `Table ${order.tableNumber}`)}
                        {order.paymentMethod === 'PayAtTable' && (
                          <span className="ml-1 font-normal text-gray-500 dark:text-neutral-400">
                            · {getText('paga al mesero', 'pays the server')}
                          </span>
                        )}
                      </p>
                    )}
                    {order.scheduledFor && (
                      <p className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        📅 {getText('Programado para', 'Scheduled for')} {formatScheduledFor(order.scheduledFor, language)}
                      </p>
                    )}
                    {(order.paymentMethod === 'PayAtPickup' || order.paymentMethod === 'PayAtTable') && ['Paid', 'Preparing', 'Ready', 'Fulfilled'].includes(order.status) && (
                      order.collectedAt ? (
                        <p className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          💵 {getText('Cobrado', 'Collected')} · {order.collectedMethod === 'Cash' ? getText('Efectivo', 'Cash') : order.collectedMethod === 'Card' ? getText('Tarjeta', 'Card') : order.collectedMethod === 'Online' ? getText('Tarjeta (online)', 'Card (online)') : getText('Otro', 'Other')}
                          {order.collectedReference && <> · {order.collectedReference}</>}
                        </p>
                      ) : (
                        <p className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                          ⏳ {getText('Por cobrar', 'To collect')}
                        </p>
                      )
                    )}
                    <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
                      {new Date(order.createdAt).toLocaleString(language === 'es' ? 'es-DO' : 'en-US')}
                    </p>
                  </div>
                  {(() => {
                    // Pedido que se paga al recoger / al mesero: "Paid" internamente significa ACEPTADO, no cobrado.
                    const payLater = (order.paymentMethod === 'PayAtPickup' || order.paymentMethod === 'PayAtTable') && order.status === 'Paid';
                    return (
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${payLater ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : STATUS_STYLES[order.status]}`}>
                        {payLater ? getText('Aceptado', 'Accepted') : (STATUS_LABELS[order.status]?.[language] ?? order.status)}
                      </span>
                    );
                  })()}
                </div>

                <ul className="mt-3 space-y-1">
                  {order.items.map((item) => (
                    <li key={item.itemId} className="text-sm text-gray-600 dark:text-neutral-300">
                      <div className="flex justify-between gap-2">
                        <span>{item.qty}x {item.name}</span>
                        <span>{fmt(item.price * item.qty, order.currency)}</span>
                      </div>
                      {item.notes && (
                        <div className="text-xs italic text-amber-600 dark:text-amber-400">↳ {item.notes}</div>
                      )}
                    </li>
                  ))}
                </ul>

                {(order.status === 'Paid' || order.status === 'Preparing') && order.estimatedReadyAt && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-neutral-300">
                    <span>⏱️ {getText('Listo aprox.', 'Ready about')} <strong>{new Date(order.estimatedReadyAt).toLocaleTimeString(language === 'es' ? 'es' : 'en-US', { hour: 'numeric', minute: '2-digit' })}</strong></span>
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => setEta(order.id, Math.max(1, Math.ceil((new Date(order.estimatedReadyAt!).getTime() - Date.now()) / 60000)) + 5)}
                      className="rounded-full border border-gray-300 px-2.5 py-1 font-medium hover:border-brand-primary hover:text-brand-primary disabled:opacity-50 dark:border-neutral-700"
                    >
                      +5 min
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => printTicket(order, businessName || slug, language, timezone)}
                  className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-gray-200 px-3 text-xs font-medium text-gray-600 hover:border-brand-primary hover:text-brand-primary dark:border-neutral-700 dark:text-neutral-300"
                >
                  🖨️ {getText('Imprimir ticket', 'Print ticket')}
                </button>

                {(order.paymentMethod === 'PayAtPickup' || order.paymentMethod === 'PayAtTable') && ['Paid', 'Preparing', 'Ready', 'Fulfilled'].includes(order.status) && !order.collectedAt && (
                  collectingId === order.id ? (
                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                        {getText(`¿Cómo cobraste ${fmt(order.total, order.currency)}?`, `How did you collect ${fmt(order.total, order.currency)}?`)}
                      </p>
                      <input
                        type="text"
                        value={collectRef}
                        onChange={(e) => setCollectRef(e.target.value)}
                        placeholder={getText('Referencia opcional (ej. # de orden en Toast)', 'Optional reference (e.g. Toast order #)')}
                        className="mt-2 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm dark:border-amber-800 dark:bg-neutral-900"
                      />
                      <div className="mt-2 flex flex-wrap gap-2">
                        {([['Cash', '💵', 'Efectivo', 'Cash'], ['Card', '💳', 'Tarjeta', 'Card'], ['Other', '🧾', 'Otro', 'Other']] as const).map(([m, icon, es, en]) => (
                          <button
                            key={m}
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => collectPayment(order.id, m, collectRef)}
                            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 text-sm font-medium hover:border-brand-primary hover:text-brand-primary disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900"
                          >
                            {icon} {getText(es, en)}
                          </button>
                        ))}
                        <button type="button" onClick={() => { setCollectingId(null); setCollectRef(''); }} className="px-2 text-xs text-gray-500 underline">
                          {getText('Cancelar', 'Cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCollectingId(order.id)}
                      className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-primary px-4 text-sm font-semibold text-white hover:opacity-90"
                    >
                      💵 {getText(`Cobrar ${fmt(order.total, order.currency)}`, `Collect ${fmt(order.total, order.currency)}`)}
                    </button>
                  )
                )}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 dark:border-neutral-800 pt-3">
                  <span className="text-sm font-bold">
                    {fmt(order.total, order.currency)}
                    {!!order.tip && (
                      <span className="ml-1.5 font-normal text-emerald-600 dark:text-emerald-400">
                        ({getText('propina', 'tip')} {fmt(order.tip, order.currency)})
                      </span>
                    )}
                  </span>

                  {order.status === 'Paid' && (
                    <button
                      onClick={() => updateStatus(order.id, 'Preparing')}
                      disabled={updatingId === order.id}
                      className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-4 text-xs font-medium hover:border-brand-primary hover:text-brand-primary disabled:opacity-50"
                    >
                      {getText('Marcar en preparación', 'Mark preparing')}
                    </button>
                  )}
                  {(order.status === 'Preparing' || order.status === 'Ready') && (order.paymentMethod === 'PayAtPickup' || order.paymentMethod === 'PayAtTable') && !order.collectedAt && (
                    <span className="w-full text-xs text-amber-600 dark:text-amber-400">
                      {getText('Falta cobrar antes de entregar.', 'Collect payment before handing over.')}
                    </span>
                  )}
                  {order.status === 'Preparing' && (
                    <button
                      onClick={() => updateStatus(order.id, 'Ready')}
                      disabled={updatingId === order.id}
                      className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-4 text-xs font-medium hover:border-brand-primary hover:text-brand-primary disabled:opacity-50"
                    >
                      {getText('Marcar listo', 'Mark ready')}
                    </button>
                  )}
                  {order.status === 'Ready' && (
                    <button
                      onClick={() => updateStatus(order.id, 'Fulfilled')}
                      disabled={updatingId === order.id}
                      className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-4 text-xs font-medium hover:border-brand-primary hover:text-brand-primary disabled:opacity-50"
                    >
                      {getText('Marcar entregado', 'Mark fulfilled')}
                    </button>
                  )}
                  {order.status === 'Pending' && (
                    <div className="flex w-full flex-wrap items-center justify-end gap-2">
                      <div className="mr-auto flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400">
                        <span>⏱️ {getText('Listo en', 'Ready in')}</span>
                        {[10, 15, 20, 30].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setAcceptEta(m)}
                            className={`min-h-9 rounded-full border px-3 text-xs font-medium ${acceptEta === m ? 'border-brand-primary bg-brand-primary text-white' : 'border-gray-300 dark:border-neutral-700'}`}
                          >
                            {m}′
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => updateStatus(order.id, 'Canceled')}
                        disabled={updatingId === order.id}
                        className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-4 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                      >
                        {getText('Cancelar', 'Cancel')}
                      </button>
                      <button
                        onClick={() => updateStatus(order.id, 'Paid', acceptEta)}
                        disabled={updatingId === order.id}
                        className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-4 text-xs font-medium hover:border-brand-primary hover:text-brand-primary disabled:opacity-50"
                      >
                        {order.paymentMethod === 'PayAtTable' || order.paymentMethod === 'PayAtPickup'
                          ? getText('Aceptar pedido', 'Accept order')
                          : getText('Marcar pagado', 'Mark paid')}
                      </button>
                    </div>
                  )}
                </div>

                {canHardDelete && (
                  deleteTargetId === order.id ? (
                    <DangerZoneDelete
                      title={getText('Zona de peligro', 'Danger zone')}
                      description={getText(
                        'Borra esta orden para siempre. No se puede deshacer — es solo para limpiar datos de prueba, nunca un pedido real.',
                        'Permanently deletes this order. This cannot be undone — only for cleaning up test data, never a real order.',
                      )}
                      confirmWith={getText('BORRAR', 'DELETE')}
                      confirmPlaceholder={getText('Escribe BORRAR para confirmar', 'Type DELETE to confirm')}
                      buttonLabel={getText('Borrar orden permanentemente', 'Permanently delete order')}
                      busyLabel={getText('Borrando…', 'Deleting…')}
                      onConfirm={() => hardDeleteOrder(order.id)}
                    />
                  ) : (
                    <button
                      onClick={() => setDeleteTargetId(order.id)}
                      className="mt-3 text-xs font-medium text-gray-400 hover:text-red-500 dark:text-neutral-600"
                    >
                      🗑️ {getText('Borrar permanentemente', 'Delete permanently')}
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
          </>
        )}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-11 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors sm:min-h-0 ${
        active
          ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
          : 'border-gray-300 text-gray-600 dark:border-neutral-700 dark:text-neutral-300'
      }`}
    >
      {children}
    </button>
  );
}
