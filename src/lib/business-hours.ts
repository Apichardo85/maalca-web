// src/lib/business-hours.ts
// Day-key order + labels for the public business-hours (Horario) display.
// Matches HorarioDayDto.dia values, which come from the backend's
// DiaSemanaTokens.Whitelist (lunes/martes/miercoles/jueves/viernes/sabado/
// domingo, no accents) — not English weekday names. Shared by PublicFooter
// and the Diseñar mi Espacio PreviewPanel so the two can't drift apart.
export const WEEK_DAY_ORDER = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export const WEEK_DAY_LABELS_ES: Record<string, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves',
  viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
};

export const WEEK_DAY_LABELS_EN: Record<string, string> = {
  lunes: 'Monday', martes: 'Tuesday', miercoles: 'Wednesday', jueves: 'Thursday',
  viernes: 'Friday', sabado: 'Saturday', domingo: 'Sunday',
};
