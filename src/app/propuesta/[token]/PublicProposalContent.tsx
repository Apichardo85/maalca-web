'use client';

import { useState } from 'react';

export interface PublicProposal {
  businessName: string;
  title: string;
  description: string | null;
  amount: number;
  currency: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Expired';
  expiresAt: string | null;
  acceptedAt: string | null;
  acceptedByName: string | null;
  createdAt: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Página pública de aceptación de propuesta — sin login. El cliente escribe su nombre y hace
// clic en Aceptar; esto NO es una firma dibujada/certificada, es la misma simplicidad usada en
// booking/reservas/checkout público de este proyecto. Ver ProposalService.AcceptPublicProposalAsync.
export function PublicProposalContent({ token, initial }: { token: string; initial: PublicProposal }) {
  const [proposal, setProposal] = useState(initial);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: proposal.currency || 'USD' });

  async function handleAccept() {
    if (!name.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/public/proposals/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signedByName: name.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error?.message ?? 'No se pudo aceptar la propuesta.');
      }
      setProposal((prev) => ({
        ...prev,
        status: 'Accepted',
        acceptedAt: data.acceptedAt,
        acceptedByName: data.acceptedByName,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo aceptar la propuesta.');
    } finally {
      setSaving(false);
    }
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' });

  // PDF descargable (tarea #337) — generado 100% en el navegador con jsPDF, sin depender de
  // ningún servicio de PDF en el backend .NET (no había ninguna librería de PDF instalada ahí,
  // y agregar una nueva dependencia NuGet sin poder verificar el build no valía la pena para
  // algo tan simple como un resumen de texto). Funciona igual esté la propuesta firmada o no.
  async function handleDownloadPdf() {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const marginX = 56;
    let y = 72;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(120, 120, 120);
    doc.text(proposal.businessName.toUpperCase(), marginX, y);
    y += 28;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(20, 20, 20);
    doc.text(proposal.title, marginX, y);
    y += 26;

    if (proposal.description) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(70, 70, 70);
      const lines = doc.splitTextToSize(proposal.description, 480);
      doc.text(lines, marginX, y);
      y += lines.length * 15 + 12;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(140, 140, 140);
    doc.text(`Emitida el ${fmtDate(proposal.createdAt)}`, marginX, y);
    y += 24;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(20, 20, 20);
    doc.text(fmt.format(proposal.amount), marginX, y);
    y += 20;

    if (proposal.expiresAt) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(140, 140, 140);
      doc.text(`Válida hasta el ${fmtDate(proposal.expiresAt)}`, marginX, y);
      y += 24;
    }

    if (proposal.status === 'Accepted') {
      y += 12;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(22, 130, 70);
      doc.text('Propuesta aceptada ✓', marginX, y);
      y += 18;
      if (proposal.acceptedByName) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(90, 90, 90);
        doc.text(
          `Firmado por ${proposal.acceptedByName}${proposal.acceptedAt ? ` · ${fmtDate(proposal.acceptedAt)}` : ''}`,
          marginX,
          y,
        );
        y += 18;
      }
    }

    if (proposal.attachmentUrl) {
      y += 12;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(140, 140, 140);
      doc.text('Documento adjunto:', marginX, y);
      y += 13;
      doc.textWithLink(proposal.attachmentUrl, marginX, y, { url: proposal.attachmentUrl });
    }

    doc.save(`propuesta-${proposal.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
        <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
          {proposal.businessName}
        </p>
        <h1 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{proposal.title}</h1>
        {proposal.description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-neutral-300 whitespace-pre-line">{proposal.description}</p>
        )}
        <p className="mt-3 text-[11px] text-gray-400 dark:text-neutral-500">
          Emitida el {fmtDate(proposal.createdAt)}
        </p>
        {proposal.attachmentUrl && (
          <a
            href={proposal.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold"
            style={{ color: '#C8102E' }}
          >
            📎 Ver documento adjunto
          </a>
        )}
        <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{fmt.format(proposal.amount)}</p>
        {proposal.expiresAt && proposal.status === 'Sent' && (
          <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
            Válida hasta el {fmtDate(proposal.expiresAt)}
          </p>
        )}

        {proposal.status === 'Accepted' && (
          <div className="mt-6 rounded-xl bg-green-50 dark:bg-green-950/40 p-4 text-center">
            <p className="text-sm font-semibold text-green-700 dark:text-green-300">Propuesta aceptada ✓</p>
            {proposal.acceptedByName && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                Firmado por {proposal.acceptedByName}
                {proposal.acceptedAt ? ` · ${fmtDate(proposal.acceptedAt)}` : ''}
              </p>
            )}
          </div>
        )}

        {proposal.status === 'Expired' && (
          <div className="mt-6 rounded-xl bg-gray-100 dark:bg-neutral-800 p-4 text-center">
            <p className="text-sm font-semibold text-gray-600 dark:text-neutral-300">Esta propuesta expiró.</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">Contacta al negocio para una nueva propuesta.</p>
          </div>
        )}

        {proposal.status === 'Draft' && (
          <div className="mt-6 rounded-xl bg-gray-100 dark:bg-neutral-800 p-4 text-center">
            <p className="text-sm text-gray-500 dark:text-neutral-400">Esta propuesta todavía no ha sido enviada.</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleDownloadPdf}
          className="mt-4 w-full rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-neutral-300"
        >
          Descargar PDF
        </button>

        {proposal.status === 'Sent' && (
          <div className="mt-6 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Escribe tu nombre completo para aceptar"
              className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2.5 text-sm"
            />
            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
            <button
              type="button"
              onClick={handleAccept}
              disabled={!name.trim() || saving}
              className="w-full rounded-full px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
              style={{ backgroundColor: '#C8102E' }}
            >
              {saving ? 'Aceptando…' : 'Aceptar propuesta'}
            </button>
            <p className="text-center text-[11px] text-gray-400 dark:text-neutral-500">
              Al aceptar confirmas que estás de acuerdo con los términos y el monto de esta propuesta.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
