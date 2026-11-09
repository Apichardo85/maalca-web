'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { ModuleIntro } from '@/components/space/ModuleIntro';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { DangerZoneDelete } from '@/components/space/DangerZoneDelete';
import { isPaidPlan } from '@/lib/plan-limits';
import { formatScheduledFor, mergeOrderUpdate, printTicket, type OrderRow } from '@/lib/orderTicket';
import { CustomerTrustBadge, canMarkNoShow } from '@/components/space/CustomerTrustBadge';
import { PickupRulesCard, type PickupRules } from './PickupRulesCard';
import { TaxSettingsCard, type TaxSettings } from './TaxSettingsCard';
import { CARRIERS, carrierLabel } from '@/lib/commerce';

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
  /** Reglas de confianza para pagar al recoger (null = no se pudieron cargar; la tarjeta usa defaults). */
  pickupRules?: PickupRules | null;
  /** Impuesto de venta del negocio (null = no se pudo cargar; la tarjeta muestra "sin configurar"). */
  taxSettings?: TaxSettings | null;
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

export function OrdersContent({ slug, businessName, timezone, plan, initialOrders, canHardDelete, pickupRules = null, taxSettings = null }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [orders, setOrders] = useState(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [collectingId, setCollectingId] = useState<string | null>(null);
  // Referencia libre al cobro real en el POS del negocio (ej. número de orden en Toast) — opcional,
  // solo para poder conciliar después; MaalCa no procesa ese cobro.
  const [collectRef, setCollectRef] = useState('');
  // Despacho manual de un envío: paquetería + número de rastreo.
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [shipCarrier, setShipCarrier] = useState<string>('usps');
  const [shipTracking, setShipTracking] = useState('');
  // Etiqueta con United Bridge: pedido abierto, peso manual (lb, opcional), costo real cotizado y ocupado.
  const [labelId, setLabelId] = useState<string | null>(null);
  const [labelLb, setLabelLb] = useState('');
  const [labelQuote, setLabelQuote] = useState<{ total: number; charged: number; currency: string; accountBalance: number | null; weightOz: number } | null>(null);
  const [labelBusy, setLabelBusy] = useState(false);
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

  async function labelCall(orderId: string, kind: 'label-quote' | 'label') {
    setLabelBusy(true);
    try {
      const lb = Number(labelLb);
      const res = await fetch(`/api/space/${slug}/orders/${orderId}/${kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lb > 0 ? { weightOz: Math.round(lb * 16 * 100) / 100 } : {}),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        toast.error(data?.error?.message ?? getText('No se pudo completar con United Bridge.', "Couldn't complete with United Bridge."));
        return;
      }
      if (kind === 'label-quote') {
        setLabelQuote(data);
      } else {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...data.order, customerVisits: o.customerVisits, customerNoShows: o.customerNoShows } : o)));
        setLabelId(null);
        setLabelQuote(null);
        setLabelLb('');
        toast.success(getText('Etiqueta comprada. El pedido quedó enviado y el cliente ya ve su rastreo.', 'Label bought. The order is shipped and the customer can see tracking.'));
        if (data.labelUrl) window.open(data.labelUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      toast.error(getText('No se pudo conectar con United Bridge.', "Couldn't reach United Bridge."));
    } finally {
      setLabelBusy(false);
    }
  }

  async function markShipped(orderId: string) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/space/${slug}/orders/${orderId}/ship`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrier: shipCarrier, trackingNumber: shipTracking.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...data, customerVisits: o.customerVisits, customerNoShows: o.customerNoShows } : o)));
        setShippingId(null);
        setShipTracking('');
        toast.success(getText('Envío registrado. El cliente ya ve su número de rastreo.', 'Shipment recorded. The customer can now see the tracking number.'));
      } else {
        toast.error(data?.error?.message ?? getText('No se pudo registrar el envío.', "Couldn't record the shipment."));
      }
    } catch {
      toast.error(getText('No se pudo registrar el envío.', "Couldn't record the shipment."));
    } finally {
      setUpdatingId(null);
    }
  }

  async function setNoShow(order: OrderRow, undo: boolean, reactivate = true) {
    if (!undo && !confirm(getText(
      `¿Marcar que ${order.customerName || 'el cliente'} no vino a recoger este pedido? Sus próximos pedidos tendrán que pagarse por adelantado.`,
      `Mark that ${order.customerName || 'the customer'} never picked up this order? Their next orders will have to be paid upfront.`,
    ))) return;
    setUpdatingId(order.id);
    try {
      const res = await fetch(`/api/space/${slug}/orders/${order.id}/no-show${undo && !reactivate ? '?reactivate=false' : ''}`, { method: undo ? 'DELETE' : 'PATCH' });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === order.id ? mergeOrderUpdate(o, data) : o)));
        toast.success(undo ? getText('"No vino" deshecho.', 'No-show undone.') : getText('Marcado como "No vino".', 'Marked as no-show.'));
      } else {
        toast.error(data?.error?.message ?? getText('No se pudo actualizar.', "Couldn't update."));
      }
    } catch {
      toast.error(getText('No se pudo actualizar.', "Couldn't update."));
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
    new Intl.NumberFormat(currency === 'DOP' ? 'es-DO' : 'en-US', { style: 'currency', currency }).format(n);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
          {getText('Tu espacio', 'Your space')}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{getText('Pedidos', 'Orders')}</h1>

        <ModuleIntro
          id="pedidos"
          className="mt-4"
          summary={getText('Aquí llegan los pedidos de tu tienda en línea y los del punto de venta.', 'Orders from your online store and your point of sale arrive here.')}
          steps={[
            getText('Cada pedido nuevo aparece en la lista con su estado.', 'Each new order shows in the list with its status.'),
            getText('Ábrelo para ver el detalle y actualizar su estado.', 'Open it to see the detail and update its status.'),
          ]}
        />

        {!isPaidPlan(plan) && (
          <p className="mt-3 max-w-3xl text-sm text-gray-500 dark:text-neutral-400">
            {getText(
              'Los pedidos online con cobro por tarjeta son parte del plan Growth. Con el plan gratis, tus clientes te siguen contactando por tus canales.',
              'Online orders with card payment are part of the Growth plan. On the free plan, customers still order via WhatsApp.',
            )}
          </p>
        )}

        {isPaidPlan(plan) && <PickupRulesCard slug={slug} initial={pickupRules} getText={getText} toast={toast} />}
        {isPaidPlan(plan) && <TaxSettingsCard slug={slug} initial={taxSettings} getText={getText} toast={toast} />}

        {orders.length === 0 ? (
          // Sin esta explicación, un negocio que vende en ruta ve la pantalla vacía y cree que algo se rompió:
          // las entregas del camión crean entrega + factura, nunca un pedido.
          <div className="mt-8 max-w-3xl rounded-2xl border border-dashed border-gray-300 dark:border-neutral-700 p-8 text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-neutral-200">
              {getText('Todavía no hay pedidos.', 'No orders yet.')}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-neutral-400">
              {getText(
                'Acá caen los pedidos que te hacen desde tu página y las ventas que cobras en el punto de venta. Las entregas que hace el camión en su ruta no son pedidos: esas van en Reparto y en Facturas.',
                'This is where orders from your page and sales you charge at the point of sale land. Deliveries made by the truck on its route are not orders: those live in Delivery and Invoices.',
              )}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Link
                href={`/space/${slug}/pos`}
                className="min-h-10 rounded-full px-4 py-2 text-xs font-semibold text-white"
                style={{ backgroundColor: 'var(--brand-primary, #045AFE)' }}
              >
                {getText('Cobrar en el punto de venta', 'Charge at the point of sale')}
              </Link>
              <Link
                href={`/${slug}`}
                className="min-h-10 rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold dark:border-neutral-700"
              >
                {getText('Ver mi página', 'View my page')}
              </Link>
            </div>
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
                      <a href={`tel:${order.customerPhone}`} className="block truncate text-xs text-gray-500 hover:text-brand-primary dark:text-neutral-400">📞 {order.customerPhone}</a>
                    )}
                    <div className="mt-1"><CustomerTrustBadge order={order} getText={getText} /></div>
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
                    {order.fulfillmentType === 'shipping' && (
                      <div className="mt-1 text-xs text-gray-600 dark:text-neutral-300">
                        <p className="font-semibold text-brand-primary">
                          📦 {getText('Envío', 'Shipping')}{order.shippingMethodName && <span className="font-normal text-gray-500 dark:text-neutral-400"> · {order.shippingMethodName}</span>}
                        </p>
                        {order.shipTo && (
                          <p className="mt-0.5 leading-snug">
                            {order.shipTo.name && <>{order.shipTo.name}<br /></>}
                            {order.shipTo.line1}{order.shipTo.line2 ? `, ${order.shipTo.line2}` : ''}<br />
                            {order.shipTo.city}, {order.shipTo.state} {order.shipTo.zip}
                          </p>
                        )}
                        {order.labelUrl && (
                          <p className="mt-1 text-xs text-gray-600 dark:text-neutral-400">
                            🏷️ <a href={order.labelUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline">{getText('Imprimir etiqueta', 'Print label')}</a>
                            {order.labelCost != null && (
                              <> · {getText('costo', 'cost')} {fmt(order.labelCost, order.currency)} / {getText('cobraste', 'charged')} {fmt(order.shippingCost ?? 0, order.currency)}</>
                            )}
                          </p>
                        )}
                        {order.trackingNumber && (
                          <p className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            🚚 {carrierLabel(order.shippingCarrier)} ·{' '}
                            {order.trackingUrl ? (
                              <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="underline">{order.trackingNumber}</a>
                            ) : order.trackingNumber}
                          </p>
                        )}
                      </div>
                    )}
                    {order.priceListName && (
                      <p className="mt-1 inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                        🏷️ {order.priceListName}
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
                        {order.noShowAt ? getText('No vino', 'No-show') : payLater ? getText('Aceptado', 'Accepted') : (STATUS_LABELS[order.status]?.[language] ?? order.status)}
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

                {order.fulfillmentType === 'shipping' && ['Paid', 'Preparing', 'Ready'].includes(order.status) && shippingId !== order.id && (
                  labelId === order.id ? (
                    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                        {getText('Etiqueta con United Bridge', 'United Bridge label')}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={labelLb}
                          onChange={(e) => { setLabelLb(e.target.value); setLabelQuote(null); }}
                          placeholder={getText('Peso en lb (opcional)', 'Weight in lb (optional)')}
                          className="min-h-11 min-w-0 flex-1 rounded-lg border border-emerald-300 bg-white px-3 text-sm dark:border-emerald-800 dark:bg-neutral-900"
                        />
                        <button
                          type="button"
                          disabled={labelBusy}
                          onClick={() => labelCall(order.id, 'label-quote')}
                          className="min-h-11 rounded-full border border-emerald-600 px-4 text-sm font-semibold text-emerald-700 disabled:opacity-50 dark:text-emerald-300"
                        >
                          {getText('Ver costo real', 'Get real cost')}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                        {getText('Sin peso, se suma el de los productos más la caja.', 'Empty = product weights plus the box.')}
                      </p>
                      {labelQuote && (
                        <p className="mt-2 text-sm text-gray-800 dark:text-neutral-200">
                          {getText('Costo real', 'Real cost')}: <b>{fmt(labelQuote.total, labelQuote.currency)}</b> · {getText('cobraste', 'charged')}: <b>{fmt(labelQuote.charged, labelQuote.currency)}</b>{' '}
                          <span className={labelQuote.charged - labelQuote.total >= 0 ? 'font-semibold text-emerald-700 dark:text-emerald-300' : 'font-semibold text-red-600'}>
                            ({labelQuote.charged - labelQuote.total >= 0 ? '+' : ''}{fmt(labelQuote.charged - labelQuote.total, labelQuote.currency)})
                          </span>
                          <br />
                          <span className="text-xs text-gray-500 dark:text-neutral-400">
                            {Math.round((labelQuote.weightOz / 16) * 100) / 100} lb{labelQuote.accountBalance != null ? ` · ${getText('saldo', 'balance')} ${fmt(labelQuote.accountBalance, labelQuote.currency)}` : ''}
                          </span>
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          disabled={labelBusy}
                          onClick={() => {
                            if (window.confirm(getText('Esto compra la etiqueta y descuenta el saldo de tu cuenta de United Bridge. ¿Continuar?', 'This buys the label and charges your United Bridge balance. Continue?'))) labelCall(order.id, 'label');
                          }}
                          className="flex min-h-11 flex-1 items-center justify-center rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                        >
                          {labelBusy ? getText('Procesando…', 'Working…') : getText('Comprar etiqueta', 'Buy label')}
                        </button>
                        <button type="button" onClick={() => { setLabelId(null); setLabelQuote(null); setLabelLb(''); }} className="px-2 text-xs text-gray-500 underline">
                          {getText('Cancelar', 'Cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setLabelId(order.id); setLabelQuote(null); setLabelLb(''); }}
                      className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-emerald-600 px-4 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                    >
                      🏷️ {getText('Comprar etiqueta (United Bridge)', 'Buy label (United Bridge)')}
                    </button>
                  )
                )}

                {order.fulfillmentType === 'shipping' && ['Paid', 'Preparing', 'Ready'].includes(order.status) && labelId !== order.id && (
                  shippingId === order.id ? (
                    <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/50 dark:bg-blue-950/20">
                      <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                        {getText('¿Con qué paquetería lo enviaste?', 'Which carrier did you ship with?')}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <select
                          value={shipCarrier}
                          onChange={(e) => setShipCarrier(e.target.value)}
                          className="min-h-11 rounded-lg border border-blue-300 bg-white px-3 text-sm dark:border-blue-800 dark:bg-neutral-900"
                        >
                          {CARRIERS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <input
                          type="text"
                          value={shipTracking}
                          onChange={(e) => setShipTracking(e.target.value)}
                          maxLength={80}
                          placeholder={getText('Número de rastreo', 'Tracking number')}
                          className="min-h-11 min-w-0 flex-1 rounded-lg border border-blue-300 bg-white px-3 text-sm dark:border-blue-800 dark:bg-neutral-900"
                        />
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          disabled={updatingId === order.id || shipTracking.trim().length < 4}
                          onClick={() => markShipped(order.id)}
                          className="flex min-h-11 flex-1 items-center justify-center rounded-full bg-brand-primary px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                        >
                          {getText('Confirmar envío', 'Confirm shipment')}
                        </button>
                        <button type="button" onClick={() => { setShippingId(null); setShipTracking(''); }} className="px-2 text-xs text-gray-500 underline">
                          {getText('Cancelar', 'Cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setShippingId(order.id); setShipCarrier('usps'); setShipTracking(''); }}
                      className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-primary px-4 text-sm font-semibold text-white hover:opacity-90"
                    >
                      📦 {getText('Marcar enviado', 'Mark shipped')}
                    </button>
                  )
                )}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 dark:border-neutral-800 pt-3">
                  <span className="text-sm font-bold">
                    {fmt(order.total, order.currency)}
                    {!!order.shippingCost && (
                      <span className="ml-1.5 font-normal text-gray-500 dark:text-neutral-400">
                        ({getText('envío', 'shipping')} {fmt(order.shippingCost, order.currency)})
                      </span>
                    )}
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
                  {order.status === 'Preparing' && order.fulfillmentType !== 'shipping' && (
                    <button
                      onClick={() => updateStatus(order.id, 'Ready')}
                      disabled={updatingId === order.id}
                      className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-4 text-xs font-medium hover:border-brand-primary hover:text-brand-primary disabled:opacity-50"
                    >
                      {getText('Marcar listo', 'Mark ready')}
                    </button>
                  )}
                  {canMarkNoShow(order) && (
                    <button
                      onClick={() => setNoShow(order, false)}
                      disabled={updatingId === order.id}
                      className="flex min-h-11 items-center justify-center rounded-full border border-red-300 px-4 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-950"
                    >
                      🚫 {getText('No vino', 'No-show')}
                    </button>
                  )}
                  {order.noShowAt && (
                    <button
                      onClick={() => setNoShow(order, true)}
                      disabled={updatingId === order.id}
                      className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 px-4 text-xs font-medium text-gray-500 hover:border-brand-primary hover:text-brand-primary disabled:opacity-50 dark:border-neutral-700"
                    >
                      ↩ {getText('Deshacer "No vino"', 'Undo no-show')}
                    </button>
                  )}
                  {order.noShowAt && (
                    <button
                      onClick={() => setNoShow(order, true, false)}
                      disabled={updatingId === order.id}
                      title={getText('Quita la marca al cliente y deja el pedido cancelado', 'Clears the customer mark and leaves the order canceled')}
                      className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 px-4 text-xs font-medium text-gray-500 hover:border-brand-primary hover:text-brand-primary disabled:opacity-50 dark:border-neutral-700"
                    >
                      {getText('Solo quitar la marca', 'Only clear the mark')}
                    </button>
                  )}
                  {order.status === 'Ready' && order.fulfillmentType !== 'shipping' && (
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
