// src/lib/creator.ts
// Espacio de autor (businessType 'creator'): tipos de las obras que devuelve maalca-api (Work / WorkChapter,
// ver WorkService.cs), etiquetas es/en y fetchers del lado del servidor. Qué capítulo se puede leer lo decide
// el API; aquí solo se pinta lo que llega.

export type WorkKind = 'novel' | 'poetry' | 'stories' | 'micro' | 'essay' | 'chronicle' | 'other';
export type WorkStatus = 'draft' | 'published';
export type ReadingAccess = 'free' | 'sample' | 'members' | 'closed';
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
  /** Portada de la edición en inglés (sin ella, en inglés se usa coverUrl). */
  coverUrlEn?: string | null;
  year?: number | null;
  imprint?: string | null;
  featured: boolean;
  chapterCount: number;
  readableNow: ReadableNow;
  /** Solo si hay una ventana de lectura gratis abierta ahora. */
  freeUntil?: string | null;
  buyLinks: WorkBuyLink[];
  /** La obra se abre completa para los miembros del club (ReadingAccess 'members'). */
  forMembers: boolean;
}

export interface PublicWorkChapterRef {
  number: number;
  title: string;
  wordCount: number;
  readable: boolean;
  /** Cerrado ahora, pero un miembro del club lo puede leer. */
  membersOnly: boolean;
  /** Con ?lang: este capítulo tiene traducción publicada en ese idioma (title ya viene traducido). */
  translated?: boolean;
}

/** Idiomas de lectura: "es" es el original. */
export type ReadingLang = 'es' | 'en';

export interface PublicWork {
  work: PublicWorkSummary;
  isbn?: string | null;
  contentNotice?: string | null;
  chapters: PublicWorkChapterRef[];
  /** Último capítulo que abrió este lector (solo con sesión). */
  continueAt?: number | null;
  /** Idioma en que viene el índice ("es" si no se pidió otro o no hay traducción publicada). */
  language?: ReadingLang;
  /** Idiomas en que se puede leer la obra ("es" + los que tienen capítulos traducidos y publicados). */
  languages?: ReadingLang[];
  translationCredit?: string | null;
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
  /** Idioma del texto que viene ("es" = el original). */
  language?: ReadingLang;
  languages?: ReadingLang[];
  translationCredit?: string | null;
  /** Título original cuando el texto viene traducido. */
  originalTitle?: string | null;
}

/** ?lang de la URL → idioma de lectura pedido (solo "en"; cualquier otra cosa es el original). */
export function readingLang(raw: string | string[] | undefined): ReadingLang {
  return (Array.isArray(raw) ? raw[0] : raw) === 'en' ? 'en' : 'es';
}

/** Sufijo de URL para leer en ese idioma. */
export function langQuery(lang: ReadingLang): string {
  return lang === 'en' ? '?lang=en' : '';
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
  /** Portada de la edición en inglés (sin ella, en inglés se usa coverUrl). */
  coverUrlEn?: string | null;
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
  /** Versión de la ficha (concurrencia optimista). Se devuelve como expectedRevision al guardar. */
  revision?: number;
}

// ── Traducción de obras (panel del autor; ver WorkTranslationService en maalca-api) ──────────────

/** queued → generating → draft (borrador del modelo) → published (el autor la publicó) | failed. */
export type TranslationStatus = 'queued' | 'generating' | 'draft' | 'published' | 'failed';

export interface WorkTranslationSettings {
  language: string;
  brief?: string | null;
  glossary?: string | null;
  credit?: string | null;
}

export interface WorkChapterTranslationRef {
  chapterId: string;
  number: number;
  sourceTitle: string;
  sourceWordCount: number;
  /** null = nunca se pidió traducción. */
  status?: TranslationStatus | null;
  title?: string | null;
  wordCount: number;
  /** El original cambió después de traducirlo o revisarlo. */
  stale: boolean;
  reviewed: boolean;
  error?: string | null;
  costUsd: number;
  updatedAt?: string | null;
}

export interface WorkTranslationOverview {
  workId: string;
  workTitle: string;
  settings: WorkTranslationSettings;
  chapters: WorkChapterTranslationRef[];
  modelId?: string | null;
  /** Hay modelo activo y llave del proveedor; sin eso la cola no avanza. */
  ready: boolean;
  totalCostUsd: number;
}

