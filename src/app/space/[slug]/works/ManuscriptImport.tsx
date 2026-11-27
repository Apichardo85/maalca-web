'use client';

// src/app/space/[slug]/works/ManuscriptImport.tsx
// Cargar un manuscrito entero y partirlo en capítulos de una vez (POST /works/{id}/chapters-import en el API).
// Se pega desde Word o Google Docs (el formato y los títulos se conservan) o se sube un .txt / .md / .html.
// Sin dependencias nuevas: el corte se hace en el navegador y el autor revisa los títulos antes de cargar.
import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';

export interface ImportedChapter {
  title: string;
  contentHtml: string;
}

type SplitMode = 'headings' | 'separator';

const CHAPTER_LINE = /^\s*(cap[ií]tulo|chapter|parte|part)\b.{0,80}$/i;
const NUMBER_LINE = /^\s*([IVXLCDM]+|\d{1,3})[.)]?\s*$/;
const SEPARATOR_LINE = /^\s*(\*\s*){3,}\s*$|^\s*(-\s*){3,}\s*$|^\s*(#\s*){3,}\s*$|^\s*§\s*$/;

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Texto plano o Markdown sencillo → HTML de párrafos. "# Título" pasa a <h2>. */
export function textToHtml(text: string): string {
  const blocks = text.replace(/\r\n?/g, '\n').split(/\n{2,}/);
  return blocks
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      const h = b.match(/^#{1,3}\s+(.+)$/);
      if (h && !b.includes('\n')) return `<h2>${escapeHtml(h[1].trim())}</h2>`;
      return `<p>${escapeHtml(b).replace(/\n/g, '<br>')}</p>`;
    })
    .join('');
}

/** Corta el manuscrito en capítulos. Encabezados (h1–h3) o líneas "Capítulo …" / números sueltos; o separadores *** (poemas, cuentos). */
export function splitManuscript(html: string, mode: SplitMode): ImportedChapter[] {
  if (typeof window === 'undefined' || !html.trim()) return [];
  const doc = new DOMParser().parseFromString(`<div id="root">${html}</div>`, 'text/html');
  let root: HTMLElement | null = doc.getElementById('root');
  if (!root) return [];
  // Google Docs y Word envuelven todo en un <b>/<div>/<span> único: se baja hasta donde están los párrafos.
  while (root.children.length === 1 && !/^(p|h[1-6]|ul|ol|blockquote)$/i.test(root.children[0].tagName)) {
    root = root.children[0] as HTMLElement;
  }

  const chapters: { title: string; nodes: string[] }[] = [];
  let current: { title: string; nodes: string[] } | null = null;
  const push = () => {
    if (current && (current.nodes.length > 0 || current.title)) chapters.push(current);
  };

  for (const node of Array.from(root.childNodes)) {
    const el = node.nodeType === 1 ? (node as HTMLElement) : null;
    const text = (node.textContent ?? '').trim();
    if (!el && !text) continue;
    const tag = el?.tagName.toLowerCase() ?? '';

    const isHeading = /^h[1-3]$/.test(tag);
    const isChapterLine = tag === 'p' && text.length <= 90 && (CHAPTER_LINE.test(text) || NUMBER_LINE.test(text));
    const isSeparator = (text.length <= 12 && SEPARATOR_LINE.test(text)) || tag === 'hr';

    if (mode === 'headings' && (isHeading || isChapterLine)) {
      push();
      current = { title: text, nodes: [] };
      continue;
    }
    if (mode === 'separator' && isSeparator) {
      push();
      current = { title: '', nodes: [] };
      continue;
    }
    if (!current) current = { title: '', nodes: [] };
    current.nodes.push(el ? el.outerHTML : `<p>${escapeHtml(text)}</p>`);
  }
  push();

  return chapters
    .map((c, i) => {
      let title = c.title;
      let nodes = c.nodes;
      if (!title) {
        // Sin encabezado: en modo separador, la primera línea corta hace de título (el poema se llama así).
        const first = nodes[0] ? new DOMParser().parseFromString(nodes[0], 'text/html').body.textContent?.trim() ?? '' : '';
        if (mode === 'separator' && first && first.length <= 80) {
          title = first;
          nodes = nodes.slice(1);
        } else {
          title = `${i + 1}`;
        }
      }
      return { title: title.slice(0, 200), contentHtml: nodes.join('') };
    })
    .filter((c) => c.contentHtml.replace(/<[^>]+>/g, '').trim().length > 0);
}

