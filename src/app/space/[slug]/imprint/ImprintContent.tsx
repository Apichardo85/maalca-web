'use client';

// src/app/space/[slug]/imprint/ImprintContent.tsx
// Panel del editor del sello (businessType 'publisher'):
//   - Autores: invitar por la dirección de su espacio, términos (regalías, derechos, fechas), terminar.
//   - Obras del sello: las de cada autor con contrato activo y las del propio sello, con su estado editorial
//     y la exportación a EPUB (el sello puede exportar lo que sale con él).
// Las reglas viven en el API (ImprintService): aquí solo se pinta y se pide.
import { useEffect, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { ExportPanel } from '../works/ExportPanel';
import { rightsLabel } from '../works/ImprintContractsCard';
import {
  IMPRINT_RIGHTS, IMPRINT_STATUS_LABELS, WORK_KIND_LABELS, workCover,
  type ImprintContract, type ImprintContractTerms, type ImprintRight, type ImprintWork,
} from '@/lib/creator';

const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm';
const labelClass = 'mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400';
const cardClass = 'rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4';
const primaryBtn = 'rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn = 'rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-neutral-300 disabled:opacity-40';
const dangerBtn = 'rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-600 dark:border-red-800 dark:text-red-400 disabled:opacity-40';

async function api<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; data: T | null; error?: string }> {
  try {
    const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, data: null, error: data?.error?.message ?? (typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`) };
    return { ok: true, data };
  } catch {
    return { ok: false, data: null, error: 'network' };
  }
}

interface TermsForm {
  royaltyEbookPercent: string;
  royaltyPrintPercent: string;
  rights: ImprintRight[];
  startsOn: string;
  endsOn: string;
  notes: string;
}

const emptyTerms: TermsForm = { royaltyEbookPercent: '', royaltyPrintPercent: '', rights: ['ebook'], startsOn: '', endsOn: '', notes: '' };

function termsFrom(c: ImprintContract): TermsForm {
  return {
    royaltyEbookPercent: String(c.royaltyEbookPercent),
    royaltyPrintPercent: String(c.royaltyPrintPercent),
    rights: c.rights,
    startsOn: c.startsOn?.slice(0, 10) ?? '',
    endsOn: c.endsOn?.slice(0, 10) ?? '',
    notes: c.notes ?? '',
  };
}

function termsPayload(f: TermsForm): ImprintContractTerms {
  return {
    royaltyEbookPercent: Number(f.royaltyEbookPercent) || 0,
    royaltyPrintPercent: Number(f.royaltyPrintPercent) || 0,
    rights: f.rights,
    startsOn: f.startsOn || null,
    endsOn: f.endsOn || null,
    notes: f.notes.trim() || null,
  };
}

function formatDate(iso: string | null | undefined, lang: 'es' | 'en'): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : new Intl.DateTimeFormat(lang === 'es' ? 'es-DO' : 'en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(d);
}

export function ImprintContent({ slug }: { slug: string }) {
  const { language } = useSimpleLanguage();
  const lang: 'es' | 'en' = language === 'es' ? 'es' : 'en';
  const getText = (es: string, en: string) => (lang === 'es' ? es : en);
  const toast = useToast();
  const base = `/api/space/${slug}/imprint`;

  const [contracts, setContracts] = useState<ImprintContract[]>([]);
  const [works, setWorks] = useState<ImprintWork[]>([]);
  const [loaded, setLoaded] = useState(false);
  // Formulario: null = cerrado; { id: null } = invitar; { id } = editar términos de una invitación.
  const [editing, setEditing] = useState<{ id: string | null } | null>(null);
  const [authorSlug, setAuthorSlug] = useState('');
  const [terms, setTerms] = useState<TermsForm>(emptyTerms);
  const [saving, setSaving] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState<string | null>(null);
  const [openWork, setOpenWork] = useState<string | null>(null);

  async function load() {
    const [a, w] = await Promise.all([api<ImprintContract[]>(`${base}/authors`), api<ImprintWork[]>(`${base}/works`)]);
    if (a.ok && Array.isArray(a.data)) setContracts(a.data);
    if (w.ok && Array.isArray(w.data)) setWorks(w.data);
    if (!a.ok) toast.error(a.error ?? getText('No pudimos cargar los autores.', "We couldn't load the authors."));
    setLoaded(true);
  }

  useEffect(() => { void load(); }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  function startInvite() {
    setEditing({ id: null });
    setAuthorSlug('');
    setTerms(emptyTerms);
  }

  function startEditTerms(c: ImprintContract) {
    setEditing({ id: c.id });
    setAuthorSlug(c.authorSlug ?? '');
    setTerms(termsFrom(c));
  }

  async function saveTerms(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const payload = termsPayload(terms);
    const res = editing.id
      ? await api<ImprintContract>(`${base}/authors/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) })
      : await api<ImprintContract>(`${base}/authors`, { method: 'POST', body: JSON.stringify({ authorSlug, ...payload }) });
    setSaving(false);
    if (!res.ok || !res.data) {
      toast.error(res.error && res.error !== 'network' ? res.error : getText('No se pudo guardar.', 'Could not save.'));
      return;
    }
    const saved = res.data;
    setContracts((prev) => (prev.some((c) => c.id === saved.id) ? prev.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...prev]));
    setEditing(null);
    toast.success(editing.id
      ? getText('Términos guardados. El autor tiene que aceptarlos.', 'Terms saved. The author has to accept them.')
      : getText(`Invitación enviada a ${saved.authorName}. Le aparece en su panel de Obras.`, `Invitation sent to ${saved.authorName}. It shows up in their Works panel.`));
  }

  async function endContract(c: ImprintContract) {
    setSaving(true);
    const res = await api<{ contract: ImprintContract; worksUnlinked: number }>(`${base}/authors/${c.id}/end`, { method: 'POST', body: '{}' });
    setSaving(false);
    setConfirmEnd(null);
    if (!res.ok || !res.data) {
      toast.error(res.error ?? getText('No se pudo terminar el contrato.', 'Could not end the contract.'));
      return;
    }
    const { contract, worksUnlinked } = res.data;
    setContracts((prev) => prev.map((x) => (x.id === contract.id ? contract : x)));
    setWorks((prev) => prev.filter((w) => w.authorId !== contract.authorId));
    toast.success(getText(
      `Contrato terminado. ${worksUnlinked} obra(s) dejaron de salir con el sello.`,
      `Contract ended. ${worksUnlinked} work(s) no longer carry the imprint.`,
    ));
  }

  const toggleRight = (r: ImprintRight) =>
    setTerms((t) => ({ ...t, rights: t.rights.includes(r) ? t.rights.filter((x) => x !== r) : [...t.rights, r] }));

  const statusPill = (status: ImprintContract['status']) => {
    const cls = status === 'active'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
      : status === 'invited'
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
        : 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-300';
    return <span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>{getText(IMPRINT_STATUS_LABELS[status].es, IMPRINT_STATUS_LABELS[status].en)}</span>;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-4 md:p-6">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />

      {/* ── Autores ─────────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold">{getText('Sello', 'Imprint')}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
              {getText(
                'Los autores que publica el sello. Cada autor tiene su propio espacio; aquí queda el contrato y lo que sale con el sello.',
                'The authors the imprint publishes. Each author keeps their own space; here you keep the contract and what goes out under the imprint.',
              )}
            </p>
          </div>
          {!editing && (
            <button type="button" onClick={startInvite} className={`${primaryBtn} min-h-11`}>
              {getText('+ Invitar autor', '+ Invite author')}
            </button>
          )}
        </div>

        {editing && (
          <form onSubmit={saveTerms} className={`${cardClass} mb-4 space-y-4`}>
            <h2 className="text-base font-bold">
              {editing.id ? getText('Términos de la invitación', 'Invitation terms') : getText('Invitar autor', 'Invite author')}
            </h2>
            <div>
              <label className={labelClass}>{getText('Dirección del espacio del autor', "Author's space address")}</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">maalca.com/</span>
                <input
                  className={inputClass}
                  value={authorSlug}
                  onChange={(e) => setAuthorSlug(e.target.value)}
                  disabled={!!editing.id}
                  placeholder="ciriwhispers"
                  required
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>{getText('Regalías ebook (% para el autor)', 'Ebook royalties (% to the author)')}</label>
                <input className={inputClass} inputMode="decimal" value={terms.royaltyEbookPercent} onChange={(e) => setTerms((t) => ({ ...t, royaltyEbookPercent: e.target.value.replace(/[^\d.]/g, '') }))} placeholder="50" />
              </div>
              <div>
                <label className={labelClass}>{getText('Regalías impreso (% para el autor)', 'Print royalties (% to the author)')}</label>
                <input className={inputClass} inputMode="decimal" value={terms.royaltyPrintPercent} onChange={(e) => setTerms((t) => ({ ...t, royaltyPrintPercent: e.target.value.replace(/[^\d.]/g, '') }))} placeholder="15" />
              </div>
            </div>
            <div>
              <span className={labelClass}>{getText('Derechos que cede', 'Rights granted')}</span>
              <div className="flex flex-wrap gap-3">
                {IMPRINT_RIGHTS.map((r) => (
                  <label key={r.value} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={terms.rights.includes(r.value)} onChange={() => toggleRight(r.value)} />
                    {getText(r.es, r.en)}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>{getText('Desde (vacío = al aceptar)', 'From (empty = on acceptance)')}</label>
                <input type="date" className={inputClass} value={terms.startsOn} onChange={(e) => setTerms((t) => ({ ...t, startsOn: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>{getText('Hasta (vacío = sin fecha)', 'Until (empty = open-ended)')}</label>
                <input type="date" className={inputClass} value={terms.endsOn} onChange={(e) => setTerms((t) => ({ ...t, endsOn: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className={labelClass}>{getText('Notas para el autor (opcional)', 'Notes for the author (optional)')}</label>
              <textarea className={inputClass} rows={3} maxLength={2000} value={terms.notes} onChange={(e) => setTerms((t) => ({ ...t, notes: e.target.value }))} />
            </div>
            <p className="text-xs text-gray-500 dark:text-neutral-400">
              {getText(
                'El autor acepta o rechaza desde su panel de Obras. Una vez aceptado, los términos no se cambian: para renegociar, se termina y se invita de nuevo.',
                'The author accepts or declines from their Works panel. Once accepted, terms do not change: to renegotiate, end it and invite again.',
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="submit" className={primaryBtn} disabled={saving || terms.rights.length === 0 || (!editing.id && !authorSlug.trim())}>
                {saving ? getText('Guardando…', 'Saving…') : editing.id ? getText('Guardar términos', 'Save terms') : getText('Enviar invitación', 'Send invitation')}
              </button>
              <button type="button" className={secondaryBtn} onClick={() => setEditing(null)}>{getText('Cancelar', 'Cancel')}</button>
            </div>
          </form>
        )}

        {loaded && contracts.length === 0 && !editing && (
          <div className={`${cardClass} text-center text-sm text-gray-500 dark:text-neutral-400`}>
            {getText('Todavía no hay autores. Invita al primero con la dirección de su espacio.', 'No authors yet. Invite the first one with their space address.')}
          </div>
        )}

        <ul className="space-y-3">
          {contracts.map((c) => (
            <li key={c.id} className={`${cardClass} space-y-2`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="font-semibold">{c.authorName}</span>
                  {c.authorSlug && <span className="text-xs text-gray-500">maalca.com/{c.authorSlug}</span>}
                  {statusPill(c.status)}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(c.status === 'invited' || c.status === 'declined') && (
                    <button type="button" className={secondaryBtn} onClick={() => startEditTerms(c)}>
                      {c.status === 'declined' ? getText('Invitar de nuevo', 'Invite again') : getText('Editar términos', 'Edit terms')}
                    </button>
                  )}
                  {c.status === 'ended' && c.authorSlug && (
                    <button type="button" className={secondaryBtn} onClick={() => { startInvite(); setAuthorSlug(c.authorSlug ?? ''); setTerms(termsFrom(c)); }}>
                      {getText('Invitar de nuevo', 'Invite again')}
                    </button>
                  )}
                  {(c.status === 'active' || c.status === 'invited') && confirmEnd !== c.id && (
                    <button type="button" className={dangerBtn} onClick={() => setConfirmEnd(c.id)}>
                      {c.status === 'active' ? getText('Terminar', 'End') : getText('Retirar', 'Withdraw')}
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-neutral-400">
                {c.royaltyEbookPercent}% ebook · {c.royaltyPrintPercent}% {getText('impreso', 'print')} · {rightsLabel(c.rights, getText)}
                {' · '}{getText('desde', 'from')} {formatDate(c.startsOn, lang)}{c.endsOn ? ` ${getText('hasta', 'until')} ${formatDate(c.endsOn, lang)}` : ''}
                {c.status === 'active' && ` · ${c.workCount} ${getText('obra(s) con el sello', 'work(s) with the imprint')}`}
              </p>
              {confirmEnd === c.id && (
                <div role="alert" className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    {c.status === 'active'
                      ? getText(
                        `¿Terminar el contrato con ${c.authorName}? Sus ${c.workCount} obra(s) dejan de salir con el sello (las obras y su texto no se tocan).`,
                        `End the contract with ${c.authorName}? Their ${c.workCount} work(s) stop carrying the imprint (the works and their text are not touched).`,
                      )
                      : getText(`¿Retirar la invitación a ${c.authorName}?`, `Withdraw the invitation to ${c.authorName}?`)}
                  </span>
                  <div className="flex flex-none gap-2">
                    <button type="button" className={dangerBtn} disabled={saving} onClick={() => endContract(c)}>{getText('Sí, terminar', 'Yes, end it')}</button>
                    <button type="button" className={secondaryBtn} onClick={() => setConfirmEnd(null)}>{getText('No', 'No')}</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Obras del sello ─────────────────────────────────────── */}
      <section>
        <h2 className="mb-1 text-lg font-bold">{getText('Obras del sello', 'Imprint works')}</h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-neutral-400">
          {getText(
            'Las que cada autor puso con el sello en su ficha, y las del propio sello. Desde aquí se revisa y se exporta la edición.',
            'The ones each author set with the imprint on their work page, plus the imprint’s own. Review and export the edition from here.',
          )}
        </p>
        {loaded && works.length === 0 ? (
          <div className={`${cardClass} text-center text-sm text-gray-500 dark:text-neutral-400`}>
            {getText(
              'Ninguna obra sale todavía con el sello. El autor la elige en la ficha de su obra (campo Sello) después de aceptar el contrato.',
              'No work carries the imprint yet. The author picks it on their work page (Imprint field) after accepting the contract.',
            )}
          </div>
        ) : (
          <ul className="space-y-3">
            {works.map((w) => {
              const missing = [
                !w.coverUrl && getText('portada', 'cover'),
                !w.hasSynopsis && getText('sinopsis', 'synopsis'),
                !w.isbn && 'ISBN',
                w.chapterCount === 0 && getText('capítulos', 'chapters'),
              ].filter(Boolean) as string[];
              return (
                <li key={w.id} className={`${cardClass} space-y-3`}>
                  <button type="button" onClick={() => setOpenWork(openWork === w.id ? null : w.id)} className="flex w-full items-center gap-4 text-left">
                    {workCover(w, 'es') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={workCover(w, 'es')!} alt="" className="h-20 w-14 flex-none rounded object-cover" />
                    ) : (
                      <div className="flex h-20 w-14 flex-none items-center justify-center rounded bg-gray-100 text-xl dark:bg-neutral-800">📖</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-semibold">{w.title}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${w.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-300'}`}>
                          {w.status === 'published' ? getText('Publicada', 'Published') : getText('Borrador', 'Draft')}
                        </span>
                        {w.translations.map((l) => (
                          <span key={l} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs uppercase text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">{l}</span>
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                        {[w.authorName, WORK_KIND_LABELS[w.kind]?.[lang], w.year, `${w.chapterCount} ${getText('capítulos', 'chapters')}`].filter(Boolean).join(' · ')}
                      </p>
                      {missing.length > 0 && (
                        <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">{getText('Falta', 'Missing')}: {missing.join(', ')}</p>
                      )}
                    </div>
                    <span aria-hidden className="text-gray-400">{openWork === w.id ? '▾' : '▸'}</span>
                  </button>
                  {openWork === w.id && w.chapterCount > 0 && (
                    <ExportPanel base={`/api/space/${slug}/works`} workId={w.id} getText={getText} />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
