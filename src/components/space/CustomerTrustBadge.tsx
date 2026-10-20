'use client';

import type { OrderRow } from '@/lib/orderTicket';

/** Señal de confianza del cliente en un pedido para recoger (Estación y Pedidos):
 *  "No vino ×N" (rojo) si ya falló antes, "Cliente nuevo" (ámbar) si es su primera vez,
 *  "N visitas" (verde) si ya vino. Pedidos de mesa o sin cliente enlazado: nada. */
export function CustomerTrustBadge({
  order, getText, size = 'sm',
}: { order: OrderRow; getText: (es: string, en: string) => string; size?: 'sm' | 'md' }) {
  if (order.tableNumber || order.customerVisits == null) return null;
  const cls = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]';
  const noShows = order.customerNoShows ?? 0;
  if (noShows > 0) {
    return (
      <span className={`inline-block rounded-full bg-red-600 font-bold text-white ${cls}`}>
        ⚠ {getText(`No vino ×${noShows}`, `No-show ×${noShows}`)}
      </span>
    );
  }
  if (order.customerVisits === 0) {
    return (
      <span className={`inline-block rounded-full bg-amber-500/20 font-semibold text-amber-800 dark:text-amber-300 ${cls}`}>
        ★ {getText('Cliente nuevo', 'New customer')}
      </span>
    );
  }
  return (
    <span className={`inline-block rounded-full bg-green-600/15 font-semibold text-green-700 dark:text-green-300 ${cls}`}>
      ✓ {getText(`${order.customerVisits} visita${order.customerVisits === 1 ? '' : 's'}`, `${order.customerVisits} visit${order.customerVisits === 1 ? '' : 's'}`)}
    </span>
  );
}

/** ¿Se puede marcar "No vino"? Solo pedidos para pagar al recoger, aceptados y sin cobrar. */
export function canMarkNoShow(o: OrderRow): boolean {
  return o.paymentMethod === 'PayAtPickup' && !o.collectedAt && !o.noShowAt
    && (o.status === 'Paid' || o.status === 'Preparing' || o.status === 'Ready');
}