export interface WorkChapterTranslationDetail {
  chapterId: string;
  number: number;
  sourceTitle: string;
  sourceHtml?: string | null;
  status?: TranslationStatus | null;
  title?: string | null;
  contentHtml?: string | null;
  stale: boolean;
  reviewed: boolean;
  error?: string | null;
  modelId?: string | null;
  costUsd: number;
  generatedAt?: string | null;
  reviewedAt?: string | null;
  publishedAt?: string | null;
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
  members: { es: 'Miembros', en: 'Members', hintEs: 'Las muestras para todos; completa para los miembros del club.', hintEn: 'Samples for everyone; the full work for club members.' },
  closed: { es: 'Cerrada', en: 'Closed', hintEs: 'No se lee en la página: solo ficha y dónde comprarla.', hintEn: 'Not readable on the page: just the details and where to buy it.' },
};

export function kindLabel(kind: WorkKind, lang: Lang): string {
  return (WORK_KIND_LABELS[kind] ?? WORK_KIND_LABELS.other)[lang];
}

/** Portada para el idioma: en inglés, la de la edición en inglés si existe; si no, la original. */
export function workCover(w: { coverUrl?: string | null; coverUrlEn?: string | null }, lang: 'es' | 'en'): string | null {
  return (lang === 'en' && w.coverUrlEn) || w.coverUrl || null;
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

// ── Club de lectores ────────────────────────────────────────────────────────────

export interface PublicReaderClub {
  lettersEnabled: boolean;
  lettersPitch?: string | null;
  lettersPitchEn?: string | null;
  membershipAvailable: boolean;
  monthlyPrice?: number | null;
  currency: 'USD' | 'DOP' | string;
  benefits?: string | null;
  benefitsEn?: string | null;
}

export interface ReaderMe {
  email: string;
  name?: string | null;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  lettersOptIn: boolean;
  isMember: boolean;
  membershipStatus: 'none' | 'active' | 'past_due' | 'canceled';
  membershipCurrentPeriodEnd?: string | null;
}

/** Cookie httpOnly de la sesión del lector, una por autor. La pone /[slug]/lectores/* y la lee el servidor. */
export function readerCookieName(slug: string): string {
  return `cw_reader_${slug.replace(/[^a-z0-9-]/gi, '')}`;
}

export const READER_COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // igual que ReaderTokens.SessionLife en el API

export function formatMoney(amount: number, currency: string, lang: Lang): string {
  return new Intl.NumberFormat(lang === 'es' ? 'es-DO' : 'en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
}

// ── Fetchers (servidor) ─────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/** Con sesión de lector la respuesta es personal: va sin caché y con X-Reader-Token. */
async function getJson<T>(path: string, tag: string, readerToken?: string | null): Promise<T | null> {
  try {
    const res = await fetch(
      `${API_BASE}${path}`,
      readerToken
        ? { headers: { 'X-Reader-Token': readerToken }, cache: 'no-store' }
        : { next: { revalidate: 60, tags: [tag] } },
    );
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

export function getPublicWork(slug: string, workSlug: string, readerToken?: string | null, lang: ReadingLang = 'es') {
  return getJson<PublicWork>(
    `/api/public/affiliates/${encodeURIComponent(slug)}/works/${encodeURIComponent(workSlug)}${langQuery(lang)}`,
    `affiliate:${slug}`,
    readerToken,
  );
}

export function getPublicChapter(slug: string, workSlug: string, number: number, readerToken?: string | null, lang: ReadingLang = 'es') {
  return getJson<PublicWorkChapter>(
    `/api/public/affiliates/${encodeURIComponent(slug)}/works/${encodeURIComponent(workSlug)}/chapters/${number}${langQuery(lang)}`,
    `affiliate:${slug}`,
    readerToken,
  );
}

export function getReaderClub(slug: string) {
  return getJson<PublicReaderClub>(`/api/public/affiliates/${encodeURIComponent(slug)}/readers/club`, `affiliate:${slug}`);
}

export async function getReaderMe(slug: string, readerToken?: string | null): Promise<ReaderMe | null> {
  if (!readerToken) return null;
  return getJson<ReaderMe>(`/api/public/affiliates/${encodeURIComponent(slug)}/readers/me`, `affiliate:${slug}`, readerToken);
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
