// Pedido (OrderRow) + impresión de ticket de cocina — extraído de OrdersContent.tsx para que
// la Estación de pedidos (/space/{slug}/station) pueda imprimir exactamente el mismo ticket al
// aceptar, sin duplicar el layout. OrdersContent sigue re-exportando estos nombres para no
// tocar sus importadores existentes (KitchenContent, orders/page.tsx).

export interface OrderItem {
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
  status: 'Pending' | 'Paid' | 'Preparing' | 'Ready' | 'Fulfilled' | 'Canceled';
  createdAt: string;
  // Pedido desde la mesa (QR por mesa). paymentMethod === 'PayAtTable' = el cliente paga al mesero.
  tableNumber?: string | null;
  paymentMethod?: string | null;
  // Pedido programado: "yyyy-MM-dd" de la apertura para la que se pidió (el negocio estaba cerrado).
  scheduledFor?: string | null;
  // Cobro en el local (pagar al recoger / mesero): null = por cobrar. method: Cash | Card | Other.
  collectedAt?: string | null;
  collectedMethod?: string | null;
  collectedReference?: string | null;
  // Hora estimada de entrega (ISO) que se fija al aceptar; el cliente la ve en /t/{token}.
  estimatedReadyAt?: string | null;
  // Estación de pedidos (Fase 3): cuándo el personal reconoció este pedido. Null = la alarma de
  // la estación sigue sonando por este pedido en todos los dispositivos.
  acknowledgedAt?: string | null;
  // "No vino": el cliente nunca recogió el pedido (queda Canceled). Ver CustomerTrustBadge.
  noShowAt?: string | null;
  // Historial del cliente (visitas y "No vino") — viene en el listado; los eventos en tiempo real
  // de cambios de estado no lo traen (null) y el front conserva el que ya tenía.
  customerVisits?: number | null;
  customerNoShows?: number | null;
}

/** Fusiona una actualización en tiempo real conservando el historial del cliente que ya se tenía. */
export function mergeOrderUpdate(prev: OrderRow | undefined, next: OrderRow): OrderRow {
  if (!prev) return next;
  return {
    ...prev,
    ...next,
    customerVisits: next.customerVisits ?? prev.customerVisits,
    customerNoShows: next.customerNoShows ?? prev.customerNoShows,
  };
}

/** "2026-10-03" -> "mié, 3 oct". Se arma con partes numéricas para no correrse de día por zona horaria. */
export function formatScheduledFor(iso: string, language: 'es' | 'en'): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(language === 'es' ? 'es-DO' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

/** Ticket de cocina (80 mm / térmica): abre el diálogo de impresión del navegador con un layout monocromo y grande. */
export function printTicket(order: OrderRow, title: string, language: 'es' | 'en', timeZone?: string) {
  const t = (es: string, en: string) => (language === 'es' ? es : en);
  const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency || 'USD' }).format(n);
  const kind = order.tableNumber
    ? `${t('MESA', 'TABLE')} ${order.tableNumber}`
    : order.paymentMethod === 'PayAtPickup' ? t('PARA RECOGER', 'PICKUP') : t('PEDIDO ONLINE', 'ONLINE ORDER');
  const payLater = order.paymentMethod === 'PayAtPickup' || order.paymentMethod === 'PayAtTable';
  const unpaid = payLater && !order.collectedAt;
  const when = new Date(order.createdAt).toLocaleString(language === 'es' ? 'es' : 'en-US', timeZone ? { timeZone } : undefined);
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
    <h1>${esc(title)}</h1>
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
    ${unpaid ? `<div class="big">${t('COBRAR AL ENTREGAR', 'COLLECT PAYMENT')}</div>` : `<div class="c">${t('Pagado', 'Paid')}${order.collectedMethod ? ` (${order.collectedMethod})` : ''}</div>`}
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
