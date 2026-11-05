'use client';

// Reporte de ventas por cliente: rango de fechas, tabla ordenada por lo comprado y descarga en CSV.
import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { downloadCsv } from './csv';

interface Row {
  customerId: string;
  name: string;
  email: string | null;
  phone: string | null;
  businessName: string | null;
  orders: number;
  spent: number;
  avgTicket: number;
  lastOrderAt: string | null;
}

interface Props {
  slug: string;
  open: boolean;
  onClose: () => void;
  getText: (es: string, en: string) => string;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

export function SalesReport({ slug, open, onClose, getText }: Props) {
  const today = new Date();
  const [from, setFrom] = useState(iso(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [to, setTo] = useState(iso(today));
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    fetch(`/api/space/${slug}/customers-report?from=${from}&to=${to}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Row[]) => alive && setRows(Array.isArray(d) ? d : []))
      .catch(() => alive && setRows([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [open, slug, from, to]);

  const total = (rows ?? []).reduce((s, r) => s + r.spent, 0);
  const orders = (rows ?? []).reduce((s, r) => s + r.orders, 0);

  function preset(kind: 'month' | 'last30' | 'year') {
    const now = new Date();
    if (kind === 'month') setFrom(iso(new Date(now.getFullYear(), now.getMonth(), 1)));
    if (kind === 'last30') setFrom(iso(new Date(now.getTime() - 29 * 86400000)));
    if (kind === 'year') setFrom(iso(new Date(now.getFullYear(), 0, 1)));
    setTo(iso(now));
  }

  function exportCsv() {
    downloadCsv(`ventas-por-cliente_${from}_${to}.csv`, [
      [getText('Cliente', 'Customer'), getText('Negocio', 'Business'), 'Email', getText('Teléfono', 'Phone'), getText('Compras', 'Purchases'), getText('Total', 'Total'), getText('Ticket promedio', 'Average ticket'), getText('Última compra', 'Last purchase')],
      ...(rows ?? []).map((r) => [r.name, r.businessName, r.email, r.phone, r.orders, r.spent.toFixed(2), r.avgTicket.toFixed(2), r.lastOrderAt?.slice(0, 10)]),
    ]);
  }

  const input = 'rounded-lg border border-gray-200 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white';
  const chip = 'rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:border-brand-primary dark:border-neutral-700 dark:text-neutral-300';

  return (
    <Modal isOpen={open} onClose={onClose} title={getText('Ventas por cliente', 'Sales by customer')} size="lg">
      <div className="max-h-[75vh] overflow-y-auto px-6 py-4">
        <div className="mb-3 flex flex-wrap items-end gap-2">
          <label className="text-xs text-gray-500">{getText('Desde', 'From')}<br /><input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={input} /></label>
          <label className="text-xs text-gray-500">{getText('Hasta', 'To')}<br /><input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={input} /></label>
          <button type="button" className={chip} onClick={() => preset('month')}>{getText('Este mes', 'This month')}</button>
          <button type="button" className={chip} onClick={() => preset('last30')}>{getText('Últimos 30 días', 'Last 30 days')}</button>
          <button type="button" className={chip} onClick={() => preset('year')}>{getText('Este año', 'This year')}</button>
        </div>

        {loading || rows === null ? (
          <p className="py-8 text-center text-sm text-gray-400">{getText('Cargando…', 'Loading…')}</p>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">{getText('No hay compras en este rango.', 'No purchases in this range.')}</p>
        ) : (
          <>
            <p className="mb-2 text-sm text-gray-600 dark:text-neutral-400">
              {rows.length} {getText('clientes', 'customers')} · {orders} {getText('compras', 'purchases')} · <strong className="text-gray-900 dark:text-white">${total.toFixed(2)}</strong>
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500 dark:border-neutral-700">
                  <th className="py-2">{getText('Cliente', 'Customer')}</th>
                  <th className="py-2 text-right">{getText('Compras', 'Purchases')}</th>
                  <th className="py-2 text-right">Total</th>
                  <th className="hidden py-2 text-right sm:table-cell">{getText('Promedio', 'Average')}</th>
                  <th className="hidden py-2 text-right sm:table-cell">{getText('Última', 'Last')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.customerId} className="border-b border-gray-100 dark:border-neutral-800">
                    <td className="py-2 pr-2">
                      <span className="font-medium text-gray-900 dark:text-white">{r.name}</span>
                      {r.businessName && <span className="block text-xs text-gray-500">{r.businessName}</span>}
                    </td>
                    <td className="py-2 text-right">{r.orders}</td>
                    <td className="py-2 text-right font-semibold">${r.spent.toFixed(2)}</td>
                    <td className="hidden py-2 text-right sm:table-cell">${r.avgTicket.toFixed(2)}</td>
                    <td className="hidden py-2 text-right text-xs text-gray-500 sm:table-cell">{r.lastOrderAt?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={exportCsv} className="mt-4 rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-hover">
              ⬇ {getText('Descargar CSV', 'Download CSV')}
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
