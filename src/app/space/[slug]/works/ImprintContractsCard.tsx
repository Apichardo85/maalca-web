'use client';

// src/app/space/[slug]/works/ImprintContractsCard.tsx
// Lado del autor del sello editorial: invitaciones de sellos (aceptar / rechazar) y contratos activos.
// Con un contrato activo, el sello aparece para elegirlo en la ficha de cada obra. Ver ImprintService en el API.
import { useEffect, useState } from 'react';
import { IMPRINT_RIGHTS, IMPRINT_STATUS_LABELS, type ImprintContract } from '@/lib/creator';

interface Props {
  slug: string;
  getText: (es: string, en: string) => string;
  /** Avisa cuando cambian los contratos activos (para refrescar los sellos de la ficha). */
  onChange?: () => void;
}

const cardClass = 'rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4';
const primaryBtn = 'rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn = 'rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-neutral-300 disabled:opacity-40';

export function rightsLabel(rights: string[], getText: (es: string, en: string) => string): string {
  return IMPRINT_RIGHTS.filter((r) => rights.includes(r.value)).map((r) => getText(r.es, r.en)).join(', ');
}

export function ImprintContractsCard({ slug, getText, onChange }: Props) {
  const [contracts, setContracts] = useState<ImprintContract[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/space/${slug}/imprint/contracts`);
    if (!res.ok) return;
    const data = (await res.json().catch(() => [])) as ImprintContract[];
    setContracts(Array.isArray(data) ? data : []);
  }

  useEffect(() => { void load(); }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  async function respond(c: ImprintContract, accept: boolean) {
    setBusy(c.id);
    setError(null);
    const res = await fetch(`/api/space/${slug}/imprint/contracts/${c.id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accept }),
    });
    const data = await res.json().catch(() => null);
    setBusy(null);
    if (!res.ok) {
      setError(data?.error?.message ?? getText('No se pudo responder la invitación.', 'Could not answer the invitation.'));
      return;
    }
    setContracts((prev) => prev.map((x) => (x.id === c.id ? (data as ImprintContract) : x)));
    onChange?.();
  }

  const visible = contracts.filter((c) => c.status === 'invited' || c.status === 'active');
  if (visible.length === 0) return null;

  return (
    <section className={`${cardClass} mb-6 space-y-3`}>
      <h2 className="text-base font-bold">{getText('Sellos editoriales', 'Imprints')}</h2>
      {visible.map((c) => (
        <div key={c.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-3 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{c.imprintName}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${c.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                {getText(IMPRINT_STATUS_LABELS[c.status].es, IMPRINT_STATUS_LABELS[c.status].en)}
              </span>
            </div>
            <p className="mt-1 text-gray-500 dark:text-neutral-400">
              {getText('Regalías', 'Royalties')}: {c.royaltyEbookPercent}% ebook · {c.royaltyPrintPercent}% {getText('impreso', 'print')}
              {' · '}{getText('Derechos', 'Rights')}: {rightsLabel(c.rights, getText)}
              {c.status === 'active' && ` · ${c.workCount} ${getText('obra(s) con el sello', 'work(s) with the imprint')}`}
            </p>
            {c.notes && <p className="mt-1 whitespace-pre-line text-gray-500 dark:text-neutral-400">{c.notes}</p>}
          </div>
          {c.status === 'invited' && (
            <div className="flex flex-none gap-2">
              <button type="button" className={primaryBtn} disabled={busy === c.id} onClick={() => respond(c, true)}>
                {getText('Aceptar', 'Accept')}
              </button>
              <button type="button" className={secondaryBtn} disabled={busy === c.id} onClick={() => respond(c, false)}>
                {getText('Rechazar', 'Decline')}
              </button>
            </div>
          )}
        </div>
      ))}
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </section>
  );
}
