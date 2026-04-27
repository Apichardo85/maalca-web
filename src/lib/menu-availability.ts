/**
 * Helpers puros para disponibilidad de items de menú por periodo del día.
 *
 * Reutilizables por:
 * - Menu público (TLD y futuros restaurantes) → disable state + etiquetas
 * - Dashboard → filtros, resumen, editor de periodos
 *
 * Todos los helpers aceptan `now?: Date` inyectable para testing/SSR.
 */

import type { MealPeriod, MenuCatalogItem, WeekDay } from "@/lib/types";
import type { AffiliateMealPeriodHours, MealPeriodHours } from "@/config/affiliates-config";

// ─── Labels ──────────────────────────────────────────────────────────────────

export const MEAL_PERIOD_LABELS: Record<MealPeriod, string> = {
  breakfast: "Desayuno",
  lunch: "Almuerzo",
  dinner: "Cena",
  late_night: "Trasnoche",
  all_day: "Todo el día",
};

/** Orden canónico para agrupar en UI (desayuno primero, all_day al final). */
export const MEAL_PERIOD_ORDER: MealPeriod[] = [
  "breakfast",
  "lunch",
  "dinner",
  "late_night",
  "all_day",
];

// ─── Internals ──────────────────────────────────────────────────────────────

/** Minutos desde medianoche para un "HH:mm" (ej. "14:30" → 870). */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * ¿`now` cae dentro del rango `[start, end)`?
 * Maneja rangos que cruzan medianoche (end < start): ej. late_night 22:00→02:00
 */
function isWithinHours(hours: MealPeriodHours, now: Date): boolean {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = toMinutes(hours.start);
  const endMin = toMinutes(hours.end);

  if (endMin > startMin) {
    // Rango normal (ej. 11:00 → 16:00)
    return nowMin >= startMin && nowMin < endMin;
  }
  // Cruza medianoche (ej. 22:00 → 02:00): dos segmentos
  return nowMin >= startMin || nowMin < endMin;
}

/** Formatea minutos desde medianoche como "7am" / "6pm" / "2:30pm". */
function formatHour(minutes: number): string {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const period = h24 >= 12 ? "pm" : "am";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return m === 0 ? `${h12}${period}` : `${h12}:${String(m).padStart(2, "0")}${period}`;
}

// ─── Week-day helpers ────────────────────────────────────────────────────────

export const WEEK_DAY_LABELS: Record<WeekDay, string> = {
  monday:    "Lunes",
  tuesday:   "Martes",
  wednesday: "Miércoles",
  thursday:  "Jueves",
  friday:    "Viernes",
  saturday:  "Sábado",
  sunday:    "Domingo",
};

export const WEEK_DAY_SHORT: Record<WeekDay, string> = {
  monday:    "Lun",
  tuesday:   "Mar",
  wednesday: "Mié",
  thursday:  "Jue",
  friday:    "Vie",
  saturday:  "Sáb",
  sunday:    "Dom",
};

export const WEEK_DAY_ORDER: WeekDay[] = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
];

export function getCurrentWeekDay(now: Date = new Date()): WeekDay {
  const map: WeekDay[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return map[now.getDay()];
}

export function isAvailableOnDay(item: { weekDays?: WeekDay[] }, day: WeekDay): boolean {
  if (!item.weekDays || item.weekDays.length === 0) return true;
  return item.weekDays.includes(day);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Devuelve el periodo activo "ahora" según los horarios del afiliado.
 * Si ningún rango matchea, devuelve `all_day` (comida/bebida siempre disponible).
 */
export function getCurrentPeriod(
  hours: AffiliateMealPeriodHours | undefined,
  now: Date = new Date(),
): MealPeriod {
  if (!hours) return "all_day";
  // Evaluamos en orden canónico para preferencia estable en overlaps
  for (const period of MEAL_PERIOD_ORDER) {
    if (period === "all_day") continue;
    const range = hours[period as Exclude<MealPeriod, "all_day">];
    if (range && isWithinHours(range, now)) return period;
  }
  return "all_day";
}

/**
 * ¿El item está disponible ahora?
 * - Sin `periods` o incluye `all_day` → siempre disponible.
 * - Con `periods` → disponible solo si el periodo actual coincide.
 * - Sin `hours` del afiliado → siempre disponible (no podemos evaluar).
 */
export function isItemAvailable(
  item: MenuCatalogItem,
  hours: AffiliateMealPeriodHours | undefined,
  now: Date = new Date(),
): boolean {
  if (!item.periods || item.periods.length === 0) return true;
  if (item.periods.includes("all_day")) return true;
  if (!hours) return true;

  const current = getCurrentPeriod(hours, now);
  return item.periods.includes(current);
}

/**
 * Devuelve una etiqueta legible con la próxima disponibilidad del item.
 * Ej: "Disponible desde las 6pm", "Disponible mañana a las 7am".
 * Devuelve `null` si el item ya está disponible ahora.
 */
export function nextAvailabilityLabel(
  item: MenuCatalogItem,
  hours: AffiliateMealPeriodHours | undefined,
  now: Date = new Date(),
): string | null {
  if (isItemAvailable(item, hours, now)) return null;
  if (!hours || !item.periods) return null;

  const nowMin = now.getHours() * 60 + now.getMinutes();

  // Encontrar el siguiente "start" de un periodo en el que el item está
  const candidates = item.periods
    .filter((p): p is Exclude<MealPeriod, "all_day"> => p !== "all_day")
    .map((p) => ({ period: p, range: hours[p] }))
    .filter((c): c is { period: Exclude<MealPeriod, "all_day">; range: MealPeriodHours } => !!c.range)
    .map((c) => ({ ...c, startMin: toMinutes(c.range.start) }));

  if (candidates.length === 0) return null;

  // Próximo start HOY
  const todayUpcoming = candidates.filter((c) => c.startMin > nowMin);
  if (todayUpcoming.length > 0) {
    const next = todayUpcoming.sort((a, b) => a.startMin - b.startMin)[0];
    return `Disponible desde las ${formatHour(next.startMin)}`;
  }

  // Si no hay más hoy, devolver el primero del día siguiente
  const earliest = candidates.sort((a, b) => a.startMin - b.startMin)[0];
  return `Disponible mañana a las ${formatHour(earliest.startMin)}`;
}

/**
 * Agrupa items por periodo para UI pública.
 * Items con múltiples periodos aparecen en cada uno.
 * Items sin periodo se agrupan en `all_day`.
 */
export function groupByPeriod(
  items: MenuCatalogItem[],
): Array<{ period: MealPeriod; items: MenuCatalogItem[] }> {
  const buckets: Record<MealPeriod, MenuCatalogItem[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    late_night: [],
    all_day: [],
  };

  for (const item of items) {
    const periods = item.periods && item.periods.length > 0 ? item.periods : ["all_day" as const];
    for (const p of periods) {
      buckets[p].push(item);
    }
  }

  return MEAL_PERIOD_ORDER.filter((p) => buckets[p].length > 0).map((period) => ({
    period,
    items: buckets[period],
  }));
}

/**
 * Devuelve la hora de cierre del periodo actual ("4pm") para mostrar
 * un chip tipo "Ahora sirviendo: Almuerzo (hasta las 4pm)".
 */
export function currentPeriodEndLabel(
  hours: AffiliateMealPeriodHours | undefined,
  now: Date = new Date(),
): string | null {
  if (!hours) return null;
  const current = getCurrentPeriod(hours, now);
  if (current === "all_day") return null;
  const range = hours[current];
  if (!range) return null;
  return formatHour(toMinutes(range.end));
}
