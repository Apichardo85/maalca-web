'use client';

import { useRef, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

// Subida masiva de fotos: el dueño elige muchas imágenes (o una carpeta) y se emparejan solas con
// sus productos por el NOMBRE DEL ARCHIVO: código de barras (UPC/EAN), código interno (INT-…) o el
// nombre del producto. "7501234567890.jpg", "7501234567890-2.jpg" (2ª foto del mismo producto),
// "INT-1A2B3C4D.png", "Club de Nuit Urban Man Armaf.jpg". Usa el mismo subidor que el resto del
// dashboard (optimiza a WebP y guarda en el almacenamiento) y falla abierto: un archivo malo no
// frena a los demás.

interface PhotoIndexRow {
  id: string;
  name: string;
  barcode?: string | null;
  internalCode?: string | null;
  hasImage: boolean;
}

interface Match {
  item: PhotoIndexRow;
  files: { file: File; order: number }[];
}

type Phase = 'pick' | 'review' | 'running' | 'done';

const IMG_RE = /\.(jpe?g|png|webp)$/i;
const CONCURRENCY = 3;

const normText = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const normDigits = (s: string) => s.replace(/\D/g, '').replace(/^0+/, '');

function addTo(map: Map<string, PhotoIndexRow[]>, key: string, row: PhotoIndexRow) {
  if (!key) return;
  const list = map.get(key);
  if (list) list.push(row);
  else map.set(key, [row]);
}

async function pool<T>(items: T[], worker: (item: T) => Promise<void>, onTick: () => void) {
  let next = 0;
  const runners = Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
    while (next < items.length) {
      const current = items[next++];
      await worker(current);
      onTick();
    }
  });
  await Promise.all(runners);
}

