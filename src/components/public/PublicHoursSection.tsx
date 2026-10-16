'use client';

import {
  WEEK_DAY_ORDER as HORARIO_DAY_ORDER,
  WEEK_DAY_LABELS_ES as HORARIO_LABELS_ES,
  WEEK_DAY_LABELS_EN as HORARIO_LABELS_EN,
  formatHour,
} from '@/lib/business-hours';
import type { PublicTemplateProps } from '@/lib/templates/registry';

// Tabla "Horario" de la página pública. Compartida entre plantillas; los colores y la tipografía
// del título llegan por props porque cada plantilla tiene su propio juego de variables.
export function PublicHoursSection({
  horario,
  todayKey,
  language,
  getText,
  headingClassName,
  headingColor,
  ink,
  muted,
  surface,
  border,
  rowBorder,
}: {
  horario: PublicTemplateProps['business']['horario'];
  todayKey: string | null;
  language: 'es' | 'en';
  getText: (es: string, en: string) => string;
  headingClassName?: string;
  headingColor: string;
  ink: string;
  muted: string;
  surface: string;
  /** Borde exterior de la tarjeta. */
  border: string;
  /** Línea que separa una fila de la siguiente. */
  rowBorder: string;
}) {
  const rows = HORARIO_DAY_ORDER.map((day) => ({ day, entry: horario?.find((h) => h.dia === day) })).filter(
    (r): r is { day: string; entry: NonNullable<typeof r.entry> } => Boolean(r.entry),
  );
  if (rows.length === 0) return null;

  // Días consecutivos con el mismo horario se muestran como una sola fila ("Lunes – Viernes",
  // o "Todos los días" si los 7 coinciden) en vez de repetir la misma línea siete veces.
  const sameHours = (a: (typeof rows)[number]['entry'], b: (typeof rows)[number]['entry']) =>
    Boolean(a.cerrado) === Boolean(b.cerrado) && (a.cerrado || (a.abre === b.abre && a.cierra === b.cierra));
  const groups: Array<{ days: string[]; entry: (typeof rows)[number]['entry'] }> = [];
  for (const r of rows) {
    const last = groups[groups.length - 1];
    if (last && sameHours(last.entry, r.entry)) last.days.push(r.day);
    else groups.push({ days: [r.day], entry: r.entry });
  }
  const dayLabel = (d: string) => (language === 'en' ? HORARIO_LABELS_EN[d] : HORARIO_LABELS_ES[d]);
  const groupLabel = (days: string[]) =>
    days.length === HORARIO_DAY_ORDER.length
      ? getText('Todos los días', 'Every day')
      : days.length === 1
        ? dayLabel(days[0])
        : days.length === 2
          ? `${dayLabel(days[0])} y ${dayLabel(days[1])}`.replace(' y ', language === 'en' ? ' & ' : ' y ')
          : `${dayLabel(days[0])} – ${dayLabel(days[days.length - 1])}`;

  return (
    <section className="mx-auto max-w-public-content" style={{ padding: '0 24px 32px' }}>
      <h2 className={headingClassName} style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 800, letterSpacing: '-0.01em', color: headingColor }}>
        {getText('Horario', 'Hours')}
      </h2>
      <div style={{ backgroundColor: surface, border: `0.5px solid ${border}`, borderRadius: '12px', padding: '4px 16px' }}>
        {groups.map(({ days, entry }, i) => {
          const isToday = todayKey !== null && days.includes(todayKey);
          const label = groupLabel(days);
          return (
            <div
              key={days.join('-')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '11px 0',
                borderTop: i === 0 ? 'none' : `1px solid ${rowBorder}`,
                fontSize: '14px',
                color: ink,
                fontWeight: isToday ? 600 : 400,
              }}
            >
              <span>
                {label}
                {isToday && (
                  <span style={{ marginLeft: '8px', fontSize: '11px', color: headingColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {getText('Hoy', 'Today')}
                  </span>
                )}
              </span>
              <span style={{ color: entry.cerrado ? muted : ink }}>
                {entry.cerrado ? getText('Cerrado', 'Closed') : `${formatHour(entry.abre)} – ${formatHour(entry.cierra)}`}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
