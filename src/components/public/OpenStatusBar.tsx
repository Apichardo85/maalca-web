'use client';

import { formatHour, WEEK_DAY_LABELS_EN, WEEK_DAY_LABELS_ES, type OpenStatus } from '@/lib/business-hours';

/**
 * Franja "Abierto ahora / Abre pronto / Cerrado ahora" para las plantillas que no traen una propia
 * (Retail, Servicios). Colores con Tailwind + variantes dark: para seguir el modo oscuro sin
 * conocer las variables de cada plantilla. Null = sin horario configurado: no se muestra.
 */
export function OpenStatusBar({
  status,
  language,
  sticky = false,
}: {
  status: OpenStatus | null;
  language: 'es' | 'en';
  sticky?: boolean;
}) {
  if (!status) return null;
  const t = (es: string, en: string) => (language === 'es' ? es : en);
  const dayLabel = (day: string) => (language === 'en' ? WEEK_DAY_LABELS_EN[day] : WEEK_DAY_LABELS_ES[day]) ?? day;

  let tone = 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-900';
  let dot = 'bg-emerald-500';
  let strong: string;
  let rest = '';

  if (status.state === 'open') {
    strong = t('Abierto ahora', 'Open now');
    rest = t(`Cierra a las ${formatHour(status.closesAt)}`, `Closes at ${formatHour(status.closesAt)}`);
  } else if (status.state === 'opening_soon') {
    tone = 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-900';
    dot = 'bg-amber-500';
    strong = t('Abre pronto', 'Opening soon');
    rest = t(`Abre a las ${formatHour(status.opensAt)}`, `Opens at ${formatHour(status.opensAt)}`);
  } else {
    tone = 'bg-stone-100 text-stone-800 border-stone-200 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700';
    dot = 'bg-stone-400 dark:bg-neutral-500';
    strong = t('Cerrado ahora', 'Closed now');
    const n = status.next;
    if (n) {
      const at = formatHour(n.opensAt);
      rest =
        n.daysAhead === 0
          ? t(`Abre hoy a las ${at}`, `Opens today at ${at}`)
          : n.daysAhead === 1
            ? t(`Abre mañana a las ${at}`, `Opens tomorrow at ${at}`)
            : t(`Abre el ${dayLabel(n.day)} a las ${at}`, `Opens ${dayLabel(n.day)} at ${at}`);
    }
  }

  return (
    <div
      role="status"
      className={`${sticky ? 'sticky top-0 z-40 ' : ''}flex min-h-10 items-center justify-center gap-2 border-b px-4 py-2 text-center text-[13px] ${tone}`}
    >
      <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
      <span className="font-semibold">{strong}</span>
      {rest && <span>· {rest}</span>}
    </div>
  );
}
