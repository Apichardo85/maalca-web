// src/lib/business-hours.ts
// Day-key order + labels for the public business-hours (Horario) display.
// Matches HorarioDayDto.dia values, which come from the backend's
// DiaSemanaTokens.Whitelist (lunes/martes/miercoles/jueves/viernes/sabado/
// domingo, no accents) — not English weekday names. Used by PublicFooter,
// which every public template (and the Diseñar mi Espacio preview, via
// PreviewFrame rendering that same template) renders as-is.
export const WEEK_DAY_ORDER = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export const WEEK_DAY_LABELS_ES: Record<string, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves',
  viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
};

export const WEEK_DAY_LABELS_EN: Record<string, string> = {
  lunes: 'Monday', martes: 'Tuesday', miercoles: 'Wednesday', jueves: 'Thursday',
  viernes: 'Friday', sabado: 'Saturday', domingo: 'Sunday',
};

// ── Estado "abierto ahora" ──────────────────────────────────────────────────
// Función pura sobre el mismo Horario (dia/abre/cierra/cerrado) que ya muestra PublicFooter.
// Recibe `now` para poder probarla con fechas fijas. El "ahora" se evalúa en la zona horaria
// IANA del NEGOCIO (Intl.DateTimeFormat) — no la del visitante ni la del servidor. Soporta
// turnos que cruzan la medianoche (abre 18:00, cierra 02:00: cierra < abre). Todavía no hay
// excepciones por fecha (feriados/cierres puntuales): eso necesita esquema nuevo en el API.

export interface HorarioEntry {
  dia: string;
  abre: string;
  cierra: string;
  cerrado: boolean;
}

export type OpenStatus =
  | { state: 'open'; closesAt: string }
  | { state: 'opening_soon'; opensAt: string; inMinutes: number }
  | { state: 'closed'; next: { day: string; opensAt: string; daysAhead: number } | null };

const OPENING_SOON_WINDOW_MIN = 60;

const EN_WEEKDAY_TO_KEY: Record<string, string> = {
  monday: 'lunes', tuesday: 'martes', wednesday: 'miercoles', thursday: 'jueves',
  friday: 'viernes', saturday: 'sabado', sunday: 'domingo',
};

function toMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec((hhmm ?? '').trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

function toHHmm(totalMinutes: number): string {
  const t = ((totalMinutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

/** Turno de un día como minutos desde 00:00. `close < open` = cruza la medianoche. Null si el
 *  día está cerrado, falta o tiene horas inválidas (o abre == cierra, que no es un turno real). */
function shiftOf(entry: HorarioEntry | undefined): { open: number; close: number } | null {
  if (!entry || entry.cerrado) return null;
  const open = toMinutes(entry.abre);
  const close = toMinutes(entry.cierra);
  if (open === null || close === null || open === close) return null;
  return { open, close };
}

function nowInTimezone(timezone: string, now: Date): { day: string; minutes: number } | null {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now);
    const weekday = parts.find((p) => p.type === 'weekday')?.value.toLowerCase();
    const hour = parts.find((p) => p.type === 'hour')?.value;
    const minute = parts.find((p) => p.type === 'minute')?.value;
    if (!weekday || hour === undefined || minute === undefined) return null;
    const day = EN_WEEKDAY_TO_KEY[weekday];
    if (!day) return null;
    return { day, minutes: (Number(hour) % 24) * 60 + Number(minute) };
  } catch {
    return null; // zona horaria inválida
  }
}

/**
 * Null = no se puede afirmar nada (sin horario, sin zona horaria, zona inválida, o ningún día
 * con un turno válido): la UI debe ocultar el estado en vez de mostrar un "Cerrado" falso.
 */
export function getOpenStatus(
  horario: HorarioEntry[] | null | undefined,
  timezone: string | null | undefined,
  now: Date = new Date(),
): OpenStatus | null {
  if (!horario || horario.length === 0 || !timezone) return null;
  const local = nowInTimezone(timezone, now);
  if (!local) return null;

  const shiftFor = (day: string) => shiftOf(horario.find((h) => h.dia === day));
  if (!WEEK_DAY_ORDER.some((d) => shiftFor(d))) return null;

  const idx = WEEK_DAY_ORDER.indexOf(local.day);
  const today = shiftFor(local.day);
  const yesterday = shiftFor(WEEK_DAY_ORDER[(idx + 6) % 7]);

  // 1) Sigue abierto por el turno de ayer que cruzó la medianoche.
  if (yesterday && yesterday.close < yesterday.open && local.minutes < yesterday.close) {
    return { state: 'open', closesAt: toHHmm(yesterday.close) };
  }

  // 2) Turno de hoy.
  if (today) {
    const crossesMidnight = today.close < today.open;
    const isOpen = crossesMidnight
      ? local.minutes >= today.open
      : local.minutes >= today.open && local.minutes < today.close;
    if (isOpen) return { state: 'open', closesAt: toHHmm(today.close) };

    if (local.minutes < today.open) {
      const inMinutes = today.open - local.minutes;
      if (inMinutes <= OPENING_SOON_WINDOW_MIN) {
        return { state: 'opening_soon', opensAt: toHHmm(today.open), inMinutes };
      }
      return { state: 'closed', next: { day: local.day, opensAt: toHHmm(today.open), daysAhead: 0 } };
    }
  }

  // 3) Próxima apertura en los siguientes 7 días.
  for (let ahead = 1; ahead <= 7; ahead++) {
    const day = WEEK_DAY_ORDER[(idx + ahead) % 7];
    const shift = shiftFor(day);
    if (shift) return { state: 'closed', next: { day, opensAt: toHHmm(shift.open), daysAhead: ahead } };
  }
  return { state: 'closed', next: null };
}

/** "17:30" -> "5:30 PM" (12 h, igual en ES y EN: es como se escriben las horas en RD/EE.UU.). */
export function formatHour(hhmm: string): string {
  const total = toMinutes(hhmm);
  if (total === null) return hhmm;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

/** Clave de día (lunes…domingo) de HOY en la zona horaria del negocio. Null si falta o es inválida. */
export function todayKeyInTimezone(timezone: string | null | undefined, now: Date = new Date()): string | null {
  if (!timezone) return null;
  return nowInTimezone(timezone, now)?.day ?? null;
}
