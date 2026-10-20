'use client';

import Link from 'next/link';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { type BillingSummary } from '@/lib/billing';
import { ExtraScreensControl } from './ExtraScreensControl';

export interface ScreenLimitDetails { allowance: number; used: number; requested: number; message: string }

interface Props {
  slug: string;
  details: ScreenLimitDetails;
  summary: BillingSummary | null;
  onSummary: (s: BillingSummary) => void;
  onClose: () => void;
}

/**
 * Aparece cuando crear una pantalla o un muro supera el plan (API 402 SCREEN_LIMIT_REACHED).
 * Con suscripción: agrega las extra que faltan ahí mismo. Sin suscripción: lleva al selector de
 * plan con esas extra ya puestas.
 */
export function ScreenLimitNotice({ slug, details, summary, onSummary, onClose }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const missing = Math.max(1, details.used + details.requested - details.allowance);

  return (
    <div className="mt-4 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-amber-900 dark:text-amber-300">{details.message}</p>
        <button type="button" onClick={onClose} className="text-xs text-amber-700 dark:text-amber-400 hover:underline">
          {getText('Cerrar', 'Close')}
        </button>
      </div>

      {summary?.hasSubscription ? (
        <div className="mt-3 rounded-xl bg-white dark:bg-neutral-900 p-3">
          <ExtraScreensControl
            slug={slug}
            summary={summary}
            suggested={summary.extraScreens + missing}
            compact
            onUpdated={(s) => {
              onSummary(s);
              onClose();
            }}
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-neutral-400">
            {getText('Después de confirmar, vuelve a crearla.', 'After confirming, create it again.')}
          </p>
        </div>
      ) : (
        <Link
          href={`/space/${slug}/settings?extraScreens=${missing}#plan`}
          className="mt-3 inline-block rounded-full bg-brand-primary px-4 py-2 text-xs font-medium text-white hover:bg-brand-primary-hover"
        >
          {getText(`Ver planes con ${missing} pantalla${missing === 1 ? '' : 's'} extra`, `See plans with ${missing} extra screen${missing === 1 ? '' : 's'}`)}
        </Link>
      )}
    </div>
  );
}
