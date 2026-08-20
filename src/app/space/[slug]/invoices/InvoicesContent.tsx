'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';

interface InvoiceItemRow {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: { id: string; name: string } | null;
  subtotal: number;
  tax: number;
  total: number;
  status: 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
  issueDate: string;
  dueDate: string | null;
  paidDate: string | null;
  notes: string | null;
  items?: InvoiceItemRow[];
}

interface CustomerOption {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface LineDraft {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Props {
  slug: string;
  currency: 'USD' | 'DOP';
  initialInvoices: InvoiceRow[];
  customers: CustomerOption[];
}

const STATUS_STYLES: Record<InvoiceRow['status'], string> = {
  Paid: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Overdue: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  Cancelled: 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400',
};

const emptyLine = (): LineDraft => ({ description: '', quantity: 1, unitPrice: 0 });

export function InvoicesContent({ slug, currency, initialInvoices, customers }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();

  const [invoices, setInvoices] = useState<InvoiceRow[]>(initialInvoices);
  const [showForm, setShowForm] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [tax, setTax] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);
  const [saving, setSaving] = useState(false);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  // Prefill desde "Generar factura" en Agenda/Fila/Reservas/Propuestas (src/lib/invoice-link.ts).
  // Solo al montar — si el dueño cambia customerId/líneas a mano después, no lo pisamos otra vez.
  const searchParams = useSearchParams();
  useEffect(() => {
    const prefillCustomerId = searchParams.get('customerId');
    if (!prefillCustomerId) return;
    setCustomerId(prefillCustomerId);
    const desc = searchParams.get('desc');
    const amount = searchParams.get('amount');
    if (desc) setLines([{ description: desc, quantity: 1, unitPrice: amount ? Number(amount) || 0 : 0 }]);
    setShowForm(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency });
  const dateFmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString() : '—');

  const linesTotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
  const grandTotal = linesTotal + tax;

  function updateLine(i: number, patch: Partial<LineDraft>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  async function handleCreate() {
    const validLines = lines.filter((l) => l.description.trim() && l.unitPrice > 0);
    if (!customerId || validLines.length === 0 || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/space/${slug}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          tax,
          dueDate: dueDate || null,
          notes: notes.trim() || null,
          items: validLines.map((l) => ({ description: l.description.trim(), quantity: l.quantity, unitPrice: l.unitPrice })),
        }),
      });
      if (!res.ok) throw new Error('create failed');
      const created: InvoiceRow = await res.json();
      setInvoices((prev) => [created, ...prev]);
      setShowForm(false);
      setCustomerId('');
      setTax(0);
      setDueDate('');
      setNotes('');
      setLines([emptyLine()]);
      toast.success(getText('Factura creada.', 'Invoice created.'));
    } catch {
      toast.error(getText('No se pudo crear la factura. Intenta de nuevo.', "Couldn't create the invoice. Try again."));
    } finally {
      setSaving(false);
    }
  }

  async function markPaid(invoice: InvoiceRow) {
    if (markingPaid) return;
    setMarkingPaid(invoice.id);
    try {
      const res = await fetch(`/api/space/${slug}/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: invoice.customerId,
          subtotal: invoice.subtotal,
          tax: invoice.tax,
          total: invoice.total,
          status: 'Paid',
          dueDate: invoice.dueDate,
          paidDate: new Date().toISOString(),
          notes: invoice.notes,
        }),
      });
      if (!res.ok) throw new Error('update failed');
      setInvoices((prev) =>
        prev.map((i) => (i.id === invoice.id ? { ...i, status: 'Paid', paidDate: new Date().toISOString() } : i)),
      );
      toast.success(getText('Factura marcada como pagada.', 'Invoice marked as paid.'));
    } catch {
      toast.error(getText('No se pudo actualizar. Intenta de nuevo.', "Couldn't update. Try again."));
    } finally {
      setMarkingPaid(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
              {getText('Tu espacio', 'Your space')}
            </p>
            <h1 className="mt-1 text-2xl font-bold">{getText('Facturación', 'Invoicing')}</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--brand-primary, #C8102E)' }}
          >
            {showForm ? getText('Cancelar', 'Cancel') : getText('+ Nueva factura', '+ New invoice')}
          </button>
        </div>

        {showForm && (
          <div className="mt-4 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-3">
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            >
              <option value="">{getText('Elige un cliente', 'Choose a customer')}</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <div className="space-y-2">
              {lines.map((line, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={line.description}
                    onChange={(e) => updateLine(i, { description: e.target.value })}
                    placeholder={getText('Descripción del trabajo', 'Work description')}
                    className="min-w-0 flex-1 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) => updateLine(i, { quantity: Number(e.target.value) || 1 })}
                    className="w-16 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-2 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.unitPrice}
                    onChange={(e) => updateLine(i, { unitPrice: Number(e.target.value) || 0 })}
                    placeholder={getText('Precio', 'Price')}
                    className="w-24 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-2 py-2 text-sm"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setLines((prev) => [...prev, emptyLine()])}
                className="text-xs font-semibold text-gray-500 dark:text-neutral-400 hover:underline"
              >
                {getText('+ Agregar línea', '+ Add line')}
              </button>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-neutral-400">{getText('Impuesto', 'Tax')}</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-neutral-400">{getText('Vence', 'Due')}</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={getText('Notas (opcional)', 'Notes (optional)')}
              rows={2}
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />

            <div className="flex items-center justify-between text-sm font-semibold">
              <span>{getText('Total', 'Total')}</span>
              <span>{fmt.format(grandTotal)}</span>
            </div>

            <button
              type="button"
              onClick={handleCreate}
              disabled={!customerId || lines.every((l) => !l.description.trim()) || saving}
              className="w-full rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              style={{ backgroundColor: 'var(--brand-primary, #C8102E)' }}
            >
              {saving ? getText('Creando…', 'Creating…') : getText('Crear factura', 'Create invoice')}
            </button>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {invoices.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-neutral-500">
              {getText('Todavía no tienes facturas.', "You don't have any invoices yet.")}
            </p>
          )}
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{invoice.invoiceNumber}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[invoice.status]}`}>
                    {invoice.status}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
                  {invoice.customer?.name ?? '—'} · {dateFmt(invoice.issueDate)}
                  {invoice.dueDate && ` · ${getText('vence', 'due')} ${dateFmt(invoice.dueDate)}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-bold">{fmt.format(invoice.total)}</span>
                {(invoice.status === 'Pending' || invoice.status === 'Overdue') && (
                  <button
                    type="button"
                    onClick={() => markPaid(invoice)}
                    disabled={markingPaid === invoice.id}
                    className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                  >
                    {getText('Marcar pagada', 'Mark paid')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
