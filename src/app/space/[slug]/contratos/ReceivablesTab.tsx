'use client';

import { useMemo, useRef, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { downloadBrandedPdf, type BrandInfo } from '@/lib/pdf/document';
import {
  type AgingReport,
  type AgingRow,
  type CustomerStatement,
  type PaymentResult,
  formatDate,
  moneyFormatter,
  readApiError,
} from '@/lib/receivables';

interface PayTarget {
  customerId: string;
  customerName: string;
  invoiceId: string | null;
  invoiceNumber: string | null;
  suggested: number;
}

export function ReceivablesTab({
  slug,
  currency,
  brand,
  initialAging,
}: {
  slug: string;
  currency: 'USD' | 'DOP';
  brand: BrandInfo;
  initialAging: AgingReport;
}) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();
  const fmt = moneyFormatter(currency);

  const [aging, setAging] = useState<AgingReport>(initialAging);
  const [search, setSearch] = useState('');
  const [statement, setStatement] = useState<CustomerStatement | null>(null);
  const [loadingStatementId, setLoadingStatementId] = useState<string | null>(null);
  const [pay, setPay] = useState<PayTarget | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'transfer'>('cash');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  // La misma llave se reutiliza si el cobro se reintenta (red caída, doble toque): el API no duplica el pago.
  const idempotencyKey = useRef<string | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return aging.rows.filter((r) => !q || r.customerName.toLowerCase().includes(q));
  }, [aging.rows, search]);

  async function refreshAging() {
    const res = await fetch(`/api/space/${slug}/receivables/aging`, { cache: 'no-store' });
    if (res.ok) setAging(await res.json());
  }

  // Estado de cuenta en PDF con el logo y el color del negocio (mismo generador que las facturas).
  async function downloadStatement(st: CustomerStatement) {
    try {
      await downloadBrandedPdf({
        brand,
        documentTitle: getText('Estado de cuenta', 'Account statement'),
        counterpartLabel: getText('Cliente', 'Customer'),
        counterpartName: st.customerName,
        metaLines: [`${getText('Al', 'As of')}: ${formatDate(st.asOf)}`],
        items: st.lines.map((l) => ({
          description: `${formatDate(l.date)} · ${l.type === 'payment' ? getText('Pago', 'Payment') : l.type === 'settled' ? getText('Saldada', 'Settled') : getText('Factura', 'Invoice')}${l.reference ? ` ${l.reference}` : ''}`,
          total: l.debit > 0 ? `+${fmt.format(l.debit)}` : `−${fmt.format(l.credit)}`,
        })),
        subtotalLines: [
          { label: getText('Facturado', 'Invoiced'), value: fmt.format(st.totalInvoiced) },
          { label: getText('Pagado', 'Paid'), value: fmt.format(st.totalPaid) },
          ...(st.creditOnAccount > 0 ? [{ label: getText('Saldo a favor', 'Customer credit'), value: fmt.format(st.creditOnAccount) }] : []),
        ],
        amountValue: fmt.format(st.balance),
        status:
          st.balance > 0
            ? { label: getText('Saldo pendiente', 'Balance due'), tone: 'danger' }
            : { label: getText('Al día', 'Paid up'), tone: 'success' },
        filename: `estado-de-cuenta-${st.customerName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
      });
    } catch {
      toast.error(getText('No se pudo generar el PDF.', "Couldn't generate the PDF."));
    }
  }

  // WhatsApp: abre el chat con el resumen listo (el dueño elige el contacto); no se envía nada solo.
  function whatsappStatement(st: CustomerStatement) {
    const open = st.openInvoices.map((i) => `• ${i.invoiceNumber}: ${fmt.format(i.open)}`).join('\n');
    const text = `${brand.name}\n${getText('Estado de cuenta', 'Account statement')} — ${st.customerName}\n${getText('Al', 'As of')} ${formatDate(st.asOf)}\n\n${open ? `${open}\n\n` : ''}${getText('Saldo', 'Balance')}: ${fmt.format(st.balance)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  }

  async function openStatement(customerId: string) {
    setLoadingStatementId(customerId);
    try {
      const res = await fetch(`/api/space/${slug}/customers/${customerId}/statement`, { cache: 'no-store' });
      if (!res.ok) throw new Error();
      setStatement(await res.json());
    } catch {
      toast.error(getText('No se pudo cargar el estado de cuenta.', "Couldn't load the statement."));
    } finally {
      setLoadingStatementId(null);
    }
  }

  function startPay(target: PayTarget) {
    idempotencyKey.current = crypto.randomUUID();
    setAmount(target.suggested > 0 ? String(target.suggested) : '');
    setMethod('cash');
    setNotes('');
    setPay(target);
  }

  async function submitPay() {
    if (!pay) return;
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error(getText('Escribe un monto mayor que cero.', 'Enter an amount greater than zero.'));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/space/${slug}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: pay.customerId,
          amount: value,
          method,
          invoiceId: pay.invoiceId,
          notes: notes.trim() || null,
          idempotencyKey: idempotencyKey.current,
        }),
      });
      if (!res.ok) {
        toast.error(await readApiError(res, getText('No se pudo registrar el pago. Intenta de nuevo.', "Couldn't record the payment. Try again.")));
        return;
      }
      const result: PaymentResult = await res.json();
      toast.success(
        result.duplicate
          ? getText('Ese pago ya estaba registrado.', 'That payment was already recorded.')
          : getText('Pago registrado.', 'Payment recorded.'),
      );
      const customerId = pay.customerId;
      setPay(null);
      idempotencyKey.current = null;
      await refreshAging();
      if (statement && statement.customerId === customerId) await openStatement(customerId);
    } catch {
      toast.error(getText('No se pudo registrar el pago. Intenta de nuevo.', "Couldn't record the payment. Try again."));
    } finally {
      setSaving(false);
    }
  }

  const buckets: { label: string; value: number }[] = [
    { label: getText('0–15 días', '0–15 days'), value: aging.totals.days0To15 },
    { label: getText('16–30 días', '16–30 days'), value: aging.totals.days16To30 },
    { label: getText('31–60 días', '31–60 days'), value: aging.totals.days31To60 },
    { label: getText('Más de 60', 'Over 60'), value: aging.totals.over60 },
  ];

  const input = 'w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm';

  return (
    <div>
      <Toast toasts={toast.toasts} onRemove={toast.remove} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-[var(--brand-tint)] p-4">
          <p className="text-xs text-gray-500 dark:text-neutral-400">{getText('Por cobrar', 'Receivable')}</p>
          <p className="mt-1 text-xl font-bold">{fmt.format(aging.totalBalance)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-[var(--brand-tint)] p-4">
          <p className="text-xs text-gray-500 dark:text-neutral-400">{getText('A favor de clientes', 'Customer credit')}</p>
          <p className="mt-1 text-xl font-bold">{fmt.format(aging.totalCreditOnAccount)}</p>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-gray-200 dark:border-neutral-800 bg-[var(--brand-tint)] p-4">
          <p className="text-xs text-gray-500 dark:text-neutral-400">{getText('Clientes con saldo', 'Customers with balance')}</p>
          <p className="mt-1 text-xl font-bold">{aging.rows.filter((r) => r.balance > 0).length}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {buckets.map((b) => (
          <div key={b.label} className="rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
            <p className="text-xs text-gray-500 dark:text-neutral-400">{b.label}</p>
            <p className="mt-1 text-sm font-semibold">{fmt.format(b.value)}</p>
          </div>
        ))}
      </div>
      <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
        {aging.basis === 'due'
          ? getText('Días desde el vencimiento; lo que aún no vence está en el primer rango.', 'Days since the due date; anything not yet due is in the first range.')
          : getText('Días desde la emisión de la factura.', 'Days since the invoice date.')}
      </p>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={getText('Buscar cliente…', 'Search customer…')}
        className={`${input} mt-5`}
      />

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500 dark:text-neutral-400">
          {getText('No hay saldos pendientes.', 'No outstanding balances.')}
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-gray-200 dark:divide-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-800">
          {rows.map((r: AgingRow) => (
            <li key={r.customerId} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="break-words text-sm font-medium">{r.customerName}</p>
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  {r.oldestOpenInvoiceDate
                    ? `${getText('Más antigua', 'Oldest')}: ${formatDate(r.oldestOpenInvoiceDate)}`
                    : getText('Sin facturas abiertas', 'No open invoices')}
                  {r.hasOverdue && (
                    <span className="ml-2 font-semibold text-red-600 dark:text-red-400">{getText('Vencido', 'Overdue')}</span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-semibold">{fmt.format(r.balance)}</span>
                <button
                  type="button"
                  onClick={() => openStatement(r.customerId)}
                  disabled={loadingStatementId === r.customerId}
                  className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                >
                  {getText('Estado de cuenta', 'Statement')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {statement && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-t-2xl bg-white dark:bg-neutral-900 p-5 sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="break-words text-lg font-bold">{statement.customerName}</h2>
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  {getText('Al', 'As of')} {formatDate(statement.asOf)}
                </p>
              </div>
              <button type="button" onClick={() => setStatement(null)} className="text-sm font-semibold text-gray-500 dark:text-neutral-400">
                {getText('Cerrar', 'Close')}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-gray-200 dark:border-neutral-800 p-2">
                <p className="text-[11px] text-gray-500 dark:text-neutral-400">{getText('Facturado', 'Invoiced')}</p>
                <p className="text-sm font-semibold">{fmt.format(statement.totalInvoiced)}</p>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-neutral-800 p-2">
                <p className="text-[11px] text-gray-500 dark:text-neutral-400">{getText('Pagado', 'Paid')}</p>
                <p className="text-sm font-semibold">{fmt.format(statement.totalPaid)}</p>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-neutral-800 p-2">
                <p className="text-[11px] text-gray-500 dark:text-neutral-400">{getText('Saldo', 'Balance')}</p>
                <p className="text-sm font-bold">{fmt.format(statement.balance)}</p>
              </div>
            </div>
            {statement.creditOnAccount > 0 && (
              <p className="mt-2 text-xs text-gray-500 dark:text-neutral-400">
                {getText('Saldo a favor del cliente', 'Customer credit')}: {fmt.format(statement.creditOnAccount)}
              </p>
            )}

            <button
              type="button"
              onClick={() =>
                startPay({
                  customerId: statement.customerId,
                  customerName: statement.customerName,
                  invoiceId: null,
                  invoiceNumber: null,
                  suggested: 0,
                })
              }
              className="mt-4 w-full rounded-full px-4 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--brand-primary, #045AFE)' }}
            >
              {getText('Abono a cuenta', 'Payment on account')}
            </button>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => downloadStatement(statement)} className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-semibold">
                {getText('Descargar PDF', 'Download PDF')}
              </button>
              <button type="button" onClick={() => whatsappStatement(statement)} className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-semibold">
                WhatsApp
              </button>
            </div>

            <h3 className="mt-5 text-sm font-semibold">{getText('Facturas abiertas', 'Open invoices')}</h3>
            {statement.openInvoices.length === 0 ? (
              <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">{getText('Ninguna.', 'None.')}</p>
            ) : (
              <ul className="mt-2 divide-y divide-gray-200 dark:divide-neutral-800">
                {statement.openInvoices.map((inv) => (
                  <li key={inv.invoiceId} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                      <p className="text-xs text-gray-500 dark:text-neutral-400">
                        {formatDate(inv.issueDate)} · {inv.ageDays} {aging.basis === 'due' ? getText('días de vencida', 'days past due') : getText('días', 'days')}
                        {inv.isOverdue && <span className="ml-2 font-semibold text-red-600 dark:text-red-400">{getText('Vencida', 'Overdue')}</span>}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-semibold">{fmt.format(inv.open)}</span>
                      <button
                        type="button"
                        onClick={() =>
                          startPay({
                            customerId: statement.customerId,
                            customerName: statement.customerName,
                            invoiceId: inv.invoiceId,
                            invoiceNumber: inv.invoiceNumber,
                            suggested: inv.open,
                          })
                        }
                        className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1 text-xs font-semibold"
                      >
                        {getText('Cobrar', 'Collect')}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <h3 className="mt-5 text-sm font-semibold">{getText('Movimientos', 'Activity')}</h3>
            <ul className="mt-2 divide-y divide-gray-200 dark:divide-neutral-800">
              {[...statement.lines].reverse().map((l, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="break-words">
                      {l.type === 'payment' ? getText('Pago', 'Payment') : l.type === 'settled' ? getText('Saldada', 'Settled') : getText('Factura', 'Invoice')}
                      {l.reference ? ` ${l.reference}` : ''}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">{formatDate(l.date)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-medium">{l.debit > 0 ? `+${fmt.format(l.debit)}` : `−${fmt.format(l.credit)}`}</p>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">{fmt.format(l.runningBalance)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {pay && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="w-full max-w-sm rounded-t-2xl bg-white dark:bg-neutral-900 p-5 sm:rounded-2xl">
            <h2 className="text-lg font-bold">
              {pay.invoiceNumber ? `${getText('Cobrar', 'Collect')} ${pay.invoiceNumber}` : getText('Abono a cuenta', 'Payment on account')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400">{pay.customerName}</p>

            <label className="mt-4 block text-xs font-semibold">{getText('Monto', 'Amount')}</label>
            <input type="number" inputMode="decimal" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={`${input} mt-1`} />

            <label className="mt-3 block text-xs font-semibold">{getText('Método', 'Method')}</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as 'cash' | 'transfer')} className={`${input} mt-1`}>
              <option value="cash">{getText('Efectivo', 'Cash')}</option>
              <option value="transfer">{getText('Transferencia', 'Transfer')}</option>
            </select>

            <label className="mt-3 block text-xs font-semibold">{getText('Nota (opcional)', 'Note (optional)')}</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className={`${input} mt-1`} />

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setPay(null)}
                disabled={saving}
                className="flex-1 rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm font-semibold"
              >
                {getText('Cancelar', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={submitPay}
                disabled={saving}
                className="flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: 'var(--brand-primary, #045AFE)' }}
              >
                {saving ? getText('Guardando…', 'Saving…') : getText('Registrar', 'Record')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
