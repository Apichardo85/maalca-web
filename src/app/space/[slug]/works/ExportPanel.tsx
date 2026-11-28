'use client';

// src/app/space/[slug]/works/ExportPanel.tsx
// Exportar una obra como libro (EPUB 3) desde los capítulos que ya están en la plataforma. Primero la revisión
// previa del API (qué bloquea y qué conviene arreglar antes de subirlo a una tienda), después la descarga.
// Lo usan la ficha de la obra (autor) y el panel del sello (editor): `base` es el proxy de obras de ese espacio.
import { useCallback, useEffect, useState } from 'react';
import type { ReadingLang, WorkExportPreflight } from '@/lib/creator';

interface Props {
  /** `/api/space/{slug}/works` del espacio que exporta (el autor dueño o el sello con el que sale). */
  base: string;
  workId: string;
  getText: (es: string, en: string) => string;
  /** Cambia cuando cambian capítulos o la ficha: se vuelve a revisar. */
  refreshKey?: string | number;
}

const cardClass = 'rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4';
const primaryBtn = 'rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn = 'rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-neutral-300 disabled:opacity-40';

const LANG_LABELS: Record<ReadingLang, { es: string; en: string }> = {
  es: { es: 'Español (original)', en: 'Spanish (original)' },
  en: { es: 'Inglés', en: 'English' },
};

function fileNameFrom(disposition: string | null, fallback: string): string {
  if (!disposition) return fallback;
  const star = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (star) return decodeURIComponent(star[1]);
  const plain = /filename="?([^";]+)"?/i.exec(disposition);
  return plain ? plain[1] : fallback;
}

export function ExportPanel({ base, workId, getText, refreshKey }: Props) {
  const [lang, setLang] = useState<ReadingLang>('es');
  const [preflight, setPreflight] = useState<WorkExportPreflight | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${base}/${workId}/export/preflight?lang=${lang}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
      setPreflight(data as WorkExportPreflight);
    } catch (e) {
      setPreflight(null);
      setError(e instanceof Error ? e.message : 'error');
    } finally {
      setLoading(false);
    }
  }, [base, workId, lang]);

  useEffect(() => { void check(); }, [check, refreshKey]);

  async function download() {
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(`${base}/${workId}/export/epub?lang=${lang}`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileNameFrom(res.headers.get('content-disposition'), `obra-${lang}.epub`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (e) {
      setError(e instanceof Error ? e.message : getText('No se pudo generar el EPUB.', 'Could not build the EPUB.'));
    } finally {
      setDownloading(false);
    }
  }

  const errors = preflight?.issues.filter((i) => i.level === 'error') ?? [];
  const warnings = preflight?.issues.filter((i) => i.level === 'warning') ?? [];
  const languages = preflight?.languages?.length ? preflight.languages : (['es'] as ReadingLang[]);

  return (
    <section className={`${cardClass} space-y-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold">{getText('Exportar libro (EPUB)', 'Export book (EPUB)')}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
            {getText(
              'Arma el ebook con los capítulos de aquí: portada, créditos e índice. Es el archivo que se sube a Amazon, Apple o Kobo.',
              'Builds the ebook from the chapters here: cover, copyright page and contents. It is the file you upload to Amazon, Apple or Kobo.',
            )}
          </p>
        </div>
        <select
          aria-label={getText('Idioma de la edición', 'Edition language')}
          className="rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          value={lang}
          onChange={(e) => setLang(e.target.value as ReadingLang)}
        >
          {(['es', 'en'] as ReadingLang[]).map((l) => (
            <option key={l} value={l} disabled={!languages.includes(l) && l !== lang}>
              {getText(LANG_LABELS[l].es, LANG_LABELS[l].en)}
              {!languages.includes(l) ? ` — ${getText('sin traducción publicada', 'no published translation')}` : ''}
            </option>
          ))}
        </select>
      </div>

      {loading && !preflight && <p className="text-sm text-gray-500">{getText('Revisando…', 'Checking…')}</p>}

      {preflight && (
        <>
          <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
            <div className="flex gap-2"><dt className="text-gray-500 dark:text-neutral-400">{getText('Título', 'Title')}:</dt><dd className="font-medium">{preflight.title}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 dark:text-neutral-400">{getText('Autor', 'Author')}:</dt><dd className="font-medium">{preflight.author}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 dark:text-neutral-400">{getText('Sello', 'Imprint')}:</dt><dd className="font-medium">{preflight.publisher || '—'}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 dark:text-neutral-400">ISBN:</dt><dd className="font-medium">{preflight.isbn || '—'}</dd></div>
            <div className="flex gap-2 sm:col-span-2">
              <dt className="text-gray-500 dark:text-neutral-400">{getText('Contenido', 'Content')}:</dt>
              <dd className="font-medium">
                {preflight.chapterCount} {getText('capítulos', 'chapters')} · {preflight.wordCount.toLocaleString(getText('es-DO', 'en-US'))} {getText('palabras', 'words')}
              </dd>
            </div>
          </dl>

          {errors.length > 0 && (
            <ul className="space-y-1 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {errors.map((i) => <li key={i.code}>✕ {i.message}</li>)}
            </ul>
          )}
          {warnings.length > 0 && (
            <ul className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              {warnings.map((i) => <li key={i.code}>• {i.message}</li>)}
            </ul>
          )}
          {errors.length === 0 && warnings.length === 0 && (
            <p className="text-sm text-green-700 dark:text-green-400">{getText('Todo listo para exportar.', 'Ready to export.')}</p>
          )}
        </>
      )}

      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <button type="button" className={primaryBtn} onClick={download} disabled={downloading || loading || !preflight?.ready}>
          {downloading ? getText('Generando…', 'Building…') : getText('Descargar EPUB', 'Download EPUB')}
        </button>
        <button type="button" className={secondaryBtn} onClick={() => void check()} disabled={loading}>
          {loading ? getText('Revisando…', 'Checking…') : getText('Revisar de nuevo', 'Check again')}
        </button>
      </div>
    </section>
  );
}
