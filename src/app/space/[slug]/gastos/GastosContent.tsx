'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { downloadBrandedPdf, type BrandInfo } from '@/lib/pdf/document';
import { formatDate, moneyFormatter, readApiError } from '@/lib/receivables';
import {
  EXPENSE_CATEGORIES,
  categoryLabel,
  monthBounds,
  shiftMonth,
  type Expense,
  type GenerateRecurringResult,
  type ProfitReport,
} from '@/lib/expenses';

interface Props {
  slug: string;
  currency: 'USD' | 'DOP';
  brand: BrandInfo;
  initialMonth: string;
  initialExpenses: Expense[];
  initialProfit: ProfitReport | null;
}

interface Form {
  id: string | null;
  category: string;
  description: string;
  amount: string;
  date: string;
  recurrence: 'none' | 'monthly';
  vendor: string;
  method: string;
  notes: string;
}

export function GastosContent({ slug, currency, brand: brandInfo, initialMonth, initialExpenses, initialProfit }: Props) {
  const { language } = useSimpleLanguage();
  const es = language === 'es';
  const getText = (a: string, b: string) => (es ? a : b);
  const toast = useToast();
  const fmt = moneyFormatter(currency);

  const [month, setMonth] = useState(initialMonth);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [profit, setProfit] = useState(initialProfit);
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  const input = 'w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm';
  const ghost = 'rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold';
  const brand = { backgroundColor: 'var(--brand-primary, #045AFE)' };

  async function load(m: string) {
    const { from, to } = monthBounds(m);
    try {
      const [eRes, pRes] = await Promise.all([
        fetch(`/api/space/${slug}/expenses?from=${from}&to=${to}`, { cache: 'no-store' }),
        fetch(`/api/space/${slug}/reports/profit?month=${m}`, { cache: 'no-store' }),
      ]);
      if (eRes.ok) setExpenses(await eRes.json());
      if (pRes.ok) setProfit(await pRes.json());
    } catch {
      toast.error(getText('No se pudo cargar el mes.', "Couldn't load the month."));
    }
  }

  async function go(delta: number) {
    const next = shiftMonth(month, delta);
    setMonth(next);
    setForm(null);
    await load(next);
  }

  // Reporte mensual para contabilidad: PDF con logo y color del negocio.
  async function downloadReport() {
    if (!profit) return;
    try {
      await downloadBrandedPdf({
        brand: brandInfo,
        documentTitle: getText('Reporte de utilidad', 'Profit report'),
        metaLines: [monthTitle(month)],
        items: profit.expensesByCategory.map((c) => ({ description: categoryLabel(c.category, es), total: fmt.format(c.total) })),
        subtotalLines: [
          { label: getText('Ventas', 'Sales'), value: fmt.format(profit.salesTotal) },
          { label: `  ${getText('Facturado', 'Invoiced')}`, value: fmt.format(profit.salesInvoiced) },
          { label: `  ${getText('Mostrador', 'Counter')}`, value: fmt.format(profit.salesCounter) },
          { label: getText('Gastos', 'Expenses'), value: fmt.format(profit.expensesTotal) },
          { label: getText('Utilidad de caja', 'Cash profit'), value: fmt.format(profit.cashProfit) },
        ],
        amountLabel: getText('Utilidad del mes', 'Profit for the month'),
        amountValue: fmt.format(profit.profit),
        status: profit.profit < 0 ? { label: getText('Pérdida', 'Loss'), tone: 'danger' } : { label: getText('Utilidad', 'Profit'), tone: 'success' },
        filename: `utilidad-${month}`,
      });
    } catch {
      toast.error(getText('No se pudo generar el PDF.', "Couldn't generate the PDF."));
    }
  }

  function monthTitle(m: string) {
    const [y, mo] = m.split('-').map(Number);
    return new Date(y, mo - 1, 1).toLocaleDateString(es ? 'es-DO' : 'en-US', { month: 'long', year: 'numeric' });
  }

  function openNew() {
    const { from, to } = monthBounds(month);
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santo_Domingo' });
    setForm({ id: null, category: EXPENSE_CATEGORIES[0], description: '', amount: '', date: today >= from && today <= to ? today : from, recurrence: 'none', vendor: '', method: '', notes: '' });
  }

  async function save() {
    if (!form) return;
    const amount = Number(form.amount);
    if (!form.description.trim()) {
      toast.error(getText('Escribe qué fue el gasto.', 'Enter what the expense was.'));
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error(getText('Escribe un monto mayor que cero.', 'Enter an amount greater than zero.'));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(form.id ? `/api/space/${slug}/expenses/${form.id}` : `/api/space/${slug}/expenses`, {
        method: form.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: form.category,
          description: form.description.trim(),
          amount,
          expenseDate: form.date,
          recurrence: form.recurrence,
          vendor: form.vendor.trim() || null,
          paymentMethod: form.method || null,
          notes: form.notes.trim() || null,
        }),
      });
      if (!res.ok) {
        toast.error(await readApiError(res, getText('No se pudo guardar el gasto.', "Couldn't save the expense.")));
        return;
      }
      toast.success(getText('Gasto guardado.', 'Expense saved.'));
      setForm(null);
      // Si el gasto cayó en otro mes, se muestra ese mes.
      const savedMonth = form.date.slice(0, 7);
      if (savedMonth !== month) setMonth(savedMonth);
      await load(savedMonth);
    } catch {
      toast.error(getText('Sin conexión. Intenta de nuevo.', 'No connection. Try again.'));
    } finally {
      setSaving(false);
    }
  }

  async function remove(e: Expense) {
    if (!window.confirm(getText(`¿Quitar "${e.description}"?`, `Remove "${e.description}"?`))) return;
    try {
      const res = await fetch(`/api/space/${slug}/expenses/${e.id}`, { method: 'DELETE' });
      if (!res.ok) {
        toast.error(await readApiError(res, getText('No se pudo quitar el gasto.', "Couldn't remove the expense.")));
        return;
      }
      toast.success(getText('Gasto quitado.', 'Expense removed.'));
      await load(month);
    } catch {
      toast.error(getText('Sin conexión. Intenta de nuevo.', 'No connection. Try again.'));
    }
  }

  async function generate() {
    try {
      const res = await fetch(`/api/space/${slug}/expenses/generate-recurring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month }),
      });
      if (!res.ok) {
        toast.error(await readApiError(res, getText('No se pudieron generar los gastos fijos.', "Couldn't generate the fixed expenses.")));
        return;
      }
      const r: GenerateRecurringResult = await res.json();
      toast.success(
        r.created.length > 0
          ? getText(`${r.created.length} gastos fijos creados.`, `${r.created.length} fixed expenses created.`)
          : getText('Los gastos fijos de este mes ya estaban.', 'This month already has its fixed expenses.'),
      );
      await load(month);
    } catch {
      toast.error(getText('Sin conexión. Intenta de nuevo.', 'No connection. Try again.'));
    }
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const methodLabel: Record<string, string> = { cash: getText('Efectivo', 'Cash'), transfer: getText('Transferencia', 'Transfer'), card: getText('Tarjeta', 'Card') };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <h1 className="text-xl font-bold">{getText('Gastos y utilidad', 'Expenses & profit')}</h1>

      <div className="mt-3 flex items-center justify-between">
        <button type="button" onClick={() => go(-1)} aria-label={getText('Mes anterior', 'Previous month')} className="h-10 w-10 rounded-full border border-gray-300 dark:border-neutral-700 text-lg">‹</button>
        <p className="text-base font-semibold capitalize">{monthTitle(month)}</p>
        <button type="button" onClick={() => go(1)} aria-label={getText('Mes siguiente', 'Next month')} className="h-10 w-10 rounded-full border border-gray-300 dark:border-neutral-700 text-lg">›</button>
      </div>

      {profit && (
        <section className="mt-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-[var(--brand-tint)] p-3">
              <p className="text-xs text-gray-500 dark:text-neutral-400">{getText('Ventas', 'Sales')}</p>
              <p className="text-lg font-bold">{fmt.format(profit.salesTotal)}</p>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                {getText('Facturado', 'Invoiced')} {fmt.format(profit.salesInvoiced)} · {getText('Mostrador', 'Counter')} {fmt.format(profit.salesCounter)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-[var(--brand-tint)] p-3">
              <p className="text-xs text-gray-500 dark:text-neutral-400">{getText('Gastos', 'Expenses')}</p>
              <p className="text-lg font-bold">{fmt.format(profit.expensesTotal)}</p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-[var(--brand-tint)] p-3">
              <p className="text-xs text-gray-500 dark:text-neutral-400">{getText('Utilidad', 'Profit')}</p>
              <p className={`text-lg font-bold ${profit.profit < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>{fmt.format(profit.profit)}</p>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400">{getText('Ventas − gastos', 'Sales − expenses')}</p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-[var(--brand-tint)] p-3">
              <p className="text-xs text-gray-500 dark:text-neutral-400">{getText('Utilidad de caja', 'Cash profit')}</p>
              <p className={`text-lg font-bold ${profit.cashProfit < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>{fmt.format(profit.cashProfit)}</p>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                {getText('Cobrado', 'Collected')} {fmt.format(profit.collectedTotal)} − {getText('gastos', 'expenses')}
              </p>
            </div>
          </div>

          {(profit.taxInvoiced ?? 0) > 0 && (
            <p className="mt-2 text-xs text-gray-500 dark:text-neutral-400">
              {getText('Impuesto facturado este mes', 'Tax invoiced this month')}: {fmt.format(profit.taxInvoiced ?? 0)} ·{' '}
              {getText('no cuenta como venta ni utilidad; la utilidad de caja sí incluye lo cobrado con impuesto.', 'not counted as sales or profit; cash profit does include collected tax.')}
            </p>
          )}

          {profit.expensesByCategory.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {profit.expensesByCategory.map((c) => (
                <li key={c.category}>
                  <div className="flex justify-between text-sm">
                    <span>{categoryLabel(c.category, es)}</span>
                    <span className="font-semibold">{fmt.format(c.total)}</span>
                  </div>
                  <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-800">
                    <div className="h-full" style={{ width: `${profit.expensesTotal > 0 ? (c.total / profit.expensesTotal) * 100 : 0}%`, ...brand }} />
                  </div>
                </li>
              ))}
            </ul>
          )}

          <button type="button" onClick={downloadReport} className={`${ghost} mt-3`}>
            {getText('Descargar reporte (PDF)', 'Download report (PDF)')}
          </button>
        </section>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{getText('Gastos del mes', 'Expenses this month')}</h2>
        <div className="flex gap-2">
          <button type="button" onClick={generate} className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-semibold">
            {getText('Generar gastos fijos', 'Generate fixed expenses')}
          </button>
          <button type="button" onClick={openNew} className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={brand}>
            {getText('Nuevo gasto', 'New expense')}
          </button>
        </div>
      </div>

      {form && (
        <div className="mt-3 space-y-2 rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <select className={input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{categoryLabel(c, es)}</option>
              ))}
            </select>
            <input className={input} placeholder={getText('Descripción (ej. Factura de luz)', 'Description (e.g. Electric bill)')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input className={input} type="number" inputMode="decimal" min="0" step="0.01" placeholder={`${getText('Monto', 'Amount')} (${currency === 'DOP' ? 'RD$' : 'US$'})`} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <input className={input} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <input className={input} placeholder={getText('Proveedor (opcional)', 'Vendor (optional)')} value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
            <select className={input} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
              <option value="">{getText('Forma de pago (opcional)', 'Payment method (optional)')}</option>
              <option value="cash">{methodLabel.cash}</option>
              <option value="transfer">{methodLabel.transfer}</option>
              <option value="card">{methodLabel.card}</option>
            </select>
          </div>
          <input className={input} placeholder={getText('Nota (opcional)', 'Note (optional)')} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.recurrence === 'monthly'} onChange={(e) => setForm({ ...form, recurrence: e.target.checked ? 'monthly' : 'none' })} />
            {getText('Gasto fijo: se repite cada mes', 'Fixed expense: repeats every month')}
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setForm(null)} disabled={saving} className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-semibold">{getText('Cancelar', 'Cancel')}</button>
            <button type="button" onClick={save} disabled={saving} className="rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" style={brand}>
              {saving ? getText('Guardando…', 'Saving…') : getText('Guardar', 'Save')}
            </button>
          </div>
        </div>
      )}

      {expenses.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500 dark:text-neutral-400">{getText('No hay gastos este mes.', 'No expenses this month.')}</p>
      ) : (
        <>
          <ul className="mt-3 space-y-2">
            {expenses.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold">{e.description}</p>
                  <p className="break-words text-xs text-gray-500 dark:text-neutral-400">
                    {categoryLabel(e.category, es)} · {formatDate(e.expenseDate)}
                    {e.vendor ? ` · ${e.vendor}` : ''}
                    {e.paymentMethod ? ` · ${methodLabel[e.paymentMethod] ?? e.paymentMethod}` : ''}
                    {e.recurrence === 'monthly' ? ` · ${getText('fijo', 'fixed')}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-semibold">{fmt.format(e.amount)}</span>
                  <button type="button" onClick={() => setForm({ id: e.id, category: e.category, description: e.description, amount: String(e.amount), date: e.expenseDate.slice(0, 10), recurrence: e.recurrence, vendor: e.vendor ?? '', method: e.paymentMethod ?? '', notes: e.notes ?? '' })} className={ghost}>{getText('Editar', 'Edit')}</button>
                  <button type="button" onClick={() => remove(e)} aria-label={getText('Quitar', 'Remove')} className={ghost}>✕</button>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-right text-sm font-bold">{getText('Total', 'Total')}: {fmt.format(total)}</p>
        </>
      )}
    </div>
  );
}