export function ManuscriptImport({
  hasChapters,
  getText,
  onImport,
  onCancel,
}: {
  hasChapters: boolean;
  getText: (es: string, en: string) => string;
  /** sampleCount: cuántos de los capítulos cargados (desde el primero) quedan como muestra gratis. */
  onImport: (chapters: ImportedChapter[], mode: 'append' | 'replace', sampleCount: number) => Promise<boolean>;
  onCancel: () => void;
}) {
  const [html, setHtml] = useState('');
  const [split, setSplit] = useState<SplitMode>('headings');
  const [titles, setTitles] = useState<Record<number, string>>({});
  const [mode, setMode] = useState<'append' | 'replace'>('append');
  const [sampleCount, setSampleCount] = useState(hasChapters ? 0 : 1);
  const [busy, setBusy] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);

  const chapters = useMemo(() => splitManuscript(html, split), [html, split]);

  function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const rich = e.clipboardData.getData('text/html');
    const plain = e.clipboardData.getData('text/plain');
    setTitles({});
    setHtml(rich ? rich.replace(/^[\s\S]*<body[^>]*>|<\/body>[\s\S]*$/gi, '').replace(/<!--[\s\S]*?-->/g, '') : textToHtml(plain));
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const text = await file.text();
    setTitles({});
    setHtml(/\.html?$/i.test(file.name) ? text.replace(/^[\s\S]*<body[^>]*>|<\/body>[\s\S]*$/gi, '') : textToHtml(text));
  }

  async function run() {
    if (mode === 'replace' && hasChapters && !confirmReplace) {
      setConfirmReplace(true);
      return;
    }
    setBusy(true);
    const ok = await onImport(chapters.map((c, i) => ({ ...c, title: (titles[i] ?? c.title).trim() || `${i + 1}` })), mode, Math.min(sampleCount, chapters.length));
    setBusy(false);
    if (!ok) setConfirmReplace(false);
  }

  const words = chapters.reduce((n, c) => n + c.contentHtml.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length, 0);

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">{getText('Cargar manuscrito', 'Load manuscript')}</h2>
      <p className="text-xs text-gray-500 dark:text-neutral-400">
        {getText(
          'Pega el texto completo desde Word o Google Docs (se conservan cursivas y títulos) o sube un archivo .txt, .md o .html. Revisa los capítulos antes de cargar.',
          'Paste the full text from Word or Google Docs (italics and headings are kept) or upload a .txt, .md or .html file. Check the chapters before loading.',
        )}
      </p>
      <label className="inline-block cursor-pointer rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 dark:border-neutral-700 dark:text-neutral-300">
        {getText('Subir archivo', 'Upload file')}
        <input type="file" accept=".txt,.md,.markdown,.html,.htm,text/plain,text/html,text/markdown" className="hidden" onChange={onFile} />
      </label>
      {/* Zona de pegado: guarda el HTML del portapapeles tal cual (con sus títulos h1). El API lo sanea al guardar. */}
      <div
        role="textbox"
        aria-label={getText('Pega aquí el manuscrito', 'Paste the manuscript here')}
        tabIndex={0}
        contentEditable
        suppressContentEditableWarning
        onPaste={onPaste}
        onKeyDown={(e) => { if (!(e.ctrlKey || e.metaKey) && e.key !== 'Tab') e.preventDefault(); }}
        className="flex min-h-[120px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 focus:border-brand-primary focus:outline-none dark:border-neutral-700 dark:text-neutral-400"
      >
        {html
          ? getText(`Manuscrito listo (${html.replace(/<[^>]+>/g, '').length.toLocaleString()} caracteres). Pega otro para cambiarlo.`, `Manuscript ready (${html.replace(/<[^>]+>/g, '').length.toLocaleString()} characters). Paste another to replace it.`)
          : getText('Haz clic aquí y pega (Ctrl+V / ⌘V) el manuscrito completo', 'Click here and paste (Ctrl+V / ⌘V) the full manuscript')}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-xs text-gray-500 dark:text-neutral-400">{getText('Partir en capítulos por', 'Split into chapters by')}</span>
        <label className="flex items-center gap-1.5">
          <input type="radio" checked={split === 'headings'} onChange={() => { setSplit('headings'); setTitles({}); }} />
          {getText('títulos ("Capítulo 1", encabezados)', 'headings ("Chapter 1", titles)')}
        </label>
        <label className="flex items-center gap-1.5">
          <input type="radio" checked={split === 'separator'} onChange={() => { setSplit('separator'); setTitles({}); }} />
          {getText('separadores *** (poemas, cuentos)', 'separators *** (poems, stories)')}
        </label>
      </div>

      {chapters.length > 0 && (
        <div className="rounded-xl border border-gray-200 p-3 dark:border-neutral-800">
          <p className="mb-2 text-xs text-gray-500 dark:text-neutral-400">
            {chapters.length} {getText('capítulos', 'chapters')} · {words.toLocaleString()} {getText('palabras', 'words')}
          </p>
          <ol className="max-h-72 space-y-1.5 overflow-y-auto">
            {chapters.map((c, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-7 text-right text-xs text-gray-400">{i + 1}</span>
                <input
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1 text-sm dark:border-neutral-700"
                  value={titles[i] ?? c.title}
                  maxLength={200}
                  onChange={(e) => setTitles((t) => ({ ...t, [i]: e.target.value }))}
                />
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm">
        {hasChapters && (
          <>
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={mode === 'append'} onChange={() => { setMode('append'); setConfirmReplace(false); }} />
              {getText('Agregar al final', 'Add at the end')}
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={mode === 'replace'} onChange={() => setMode('replace')} />
              {getText('Reemplazar los capítulos actuales', 'Replace the current chapters')}
            </label>
          </>
        )}
        <label className="flex items-center gap-1.5">
          {getText('Muestra gratis: los primeros', 'Free sample: the first')}
          <input
            type="number"
            min={0}
            max={Math.max(chapters.length, 1)}
            value={sampleCount}
            onChange={(e) => setSampleCount(Math.max(0, Math.min(500, Number(e.target.value) || 0)))}
            className="w-16 rounded-lg border border-gray-300 bg-transparent px-2 py-1 text-sm dark:border-neutral-700"
          />
          {getText('capítulos', 'chapters')}
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={run}
          disabled={busy || chapters.length === 0}
          className="min-h-11 rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy
            ? getText('Cargando…', 'Loading…')
            : confirmReplace
              ? getText('Sí, borrar los actuales y cargar', 'Yes, delete the current ones and load')
              : getText(`Cargar ${chapters.length} capítulos`, `Load ${chapters.length} chapters`)}
        </button>
        <button type="button" onClick={onCancel} className="min-h-11 rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-600 dark:border-neutral-700 dark:text-neutral-300">
          {getText('Cancelar', 'Cancel')}
        </button>
      </div>
    </div>
  );
}
