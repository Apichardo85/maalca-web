'use client';

// src/app/space/[slug]/works/WorksContent.tsx
// Obras del autor (businessType 'creator'): ficha de cada libro, capítulos con su texto y qué se puede leer
// gratis en la página pública (abierta / muestra / cerrada, más una ventana de tiempo que la abre completa).
// Mismo patrón de página propia que /vehicles y /programs. La regla de lectura la aplica el API (WorkService).
import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { sanitizeLiteraryHtml } from '@/lib/sanitize-html';
import { ManuscriptImport, type ImportedChapter } from './ManuscriptImport';
import { TranslationPanel } from './TranslationPanel';
import { ExportPanel } from './ExportPanel';
import { ImprintContractsCard } from './ImprintContractsCard';
import {
  READING_ACCESS_LABELS, WORK_KIND_LABELS, readingMinutes,
  type ImprintOption, type ReadingAccess, type Work, type WorkBuyLink, type WorkChapter, type WorkChapterRef, type WorkDetail, type WorkKind,
} from '@/lib/creator';

interface Props {
  slug: string;
  initialWorks: Work[];
}

const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm';
const labelClass = 'mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400';
const cardClass = 'rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4';
const primaryBtn = 'rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn = 'rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-neutral-300 disabled:opacity-40';
const dangerBtn = 'rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-600 dark:border-red-800 dark:text-red-400';

