'use client';

// Ficha del cliente para el dueño: cuenta mayorista (con cambio de lista), cifras de compra, compras por mes,
// productos más comprados, exportar su historial a CSV y "Vender en el POS" a su nombre.
// Compras = pedidos cobrados (pago en el local solo cuenta al cobrarse); mismo criterio que el API.
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { downloadCsv } from './csv';

interface Insights {
  account: { id: string; status: string; businessName: string | null; taxId: string | null; priceListId: string | null; priceListName: string | null } | null;
  stats: { orderCount: number; purchaseCount: number; spent: number; avgTicket: number; firstOrderAt: string | null; lastOrderAt: string | null; avgDaysBetween: number | null };
  monthly: { month: string; total: number; orders: number }[];
  topProducts: { name: string; qty: number; amount: number; lastAt: string }[];
  orders: { id: string; createdAt: string; status: string; total: number; counted: boolean; items: { name: string; qty: number; price: number }[] }[];
  noShows?: number;
}

interface Props {
  slug: string;
  customerId: string;
  customerName: string;
  getText: (es: string, en: string) => string;
  language: string;
  currency?: 'USD' | 'DOP';
}

const ACCOUNT_ES: Record<string, string> = { approved: 'Aprobada', pending: 'Pendiente', rejected: 'Sin acceso' };

