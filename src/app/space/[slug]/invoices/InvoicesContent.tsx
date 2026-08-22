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
  // number | '' a propósito: si fuera solo `number` inicializado en 0, un <input type="number">
  // controlado nunca deja "vaciar" el campo — al borrar el único dígito, el valor vuelve a 0 y
  // React lo vuelve a pintar como "0" en el mismo tick, así que el usuario nunca puede escribir
  // encima sin que parezca que el campo "no lo deja borrar". Con '' como estado intermedio, el
  // campo sí puede quedar vacío mientras se edita, y solo se normaliza a 0 al perder el foco.
  const [tax, setTax] = useState<number | ''>(0);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);
  const [saving, setSaving] = useState(false);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [generatingLink, setGeneratingLink] = useState<string | null>(null);
  const [paymentLinks, setPaymentLinks] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
  const grandTotal = linesTotal + (Number(tax) || 0);

  function updateLine(i: number, patch: Partial<LineDraft>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  // Si es la única línea, la reseteamos en vez de dejar el formulario sin ninguna — siempre debe
  // quedar al menos una fila para poder seguir escribiendo.
  function removeLine(i: number) {
    setLines((prev) => (prev.length === 1 ? [emptyLine()] : prev.filter((_, idx) => idx !== i)));
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
          tax: Number(tax) || 0,
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

  // Cobro real por Stripe Connect (checkout hospedado) — el link se muestra acá para
  // copiar/mandar por WhatsApp; el backend además dispara el email automático al cliente si
  // tiene correo guardado (ver InvoiceNotificationService). "Marcar pagada" arriba sigue
  // existiendo aparte para cash/transferencia/Zelle.
  async function generatePaymentLink(invoice: InvoiceRow) {
    if (generatingLink) return;
    setGeneratingLink(invoice.id);
    try {
      const res = await fetch(`/api/space/${slug}/invoices/${invoice.id}/checkout`, { method: 'POST' });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.checkoutUrl) {
        throw new Error(data?.error?.message || 'checkout failed');
      }
      setPaymentLinks((prev) => ({ ...prev, [invoice.id]: data.checkoutUrl }));
      toast.success(getText('Link de cobro generado.', 'Payment link generated.'));
    } catch (err) {
      const message = err instanceof Error && err.message !== 'checkout failed' ? err.message : undefined;
      toast.error(message || getText('No se pudo generar el link. Verifica que Stripe esté conectado.', "Couldn't generate the link. Check that Stripe is connected."));
    } finally {
      setGeneratingLink(null);
    }
  }

  async function copyLink(invoiceId: string, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(invoiceId);
      setTimeout(() => setCopiedId((prev) => (prev === invoiceId ? null : prev)), 2000);
    } catch {
      toast.error(getText('No se pudo copiar el link.', "Couldn't copy the link."));
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
                <div key={i} className="space-y-2 rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <label className="text-xs text-gray-500 dark:text-neutral-400">
                        {getText('Descripción', 'Description')}
                      </label>
                      <input
                        value={line.description}
                        onChange={(e) => updateLine(i, { description: e.target.value })}
                        placeholder={getText(
                          'Ej. Cena para 2, corte de cabello, camisa talla M…',
                          'E.g. Dinner for 2, haircut, t-shirt size M…',
                        )}
                        className="mt-1 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(i)}
                      aria-label={getText('Quitar línea', 'Remove line')}
                      className="mt-5 flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 dark:border-neutral-700 text-gray-400 hover:border-red-300 hover:text-red-600 dark:hover:border-red-900/50 dark:hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-neutral-400">
                        {getText('Cantidad', 'Quantity')}
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) => updateLine(i, { quantity: Number(e.target.value) || 1 })}
                        onFocus={(e) => e.target.select()}
                        className="mt-1 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-neutral-400">
                        {getText('Precio unitario', 'Unit price')}
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={line.unitPrice}
                        onChange={(e) => updateLine(i, { unitPrice: Number(e.target.value) || 0 })}
                        onFocus={(e) => e.target.select()}
                        className="mt-1 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
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
                  onChange={(e) => setTax(e.target.value === '' ? '' : Number(e.target.value))}
                  onBlur={() => setTax((v) => (v === '' ? 0 : v))}
                  onFocus={(e) => e.target.select()}
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
          {invoices.map((invoice) => {
            const isCollectable = invoice.status === 'Pending' || invoice.status === 'Overdue';
            const paymentLink = paymentLinks[invoice.id];
            const customerPhone = customers.find((c) => c.id === invoice.customerId)?.phone;
            const whatsappHref = customerPhone && paymentLink
              ? `https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  getText(
                    `Hola! Aquí tienes el link para pagar tu factura ${invoice.invoiceNumber} (${fmt.format(invoice.total)}): ${paymentLink}`,
                    `Hi! Here's the link to pay your invoice ${invoice.invoiceNumber} (${fmt.format(invoice.total)}): ${paymentLink}`,
                  ),
                )}`
              : null;

            return (
              <div
                key={invoice.id}
                className="rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
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
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
                    <span className="text-sm font-bold">{fmt.format(invoice.total)}</span>
                    {isCollectable && (
                      <button
                        type="button"
                        onClick={() => generatePaymentLink(invoice)}
                        disabled={generatingLink === invoice.id}
                        className="flex min-h-11 items-center justify-center rounded-full px-3 text-xs font-semibold text-white disabled:opacity-40"
                        style={{ backgroundColor: 'var(--brand-primary, #C8102E)' }}
                      >
                        {generatingLink === invoice.id
                          ? getText('Generando…', 'Generating…')
                          : getText('Cobrar con Stripe', 'Charge with Stripe')}
                      </button>
                    )}
                    {isCollectable && (
                      <button
                        type="button"
                        onClick={() => markPaid(invoice)}
                        disabled={markingPaid === invoice.id}
                        className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-3 text-xs font-semibold disabled:opacity-40"
                      >
                        {getText('Marcar pagada', 'Mark paid')}
                      </button>
                    )}
                  </div>
                </div>

                {paymentLink && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 dark:bg-neutral-800/60 px-3 py-2">
                    <span className="min-w-0 flex-1 truncate text-xs text-gray-500 dark:text-neutral-400">{paymentLink}</span>
                    <button
                      type="button"
                      onClick={() => copyLink(invoice.id, paymentLink)}
                      className="shrink-0 rounded-full border border-gray-300 dark:border-neutral-700 px-2.5 py-1 text-[11px] font-semibold"
                    >
                      {copiedId === invoice.id ? getText('¡Copiado!', 'Copied!') : getText('Copiar link', 'Copy link')}
                    </button>
                    {whatsappHref && (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-full bg-green-600 px-2.5 py-1 text-[11px] font-semibold text-white"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
