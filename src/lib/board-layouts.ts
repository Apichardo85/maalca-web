// Plantillas del Menu Board — tipos y helpers puros (sin 'use client') para poder usarlos
// tanto desde páginas de servidor como desde los componentes de cliente del board/dashboard.
export type BoardLayoutName = 'Classic' | 'Hero' | 'Grid' | 'Editorial' | 'Carousel' | 'Plates' | 'Bold' | 'Panels';

/** Plantillas con vista propia ya implementada (las demás caen a Classic). Es lo que ofrece el selector. */
export const IMPLEMENTED_LAYOUTS: BoardLayoutName[] = ['Classic', 'Hero', 'Grid', 'Editorial', 'Carousel', 'Plates', 'Bold', 'Panels'];

const ALL_LAYOUTS: BoardLayoutName[] = ['Classic', 'Hero', 'Grid', 'Editorial', 'Carousel', 'Plates', 'Bold', 'Panels'];

export function normalizeLayout(value: string | null | undefined): BoardLayoutName {
  return ALL_LAYOUTS.find((l) => l === value) ?? 'Classic';
}

/* ───────── Flyers verticales (layout "Panels") ───────── */

/** Cómo está montada la TV. Solo cambia algo con el layout "Panels". */
export type BoardOrientation = 'Landscape' | 'Portrait';

export function normalizeOrientation(value: string | null | undefined): BoardOrientation {
  return value === 'Portrait' ? 'Portrait' : 'Landscape';
}

/** Un flyer vertical: Menú del día, Comerciales a pantalla completa o una Categoría del catálogo. */
export type BoardPanelKind = 'Daily' | 'Ads' | 'Category';
export interface BoardPanel {
  kind: BoardPanelKind;
  category?: string | null;
}

export const DEFAULT_PANELS: BoardPanel[] = [{ kind: 'Daily' }, { kind: 'Ads' }];
export const MAX_PANELS = 3;

export function normalizePanels(value: unknown): BoardPanel[] | null {
  if (!Array.isArray(value)) return null;
  const out: BoardPanel[] = [];
  for (const raw of value.slice(0, MAX_PANELS)) {
    const kind = (raw as { kind?: string })?.kind;
    if (kind === 'Daily' || kind === 'Ads') out.push({ kind });
    else if (kind === 'Category') {
      const category = String((raw as { category?: string }).category ?? '').trim();
      if (category) out.push({ kind, category });
    }
  }
  return out.length > 0 ? out : null;
}

/* ───────── Menú del día (Affiliate.DailyMenu) ───────── */

export const WEEK_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
export type WeekDayKey = (typeof WEEK_DAYS)[number];

/** List = lista sin precio (Arroz). Combo = platos + precios/tamaños del plato enlazado (Pollo).
 *  Featured = tarjeta destacada con precio del plato enlazado (Sopa del día, Desayuno). */
export type DailySectionKind = 'List' | 'Combo' | 'Featured';

export interface DailyMenuSection {
  name: string;
  nameEn?: string | null;
  kind: DailySectionKind;
  items?: string[] | null;
  itemsEn?: string[] | null;
  /** El precio sale SIEMPRE del plato enlazado, nunca se escribe en el menú del día. */
  productId?: string | null;
  /** "HH:mm" — solo se muestra en ese horario (ej. desayuno 10:00–12:00). */
  from?: string | null;
  to?: string | null;
}

export interface DailyMenu {
  note?: string | null;
  noteEn?: string | null;
  days: Partial<Record<WeekDayKey, DailyMenuSection[]>>;
}

export function normalizeDailyMenu(value: unknown): DailyMenu | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as { note?: string | null; noteEn?: string | null; days?: Record<string, unknown> };
  if (!v.days || typeof v.days !== 'object') return null;
  const days: DailyMenu['days'] = {};
  for (const d of WEEK_DAYS) {
    const list = v.days[d];
    if (!Array.isArray(list)) continue;
    const sections = list
      .filter((s): s is DailyMenuSection => Boolean(s && typeof (s as DailyMenuSection).name === 'string'))
      .map((s) => ({
        ...s,
        kind: (['List', 'Combo', 'Featured'].includes(s.kind) ? s.kind : 'List') as DailySectionKind,
        items: Array.isArray(s.items) ? s.items : [],
        itemsEn: Array.isArray(s.itemsEn) ? s.itemsEn : null,
      }));
    if (sections.length > 0) days[d] = sections;
  }
  return { note: v.note ?? null, noteEn: v.noteEn ?? null, days };
}

/** "HH:mm" → minutos desde medianoche. */
export function hhmmToMinutes(value: string | null | undefined): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(value ?? '');
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/** ¿La sección se muestra a esta hora? Sin horario = todo el día. to < from = cruza medianoche. */
export function sectionVisibleAt(section: DailyMenuSection, minutes: number): boolean {
  const from = hhmmToMinutes(section.from);
  const to = hhmmToMinutes(section.to);
  if (from === null || to === null) return true;
  return from < to ? minutes >= from && minutes < to : minutes >= from || minutes < to;
}
