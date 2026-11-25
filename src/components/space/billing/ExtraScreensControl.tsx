'use client';

import { useEffect, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import {
  type BillingSummary, checkoutScreens, screenKey, screenPriceText, screensCost, screenTiers, updateExtraScreens,
} from '@/lib/billing';
import { Stepper } from './PlanPicker';

interface Props {
  slug: string;
  summary: BillingSummary;
  onUpdated: (s: BillingSummary) => void;
  /** Cuántas proponer de entrada (ej. las que faltan para crear un muro). */
  suggested?: number;
  compact?: boolean;
  /** A dónde vuelve Stripe al contratar sin suscripción (por defecto, la página de Pantalla). */
  returnPath?: string;
}

const money = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

/**
 * Pantallas de TV pagadas. Ningún plan las incluye: cada pantalla se cobra aparte (1.ª $39 ·
 * 2.ª $15 · desde la 3.ª $10 al mes).
 * - Con suscripción (plan o solo pantallas): ajusta la cantidad en Stripe; el prorrateo se cobra
 *   al momento a la tarjeta guardada y el límite sube en el acto.
 * - Sin suscripción: abre Stripe Checkout solo con las pantallas (el negocio sigue en Starter).
 */
export function ExtraScreensControl({ slug, summary, onUpdated, suggested, compact, returnPath }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const subscribed = summary.hasSubscription;
  const current = subscribed ? summary.extraScreens : 0;
  const [value, setValue] = useState(suggested ?? Math.max(current, subscribed ? 0 : 1));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setValue(suggested ?? Math.max(current, subscribed ? 0 : 1)); }, [suggested, current, subscribed]);

  const interval = summary.interval ?? 'month';
  const per = interval === 'year' ? getText('/año', '/yr') : getText('/mes', '/mo');
  const key = screenKey(interval);
  const priceText = screenPriceText(screenTiers(summary, key), per, language === 'es' ? 'es' : 'en');
  const diffCost = screensCost(summary, key, value) - screensCost(summary, key, current);
  const minAllowed = Math.max(subscribed ? 0 : 1, summary.screensUsed - summary.includedScreens);
  const back = returnPath ?? `/space/${slug}/board`;

  async function save() {
    setSaving(true);
    setError(null);
    const fallback = getText('No se pudo actualizar.', "Couldn't update.");
    try {
      if (!subscribed) {
        window.location.href = await checkoutScreens(slug, value, interval, `${back}?screens=paid`, back, fallback);
        return;
      }
      onUpdated(await updateExtraScreens(slug, value, fallback));
    } catch (e) {
      setError(e instanceof Error ? e.message : fallback);
    } finally {
      setSaving(false);
    }
  }

  const changed = subscribed ? value !== current : value > 0;

  return (
    <div className={compact ? '' : 'rounded-xl border border-gray-200 dark:border-neutral-700 px-4 py-3'}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{getText('Pantallas de TV', 'TV screens')}</p>
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            {priceText}
            {summary.includedScreens > 0 && getText(` · ${summary.includedScreens} de cortesía`, ` · ${summary.includedScreens} courtesy`)}
          </p>
        </div>
        <Stepper value={value} onChange={setValue} min={minAllowed} max={20} disabled={saving} />
      </div>
      {changed && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-gray-600 dark:text-neutral-300">
            {!subscribed
              ? getText(
                  `${money(diffCost)}${per} por ${value} pantalla${value === 1 ? '' : 's'}. Pagas con tarjeta en Stripe; no necesitas un plan.`,
                  `${money(diffCost)}${per} for ${value} screen${value === 1 ? '' : 's'}. Pay by card on Stripe; no plan needed.`,
                )
              : diffCost >= 0
                ? getText(
                    `+${money(diffCost)}${per}. Hoy se cobra la parte proporcional a tu tarjeta.`,
                    `+${money(diffCost)}${per}. The prorated amount is charged to your card today.`,
                  )
                : getText(
                    `−${money(-diffCost)}${per}. El crédito se aplica a tu próxima factura.`,
                    `−${money(-diffCost)}${per}. Credit applies to your next invoice.`,
                  )}
          </p>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-full bg-brand-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-brand-primary-hover disabled:opacity-50"
          >
            {saving
              ? getText('Guardando...', 'Saving...')
              : subscribed ? getText('Confirmar', 'Confirm') : getText('Contratar', 'Subscribe')}
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
