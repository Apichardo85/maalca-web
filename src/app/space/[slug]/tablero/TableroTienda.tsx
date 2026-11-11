'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { moneyFormatter } from '@/lib/receivables';
import type { OrderRow } from '@/lib/orderTicket';

// "Operación hoy" para negocios con pedidos pero SIN módulo de rutas (tiendas, mayoristas). El tablero de
// reparto (TableroContent) habla de camiones y envases; este habla de lo que mueve una tienda: ventas del día,
// pedidos por atender, envíos por despachar y lo pendiente de cobro. Todo sale de la lista de pedidos que el
// panel ya carga — sin endpoints nuevos.

interface Props {
  slug: string;
  currency: 'USD' | 'DOP';
  initialOrders: OrderRow[];
}

const REFRESH_MS = 60000;
const card = 'rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4';
const h2 = 'text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500';
// Un pedido "vendido" ya está cobrado o en proceso; Pending (sin pagar) y Canceled no cuentan como venta.
const SOLD = new Set(['Paid', 'Preparing', 'Ready', 'Fulfilled']);

const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function TableroTienda({ slug, currency, initialOrders }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const fmt = moneyFormatter(currency);

  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [updatedAt, setUpdatedAt] = useState(() => new Date());

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/space/${slug}/orders`, { cache: 'no-store' });
        if (!res.ok || !alive) return;
        const json = await res.json();
        const list = Array.isArray(json) ? json : json?.data;
        if (Array.isArray(list)) {
          setOrders(list as OrderRow[]);
          setUpdatedAt(new Date());
        }
      } catch {
        // Se queda con lo último que tenía.
      }
    };
    const id = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [slug]);

  const todayKey = dayKey(new Date());
  const isToday = (iso: string) => dayKey(new Date(iso)) === todayKey;
  const isShipping = (o: OrderRow) => o.fulfillmentType === 'shipping';

  const todays = orders.filter((o) => isToday(o.createdAt) && o.status !== 'Canceled');
  const soldToday = todays.filter((o) => SOLD.has(o.status));
  const salesToday = soldToday.reduce((s, o) => s + o.total, 0);
  const toShip = orders.filter((o) => isShipping(o) && !o.trackingNumber && ['Paid', 'Preparing', 'Ready'].includes(o.status));
  const toAttend = orders.filter((o) => !isShipping(o) && ['Paid', 'Preparing', 'Ready'].includes(o.status));
  const unpaid = orders.filter((o) => o.status === 'Pending');
  const unpaidTotal = unpaid.reduce((s, o) => s + o.total, 0);

  // Últimos 7 días (hoy incluido): ventas por día.
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = dayKey(d);
    const total = orders.filter((o) => SOLD.has(o.status) && dayKey(new Date(o.createdAt)) === key).reduce((s, o) => s + o.total, 0);
    return { key, label: d.toLocaleDateString(language === 'es' ? 'es' : 'en-US', { weekday: 'short' }), total };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.total));
  const week = days.reduce((s, d) => s + d.total, 0);

  const kpi = (label: string, value: string, sub?: string, href?: string) => {
    const body = (
      <>
        <p className={h2}>{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">{sub}</p>}
      </>
    );
    return href ? (
      <Link href={href} className={`${card} block transition hover:border-gray-300 dark:hover:border-neutral-600`}>{body}</Link>
    ) : (
      <div className={card}>{body}</div>
    );
  };

  const pending = [...toShip, ...toAttend].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).slice(0, 8);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold">{getText('Operación hoy', "Today's operation")}</h1>
        <span className="text-xs text-gray-400 dark:text-neutral-500">
          {getText('Actualizado', 'Updated')} {updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpi(getText('Vendido hoy', 'Sold today'), fmt.format(salesToday), `${soldToday.length} ${getText(soldToday.length === 1 ? 'pedido' : 'pedidos', soldToday.length === 1 ? 'order' : 'orders')}`, `/space/${slug}/orders`)}
        {kpi(getText('Por despachar', 'To ship'), String(toShip.length), getText('envíos pagados sin rastreo', 'paid shipments without tracking'), `/space/${slug}/orders`)}
        {kpi(getText('Por atender', 'To handle'), String(toAttend.length), getText('recoger en tienda', 'store pickup'), `/space/${slug}/orders`)}
        {kpi(getText('Sin pagar', 'Unpaid'), String(unpaid.length), unpaid.length > 0 ? fmt.format(unpaidTotal) : undefined, `/space/${slug}/orders`)}
      </div>

      <section className={card}>
        <div className="flex items-baseline justify-between">
          <h2 className={h2}>{getText('Últimos 7 días', 'Last 7 days')}</h2>
          <span className="text-sm font-semibold">{fmt.format(week)}</span>
        </div>
        <div className="mt-3 flex h-28 items-end gap-2">
          {days.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center justify-end gap-1" title={fmt.format(d.total)}>
              <div className="w-full rounded-md bg-brand-primary/80" style={{ height: `${Math.max(3, (d.total / maxDay) * 100)}%` }} />
              <span className="text-[11px] text-gray-500 dark:text-neutral-400">{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={card}>
        <h2 className={h2}>{getText('Lo que sigue', 'Up next')}</h2>
        {pending.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500 dark:text-neutral-400">{getText('Nada pendiente. Todo despachado.', 'Nothing pending. All shipped.')}</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100 dark:divide-neutral-800">
            {pending.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="min-w-0 truncate">
                  <span className="font-medium">{o.customerName ?? getText('Cliente', 'Customer')}</span>
                  <span className="ml-2 text-gray-500 dark:text-neutral-400">
                    {isShipping(o) ? `🚚 ${getText('envío', 'shipping')}` : `🛍️ ${getText('recoger', 'pickup')}`}
                  </span>
                </span>
                <span className="shrink-0 font-semibold">{fmt.format(o.total)}</span>
              </li>
            ))}
          </ul>
        )}
        {(toShip.length + toAttend.length > pending.length) && (
          <Link href={`/space/${slug}/orders`} className="mt-3 inline-block text-sm font-semibold text-brand-primary">
            {getText('Ver todos los pedidos →', 'See all orders →')}
          </Link>
        )}
      </section>
    </div>
  );
}
