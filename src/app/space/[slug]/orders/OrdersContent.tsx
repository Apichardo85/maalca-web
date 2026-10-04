'use client';

import { useMemo, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { DangerZoneDelete } from '@/components/space/DangerZoneDelete';
import { isPaidPlan } from '@/lib/plan-limits';

interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  qty: number;
  notes?: string;
}

export interface OrderRow {
  id: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  notes: string | null;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  tip?: number;
  total: number;
  currency: string;
  status: 'Pending' | 'Paid' | 'Preparing' | 'Fulfilled' | 'Canceled';
  createdAt: string;
  // Pedido desde la mesa (QR por mesa). paymentMethod === 'PayAtTable' = el cliente paga al mesero.
  tableNumber?: string | null;
  paymentMethod?: string | null;
  // Pedido programado: "yyyy-MM-dd" de la apertura para la que se pidió (el negocio estaba cerrado).
  scheduledFor?: string | null;
}

/** "2026-10-03" -> "mié, 3 oct". Se arma con partes numéricas para no correrse de día por zona horaria. */
export function formatScheduledFor(iso: string, language: 'es' | 'en'): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(language === 'es' ? 'es-DO' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

interface Props {
  slug: string;
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
  Fulfilled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Canceled: 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400',
};

const STATUS_LABELS: Record<string, { es: string; en: string }> = {
  Pending: { es: 'Pendiente', en: 'Pending' },
  Paid: { es: 'Pagado', en: 'Paid' },
  Preparing: { es: 'En preparación', en: 'Preparing' },
  Fulfilled: { es: 'Entregado', en: 'Fulfilled' },
  Canceled: { es: 'Cancelado', en: 'Canceled' },
};

const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

/** Ticket de cocina (80 mm / térmica): abre el diálogo de impresión del navegador con un layout monocromo y grande. */
function printTicket(order: OrderRow, slug: string, language: 'es' | 'en') {
  const t = (es: string, en: string) => (language === 'es' ? es : en);
  const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency || 'USD' }).format(n);
  const kind = order.tableNumber
    ? `${t('MESA', 'TABLE')} ${order.tableNumber}`
    : order.paymentMethod === 'PayAtPickup' ? t('PARA RECOGER', 'PICKUP') : t('PEDIDO ONLINE', 'ONLINE ORDER');
  const payLater = order.paymentMethod === 'PayAtPickup' || order.paymentMethod === 'PayAtTable';
  const unpaid = payLater && order.status !== 'Fulfilled';
  const when = new Date(order.createdAt).toLocaleString(language === 'es' ? 'es-DO' : 'en-US');
  const items = order.items.map((i) =>
    `<div class="it"><b>${i.qty}x</b> ${esc(i.name)}</div>${i.notes ? `<div class="nt">&gt;&gt; ${esc(i.notes)}</div>` : ''}`).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Ticket</title><style>
    @page { size: 80mm auto; margin: 3mm; }
    body { font-family: 'Courier New', monospace; width: 74mm; margin: 0; color: #000; font-size: 13px; }
    h1 { font-size: 20px; text-align: center; margin: 0 0 4px; } .c { text-align: center; }
    .big { font-size: 18px; font-weight: 700; text-align: center; border: 2px solid #000; padding: 4px; margin: 6px 0; }
    hr { border: 0; border-top: 1px dashed #000; margin: 6px 0; }
    .it { font-size: 16px; margin-top: 5px; } .nt { font-size: 14px; font-weight: 700; margin-left: 14px; }
    .row { display: flex; justify-content: space-between; } .tot { font-size: 16px; font-weight: 700; }
  </style></head><body>
    <h1>${esc(slug)}</h1>
    <div class="big">${esc(kind)}</div>
    ${order.scheduledFor ? `<div class="c"><b>${t('PROGRAMADO', 'SCHEDULED')}: ${esc(formatScheduledFor(order.scheduledFor, language))}</b></div>` : ''}
    <div>${esc(when)}</div>
    <div>#${esc(order.id.slice(0, 8).toUpperCase())}</div>
    ${order.customerName ? `<div><b>${esc(order.customerName)}</b></div>` : ''}
    ${order.customerPhone ? `<div>${esc(order.customerPhone)}</div>` : ''}
    <hr>${items}<hr>
    ${order.notes ? `<div><b>${t('Notas', 'Notes')}:</b> ${esc(order.notes)}</div><hr>` : ''}
    <div class="row"><span>Subtotal</span><span>${money(order.subtotal)}</span></div>
    ${order.tax ? `<div class="row"><span>Tax</span><span>${money(order.tax)}</span></div>` : ''}
    ${order.tip ? `<div class="row"><span>${t('Propina', 'Tip')}</span><span>${money(order.tip)}</span></div>` : ''}
    <div class="row tot"><span>TOTAL</span><span>${money(order.total)}</span></div>
    ${unpaid ? `<div class="big">${t('COBRAR AL ENTREGAR', 'COLLECT PAYMENT')}</div>` : `<div class="c">${t('Pagado', 'Paid')}</div>`}
  </body></html>`;
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(frame);
  const doc = frame.contentWindow?.document;
  if (!doc || !frame.contentWindow) { frame.remove(); return; }
  doc.open(); doc.write(html); doc.close();
  setTimeout(() => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    setTimeout(() => frame.remove(), 2000);
  }, 250);
}

export function OrdersContent({ slug, plan, initialOrders, canHardDelete }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [orders, setOrders] = useState(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
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

  async function updateStatus(orderId: string, status: string) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/space/${slug}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)));
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
              {(['Pending', 'Paid', 'Preparing', 'Fulfilled', 'Canceled'] as const).map((st) => (
                <FilterChip key={st} active={statusFilter === st} onClick={() => setStatusFilter(st)}>
                  {STATUS_LABELS[st][language]} ({statusCount(st)})
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

                <button
                  type="button"
                  onClick={() => printTicket(order, slug, language)}
                  className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-gray-200 px-3 text-xs font-medium text-gray-600 hover:border-brand-primary hover:text-brand-primary dark:border-neutral-700 dark:text-neutral-300"
                >
                  🖨️ {getText('Imprimir ticket', 'Print ticket')}
                </button>

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
                  {order.status === 'Preparing' && (
                    <button
                      onClick={() => updateStatus(order.id, 'Fulfilled')}
                      disabled={updatingId === order.id}
                      className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-4 text-xs font-medium hover:border-brand-primary hover:text-brand-primary disabled:opacity-50"
                    >
                      {getText('Marcar entregado', 'Mark fulfilled')}
                    </button>
                  )}
                  {order.status === 'Pending' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateStatus(order.id, 'Canceled')}
                        disabled={updatingId === order.id}
                        className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-4 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                      >
                        {getText('Cancelar', 'Cancel')}
                      </button>
                      <button
                        onClick={() => updateStatus(order.id, 'Paid')}
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
