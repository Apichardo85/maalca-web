'use client';

import { useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { buildInvoiceLink } from '@/lib/invoice-link';

export interface ProposalRow {
  id: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  title: string;
  description: string | null;
  amount: number;
  currency: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Expired';
  token: string;
  sentAt: string | null;
  acceptedAt: string | null;
  acceptedByName: string | null;
  expiresAt: string | null;
  createdAt: string;
  /** CRM (tarea #244) — sin esto no se puede generar factura (Invoice.CustomerId requerido). */
  customerId: string | null;
  /** Documento adjunto (tarea #336) — contrato/cotización/referencia subido al crear. */
  attachmentUrl: string | null;
  attachmentName: string | null;
}

interface CustomerOption {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface Props {
  slug: string;
  currency: 'USD' | 'DOP';
  initialProposals: ProposalRow[];
  customers: CustomerOption[];
}

const STATUS_STYLES: Record<ProposalRow['status'], string> = {
  Draft: 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400',
  Sent: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  Accepted: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  Expired: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
};

const STATUS_LABELS: Record<ProposalRow['status'], { es: string; en: string }> = {
  Draft: { es: 'Borrador', en: 'Draft' },
  Sent: { es: 'Enviada', en: 'Sent' },
  Accepted: { es: 'Aceptada', en: 'Accepted' },
  Expired: { es: 'Expirada', en: 'Expired' },
};

// Propuestas de servicio — el cliente abre un link público, escribe su nombre y acepta. No es
// una firma dibujada/certificada a propósito: coincide con la simplicidad ya usada en
// booking/reservas/checkout público de este proyecto. Ver Proposal.cs en maalca-api.
const NEW_CUSTOMER = '__new__';

export function ProposalsContent({ slug, currency, initialProposals, customers }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency });

  const [proposals, setProposals] = useState<ProposalRow[]>(initialProposals);
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(NEW_CUSTOMER);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  async function refetch() {
    try {
      const res = await fetch(`/api/space/${slug}/proposals`, { cache: 'no-store' });
      if (!res.ok) return;
      setProposals(await res.json());
    } catch {
      // Deja la lista como estaba — no rompemos la pantalla por un refetch fallido.
    }
  }

  async function handleAdd() {
    if (!name.trim() || !title.trim() || !amount || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/space/${slug}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          customerEmail: email.trim() || null,
          customerPhone: phone.trim() || null,
          title: title.trim(),
          description: description.trim() || null,
          amount: Number(amount),
          currency,
          expiresAt: expiresAt || null,
          attachmentUrl,
          attachmentName,
        }),
      });
      if (!res.ok) throw new Error('add failed');
      setSelectedCustomerId(NEW_CUSTOMER);
      setName('');
      setEmail('');
      setPhone('');
      setTitle('');
      setDescription('');
      setAmount('');
      setExpiresAt('');
      setAttachmentUrl(null);
      setAttachmentName(null);
      setShowForm(false);
      toast.success(getText('Propuesta creada.', 'Proposal created.'));
      await refetch();
    } catch {
      toast.error(getText('No se pudo crear. Intenta de nuevo.', "Couldn't create it. Try again."));
    } finally {
      setSaving(false);
    }
  }

  // Adjuntar documento (tarea #336) — sube de inmediato al elegir el archivo (Supabase Storage
  // vía la ruta interna), y guarda solo la URL pública para mandarla junto con el resto del
  // formulario al crear la propuesta.
  async function handleAttachmentChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingAttachment(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/space/${slug}/proposals/upload-attachment`, { method: 'POST', body: formData });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? 'upload failed');
      setAttachmentUrl(data.url);
      setAttachmentName(data.name ?? file.name);
      toast.success(getText('Documento adjuntado.', 'Document attached.'));
    } catch {
      toast.error(getText('No se pudo subir el documento (máx. 10MB, PDF o imagen).', "Couldn't upload the document (max 10MB, PDF or image)."));
    } finally {
      setUploadingAttachment(false);
    }
  }

  async function handleSend(id: string) {
    if (actingOn) return;
    setActingOn(id);
    try {
      const res = await fetch(`/api/space/${slug}/proposals/${id}/send`, { method: 'POST' });
      if (!res.ok) throw new Error('send failed');
      await refetch();
      toast.success(getText('Propuesta enviada — copia el link para mandarlo.', 'Proposal sent — copy the link to share it.'));
    } catch {
      toast.error(getText('No se pudo enviar. Intenta de nuevo.', "Couldn't send it. Try again."));
    } finally {
      setActingOn(null);
    }
  }

  async function handleDelete(id: string) {
    if (actingOn) return;
    if (!confirm(getText('¿Eliminar esta propuesta?', 'Delete this proposal?'))) return;
    setActingOn(id);
    try {
      const res = await fetch(`/api/space/${slug}/proposals/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error('delete failed');
      setProposals((prev) => prev.filter((p) => p.id !== id));
      toast.success(getText('Propuesta eliminada.', 'Proposal deleted.'));
    } catch {
      toast.error(getText('No se pudo eliminar. Intenta de nuevo.', "Couldn't delete it. Try again."));
    } finally {
      setActingOn(null);
    }
  }

  // Elegir un cliente existente autocompleta nombre/correo/teléfono (siguen editables) — antes
  // solo se podía escribir a mano, incluso si el cliente ya existía en Clientes.
  function selectCustomer(id: string) {
    setSelectedCustomerId(id);
    if (id === NEW_CUSTOMER) return;
    const c = customers.find((cust) => cust.id === id);
    if (!c) return;
    setName(c.name);
    setEmail(c.email ?? '');
    setPhone(c.phone ?? '');
  }

  // PDF descargable (tarea #337) — mismo generador en el navegador que la página pública, para
  // que el dueño también pueda bajar un resumen sin tener que abrir el link público.
  async function handleDownloadPdf(p: ProposalRow) {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const marginX = 56;
    let y = 72;
    const pFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: p.currency });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(20, 20, 20);
    doc.text(p.title, marginX, y);
    y += 22;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(90, 90, 90);
    doc.text(`Cliente: ${p.customerName}`, marginX, y);
    y += 20;

    if (p.description) {
      const lines = doc.splitTextToSize(p.description, 480);
      doc.text(lines, marginX, y);
      y += lines.length * 15 + 12;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(140, 140, 140);
    doc.text(`Emitida el ${fmtDate(p.createdAt)}`, marginX, y);
    y += 24;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(20, 20, 20);
    doc.text(pFmt.format(p.amount), marginX, y);
    y += 24;

    if (p.status === 'Accepted' && p.acceptedByName) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(22, 130, 70);
      doc.text('Propuesta aceptada ✓', marginX, y);
      y += 18;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      doc.text(`Firmado por ${p.acceptedByName}${p.acceptedAt ? ` · ${fmtDate(p.acceptedAt)}` : ''}`, marginX, y);
      y += 18;
    }

    if (p.attachmentUrl) {
      y += 12;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(140, 140, 140);
      doc.text('Documento adjunto:', marginX, y);
      y += 13;
      doc.textWithLink(p.attachmentUrl, marginX, y, { url: p.attachmentUrl });
    }

    doc.save(`propuesta-${p.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`);
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/propuesta/${token}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success(getText('Link copiado.', 'Link copied.')),
      () => toast.error(getText('No se pudo copiar el link.', "Couldn't copy the link.")),
    );
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(language === 'es' ? 'es-DO' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const active = proposals.filter((p) => p.status !== 'Accepted' && p.status !== 'Expired');
  const resolved = proposals.filter((p) => p.status === 'Accepted' || p.status === 'Expired');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
              {getText('Tu espacio', 'Your space')}
            </p>
            <h1 className="mt-1 text-2xl font-bold">{getText('Propuestas', 'Proposals')}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
              {getText('Envía una propuesta y deja que el cliente la acepte en línea.', 'Send a proposal and let the client accept it online.')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--brand-primary, #C8102E)' }}
          >
            {showForm ? getText('Cancelar', 'Cancel') : getText('+ Nueva', '+ New')}
          </button>
        </div>

        {showForm && (
          <div className="mt-4 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-3">
            {customers.length > 0 && (
              <div>
                <label className="text-xs text-gray-500 dark:text-neutral-400">
                  {getText('Cliente', 'Customer')}
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => selectCustomer(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                >
                  <option value={NEW_CUSTOMER}>{getText('— Cliente nuevo —', '— New customer —')}</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-xs text-gray-500 dark:text-neutral-400">
                {getText('Nombre del cliente', "Customer's name")}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={getText('Nombre completo', 'Full name')}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-3">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={getText('Correo (opcional)', 'Email (optional)')}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={getText('Teléfono (opcional)', 'Phone (optional)')}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={getText('Título de la propuesta (ej. Renovación de cocina, Menú de boda)', 'Proposal title (e.g. Kitchen remodel, Wedding menu)')}
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={getText('Descripción (opcional)', 'Description (optional)')}
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-neutral-400">
                  {getText(`Monto (${currency})`, `Amount (${currency})`)}
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-neutral-400">
                  {getText('Expira (opcional)', 'Expires (optional)')}
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-neutral-400">
                {getText('Documento adjunto (opcional)', 'Attached document (optional)')}
              </label>
              {attachmentUrl ? (
                <div className="mt-1 flex items-center justify-between gap-2 rounded-lg border border-gray-300 dark:border-neutral-700 px-3 py-2 text-sm">
                  <span className="truncate">📎 {attachmentName}</span>
                  <button
                    type="button"
                    onClick={() => { setAttachmentUrl(null); setAttachmentName(null); }}
                    className="shrink-0 min-h-8 min-w-8 rounded-full text-gray-400 hover:text-red-600"
                    aria-label={getText('Quitar adjunto', 'Remove attachment')}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={handleAttachmentChange}
                  disabled={uploadingAttachment}
                  className="mt-1 w-full text-sm text-gray-500 dark:text-neutral-400 file:mr-3 file:rounded-full file:border-0 file:bg-[#C8102E] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white disabled:opacity-40"
                />
              )}
              {uploadingAttachment && (
                <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">{getText('Subiendo…', 'Uploading…')}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!name.trim() || !title.trim() || !amount || saving}
              className="w-full rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              style={{ backgroundColor: 'var(--brand-primary, #C8102E)' }}
            >
              {saving ? getText('Creando…', 'Creating…') : getText('Crear propuesta', 'Create proposal')}
            </button>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {active.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-neutral-500">
              {getText('No hay propuestas activas.', 'No active proposals.')}
            </p>
          )}
          {active.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[p.status]}`}>
                      {STATUS_LABELS[p.status][language]}
                    </span>
                    <p className="truncate text-sm font-semibold">{p.title}</p>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                    {p.customerName} · {fmt.format(p.amount)}
                    {p.expiresAt ? ` · ${getText('expira', 'expires')} ${fmtDate(p.expiresAt)}` : ''}
                  </p>
                  {p.attachmentUrl && (
                    <a
                      href={p.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs font-medium text-[#C8102E] hover:underline"
                    >
                      📎 {getText('Ver documento adjunto', 'View attached document')}
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {p.status === 'Draft' && (
                    <button
                      type="button"
                      onClick={() => handleSend(p.id)}
                      disabled={actingOn === p.id}
                      className="rounded-full px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                      style={{ backgroundColor: 'var(--brand-primary, #C8102E)' }}
                    >
                      {getText('Enviar', 'Send')}
                    </button>
                  )}
                  {p.status === 'Sent' && (
                    <button
                      type="button"
                      onClick={() => copyLink(p.token)}
                      className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-2 text-xs font-semibold"
                    >
                      {getText('Copiar link', 'Copy link')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(p)}
                    className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-2 text-xs font-semibold text-gray-500 dark:text-neutral-400"
                  >
                    PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    disabled={actingOn === p.id}
                    className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-2 text-xs font-semibold text-gray-500 dark:text-neutral-400 disabled:opacity-40"
                  >
                    {getText('Eliminar', 'Delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {resolved.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
              {getText('Historial', 'History')}
            </h2>
            <div className="mt-3 space-y-2">
              {resolved.slice(0, 20).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200/70 dark:border-neutral-800 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-gray-400 dark:text-neutral-500">
                      {p.customerName} · {fmt.format(p.amount)}
                      {p.status === 'Accepted' && p.acceptedByName ? ` · ${getText('firmado por', 'signed by')} ${p.acceptedByName}` : ''}
                    </p>
                    {p.attachmentUrl && (
                      <a
                        href={p.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-[#C8102E] hover:underline"
                      >
                        📎 {getText('Ver adjunto', 'View attachment')}
                      </a>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {p.status === 'Accepted' && p.customerId && (
                      <Link
                        href={buildInvoiceLink(slug, { customerId: p.customerId, desc: p.title, amount: p.amount })}
                        className="rounded-full border border-gray-300 dark:border-neutral-700 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:text-neutral-300 hover:border-[#C8102E] hover:text-[#C8102E]"
                      >
                        {getText('Generar factura', 'Generate invoice')}
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(p)}
                      className="rounded-full border border-gray-300 dark:border-neutral-700 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:text-neutral-400"
                    >
                      PDF
                    </button>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[p.status]}`}>
                      {STATUS_LABELS[p.status][language]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