export function BulkPhotoUpload({
  slug,
  onClose,
  onDone,
}: {
  slug: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  const filesRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>('pick');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [unmatched, setUnmatched] = useState<string[]>([]);
  const [skippedHasImage, setSkippedHasImage] = useState(0);
  const [replace, setReplace] = useState(false);
  const [allFilesCount, setAllFilesCount] = useState(0);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [failed, setFailed] = useState<string[]>([]);
  const [okItems, setOkItems] = useState(0);
  const pickedRef = useRef<File[]>([]);
  const indexRef = useRef<PhotoIndexRow[]>([]);

  function analyze(files: File[], rows: PhotoIndexRow[], replaceExisting: boolean) {
    const byBarcode = new Map<string, PhotoIndexRow[]>();
    const byCode = new Map<string, PhotoIndexRow[]>();
    const byName = new Map<string, PhotoIndexRow[]>();
    for (const r of rows) {
      addTo(byBarcode, r.barcode ? normDigits(r.barcode) : '', r);
      addTo(byCode, r.internalCode ? normText(r.internalCode) : '', r);
      addTo(byName, normText(r.name), r);
    }
    const resolve = (stem: string): PhotoIndexRow[] | undefined => {
      const digits = /^[\d\s-]+$/.test(stem) ? normDigits(stem) : '';
      return (
        (digits ? byBarcode.get(digits) : undefined) ??
        byCode.get(normText(stem)) ??
        byName.get(normText(stem))
      );
    };

    const grouped = new Map<string, Match>();
    const lost: string[] = [];
    let skipped = 0;
    for (const file of files) {
      const stem = file.name.replace(/\.[^.]+$/, '').trim();
      let order = 1;
      let hit = resolve(stem);
      if (!hit) {
        // "<código>-2" / "<código>_3" = segunda/tercera foto del mismo producto.
        const m = /^(.+?)[\s_-]+(\d{1,2})$/.exec(stem);
        if (m) {
          hit = resolve(m[1]);
          order = Number(m[2]);
        }
      }
      if (!hit) {
        lost.push(file.name);
        continue;
      }
      for (const item of hit) {
        if (item.hasImage && !replaceExisting) {
          skipped++;
          continue;
        }
        const g = grouped.get(item.id) ?? { item, files: [] };
        g.files.push({ file, order });
        grouped.set(item.id, g);
      }
    }
    const list = Array.from(grouped.values());
    for (const g of list) g.files.sort((a, b) => a.order - b.order);
    setMatches(list);
    setUnmatched(lost);
    setSkippedHasImage(skipped);
  }

  async function handlePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []).filter((f) => IMG_RE.test(f.name));
    e.target.value = '';
    if (picked.length === 0) {
      setError(getText('No se encontraron imágenes JPG, PNG o WebP.', 'No JPG, PNG or WebP images found.'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/inventory/photo-index`, { cache: 'no-store' });
      if (!res.ok) throw new Error('index failed');
      indexRef.current = (await res.json()) as PhotoIndexRow[];
      pickedRef.current = picked;
      setAllFilesCount(picked.length);
      analyze(picked, indexRef.current, replace);
      setPhase('review');
    } catch {
      setError(getText('No se pudo leer tu inventario. Intenta de nuevo.', "Couldn't read your inventory. Try again."));
    } finally {
      setBusy(false);
    }
  }

  function toggleReplace(v: boolean) {
    setReplace(v);
    analyze(pickedRef.current, indexRef.current, v);
  }

  async function run() {
    // Cada archivo se sube una sola vez aunque lo usen varios productos (mismo código de barras).
    const uniqueFiles = Array.from(new Set(matches.flatMap((m) => m.files.map((f) => f.file))));
    const firstItemOf = new Map<File, string>();
    for (const m of matches) for (const f of m.files) if (!firstItemOf.has(f.file)) firstItemOf.set(f.file, m.item.id);

    setPhase('running');
    setFailed([]);
    setProgress({ done: 0, total: uniqueFiles.length + matches.length });
    const urls = new Map<File, string>();
    const bad: string[] = [];
    let done = 0;
    const tick = () => setProgress((p) => ({ ...p, done: ++done }));

    await pool(
      uniqueFiles,
      async (file) => {
        try {
          const fd = new FormData();
          fd.append('file', file);
          fd.append('itemId', firstItemOf.get(file) ?? 'bulk');
          const res = await fetch(`/api/space/${slug}/catalog/upload-image`, { method: 'POST', body: fd });
          if (!res.ok) throw new Error('upload failed');
          const { url } = (await res.json()) as { url: string };
          urls.set(file, url);
        } catch {
          bad.push(file.name);
        }
      },
      tick,
    );

    let ok = 0;
    await pool(
      matches,
      async (m) => {
        const images = m.files.map((f) => urls.get(f.file)).filter((u): u is string => !!u);
        if (images.length === 0) return;
        try {
          const res = await fetch(`/api/space/${slug}/catalog/${m.item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images }),
          });
          if (!res.ok) throw new Error('patch failed');
          ok++;
        } catch {
          bad.push(m.item.name);
        }
      },
      tick,
    );

    setOkItems(ok);
    setFailed(bad);
    setPhase('done');
    onDone();
  }

  const btnPrimary = 'rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40';
  const btnGhost =
    'rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm font-semibold disabled:opacity-40';
  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;
  const folderAttrs = { webkitdirectory: '', directory: '' } as Record<string, string>;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={() => phase !== 'running' && onClose()}
    >
      <div
        className="max-h-[90vh] w-full max-w-md space-y-3 overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold">{getText('Subir fotos en bloque', 'Bulk photo upload')}</h2>

        {phase === 'pick' && (
          <>
            <p className="text-sm text-gray-600 dark:text-neutral-300">
              {getText(
                'Elige muchas fotos (o una carpeta) y se emparejan solas con tus productos por el nombre del archivo:',
                'Pick many photos (or a folder) and they match your products by file name:',
              )}
            </p>
            <ul className="list-disc space-y-1 pl-5 text-xs text-gray-500 dark:text-neutral-400">
              <li>{getText('Código de barras: 614514555125.jpg', 'Barcode: 614514555125.jpg')}</li>
              <li>{getText('Segunda foto del mismo producto: 614514555125-2.jpg', 'Second photo of the same product: 614514555125-2.jpg')}</li>
              <li>{getText('Código interno: INT-1A2B3C4D.png', 'Internal code: INT-1A2B3C4D.png')}</li>
              <li>{getText('O el nombre exacto del producto: Club de Nuit Urban Man Armaf.jpg', 'Or the exact product name: Club de Nuit Urban Man Armaf.jpg')}</li>
            </ul>
            <p className="text-xs text-gray-500 dark:text-neutral-400">
              {getText('JPG, PNG o WebP. Se optimizan solas al subir. Antes de guardar verás un resumen.', 'JPG, PNG or WebP. They are optimized on upload. You will see a summary before anything is saved.')}
            </p>
            {error && <p className="text-xs font-medium text-red-600">{error}</p>}
            <input ref={filesRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handlePicked} />
            <input ref={folderRef} type="file" multiple className="hidden" onChange={handlePicked} {...folderAttrs} />
            <div className="flex flex-col gap-2 pt-1">
              <button type="button" disabled={busy} onClick={() => folderRef.current?.click()} className={btnPrimary} style={{ backgroundColor: 'var(--brand-primary, #045AFE)' }}>
                {busy ? getText('Leyendo…', 'Reading…') : getText('Elegir carpeta', 'Choose folder')}
              </button>
              <button type="button" disabled={busy} onClick={() => filesRef.current?.click()} className={btnGhost}>
                {getText('Elegir archivos', 'Choose files')}
              </button>
              <button type="button" onClick={onClose} className="py-1 text-xs text-gray-500 dark:text-neutral-400">
                {getText('Cancelar', 'Cancel')}
              </button>
            </div>
          </>
        )}

        {phase === 'review' && (
          <>
            <div className="space-y-1 rounded-lg border border-gray-200/70 dark:border-neutral-800 p-3 text-sm">
              <p>
                <strong>{matches.length}</strong> {getText('productos recibirán foto', 'products will get a photo')}
                <span className="text-gray-500 dark:text-neutral-400"> · {allFilesCount} {getText('archivos elegidos', 'files picked')}</span>
              </p>
              {skippedHasImage > 0 && (
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  {getText(`${skippedHasImage} ya tienen foto y se respetan.`, `${skippedHasImage} already have a photo and are kept.`)}
                </p>
              )}
              {unmatched.length > 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {getText(`${unmatched.length} archivos sin pareja (no se suben).`, `${unmatched.length} files without a match (not uploaded).`)}
                </p>
              )}
            </div>
            {unmatched.length > 0 && (
              <details className="text-xs text-gray-500 dark:text-neutral-400">
                <summary className="cursor-pointer">{getText('Ver archivos sin pareja', 'Show unmatched files')}</summary>
                <ul className="mt-1 max-h-32 overflow-y-auto">
                  {unmatched.slice(0, 50).map((n) => <li key={n} className="truncate">{n}</li>)}
                  {unmatched.length > 50 && <li>{getText(`y ${unmatched.length - 50} más…`, `and ${unmatched.length - 50} more…`)}</li>}
                </ul>
              </details>
            )}
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-neutral-300">
              <input type="checkbox" checked={replace} onChange={(e) => toggleReplace(e.target.checked)} />
              {getText('Reemplazar fotos que ya tienen', 'Replace photos that already exist')}
            </label>
            <div className="flex flex-col gap-2 pt-1">
              <button type="button" disabled={matches.length === 0} onClick={run} className={btnPrimary} style={{ backgroundColor: 'var(--brand-primary, #045AFE)' }}>
                {getText(`Subir ${matches.length} fotos`, `Upload ${matches.length} photos`)}
              </button>
              <button type="button" onClick={() => setPhase('pick')} className={btnGhost}>
                {getText('Elegir otras', 'Pick others')}
              </button>
            </div>
          </>
        )}

        {phase === 'running' && (
          <>
            <p className="text-sm text-gray-600 dark:text-neutral-300">
              {getText('Subiendo y emparejando… no cierres esta ventana.', 'Uploading and matching… keep this window open.')}
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-800">
              <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: 'var(--brand-primary, #045AFE)' }} />
            </div>
            <p className="text-xs text-gray-500 dark:text-neutral-400">{progress.done} / {progress.total} · {pct}%</p>
          </>
        )}

        {phase === 'done' && (
          <>
            <p className="text-sm">
              ✅ <strong>{okItems}</strong> {getText('productos con foto nueva.', 'products with a new photo.')}
            </p>
            {failed.length > 0 && (
              <details open className="text-xs text-amber-700 dark:text-amber-300">
                <summary className="cursor-pointer">{getText(`${failed.length} fallaron — vuelve a subir solo esos`, `${failed.length} failed — upload just those again`)}</summary>
                <ul className="mt-1 max-h-32 overflow-y-auto">
                  {failed.slice(0, 50).map((n) => <li key={n} className="truncate">{n}</li>)}
                </ul>
              </details>
            )}
            <button type="button" onClick={onClose} className={`${btnPrimary} w-full`} style={{ backgroundColor: 'var(--brand-primary, #045AFE)' }}>
              {getText('Listo', 'Done')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
