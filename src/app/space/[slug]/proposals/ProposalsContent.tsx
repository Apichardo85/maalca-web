'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';

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
}

interface Props {
  slug: string;
  currency: 'USD' | 'DOP';
  initialProposals: ProposalRow[];
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
export function ProposalsContent({ slug, currency, initialProposals }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency });

  const [proposals, setProposals] = useState<ProposalRow[]>(initialProposals);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);

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
        }),
      });
      if (!res.ok) throw new Error('add failed');
      setName('');
      setEmail('');
      setPhone('');
      setTitle('');
      setDescription('');
      setAmount('');
      setExpiresAt('');
      setShowForm(false);
      toast.success(getText('Propuesta creada.', 'Proposal created.'));
      await refetch();
    } catch {
      toast.error(getText('No se pudo crear. Intenta de nuevo.', "Couldn't create it. Try again."));
    } finally {
      setSaving(false);
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
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={getText('Nombre del cliente', "Customer's name")}
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
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
              placeholder={getText('Título del trabajo', 'Job title')}
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
              <input
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={getText(`Monto (${currency})`, `Amount (${currency})`)}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                title={getText('Expira (opcional)', 'Expires (optional)')}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              />
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
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[p.status]}`}>
                    {STATUS_LABELS[p.status][language]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