async function api<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; data: T | null; error?: string; status?: number }> {
  try {
    const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
    if (res.status === 204) return { ok: true, data: null, status: 204 };
    const data = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, status: res.status, data: null, error: data?.error?.message ?? (typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`) };
    return { ok: true, data, status: res.status };
  } catch {
    return { ok: false, data: null, error: 'network' };
  }
}

/** ISO (UTC) → valor de <input type="datetime-local"> en la hora del navegador. */
function isoToLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function localInputToIso(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const emptyWork = {
  title: '', titleEn: '', subtitle: '', slug: '',
  kind: 'novel' as WorkKind, status: 'draft' as Work['status'],
  synopsis: '', synopsisEn: '', coverUrl: '', coverUrlEn: '',
  year: '', isbn: '', imprint: '', imprintId: '', byline: '', contentNotice: '',
  buyLinks: [] as WorkBuyLink[],
  readingAccess: 'sample' as ReadingAccess, freeFrom: '', freeUntil: '',
  featured: false, sortOrder: '0',
};
type WorkForm = typeof emptyWork;

function toForm(w: Work): WorkForm {
  return {
    title: w.title, titleEn: w.titleEn ?? '', subtitle: w.subtitle ?? '', slug: w.slug,
    kind: w.kind, status: w.status,
    synopsis: w.synopsis ?? '', synopsisEn: w.synopsisEn ?? '', coverUrl: w.coverUrl ?? '', coverUrlEn: w.coverUrlEn ?? '',
    year: w.year != null ? String(w.year) : '', isbn: w.isbn ?? '', imprint: w.imprint ?? '',
    imprintId: w.imprintId ?? '', byline: w.byline ?? '', contentNotice: w.contentNotice ?? '',
    buyLinks: w.buyLinks ?? [],
    readingAccess: w.readingAccess, freeFrom: isoToLocalInput(w.freeFrom), freeUntil: isoToLocalInput(w.freeUntil),
    featured: w.featured, sortOrder: String(w.sortOrder ?? 0),
  };
}

// expectedRevision: la versión con la que se abrió el formulario. Si otro guardó en medio, el API
// responde 409 STALE_WORK en vez de pisar sus cambios con los datos viejos de esta pestaña.
function toPayload(f: WorkForm, expectedRevision: number | null) {
  return {
    title: f.title.trim(),
    titleEn: f.titleEn.trim() || null,
    subtitle: f.subtitle.trim() || null,
    slug: f.slug.trim() || null,
    kind: f.kind,
    status: f.status,
    synopsis: f.synopsis || null,
    synopsisEn: f.synopsisEn || null,
    coverUrl: f.coverUrl.trim() || null,
    coverUrlEn: f.coverUrlEn.trim() || null,
    year: f.year.trim() ? Number(f.year) : null,
    isbn: f.isbn.trim() || null,
    // Con sello de MaalCa (por llave) el texto libre no hace falta: el nombre sale del sello.
    imprintId: f.imprintId || null,
    imprint: f.imprintId ? null : f.imprint.trim() || null,
    byline: f.byline.trim() || null,
    contentNotice: f.contentNotice.trim() || null,
    buyLinks: f.buyLinks.filter((l) => l.label.trim() && l.url.trim()).map((l) => ({ label: l.label.trim(), url: l.url.trim() })),
    readingAccess: f.readingAccess,
    freeFrom: localInputToIso(f.freeFrom),
    freeUntil: localInputToIso(f.freeUntil),
    featured: f.featured,
    sortOrder: Number(f.sortOrder) || 0,
    expectedRevision,
  };
}

export function WorksContent({ slug, initialWorks }: Props) {
  const { language } = useSimpleLanguage();
  const lang: 'es' | 'en' = language === 'es' ? 'es' : 'en';
  const getText = (es: string, en: string) => (lang === 'es' ? es : en);
  const toast = useToast();
  const base = `/api/space/${slug}/works`;

  const [works, setWorks] = useState<Work[]>(initialWorks);
  const [editing, setEditing] = useState<{ id: string | null } | null>(null);
  const [form, setForm] = useState<WorkForm>(emptyWork);
  const [chapters, setChapters] = useState<WorkChapterRef[]>([]);
  const [saving, setSaving] = useState(false);
  // Qué portada se está subiendo (null = ninguna).
  const [uploading, setUploading] = useState<'coverUrl' | 'coverUrlEn' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Versión de la ficha que tiene este formulario, y si el API dijo que ya cambió (409).
  const [revision, setRevision] = useState<number | null>(null);
  const [stale, setStale] = useState(false);
  // Sellos de MaalCa que esta obra puede elegir (contratos activos, o el propio sello).
  const [imprintOptions, setImprintOptions] = useState<ImprintOption[]>([]);

  async function loadImprintOptions() {
    const res = await api<ImprintOption[]>(`/api/space/${slug}/imprint/options`);
    if (res.ok && Array.isArray(res.data)) setImprintOptions(res.data);
  }
  useEffect(() => { void loadImprintOptions(); }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const sorted = useMemo(() => [...works].sort((a, b) => a.sortOrder - b.sortOrder || b.createdAt.localeCompare(a.createdAt)), [works]);

  function startCreate() {
    setEditing({ id: null });
    setForm(emptyWork);
    setChapters([]);
    setConfirmDelete(false);
    setRevision(null);
    setStale(false);
  }

  async function startEdit(w: Work) {
    setEditing({ id: w.id });
    setForm(toForm(w));
    setChapters([]);
    setConfirmDelete(false);
    setRevision(w.revision ?? null);
    setStale(false);
    const res = await api<WorkDetail>(`${base}/${w.id}`);
    if (res.ok && res.data) {
      setForm(toForm(res.data.work));
      setRevision(res.data.work.revision ?? null);
      upsertLocal(res.data.work);
      setChapters(res.data.chapters);
    } else {
      toast.error(getText('No pudimos cargar los capítulos.', "We couldn't load the chapters."));
    }
  }

  function close() {
    setEditing(null);
    setForm(emptyWork);
    setChapters([]);
    setRevision(null);
    setStale(false);
  }

  function upsertLocal(w: Work) {
    setWorks((prev) => (prev.some((p) => p.id === w.id) ? prev.map((p) => (p.id === w.id ? w : p)) : [...prev, w]));
  }

  // field: portada original o la de la edición en inglés (sin ella, en inglés se usa la original).
  async function handleCover(e: ChangeEvent<HTMLInputElement>, field: 'coverUrl' | 'coverUrlEn' = 'coverUrl') {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(field);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('itemId', editing?.id ?? 'new-work');
      const res = await fetch(`/api/space/${slug}/catalog/upload-image`, { method: 'POST', body: fd });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) throw new Error(data?.error ?? getText('No pudimos subir la portada.', "We couldn't upload the cover."));
      setForm((f) => ({ ...f, [field]: data.url }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : getText('No pudimos subir la portada.', "We couldn't upload the cover."));
    } finally {
      setUploading(null);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error(getText('El título es obligatorio.', 'Title is required.'));
      return;
    }
    setSaving(true);
    const payload = JSON.stringify(toPayload(form, editing?.id ? revision : null));
    const res = editing?.id
      ? await api<Work>(`${base}/${editing.id}`, { method: 'PUT', body: payload })
      : await api<Work>(base, { method: 'POST', body: payload });
    setSaving(false);
    if (res.status === 409 && editing?.id) {
      setStale(true);
      toast.error(getText('Esta obra cambió desde que la abriste. No se guardó para no borrar esos cambios.', 'This work changed since you opened it. Not saved, so those changes are kept.'));
      return;
    }
    if (!res.ok || !res.data) {
      toast.error(res.error && res.error !== 'network' ? res.error : getText('No se pudo guardar la obra.', 'Could not save the work.'));
      return;
    }
    upsertLocal(res.data);
    setForm(toForm(res.data));
    setRevision(res.data.revision ?? null);
    setStale(false);
    if (!editing?.id) {
      setEditing({ id: res.data.id });
      toast.success(getText('Obra creada. Ahora agrega sus capítulos.', 'Work created. Now add its chapters.'));
    } else {
      toast.success(getText('Obra guardada.', 'Work saved.'));
    }
  }

  async function handleDelete() {
    if (!editing?.id) return;
    const res = await api(`${base}/${editing.id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error(getText('No se pudo eliminar la obra.', 'Could not delete the work.'));
      return;
    }
    setWorks((prev) => prev.filter((w) => w.id !== editing.id));
    toast.success(getText('Obra eliminada.', 'Work deleted.'));
    close();
  }

  function refreshCounts(next: WorkChapterRef[]) {
    setChapters(next);
    if (!editing?.id) return;
    const id = editing.id;
    setWorks((prev) => prev.map((w) => (w.id === id ? { ...w, chapterCount: next.length, wordCount: next.reduce((s, c) => s + c.wordCount, 0) } : w)));
  }

  // ── Vista: lista ─────────────────────────────────────────────────────────────
  if (!editing) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-6">
        <Toast toasts={toast.toasts} onRemove={toast.remove} />
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold">{getText('Obras', 'Works')}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
              {getText(
                'Tus libros y sus capítulos. Tú decides qué se lee gratis en tu página y por cuánto tiempo.',
                'Your books and their chapters. You decide what can be read for free on your page, and for how long.',
              )}
            </p>
          </div>
          <button type="button" onClick={startCreate} className={`${primaryBtn} min-h-11`}>
            {getText('+ Nueva obra', '+ New work')}
          </button>
        </div>

        <ImprintContractsCard slug={slug} getText={getText} onChange={loadImprintOptions} />

        {sorted.length === 0 ? (
          <div className={`${cardClass} text-center text-sm text-gray-500 dark:text-neutral-400`}>
            {getText('Todavía no hay obras. Crea la primera para que aparezca en tu página.', 'No works yet. Create the first one so it shows on your page.')}
          </div>
        ) : (
          <ul className="space-y-3">
            {sorted.map((w) => (
              <li key={w.id}>
                <button type="button" onClick={() => startEdit(w)} className={`${cardClass} flex w-full items-center gap-4 text-left transition hover:border-brand-primary`}>
                  {w.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={w.coverUrl} alt="" className="h-20 w-14 flex-none rounded object-cover" />
                  ) : (
                    <div className="flex h-20 w-14 flex-none items-center justify-center rounded bg-gray-100 text-xl dark:bg-neutral-800">📖</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-semibold">{w.title}</span>
                      {w.featured && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">{getText('Destacada', 'Featured')}</span>}
                      <span className={`rounded-full px-2 py-0.5 text-xs ${w.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-300'}`}>
                        {w.status === 'published' ? getText('Publicada', 'Published') : getText('Borrador', 'Draft')}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                      {[WORK_KIND_LABELS[w.kind]?.[lang], w.year, `${w.chapterCount} ${getText('capítulos', 'chapters')}`, READING_ACCESS_LABELS[w.readingAccess]?.[lang]].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // ── Vista: editor de una obra ────────────────────────────────────────────────
  const set = <K extends keyof WorkForm>(k: K, v: WorkForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <button type="button" onClick={close} className="mb-4 text-sm text-gray-500 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-white">
        ← {getText('Obras', 'Works')}
      </button>

      <form onSubmit={handleSave} className={`${cardClass} space-y-4`}>
        <h1 className="text-lg font-bold">{editing.id ? form.title || getText('Obra', 'Work') : getText('Nueva obra', 'New work')}</h1>

        {stale && editing.id && (
          <div role="alert" className="flex flex-col gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {getText(
                'Alguien guardó esta obra (otra pestaña u otra persona) después de que la abriste. Carga la versión actual; lo que cambiaste aquí sin guardar se pierde.',
                'Someone saved this work (another tab or person) after you opened it. Load the current version; your unsaved changes here will be lost.',
              )}
            </span>
            <button
              type="button"
              className={secondaryBtn}
              onClick={() => {
                const current = works.find((w) => w.id === editing.id);
                if (current) void startEdit(current);
              }}
            >
              {getText('Cargar la versión actual', 'Load current version')}
            </button>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{getText('Título', 'Title')}</label>
            <input className={inputClass} value={form.title} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{getText('Título en inglés (opcional)', 'English title (optional)')}</label>
            <input className={inputClass} value={form.titleEn} onChange={(e) => set('titleEn', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{getText('Subtítulo (opcional)', 'Subtitle (optional)')}</label>
            <input className={inputClass} value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{getText('Dirección en tu página', 'Address on your page')}</label>
            <div className="flex items-center gap-1 text-sm">
              <span className="whitespace-nowrap text-gray-400">/{slug}/obras/</span>
              <input className={inputClass} value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder={getText('se crea del título', 'made from the title')} />
            </div>
          </div>
          <div>
            <label className={labelClass}>{getText('Tipo', 'Kind')}</label>
            <select className={inputClass} value={form.kind} onChange={(e) => set('kind', e.target.value as WorkKind)}>
              {(Object.keys(WORK_KIND_LABELS) as WorkKind[]).map((k) => (
                <option key={k} value={k}>{WORK_KIND_LABELS[k][lang]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{getText('Estado', 'Status')}</label>
            <select className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value as Work['status'])}>
              <option value="draft">{getText('Borrador (no se ve en tu página)', 'Draft (hidden from your page)')}</option>
              <option value="published">{getText('Publicada', 'Published')}</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>{getText('Sinopsis', 'Synopsis')}</label>
          <div className="rounded-lg border border-gray-300 dark:border-neutral-700">
            <RichTextEditor value={form.synopsis} onChange={(html) => set('synopsis', html)} getText={getText} />
          </div>
        </div>
        <div>
          <label className={labelClass}>{getText('Sinopsis en inglés (opcional)', 'English synopsis (optional)')}</label>
          <div className="rounded-lg border border-gray-300 dark:border-neutral-700">
            <RichTextEditor value={form.synopsisEn} onChange={(html) => set('synopsisEn', html)} getText={getText} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {([
            ['coverUrl', getText('Portada', 'Cover')],
            ['coverUrlEn', getText('Portada en inglés (opcional; sin ella se usa la otra)', 'English cover (optional; falls back to the other)')],
          ] as const).map(([field, label]) => (
            <div key={field}>
              <span className={labelClass}>{label}</span>
              <div className="flex flex-wrap items-center gap-4">
                {form[field] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form[field]} alt="" className="h-28 w-20 rounded object-cover" />
                ) : (
                  <div className="flex h-28 w-20 items-center justify-center rounded bg-gray-100 text-2xl dark:bg-neutral-800">📖</div>
                )}
                <div className="flex flex-wrap gap-2">
                  <label className={`${secondaryBtn} cursor-pointer`}>
                    {uploading === field ? getText('Subiendo…', 'Uploading…') : getText('Subir', 'Upload')}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCover(e, field)} disabled={uploading !== null} />
                  </label>
                  {form[field] && (
                    <button type="button" className={secondaryBtn} onClick={() => set(field, '')}>{getText('Quitar', 'Remove')}</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className={labelClass}>{getText('Año', 'Year')}</label>
            <input className={inputClass} inputMode="numeric" value={form.year} onChange={(e) => set('year', e.target.value.replace(/\D/g, '').slice(0, 4))} />
          </div>
          <div>
            <label className={labelClass}>{getText('Sello', 'Imprint')}</label>
            {imprintOptions.length > 0 || form.imprintId ? (
              // Sello de MaalCa por llave (contrato activo); "otro" deja escribir uno de fuera.
              <select
                className={inputClass}
                value={form.imprintId || (form.imprint ? '__other' : '')}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((f) => ({ ...f, imprintId: v === '__other' ? '' : v, imprint: v === '__other' ? f.imprint || ' ' : '' }));
                }}
              >
                <option value="">{getText('Sin sello', 'No imprint')}</option>
                {imprintOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                {form.imprintId && !imprintOptions.some((o) => o.id === form.imprintId) && (
                  <option value={form.imprintId}>{works.find((w) => w.id === editing.id)?.imprintName ?? getText('Sello actual', 'Current imprint')}</option>
                )}
                <option value="__other">{getText('Otro (fuera de MaalCa)…', 'Other (outside MaalCa)…')}</option>
              </select>
            ) : (
              <input className={inputClass} value={form.imprint} onChange={(e) => set('imprint', e.target.value)} />
            )}
            {!form.imprintId && form.imprint && (imprintOptions.length > 0) && (
              <input className={`${inputClass} mt-2`} value={form.imprint.trimStart()} onChange={(e) => set('imprint', e.target.value)} placeholder={getText('Nombre del sello', 'Imprint name')} />
            )}
          </div>
          <div>
            <label className={labelClass}>ISBN</label>
            <input className={inputClass} value={form.isbn} onChange={(e) => set('isbn', e.target.value)} />
          </div>
        </div>

        <div>
          <label className={labelClass}>{getText('Autor como sale en el libro', 'Author as printed in the book')}</label>
          <input
            className={inputClass}
            maxLength={120}
            value={form.byline}
            onChange={(e) => set('byline', e.target.value)}
            placeholder={getText('Ej. Ciriaco Pichardo (vacío = el nombre de tu espacio)', 'e.g. Jane Doe (empty = your space name)')}
          />
        </div>

        <div>
          <label className={labelClass}>{getText('Aviso antes de leer (opcional)', 'Note before reading (optional)')}</label>
          <input className={inputClass} maxLength={300} value={form.contentNotice} onChange={(e) => set('contentNotice', e.target.value)} placeholder={getText('Ej. contiene escenas de violencia', 'e.g. contains scenes of violence')} />
        </div>

        {/* Dónde comprarla */}
        <div>
          <label className={labelClass}>{getText('Dónde comprarla', 'Where to buy it')}</label>
          <div className="space-y-2">
            {form.buyLinks.map((l, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputClass} w-40 flex-none`} value={l.label} placeholder="Amazon" onChange={(e) => set('buyLinks', form.buyLinks.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                <input className={inputClass} value={l.url} placeholder="https://" onChange={(e) => set('buyLinks', form.buyLinks.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
                <button type="button" aria-label={getText('Quitar enlace', 'Remove link')} className="px-2 text-gray-400 hover:text-red-500" onClick={() => set('buyLinks', form.buyLinks.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
            {form.buyLinks.length < 8 && (
              <button type="button" className={secondaryBtn} onClick={() => set('buyLinks', [...form.buyLinks, { label: '', url: '' }])}>
                {getText('+ Agregar enlace', '+ Add link')}
              </button>
            )}
          </div>
        </div>

        {/* Lectura en la página */}
        <fieldset className="rounded-xl border border-gray-200 p-3 dark:border-neutral-800">
          <legend className="px-1 text-sm font-semibold">{getText('Lectura en tu página', 'Reading on your page')}</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(READING_ACCESS_LABELS) as ReadingAccess[]).map((a) => (
              <label key={a} className={`cursor-pointer rounded-lg border p-3 text-sm ${form.readingAccess === a ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-gray-200 dark:border-neutral-700'}`}>
                <input type="radio" name="readingAccess" className="sr-only" checked={form.readingAccess === a} onChange={() => set('readingAccess', a)} />
                <span className="font-medium">{READING_ACCESS_LABELS[a][lang]}</span>
                <span className="mt-1 block text-xs text-gray-500 dark:text-neutral-400">{lang === 'es' ? READING_ACCESS_LABELS[a].hintEs : READING_ACCESS_LABELS[a].hintEn}</span>
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-neutral-400">
            {getText(
              'Lectura gratis por tiempo limitado: entre estas fechas se lee completa. Al cerrar, vuelve a lo que elegiste arriba.',
              'Free for a limited time: between these dates it can be read in full. Afterwards it goes back to the option above.',
            )}
          </p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>{getText('Desde', 'From')}</label>
              <input type="datetime-local" className={inputClass} value={form.freeFrom} onChange={(e) => set('freeFrom', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>{getText('Hasta', 'Until')}</label>
              <input type="datetime-local" className={inputClass} value={form.freeUntil} onChange={(e) => set('freeUntil', e.target.value)} />
            </div>
          </div>
          {(form.freeFrom || form.freeUntil) && (
            <button type="button" className="mt-2 text-xs text-gray-500 underline" onClick={() => setForm((f) => ({ ...f, freeFrom: '', freeUntil: '' }))}>
              {getText('Quitar fechas', 'Clear dates')}
            </button>
          )}
        </fieldset>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
            {getText('Destacada en la portada', 'Featured on the front page')}
          </label>
          <label className="flex items-center gap-2 text-sm">
            {getText('Orden', 'Order')}
            <input className={`${inputClass} w-20`} inputMode="numeric" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value.replace(/[^\d-]/g, ''))} />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex gap-2">
            <button type="submit" className={`${primaryBtn} min-h-11`} disabled={saving}>
              {saving ? getText('Guardando…', 'Saving…') : getText('Guardar', 'Save')}
            </button>
            {editing.id && form.status === 'published' && (
              <a href={`/${slug}/obras/${form.slug}`} target="_blank" rel="noopener noreferrer" className={`${secondaryBtn} min-h-11 inline-flex items-center`}>
                {getText('Ver en mi página', 'View on my page')}
              </a>
            )}
          </div>
          {editing.id && (confirmDelete ? (
            <div className="flex items-center gap-2 text-sm">
              <span>{getText('¿Eliminar la obra y todos sus capítulos?', 'Delete the work and all its chapters?')}</span>
              <button type="button" className={dangerBtn} onClick={handleDelete}>{getText('Sí, eliminar', 'Yes, delete')}</button>
              <button type="button" className={secondaryBtn} onClick={() => setConfirmDelete(false)}>{getText('No', 'No')}</button>
            </div>
          ) : (
            <button type="button" className={dangerBtn} onClick={() => setConfirmDelete(true)}>{getText('Eliminar', 'Delete')}</button>
          ))}
        </div>
      </form>

      {editing.id ? (
        <ChaptersPanel
          base={`${base}/${editing.id}`}
          chapters={chapters}
          readingAccess={form.readingAccess}
          onChange={refreshCounts}
          getText={getText}
          toastError={toast.error}
          toastSuccess={toast.success}
        />
      ) : (
        <p className="mt-4 text-sm text-gray-500 dark:text-neutral-400">
          {getText('Guarda la obra para empezar a agregar capítulos.', 'Save the work to start adding chapters.')}
        </p>
      )}

      {/* Traducción: solo con capítulos (lo que se traduce es el texto, capítulo por capítulo). */}
      {editing.id && chapters.length > 0 && (
        <TranslationPanel
          base={`${base}/${editing.id}`}
          lang="en"
          chaptersKey={chapters.map((c) => `${c.id}:${c.wordCount}`).join(',')}
          getText={getText}
          toastError={toast.error}
          toastSuccess={toast.success}
        />
      )}

      {/* Exportar: el libro sale de los capítulos guardados; se vuelve a revisar si cambian o se guarda la ficha. */}
      {editing.id && chapters.length > 0 && (
        <div className="mt-6">
          <ExportPanel
            base={base}
            workId={editing.id}
            getText={getText}
            refreshKey={`${revision ?? 0}|${chapters.map((c) => `${c.id}:${c.wordCount}`).join(',')}`}
          />
        </div>
      )}
    </div>
  );
}

// ── Capítulos ──────────────────────────────────────────────────────────────────

function ChaptersPanel({
  base, chapters, readingAccess, onChange, getText, toastError, toastSuccess,
}: {
  base: string;
  chapters: WorkChapterRef[];
  readingAccess: ReadingAccess;
  onChange: (next: WorkChapterRef[]) => void;
  getText: (es: string, en: string) => string;
  toastError: (m: string) => void;
  toastSuccess: (m: string) => void;
}) {
  const [open, setOpen] = useState<{ id: string | null; title: string; isSample: boolean; html: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  async function importManuscript(list: ImportedChapter[], mode: 'append' | 'replace', sampleCount: number): Promise<boolean> {
    const payload = {
      mode,
      chapters: list.map((c, i) => ({ number: null, title: c.title, contentHtml: sanitizeLiteraryHtml(c.contentHtml), isSample: i < sampleCount })),
    };
    const res = await api<WorkChapterRef[]>(`${base}/chapters-import`, { method: 'POST', body: JSON.stringify(payload) });
    if (!res.ok || !res.data) {
      toastError(res.error && res.error !== 'network' ? res.error : getText('No se pudo cargar el manuscrito.', 'Could not load the manuscript.'));
      return false;
    }
    onChange(res.data);
    setImporting(false);
    toastSuccess(getText(`${list.length} capítulos cargados.`, `${list.length} chapters loaded.`));
    return true;
  }

  async function edit(c: WorkChapterRef) {
    setLoading(true);
    const res = await api<WorkChapter>(`${base}/chapters/${c.id}`);
    setLoading(false);
    if (!res.ok || !res.data) {
      toastError(getText('No pudimos abrir el capítulo.', "We couldn't open the chapter."));
      return;
    }
    setOpen({ id: c.id, title: res.data.title, isSample: res.data.isSample, html: res.data.contentHtml ?? '' });
  }

  function create() {
    setOpen({ id: null, title: '', isSample: chapters.length === 0, html: '' });
  }

  async function reload() {
    const res = await api<WorkDetail>(base);
    if (res.ok && res.data) onChange(res.data.chapters);
  }

  async function save() {
    if (!open) return;
    if (!open.title.trim()) {
      toastError(getText('El capítulo necesita un título.', 'The chapter needs a title.'));
      return;
    }
    setSaving(true);
    const body = JSON.stringify({ number: null, title: open.title.trim(), contentHtml: open.html || null, isSample: open.isSample });
    const res = open.id
      ? await api<WorkChapter>(`${base}/chapters/${open.id}`, { method: 'PUT', body })
      : await api<WorkChapter>(`${base}/chapters`, { method: 'POST', body });
    setSaving(false);
    if (!res.ok || !res.data) {
      toastError(res.error && res.error !== 'network' ? res.error : getText('No se pudo guardar el capítulo.', 'Could not save the chapter.'));
      return;
    }
    toastSuccess(getText('Capítulo guardado.', 'Chapter saved.'));
    setOpen(null);
    await reload();
  }

  async function remove(id: string) {
    const res = await api(`${base}/chapters/${id}`, { method: 'DELETE' });
    setConfirmId(null);
    if (!res.ok) {
      toastError(getText('No se pudo eliminar el capítulo.', 'Could not delete the chapter.'));
      return;
    }
    await reload();
  }

  async function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= chapters.length) return;
    const ids = chapters.map((c) => c.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    const res = await api<WorkChapterRef[]>(`${base}/chapters-order`, { method: 'PUT', body: JSON.stringify({ chapterIds: ids }) });
    if (!res.ok || !res.data) {
      toastError(getText('No se pudo cambiar el orden.', 'Could not change the order.'));
      return;
    }
    onChange(res.data);
  }

  if (importing) {
    return (
      <div className={`${cardClass} mt-6`}>
        <ManuscriptImport hasChapters={chapters.length > 0} getText={getText} onImport={importManuscript} onCancel={() => setImporting(false)} />
      </div>
    );
  }

  if (open) {
    return (
      <div className={`${cardClass} mt-6 space-y-3`}>
        <h2 className="text-base font-semibold">{open.id ? getText('Editar capítulo', 'Edit chapter') : getText('Nuevo capítulo', 'New chapter')}</h2>
        <div>
          <label className={labelClass}>{getText('Título', 'Title')}</label>
          <input className={inputClass} value={open.title} onChange={(e) => setOpen({ ...open, title: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={open.isSample} onChange={(e) => setOpen({ ...open, isSample: e.target.checked })} />
          {getText('Muestra gratis', 'Free sample')}
          {readingAccess !== 'sample' && (
            <span className="text-xs text-gray-400">
              {getText('(solo cuenta cuando la obra está en "Muestra")', '(only applies when the work is set to "Sample")')}
            </span>
          )}
        </label>
        <div>
          <label className={labelClass}>{getText('Texto', 'Text')}</label>
          <div className="rounded-lg border border-gray-300 dark:border-neutral-700 [&_.ProseMirror]:min-h-[320px]">
            <RichTextEditor value={open.html} onChange={(html) => setOpen((o) => (o ? { ...o, html } : o))} getText={getText} />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" className={`${primaryBtn} min-h-11`} onClick={save} disabled={saving}>
            {saving ? getText('Guardando…', 'Saving…') : getText('Guardar capítulo', 'Save chapter')}
          </button>
          <button type="button" className={`${secondaryBtn} min-h-11`} onClick={() => setOpen(null)}>{getText('Cancelar', 'Cancel')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${cardClass} mt-6`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{getText('Capítulos', 'Chapters')} <span className="font-normal text-gray-400">({chapters.length})</span></h2>
        <div className="flex gap-2">
          <button type="button" className={secondaryBtn} onClick={() => setImporting(true)}>{getText('Cargar manuscrito', 'Load manuscript')}</button>
          <button type="button" className={primaryBtn} onClick={create} disabled={loading}>{getText('+ Capítulo', '+ Chapter')}</button>
        </div>
      </div>
      {chapters.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-neutral-400">{getText('Sin capítulos todavía.', 'No chapters yet.')}</p>
      ) : (
        <ol className="divide-y divide-gray-100 dark:divide-neutral-800">
          {chapters.map((c, i) => (
            <li key={c.id} className="flex items-center gap-3 py-2.5">
              <span className="w-7 text-right text-xs text-gray-400">{c.number}</span>
              <button type="button" onClick={() => edit(c)} className="min-w-0 flex-1 truncate text-left text-sm font-medium hover:text-brand-primary">
                {c.title}
              </button>
              {c.isSample && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/40 dark:text-green-300">{getText('muestra', 'sample')}</span>}
              <span className="hidden text-xs text-gray-400 sm:inline">{c.wordCount.toLocaleString()} {getText('palabras', 'words')} · {readingMinutes(c.wordCount)} min</span>
              <button type="button" aria-label={getText('Subir', 'Move up')} className="px-1 text-gray-400 hover:text-gray-700 disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
              <button type="button" aria-label={getText('Bajar', 'Move down')} className="px-1 text-gray-400 hover:text-gray-700 disabled:opacity-30" disabled={i === chapters.length - 1} onClick={() => move(i, 1)}>↓</button>
              {confirmId === c.id ? (
                <span className="flex gap-1">
                  <button type="button" className="text-xs text-red-600" onClick={() => remove(c.id)}>{getText('Eliminar', 'Delete')}</button>
                  <button type="button" className="text-xs text-gray-500" onClick={() => setConfirmId(null)}>{getText('No', 'No')}</button>
                </span>
              ) : (
                <button type="button" aria-label={getText('Eliminar capítulo', 'Delete chapter')} className="px-1 text-gray-400 hover:text-red-500" onClick={() => setConfirmId(c.id)}>✕</button>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
