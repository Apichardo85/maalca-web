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
  voidedAt?: string | null;
  voidReason?: string | null;
  replacesInvoiceId?: string | null;
  replacedByInvoiceId?: string | null;
}

interface CustomerOption {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface AuditLogRow {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string;
  actorName: string | null;
  createdAt: string;
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

  // Detalle de líneas, anular, corregir y actividad — antes una factura ya creada (Paid o
  // Cancelled) no tenía ninguna acción disponible, ni forma de ver sus líneas otra vez.
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [voidModalFor, setVoidModalFor] = useState<InvoiceRow | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [voiding, setVoiding] = useState(false);
  const [replacesInvoiceId, setReplacesInvoiceId] = useState<string | null>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [activity, setActivity] = useState<AuditLogRow[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

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
          replacesInvoiceId: replacesInvoiceId || undefined,
        }),
      });
      if (!res.ok) throw new Error('create failed');
      const created: InvoiceRow = await res.json();
      setInvoices((prev) => [
        created,
        ...prev.map((i) => (i.id === replacesInvoiceId ? { ...i, replacedByInvoiceId: created.id } : i)),
      ]);
      setShowForm(false);
      setCustomerId('');
      setTax(0);
      setDueDate('');
      setNotes('');
      setLines([emptyLine()]);
      setReplacesInvoiceId(null);
      toast.success(
        replacesInvoiceId
          ? getText('Factura de corrección creada.', 'Correction invoice created.')
          : getText('Factura creada.', 'Invoice created.'),
      );
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

  // Anular — no se edita ni se borra el original (documento financiero). Requiere motivo.
  async function confirmVoid() {
    if (!voidModalFor || !voidReason.trim() || voiding) return;
    setVoiding(true);
    try {
      const res = await fetch(`/api/space/${slug}/invoices/${voidModalFor.id}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: voidReason.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message || 'void failed');
      setInvoices((prev) =>
        prev.map((i) => (i.id === voidModalFor.id ? { ...i, ...data } : i)),
      );
      toast.success(getText('Factura anulada.', 'Invoice voided.'));
      setVoidModalFor(null);
      setVoidReason('');
    } catch (err) {
      const message = err instanceof Error && err.message !== 'void failed' ? err.message : undefined;
      toast.error(message || getText('No se pudo anular la factura.', "Couldn't void the invoice."));
    } finally {
      setVoiding(false);
    }
  }

  // Prefill del form con las líneas de la factura anulada — el dueño ajusta lo que estaba mal y
  // guarda; queda enlazada vía replacesInvoiceId (ver handleCreate).
  function startCorrection(invoice: InvoiceRow) {
    setReplacesInvoiceId(invoice.id);
    setCustomerId(invoice.customerId);
    setTax(invoice.tax);
    setDueDate(invoice.dueDate ? invoice.dueDate.slice(0, 10) : '');
    setNotes(invoice.notes ?? '');
    setLines(
      invoice.items && invoice.items.length > 0
        ? invoice.items.map((it) => ({ description: it.description, quantity: it.quantity, unitPrice: it.unitPrice }))
        : [emptyLine()],
    );
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDownloadPdf(invoice: InvoiceRow) {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const marginX = 56;
    let y = 72;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(20, 20, 20);
    doc.text(invoice.invoiceNumber, marginX, y);
    y += 22;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(90, 90, 90);
    doc.text(`${getText('Cliente', 'Customer')}: ${invoice.customer?.name ?? '—'}`, marginX, y);
    y += 18;
    doc.text(`${getText('Emitida', 'Issued')}: ${dateFmt(invoice.issueDate)}`, marginX, y);
    y += 18;
    if (invoice.dueDate) {
      doc.text(`${getText('Vence', 'Due')}: ${dateFmt(invoice.dueDate)}`, marginX, y);
      y += 18;
    }
    y += 6;

    if (invoice.items && invoice.items.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(getText('Descripción', 'Description'), marginX, y);
      doc.text(getText('Cant.', 'Qty'), 380, y);
      doc.text(getText('Total', 'Total'), 460, y);
      y += 14;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      for (const item of invoice.items) {
        doc.text(item.description, marginX, y, { maxWidth: 310 });
        doc.text(String(item.quantity), 380, y);
        doc.text(fmt.format(item.total), 460, y);
        y += 16;
      }
      y += 8;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(`${getText('Subtotal', 'Subtotal')}: ${fmt.format(invoice.subtotal)}`, marginX, y);
    y += 14;
    if (invoice.tax > 0) {
      doc.text(`${getText('Impuesto', 'Tax')}: ${fmt.format(invoice.tax)}`, marginX, y);
      y += 14;
    }
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(20, 20, 20);
    doc.text(fmt.format(invoice.total), marginX, y);
    y += 24;

    if (invoice.status === 'Paid') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(22, 130, 70);
      doc.text(getText('Pagada ✓', 'Paid ✓'), marginX, y);
      y += 18;
    } else if (invoice.status === 'Cancelled') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(180, 40, 40);
      doc.text(getText('Anulada', 'Voided'), marginX, y);
      y += 18;
      if (invoice.voidReason) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(90, 90, 90);
        doc.text(`${getText('Motivo', 'Reason')}: ${invoice.voidReason}`, marginX, y, { maxWidth: 480 });
        y += 18;
      }
    }

    doc.save(`factura-${invoice.invoiceNumber.toLowerCase()}.pdf`);
  }

  async function loadActivity() {
    setActivityLoading(true);
    try {
      const res = await fetch(`/api/space/${slug}/audit-logs?entityType=Invoice`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setActivity(data?.data ?? []);
      }
    } finally {
      setActivityLoading(false);
    }
  }

  function toggleActivity() {
    const next = !showActivity;
    setShowActivity(next);
    if (next && activity.length === 0) loadActivity();
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
            onClick={() => {
              if (showForm) setReplacesInvoiceId(null);
              setShowForm((v) => !v);
            }}
            className="shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--brand-primary, #C8102E)' }}
          >
            {showForm ? getText('Cancelar', 'Cancel') : getText('+ Nueva factura', '+ New invoice')}
          </button>
        </div>

        {showForm && (
          <div className="mt-4 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-3">
            {replacesInvoiceId && (
              <div className="flex items-center justify-between gap-2 rounded-xl bg-amber-50 dark:bg-amber-950 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
                <span>
                  {getText(
                    'Esta factura corregirá una anulada — quedarán enlazadas.',
                    'This invoice will correct a voided one — they will stay linked.',
                  )}
                </span>
                <button type="button" onClick={() => setReplacesInvoiceId(null)} className="font-semibold underline shrink-0">
                  {getText('quitar', 'remove')}
                </button>
              </div>
            )}
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
                    {invoice.status === 'Cancelled' && invoice.voidReason && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {getText('Anulada', 'Voided')}: {invoice.voidReason}
                      </p>
                    )}
                    {invoice.replacesInvoiceId && (
                      <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
                        {getText('Corrige una factura anulada', 'Corrects a voided invoice')}
                      </p>
                    )}
                    {invoice.replacedByInvoiceId && (
                      <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
                        {getText('Reemplazada por una factura de corrección', 'Replaced by a correction invoice')}
                      </p>
                    )}
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
                    <button
                      type="button"
                      onClick={() => setExpandedId((prev) => (prev === invoice.id ? null : invoice.id))}
                      className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-3 text-xs font-semibold"
                    >
                      {expandedId === invoice.id ? getText('Ocultar', 'Hide') : getText('Ver detalle', 'View detail')}
                    </button>
                  </div>
                </div>

                {expandedId === invoice.id && (
                  <div className="mt-3 space-y-3 rounded-xl bg-gray-50 dark:bg-neutral-800/60 p-3">
                    {invoice.items && invoice.items.length > 0 ? (
                      <div className="space-y-1">
                        {invoice.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-2 text-xs">
                            <span className="min-w-0 flex-1 truncate text-gray-600 dark:text-neutral-300">
                              {item.quantity}× {item.description}
                            </span>
                            <span className="shrink-0 font-semibold">{fmt.format(item.total)}</span>
                          </div>
                        ))}
                        <div className="mt-2 flex items-center justify-between border-t border-gray-200 dark:border-neutral-700 pt-2 text-xs">
                          <span className="text-gray-500 dark:text-neutral-400">{getText('Subtotal', 'Subtotal')}</span>
                          <span>{fmt.format(invoice.subtotal)}</span>
                        </div>
                        {invoice.tax > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-neutral-400">{getText('Impuesto', 'Tax')}</span>
                            <span>{fmt.format(invoice.tax)}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-neutral-500">
                        {getText('Sin líneas detalladas.', 'No line items.')}
                      </p>
                    )}
                    {invoice.notes && (
                      <p className="text-xs text-gray-500 dark:text-neutral-400">{getText('Notas', 'Notes')}: {invoice.notes}</p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(invoice)}
                        className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-3 text-xs font-semibold"
                      >
                        {getText('Descargar PDF', 'Download PDF')}
                      </button>
                      {invoice.status !== 'Cancelled' && (
                        <button
                          type="button"
                          onClick={() => setVoidModalFor(invoice)}
                          className="flex min-h-11 items-center justify-center rounded-full border border-red-300 dark:border-red-900/50 px-3 text-xs font-semibold text-red-600 dark:text-red-400"
                        >
                          {getText('Anular', 'Void')}
                        </button>
                      )}
                      {invoice.status === 'Cancelled' && !invoice.replacedByInvoiceId && (
                        <button
                          type="button"
                          onClick={() => startCorrection(invoice)}
                          className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-3 text-xs font-semibold"
                        >
                          {getText('Crear factura corregida', 'Create correction invoice')}
                        </button>
                      )}
                    </div>
                  </div>
                )}

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

        <div className="mt-8 border-t border-gray-200 dark:border-neutral-800 pt-4">
          <button
            type="button"
            onClick={toggleActivity}
            className="text-xs font-semibold text-gray-500 dark:text-neutral-400 hover:underline"
          >
            {showActivity ? getText('Ocultar actividad', 'Hide activity') : getText('Ver actividad', 'View activity')}
          </button>
          {showActivity && (
            <div className="mt-3 space-y-2">
              {activityLoading && (
                <p className="text-xs text-gray-400 dark:text-neutral-500">{getText('Cargando…', 'Loading…')}</p>
              )}
              {!activityLoading && activity.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-neutral-500">
                  {getText('Sin actividad registrada todavía.', 'No activity recorded yet.')}
                </p>
              )}
              {activity.map((entry) => (
                <div key={entry.id} className="flex items-start justify-between gap-3 text-xs">
                  <span className="min-w-0 flex-1 text-gray-600 dark:text-neutral-300">
                    {entry.description}
                    {entry.actorName && <span className="text-gray-400 dark:text-neutral-500"> · {entry.actorName}</span>}
                  </span>
                  <span className="shrink-0 text-gray-400 dark:text-neutral-500">
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {voidModalFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 p-5">
            <p className="text-sm font-semibold">
              {getText('Anular factura', 'Void invoice')} {voidModalFor.invoiceNumber}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
              {getText(
                'El documento original no se borra ni se edita — queda anulado con este motivo. Para corregir algo, después podrás crear una nueva factura enlazada.',
                "The original document isn't deleted or edited — it stays voided with this reason. To fix something, you'll be able to create a new linked invoice afterward.",
              )}
            </p>
            <textarea
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder={getText('Motivo de la anulación…', 'Reason for voiding…')}
              rows={3}
              autoFocus
              className="mt-3 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={confirmVoid}
                disabled={!voidReason.trim() || voiding}
                className="flex-1 rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                {voiding ? getText('Anulando…', 'Voiding…') : getText('Anular factura', 'Void invoice')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setVoidModalFor(null);
                  setVoidReason('');
                }}
                disabled={voiding}
                className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-neutral-300 disabled:opacity-40"
              >
                {getText('Cancelar', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