export function CustomerInsights({ slug, customerId, customerName, getText, language, currency = 'USD' }: Props) {
  const [data, setData] = useState<Insights | null>(null);
  const [failed, setFailed] = useState(false);
  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const [savingList, setSavingList] = useState(false);
  const money = (n: number) => `${currency === 'DOP' ? 'RD$' : '$'}${n.toFixed(2)}`;
  const date = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(language === 'en' ? 'en-US' : 'es', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  useEffect(() => {
    let alive = true;
    setData(null);
    setFailed(false);
    fetch(`/api/space/${slug}/customers/${customerId}/insights`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Insights) => {
        if (!alive) return;
        setData(d);
        if (d.account) {
          fetch(`/api/space/${slug}/price-lists`, { cache: 'no-store' })
            .then((r) => (r.ok ? r.json() : []))
            .then((l: { id: string; name: string }[]) => alive && setLists(Array.isArray(l) ? l : []))
            .catch(() => {});
        }
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [slug, customerId]);

  async function changeList(value: string) {
    if (!data?.account) return;
    setSavingList(true);
    try {
      const res = await fetch(`/api/space/${slug}/store-customers/${data.account.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value ? { priceListId: value } : { clearPriceList: true }),
      });
      if (res.ok) {
        const name = lists.find((l) => l.id === value)?.name ?? null;
        setData({ ...data, account: { ...data.account, priceListId: value || null, priceListName: name } });
      }
    } finally {
      setSavingList(false);
    }
  }

  async function clearNoShows() {
    if (!data) return;
    const res = await fetch(`/api/space/${slug}/customers/${customerId}/clear-no-shows`, { method: 'POST' });
    if (res.ok) setData({ ...data, noShows: 0 });
  }

  function exportCsv() {
    if (!data) return;
    const rows: (string | number)[][] = [[
      getText('Fecha', 'Date'), getText('Pedido', 'Order'), getText('Estado', 'Status'), getText('Cuenta como compra', 'Counts as purchase'),
      getText('Producto', 'Product'), getText('Cantidad', 'Qty'), getText('Precio', 'Price'), getText('Importe', 'Amount'), getText('Total del pedido', 'Order total'),
    ]];
    for (const o of data.orders) {
      const lines = o.items.length ? o.items : [{ name: '', qty: 0, price: 0 }];
      for (const l of lines) {
        rows.push([o.createdAt.slice(0, 10), o.id.slice(0, 8).toUpperCase(), o.status, o.counted ? 'Sí' : 'No', l.name, l.qty, l.price.toFixed(2), (l.price * l.qty).toFixed(2), o.total.toFixed(2)]);
      }
    }
    downloadCsv(`${customerName.replace(/[^\w-]+/g, '_')}-${getText('pedidos', 'orders')}.csv`, rows);
  }

  if (failed) return null;
  if (!data) return <p className="py-4 text-center text-sm text-gray-400">{getText('Cargando estadísticas…', 'Loading stats…')}</p>;

  const { stats, account } = data;
  const max = Math.max(1, ...data.monthly.map((m) => m.total));
  const card = 'rounded-xl bg-gray-50 p-3 dark:bg-neutral-800/60';
  const label = 'text-xs text-gray-500 dark:text-neutral-400';
  const value = 'mt-1 text-base font-bold text-gray-900 dark:text-white';

  return (
    <div className="mb-5 space-y-4">
      {account && (
        <div className="rounded-xl border border-gray-200 p-3 text-sm dark:border-neutral-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-gray-900 dark:text-white">
              {getText('Cuenta mayorista', 'Wholesale account')} · {language === 'en' ? account.status : ACCOUNT_ES[account.status] ?? account.status}
            </p>
            {lists.length > 0 && (
              <select
                value={account.priceListId ?? ''}
                disabled={savingList}
                onChange={(e) => changeList(e.target.value)}
                className="rounded-lg border border-gray-200 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              >
                <option value="">{getText('Precio normal', 'Regular price')}</option>
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            )}
          </div>
          <p className="mt-1 text-gray-600 dark:text-neutral-400">
            {account.businessName || '—'}
            {account.taxId ? ` · Tax ID ${account.taxId}` : ''}
          </p>
        </div>
      )}

      {(data.noShows ?? 0) > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm dark:border-red-900 dark:bg-red-950/40">
          <p className="text-red-700 dark:text-red-300">
            {getText(`Tiene ${data.noShows} marca(s) "No vino". Si el negocio exige pago adelantado tras un No vino, no podrá pedir pagando al recoger.`,
              `${data.noShows} no-show mark(s). If the business requires prepayment after a no-show, they cannot order with pay-at-pickup.`)}
          </p>
          <button onClick={clearNoShows} className="rounded-lg border border-red-300 px-3 py-1 font-semibold text-red-700 dark:border-red-800 dark:text-red-300">
            {getText('Quitar marcas', 'Clear marks')}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className={card}><p className={label}>{getText('Cobradas / pedidos', 'Paid / orders')}</p><p className={value}>{stats.purchaseCount}<span className="text-xs font-normal text-gray-400"> / {stats.orderCount}</span></p></div>
        <div className={card}><p className={label}>{getText('Total comprado', 'Total spent')}</p><p className={value}>{money(stats.spent)}</p></div>
        <div className={card}><p className={label}>{getText('Ticket promedio', 'Average ticket')}</p><p className={value}>{money(stats.avgTicket)}</p></div>
        <div className={card}><p className={label}>{getText('Compra cada', 'Buys every')}</p><p className={value}>{stats.avgDaysBetween != null ? `${Math.round(stats.avgDaysBetween)} ${getText('días', 'days')}` : '—'}</p></div>
      </div>
      <p className="text-xs text-gray-500 dark:text-neutral-400">
        {getText('Primera compra', 'First purchase')}: {date(stats.firstOrderAt)} · {getText('Última', 'Last')}: {date(stats.lastOrderAt)}
        {stats.orderCount > stats.purchaseCount && ` · ${getText('Los pedidos sin cobrar no cuentan como compra.', 'Unpaid orders do not count as purchases.')}`}
      </p>

      {stats.purchaseCount > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">{getText('Compras por mes', 'Purchases by month')}</p>
          <div className="flex h-24 items-end gap-1">
            {data.monthly.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-1" title={`${m.month}: ${money(m.total)} · ${m.orders}`}>
                <div className="w-full rounded-t bg-brand-primary" style={{ height: `${Math.max(m.total > 0 ? 6 : 1, (m.total / max) * 80)}px`, opacity: m.total > 0 ? 1 : 0.2 }} />
                <span className="text-[9px] text-gray-400">{m.month.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.topProducts.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">{getText('Lo que más compra', 'Top products')}</p>
          <table className="w-full text-sm">
            <tbody>
              {data.topProducts.map((p) => (
                <tr key={p.name} className="border-b border-gray-100 last:border-0 dark:border-neutral-800">
                  <td className="py-1.5 pr-2 text-gray-700 dark:text-neutral-300">{p.name}</td>
                  <td className="py-1.5 text-right text-gray-500">{p.qty} u</td>
                  <td className="py-1.5 pl-3 text-right font-medium text-gray-900 dark:text-white">{money(p.amount)}</td>
                  <td className="hidden py-1.5 pl-3 text-right text-xs text-gray-400 sm:table-cell">{date(p.lastAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/space/${slug}/pos?customer=${customerId}`}
          className="rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-hover"
        >
          {getText('Vender en el POS a su nombre', 'Sell in POS for this customer')}
        </Link>
        {data.orders.length > 0 && (
          <button type="button" onClick={exportCsv} className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:border-brand-primary dark:border-neutral-700 dark:text-neutral-300">
            ⬇ {getText('Exportar historial (CSV)', 'Export history (CSV)')}
          </button>
        )}
      </div>
    </div>
  );
}
