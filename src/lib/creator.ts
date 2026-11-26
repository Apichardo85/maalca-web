// src/lib/creator.ts
// Espacio de autor (businessType 'creator'): tipos de las obras que devuelve maalca-api (Work / WorkChapter,
// ver WorkService.cs), etiquetas es/en y fetchers del lado del servidor. Qué capítulo se puede leer lo decide
// el API; aquí solo se pinta lo que llega.

export type WorkKind = 'novel' | 'poetry' | 'stories' | 'micro' | 'essay' | 'chronicle' | 'other';
export type WorkStatus = 'draft' | 'published';
export type ReadingAccess = 'free' | 'sample' | 'closed';
/** Lo que se puede leer AHORA (incluida la ventana gratis): toda, algunos capítulos o nada. */
export type ReadableNow = 'full' | 'sample' | 'none';

export interface WorkBuyLink {
  label: string;
  url: string;
}

export interface PublicWorkSummary {
  id: string;
  slug: string;
  title: string;
  titleEn?: string | null;
  subtitle?: string | null;
  kind: WorkKind;
  synopsis?: string | null;
  synopsisEn?: string | null;
  coverUrl?: string | null;
  year?: number | null;
  imprint?: string | null;
  featured: boolean;
  chapterCount: number;
  readableNow: ReadableNow;
  /** Solo si hay una ventana de lectura gratis abierta ahora. */
  freeUntil?: string | null;
  buyLinks: WorkBuyLink[];
}

export interface PublicWorkChapterRef {
  number: number;
  title: string;
  wordCount: number;
  readable: boolean;
}

export interface PublicWork {
  work: PublicWorkSummary;
  isbn?: string | null;
  contentNotice?: string | null;
  chapters: PublicWorkChapterRef[];
}

export interface PublicWorkChapter {
  workSlug: string;
  workTitle: string;
  number: number;
  title: string;
  contentHtml?: string | null;
  wordCount: number;
  prevNumber?: number | null;
  nextNumber?: number | null;
  contentNotice?: string | null;
}

// ── Dashboard ───────────────────────────────────────────────────────────────────

export interface Work {
  id: string;
  title: string;
  titleEn?: string | null;
  subtitle?: string | null;
  slug: string;
  kind: WorkKind;
  status: WorkStatus;
  synopsis?: string | null;
  synopsisEn?: string | null;
  coverUrl?: string | null;
  year?: number | null;
  isbn?: string | null;
  imprint?: string | null;
  contentNotice?: string | null;
  buyLinks: WorkBuyLink[];
  readingAccess: ReadingAccess;
  freeFrom?: string | null;
  freeUntil?: string | null;
  featured: boolean;
  sortOrder: number;
  isDemo: boolean;
  chapterCount: number;
  wordCount: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface WorkChapterRef {
  id: string;
  number: number;
  title: string;
  isSample: boolean;
  wordCount: number;
  updatedAt?: string | null;
}

export interface WorkDetail {
  work: Work;
  chapters: WorkChapterRef[];
}

export interface WorkChapter {
  id: string;
  workId: string;
  number: number;
  title: string;
  contentHtml?: string | null;
  isSample: boolean;
  wordCount: number;
}

// ── Etiquetas ───────────────────────────────────────────────────────────────────

type Lang = 'es' | 'en';

export const WORK_KIND_LABELS: Record<WorkKind, { es: string; en: string }> = {
  novel: { es: 'novela', en: 'novel' },
  poetry: { es: 'poemario', en: 'poetry' },
  stories: { es: 'cuentos', en: 'short stories' },
  micro: { es: 'microrrelatos', en: 'flash fiction' },
  essay: { es: 'ensayo', en: 'essay' },
  chronicle: { es: 'crónica', en: 'chronicle' },
  other: { es: 'obra', en: 'work' },
};

export const READING_ACCESS_LABELS: Record<ReadingAccess, { es: string; en: string; hintEs: string; hintEn: string }> = {
  free: { es: 'Abierta', en: 'Open', hintEs: 'Todos los capítulos se leen gratis.', hintEn: 'Every chapter is free to read.' },
  sample: { es: 'Muestra', en: 'Sample', hintEs: 'Solo los capítulos marcados como muestra.', hintEn: 'Only the chapters marked as sample.' },
  closed: { es: 'Cerrada', en: 'Closed', hintEs: 'No se lee en la página: solo ficha y dónde comprarla.', hintEn: 'Not readable on the page: just the details and where to buy it.' },
};

export function kindLabel(kind: WorkKind, lang: Lang): string {
  return (WORK_KIND_LABELS[kind] ?? WORK_KIND_LABELS.other)[lang];
}

export function workTitle(w: { title: string; titleEn?: string | null }, lang: Lang): string {
  return lang === 'en' && w.titleEn ? w.titleEn : w.title;
}

export function workSynopsis(w: { synopsis?: string | null; synopsisEn?: string | null }, lang: Lang): string | null {
  return (lang === 'en' && w.synopsisEn ? w.synopsisEn : w.synopsis) ?? null;
}

/** Minutos de lectura (~220 palabras/min), mínimo 1. */
export function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / 220));
}

export function formatFreeUntil(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-DO' : 'en-US', { day: 'numeric', month: 'long' }).format(new Date(iso));
}

/** Estado de lectura en una línea, para listas. */
export function readableLabel(w: PublicWorkSummary, lang: Lang): string {
  if (w.freeUntil) {
    const date = formatFreeUntil(w.freeUntil, lang);
    return lang === 'es' ? `gratis hasta el ${date}` : `free until ${date}`;
  }
  if (w.readableNow === 'full') return lang === 'es' ? 'abierta' : 'open';
  if (w.readableNow === 'sample') return lang === 'es' ? 'muestra gratis' : 'free sample';
  return lang === 'es' ? 'solo en libro' : 'book only';
}

// ── Fetchers (servidor) ─────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

async function getJson<T>(path: string, tag: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 60, tags: [tag] } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (e) {
    console.error('[creator] fetch error', path, e);
    return null;
  }
}

export function getPublicWorks(slug: string) {
  return getJson<PublicWorkSummary[]>(`/api/public/affiliates/${encodeURIComponent(slug)}/works`, `affiliate:${slug}`);
}

export function getPublicWork(slug: string, workSlug: string) {
  return getJson<PublicWork>(
    `/api/public/affiliates/${encodeURIComponent(slug)}/works/${encodeURIComponent(workSlug)}`,
    `affiliate:${slug}`,
  );
}

export function getPublicChapter(slug: string, workSlug: string, number: number) {
  return getJson<PublicWorkChapter>(
    `/api/public/affiliates/${encodeURIComponent(slug)}/works/${encodeURIComponent(workSlug)}/chapters/${number}`,
    `affiliate:${slug}`,
  );
}

/** Lo mínimo del autor que necesitan la ficha de obra y el lector (barra y pie). Sale de /catalog. */
export interface CreatorAuthor {
  id: string;
  slug: string;
  name: string;
  businessType: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  description?: string | null;
  language?: string | null;
  contactEmail?: string | null;
  canales?: import('@/lib/public-contact').PublicCanal[];
}

export async function getCreatorAuthor(slug: string): Promise<CreatorAuthor | null> {
  const data = await getJson<{ pagePublished?: boolean; affiliate: CreatorAuthor }>(
    `/api/public/affiliates/${encodeURIComponent(slug)}/catalog`,
    `affiliate:${slug}`,
  );
  if (!data || data.pagePublished === false) return null;
  const bt = data.affiliate.businessType?.toLowerCase();
  return bt === 'creator' || bt === 'publisher' ? data.affiliate : null;
}
