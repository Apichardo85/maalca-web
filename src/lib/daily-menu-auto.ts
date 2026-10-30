// Menú del día automático a partir del catálogo que el negocio YA tiene. Se usa:
//  - en la TV, cuando el negocio todavía no configuró su menú del día (así el flyer nunca sale vacío);
//  - en el panel, como punto de partida ("Llenar desde mi catálogo") para luego editarlo.
// Reglas (iguales para cualquier tipo de negocio):
//  - Platos con tamaños (grupo de opciones, ej. Pequeño/Mediano/Grande) → filas de combo con sus precios.
//  - Platos que solo se sirven UN día (ej. sopa del martes, desayuno del jueves) → tarjetas destacadas ese día.
//  - Si un día no tiene platos con tamaños: los destacados/populares (o los primeros) del catálogo, con su precio.
import { WEEK_DAYS, type DailyMenu, type DailyMenuSection, type WeekDayKey } from './board-layouts';
import { categoryLabel } from './category-label';

export interface AutoMenuItem {
  id: string;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  category?: string | null;
  status?: string | null;
  is_demo?: boolean;
  weekDays?: string[] | null;
  featured?: boolean | null;
  popular?: boolean | null;
  /** true = tiene un grupo de opciones con 2+ opciones (tamaños). */
  hasSizes: boolean;
}

const MAX_COMBOS = 5;
const MAX_FEATURED = 2;

/** "Combo del día — Pollo" → "Pollo"; sin separador queda igual. */
function shortName(name: string | null | undefined): string | null {
  if (!name) return null;
  const m = /^(.+?)\s+[—–-]\s+(.+)$/.exec(name);
  return m ? m[2].trim() : name;
}

function availableOn(item: AutoMenuItem, day: WeekDayKey) {
  const days = item.weekDays ?? [];
  return days.length === 0 || days.includes(day);
}

export function buildAutoDailyMenu(
  items: AutoMenuItem[],
  categoryTranslations?: Record<string, { es?: string | null; en?: string | null }> | null,
): DailyMenu | null {
  const active = items.filter((i) => (i.status ?? 'Active') === 'Active' && !i.is_demo);
  if (active.length === 0) return null;

  const days: DailyMenu['days'] = {};
  for (const day of WEEK_DAYS) {
    const sections: DailyMenuSection[] = [];
    const todays = active.filter((i) => availableOn(i, day));

    let combos = todays.filter((i) => i.hasSizes && (i.weekDays?.length ?? 0) !== 1);
    if (combos.length === 0) {
      const picks = todays.filter((i) => (i.featured || i.popular) && (i.weekDays?.length ?? 0) !== 1);
      combos = picks.length > 0 ? picks : todays.filter((i) => (i.weekDays?.length ?? 0) !== 1);
    }
    for (const i of combos.slice(0, MAX_COMBOS)) {
      sections.push({
        name: shortName(i.name) ?? i.name,
        nameEn: shortName(i.nameEn),
        kind: 'Combo',
        items: i.description?.trim() ? [i.description.trim()] : [],
        itemsEn: i.descriptionEn?.trim() ? [i.descriptionEn.trim()] : null,
        productId: i.id,
      });
    }

    const onlyToday = todays.filter((i) => i.weekDays?.length === 1 && i.weekDays[0] === day);
    for (const i of onlyToday.slice(0, MAX_FEATURED)) {
      const cat = i.category ?? '';
      sections.push({
        name: cat ? categoryLabel(cat, 'es', categoryTranslations) : 'Especial de hoy',
        nameEn: cat ? categoryLabel(cat, 'en', categoryTranslations) : "Today's special",
        kind: 'Featured',
        items: [i.name],
        itemsEn: i.nameEn ? [i.nameEn] : null,
        productId: i.id,
      });
    }

    if (sections.length > 0) days[day] = sections;
  }
  return Object.keys(days).length > 0 ? { note: null, noteEn: null, days } : null;
}

/** ¿El negocio configuró su propio menú del día (al menos un día con secciones)? */
export function hasOwnDailyMenu(menu: DailyMenu | null | undefined): menu is DailyMenu {
  return Boolean(menu && WEEK_DAYS.some((d) => (menu.days[d]?.length ?? 0) > 0));
}
