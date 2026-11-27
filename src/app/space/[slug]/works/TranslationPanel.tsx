'use client';
// src/app/space/[slug]/works/TranslationPanel.tsx — traducción de una obra a otro idioma (hoy: inglés).
// El modelo hace un borrador por capítulo en segundo plano (WorkTranslationWorker en maalca-api); el autor lo
// revisa lado a lado con el original, lo corrige y decide qué se publica. Nada se publica solo.
import { useCallback, useEffect, useState } from 'react';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { sanitizeLiteraryHtml } from '@/lib/sanitize-html';
import type {
  TranslationStatus,
  WorkChapterTranslationDetail,
  WorkChapterTranslationRef,
  WorkTranslationOverview,
} from '@/lib/creator';

const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm';
const labelClass = 'mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400';
const cardClass = 'rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4';
const primaryBtn = 'rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn = 'rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-neutral-300 disabled:opacity-40';
const linkBtn = 'text-xs font-medium text-brand-primary underline disabled:opacity-40';

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

const ACTIVE: ReadonlyArray<TranslationStatus> = ['queued', 'generating'];

export function TranslationPanel({
  base, lang, chaptersKey, getText, toastError, toastSuccess,
}: {
  /** /api/space/{slug}/works/{workId} */
  base: string;
  lang: 'en';
  /** Cambia cuando cambian los capítulos del original (para recargar el índice). */
  chaptersKey: string;
  getText: (es: string, en: string) => string;
  toastError: (m: string) => void;
  toastSuccess: (m: string) => void;
}) {
  const url = `${base}/translations/${lang}`;
  const [overview, setOverview] = useState<WorkTranslationOverview | null>(null);
  const [settings, setSettings] = useState({ brief: '', glossary: '', credit: '' });
  const [savingSettings, setSavingSettings] = useState(false);
  const [queueing, setQueueing] = useState(false);
  const [confirmForce, setConfirmForce] = useState<string | null>(null);
  const [open, setOpen] = useState<WorkChapterTranslationDetail | null>(null);
  const [draft, setDraft] = useState({ title: '', html: '' });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (withSettings: boolean) => {
    const res = await api<WorkTranslationOverview>(url);
    if (!res.ok || !res.data) return;
    setOverview(res.data);
    if (withSettings) {
      setSettings({
        brief: res.data.settings.brief ?? '',
        glossary: res.data.settings.glossary ?? '',
        credit: res.data.settings.credit ?? '',
      });
    }
  }, [url]);

  useEffect(() => { void load(true); }, [load, chaptersKey]);

  // Mientras haya capítulos en cola o traduciéndose, el índice se refresca solo.
  const working = overview?.chapters.some((c) => c.status && ACTIVE.includes(c.status)) ?? false;
  useEffect(() => {
    if (!working) return;
    const id = window.setInterval(() => { void load(false); }, 5000);
    return () => window.clearInterval(id);
  }, [working, load]);

  async function saveSettings() {
    setSavingSettings(true);
    const res = await api(`${url}/settings`, { method: 'PUT', body: JSON.stringify(settings) });
    setSavingSettings(false);
    if (!res.ok) { toastError(res.error && res.error !== 'network' ? res.error : getText('No se guardó la guía.', 'The guide was not saved.')); return; }
    toastSuccess(getText('Guía de traducción guardada.', 'Translation guide saved.'));
  }

  async function queue(chapterIds: string[] | null, force = false) {
    setQueueing(true);
    const res = await api<{ queued: number; skipped: number }>(`${url}/queue`, { method: 'POST', body: JSON.stringify({ chapterIds, force }) });
    setQueueing(false);
    setConfirmForce(null);
    if (!res.ok || !res.data) { toastError(res.error && res.error !== 'network' ? res.error : getText('No se pudo pedir el borrador.', 'Could not request the draft.')); return; }
    toastSuccess(res.data.queued > 0
      ? getText(`${res.data.queued} capítulo(s) en cola.`, `${res.data.queued} chapter(s) queued.`)
      : getText('No hay nada pendiente que traducir.', 'Nothing pending to translate.'));
    await load(false);
  }

  async function openChapter(c: WorkChapterTranslationRef) {
    const res = await api<WorkChapterTranslationDetail>(`${url}/chapters/${c.chapterId}`);
    if (!res.ok || !res.data) { toastError(getText('No pudimos abrir el capítulo.', "We couldn't open the chapter.")); return; }
    setOpen(res.data);
    setDraft({ title: res.data.title ?? '', html: res.data.contentHtml ?? '' });
  }

  async function saveChapter() {
    if (!open) return;
    if (!draft.title.trim()) { toastError(getText('El título traducido es obligatorio.', 'The translated title is required.')); return; }
    setBusy(true);
    const res = await api<WorkChapterTranslationDetail>(`${url}/chapters/${open.chapterId}`, {
      method: 'PUT', body: JSON.stringify({ title: draft.title, contentHtml: draft.html }),
    });
    setBusy(false);
    if (!res.ok || !res.data) { toastError(res.error && res.error !== 'network' ? res.error : getText('No se guardó la traducción.', 'The translation was not saved.')); return; }
    setOpen(res.data);
    toastSuccess(getText('Traducción guardada como revisada.', 'Translation saved as reviewed.'));
    await load(false);
  }

  async function setPublished(published: boolean) {
    if (!open) return;
    setBusy(true);
    const res = await api<WorkChapterTranslationDetail>(`${url}/chapters/${open.chapterId}/publish`, {
      method: 'POST', body: JSON.stringify({ published }),
    });
    setBusy(false);
    if (!res.ok || !res.data) { toastError(res.error && res.error !== 'network' ? res.error : getText('No se pudo cambiar.', 'Could not change it.')); return; }
    setOpen(res.data);
    toastSuccess(published ? getText('Capítulo publicado en inglés.', 'Chapter published in English.') : getText('Vuelve a borrador.', 'Back to draft.'));
    await load(false);
  }

  function statusLabel(c: { status?: TranslationStatus | null; reviewed: boolean }): { text: string; cls: string } {
    switch (c.status) {
      case 'queued': return { text: getText('En cola', 'Queued'), cls: 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-300' };
      case 'generating': return { text: getText('Traduciendo…', 'Translating…'), cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' };
      case 'draft': return c.reviewed
        ? { text: getText('Revisado', 'Reviewed'), cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' }
        : { text: getText('Borrador sin revisar', 'Unreviewed draft'), cls: 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-200' };
      case 'published': return { text: getText('Publicado', 'Published'), cls: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' };
      case 'failed': return { text: getText('Falló', 'Failed'), cls: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' };
      default: return { text: getText('Sin traducir', 'Not translated'), cls: 'bg-transparent text-gray-500 dark:text-neutral-400 border border-gray-200 dark:border-neutral-700' };
    }
  }

  if (!overview) return null;

  // ── Revisión lado a lado ──────────────────────────────────────────────────────
  if (open) {
    const st = statusLabel(open);
    const active = open.status ? ACTIVE.includes(open.status) : false;
    return (
      <section className={`${cardClass} mt-6 space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="button" className={linkBtn} onClick={() => { setOpen(null); void load(false); }}>
            ← {getText('Volver a la traducción', 'Back to translation')}
          </button>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>{st.text}</span>
        </div>

        {open.stale && (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {getText('El original cambió después de esta traducción. Revísala contra el texto de la izquierda.', 'The original changed after this translation. Check it against the text on the left.')}
          </p>
        )}
        {open.error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">{open.error}</p>
        )}
        {active && (
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            {getText('El borrador se está haciendo. Si guardas a mano ahora, tu versión manda y el borrador se descarta.', 'The draft is in progress. If you save by hand now, your version wins and the draft is discarded.')}
          </p>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <span className={labelClass}>{getText('Original', 'Original')} · {open.number}</span>
            <h3 className="mb-2 text-base font-semibold">{open.sourceTitle}</h3>
            <div
              className="max-h-[70vh] overflow-y-auto rounded-lg border border-gray-200 p-3 text-sm leading-relaxed dark:border-neutral-800 [&_p]:mb-3"
              dangerouslySetInnerHTML={{ __html: sanitizeLiteraryHtml(open.sourceHtml ?? '') }}
            />
          </div>
          <div>
            <label className={labelClass}>{getText('Título en inglés', 'English title')}</label>
            <input className={`${inputClass} mb-2`} value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
            <RichTextEditor key={open.chapterId} value={draft.html} onChange={(html) => setDraft((d) => ({ ...d, html }))} getText={getText} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={primaryBtn} disabled={busy} onClick={saveChapter}>
            {getText('Guardar como revisado', 'Save as reviewed')}
          </button>
          {open.status === 'published' ? (
            <button type="button" className={secondaryBtn} disabled={busy} onClick={() => setPublished(false)}>
              {getText('Despublicar', 'Unpublish')}
            </button>
          ) : (
            <button type="button" className={secondaryBtn} disabled={busy || active || !open.contentHtml} onClick={() => setPublished(true)}>
              {getText('Publicar este capítulo', 'Publish this chapter')}
            </button>
          )}
          {open.modelId && (
            <span className="text-xs text-gray-500 dark:text-neutral-400">
              {getText('Borrador', 'Draft')}: {open.modelId} · ${open.costUsd.toFixed(2)}
            </span>
          )}
        </div>
      </section>
    );
  }

  // ── Índice ────────────────────────────────────────────────────────────────────
  const done = overview.chapters.filter((c) => c.status === 'draft' || c.status === 'published').length;
  const published = overview.chapters.filter((c) => c.status === 'published').length;

  return (
    <section className={`${cardClass} mt-6 space-y-4`}>
      <div>
        <h2 className="text-base font-bold">{getText('Traducción al inglés', 'English translation')}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
          {getText(
            'El modelo hace un borrador de cada capítulo; tú lo revisas al lado del original, lo corriges y decides qué se publica. Nada se publica solo.',
            'The model drafts each chapter; you review it next to the original, fix it and decide what gets published. Nothing publishes by itself.',
          )}
        </p>
      </div>

      {!overview.ready && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {getText(
            'Falta el modelo o la llave del proveedor (nivel premium en /ops). Puedes pedir borradores: quedan en cola hasta que esté configurado. Traducir a mano funciona igual.',
            'The model or provider key is missing (premium tier in /ops). Drafts you request wait in the queue until it is set. Translating by hand works anyway.',
          )}
        </p>
      )}

      <fieldset className="space-y-3">
        <div>
          <label className={labelClass}>{getText('Crédito al pie', 'Credit line')}</label>
          <input
            className={inputClass}
            value={settings.credit}
            placeholder={getText('Traducción del autor', "Translated by the author")}
            onChange={(e) => setSettings((s) => ({ ...s, credit: e.target.value }))}
          />
        </div>
        <div>
          <label className={labelClass}>{getText('Guía para el traductor (voz, registro, qué se queda en español)', 'Translator guide (voice, register, what stays in Spanish)')}</label>
          <textarea className={`${inputClass} min-h-24`} value={settings.brief} onChange={(e) => setSettings((s) => ({ ...s, brief: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>{getText('Glosario fijo, uno por línea', 'Fixed glossary, one per line')}</label>
          <textarea
            className={`${inputClass} min-h-20 font-mono`}
            placeholder="hiedra = ivy"
            value={settings.glossary}
            onChange={(e) => setSettings((s) => ({ ...s, glossary: e.target.value }))}
          />
        </div>
        <button type="button" className={secondaryBtn} disabled={savingSettings} onClick={saveSettings}>
          {savingSettings ? getText('Guardando…', 'Saving…') : getText('Guardar guía', 'Save guide')}
        </button>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4 dark:border-neutral-800">
        <span className="text-sm text-gray-600 dark:text-neutral-300">
          {getText(`${done} de ${overview.chapters.length} traducidos · ${published} publicados`, `${done} of ${overview.chapters.length} translated · ${published} published`)}
          {overview.totalCostUsd > 0 && ` · $${overview.totalCostUsd.toFixed(2)}`}
        </span>
        <button type="button" className={primaryBtn} disabled={queueing} onClick={() => queue(null)}>
          {queueing ? getText('Pidiendo…', 'Requesting…') : getText('Pedir borrador de lo que falta', 'Draft what is missing')}
        </button>
      </div>

      <ol className="divide-y divide-gray-100 dark:divide-neutral-800">
        {overview.chapters.map((c) => {
          const st = statusLabel(c);
          const active = c.status ? ACTIVE.includes(c.status) : false;
          const protectedWork = c.status === 'published' || c.reviewed;
          return (
            <li key={c.chapterId} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-7 shrink-0 font-mono text-xs text-gray-400">{c.number}</span>
                  <span className="truncate text-sm">{c.sourceTitle}</span>
                </div>
                {(c.title || c.stale || c.error) && (
                  <div className="ml-9 text-xs text-gray-500 dark:text-neutral-400">
                    {c.title && <span className="italic">{c.title}</span>}
                    {c.stale && <span className="ml-2 text-amber-700 dark:text-amber-400">{getText('· el original cambió', '· original changed')}</span>}
                    {c.error && <span className="ml-2 text-red-600 dark:text-red-400">· {c.error}</span>}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>{st.text}</span>
                {!active && (
                  confirmForce === c.chapterId ? (
                    <span className="flex items-center gap-2 text-xs">
                      {getText('¿Rehacer? Se pierde lo que corregiste.', 'Redo? Your edits are lost.')}
                      <button type="button" className={linkBtn} disabled={queueing} onClick={() => queue([c.chapterId], true)}>{getText('Sí', 'Yes')}</button>
                      <button type="button" className={linkBtn} onClick={() => setConfirmForce(null)}>{getText('No', 'No')}</button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={linkBtn}
                      disabled={queueing}
                      onClick={() => (protectedWork ? setConfirmForce(c.chapterId) : queue([c.chapterId]))}
                    >
                      {c.status ? getText('Rehacer borrador', 'Redo draft') : getText('Pedir borrador', 'Request draft')}
                    </button>
                  )
                )}
                <button type="button" className={linkBtn} onClick={() => openChapter(c)}>
                  {c.status === 'draft' || c.status === 'published' ? getText('Revisar', 'Review') : getText('Traducir a mano', 'Translate by hand')}
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
