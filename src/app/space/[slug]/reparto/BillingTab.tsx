'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { formatDate, moneyFormatter, readApiError } from '@/lib/receivables';
import type { BillResult, UnbilledReport } from '@/lib/delivery';

interface Props {
  slug: string;
  currency: 'USD' | 'DOP';
  report: UnbilledReport | null;
  onChange: () => Promise<void>;
  notify: { success: (m: string) => void; error: (m: string) => void };
}

// Facturar ciclo: los clientes a crédito acumulan entregas y se les factura al cerrar su periodo.
// Siempre se simula primero (dryRun) y solo se crean las facturas al confirmar.
export function BillingTab({ slug, currency, report, onChange, notify }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const fmt = moneyFormatter(currency);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<BillResult | null>(null);
  const [busy, setBusy] = useState(false);

  const ready = (report?.customers ?? []).filter((c) => c.ready);
  const waiting = (report?.customers ?? []).filter((c) => !c.ready);

  function toggle(id: string) {
    setPreview(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function run(dryRun: boolean) {
    const ids = [...selected];
    if (ids.length === 0) {
      notify.error(getText('Elige al menos un cliente.', 'Pick at least one customer.'));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/space/${slug}/billing/bill-deliveries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerIds: ids, dryRun }),
      });
      if (!res.ok) {
        notify.error(await readApiError(res, getText('No se pudo facturar.', "Couldn't bill.")));
        return;
      }
      const result: BillResult = await res.json();
      if (dryRun) {
        setPreview(result);
        return;
      }
      notify.success(getText(`${result.invoicesCreated} facturas creadas.`, `${result.invoicesCreated} invoices created.`));
      setPreview(null);
      setSelected(new Set());
      await onChange();
    } catch {
      notify.error(getText('Sin conexión. Intenta de nuevo.', 'No connection. Try again.'));
    } finally {
      setBusy(false);
    }
  }

  const statusLabel: Record<string, string> = {
    preview: getText('Se facturaría', 'Would invoice'),
    invoiced: getText('Facturado', 'Invoiced'),
    empty: getText('Sin entregas', 'No deliveries'),
    zero_total: getText('Total en cero', 'Zero total'),
  };

  return (
    <div>
      <h2 className="text-base font-semibold">{getText('Facturar ciclo', 'Bill cycle')}</h2>
      {report && (
        <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
          {getText('Sin facturar', 'Unbilled')}: {fmt.format(report.totalUnbilled)} · {getText('Listo para facturar', 'Ready to bill')}: {fmt.format(report.totalReady)}
        </p>
      )}

      {ready.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500 dark:text-neutral-400">{getText('Ningún cliente tiene su periodo cerrado todavía.', 'No customer has a closed period yet.')}</p>
      ) : (
        <>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => { setPreview(null); setSelected(new Set(ready.map((c) => c.customerId))); }} className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold">
              {getText('Elegir todos', 'Select all')}
            </button>
            <button type="button" onClick={() => { setPreview(null); setSelected(new Set()); }} className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold">
              {getText('Ninguno', 'None')}
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {ready.map((c) => (
              <li key={c.customerId}>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
                  <input type="checkbox" checked={selected.has(c.customerId)} onChange={() => toggle(c.customerId)} className="h-5 w-5" />
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold">{c.customerName}</p>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">
                      {c.readyDeliveries} {getText('entregas', 'deliveries')} · {getText('periodo hasta', 'period until')} {formatDate(c.cycleEnd)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold">{fmt.format(c.readyTotal)}</span>
                </label>
              </li>
            ))}
          </ul>
        </>
      )}

      {preview && (
        <div className="mt-4 rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
          <h3 className="text-sm font-semibold">{getText('Vista previa', 'Preview')}</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {preview.rows.map((r) => (
              <li key={r.customerId} className="flex justify-between gap-2">
                <span className="min-w-0 break-words">
                  {r.customerName} · {statusLabel[r.status] ?? r.status}
                  {r.dueDate ? ` · ${getText('vence', 'due')} ${formatDate(r.dueDate)}` : ''}
                </span>
                <span className="shrink-0 font-semibold">{fmt.format(r.total)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-right text-sm font-bold">{fmt.format(preview.rows.reduce((s, r) => s + r.total, 0))}</p>
          <button type="button" onClick={() => run(false)} disabled={busy} className="mt-3 w-full rounded-full px-4 py-3 text-base font-semibold text-white disabled:opacity-50" style={{ backgroundColor: 'var(--brand-primary, #045AFE)' }}>
            {getText('Confirmar y crear facturas', 'Confirm and create invoices')}
          </button>
        </div>
      )}

      {!preview && ready.length > 0 && (
        <button type="button" onClick={() => run(true)} disabled={busy || selected.size === 0} className="mt-4 w-full rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-3 text-base font-semibold disabled:opacity-50">
          {getText('Ver vista previa', 'Preview')}
        </button>
      )}

      {waiting.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold">{getText('Aún en periodo', 'Still in period')}</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-500 dark:text-neutral-400">
            {waiting.map((c) => (
              <li key={c.customerId} className="flex justify-between gap-2">
                <span className="min-w-0 break-words">
                  {c.customerName} · {getText('cierra', 'closes')} {formatDate(c.cycleEnd)}
                </span>
                <span className="shrink-0">{fmt.format(c.total)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
