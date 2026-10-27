'use client';

import { useEffect, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { type BillingSummary, extraScreenKey, extraScreenTiers, updateExtraScreens } from '@/lib/billing';
import { Stepper } from './PlanPicker';

interface Props {
  slug: string;
  summary: BillingSummary;
  onUpdated: (s: BillingSummary) => void;
  /** Cuántas extra proponer de entrada (ej. las que faltan para crear un muro). */
  suggested?: number;
  compact?: boolean;
}

const money = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

/**
 * Pantallas extra de una suscripción activa: ajusta la quantity en Stripe (el prorrateo se cobra
 * al momento a la tarjeta guardada) y el límite sube en el acto.
 */
export function ExtraScreensControl({ slug, summary, onUpdated, suggested, compact }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [value, setValue] = useState(suggested ?? summary.extraScreens);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setValue(suggested ?? summary.extraScreens); }, [suggested, summary.extraScreens]);

  const interval = summary.interval ?? 'month';
  const per = interval === 'year' ? getText('/año', '/yr') : getText('/mes', '/mo');
  const [firstTier, nextTier] = extraScreenTiers(summary, extraScreenKey(interval));
  const unit = firstTier?.amount ?? 0;
  const volume = nextTier && nextTier.amount !== unit ? nextTier.amount : null;
  const diff = value - summary.extraScreens;
  const minAllowed = Math.max(0, summary.screensUsed - summary.includedScreens);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      onUpdated(await updateExtraScreens(slug, value, getText('No se pudo actualizar.', "Couldn't update.")));
    } catch (e) {
      setError(e instanceof Error ? e.message : getText('No se pudo actualizar.', "Couldn't update."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={compact ? '' : 'rounded-xl border border-gray-200 dark:border-neutral-700 px-4 py-3'}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{getText('Pantallas extra', 'Extra screens')}</p>
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            {getText(
              `${money(unit)}${per} la 1.ª${volume !== null ? `, ${money(volume)}${per} desde la 2.ª` : ' c/u'} · ${summary.includedScreens} incluida${summary.includedScreens === 1 ? '' : 's'} en tu plan`,
              `${money(unit)}${per} the 1st${volume !== null ? `, ${money(volume)}${per} from the 2nd` : ' each'} · ${summary.includedScreens} included in your plan`,
            )}
          </p>
        </div>
        <Stepper value={value} onChange={setValue} min={minAllowed} max={20} disabled={saving} />
      </div>
      {diff !== 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-gray-600 dark:text-neutral-300">
            {diff > 0
              ? getText(
                  `+${money(diff * unit)}${per}. Hoy se cobra la parte proporcional a tu tarjeta.`,
                  `+${money(diff * unit)}${per}. The prorated amount is charged to your card today.`,
                )
              : getText(
                  `−${money(-diff * unit)}${per}. El crédito se aplica a tu próxima factura.`,
                  `−${money(-diff * unit)}${per}. Credit applies to your next invoice.`,
                )}
          </p>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-full bg-brand-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-brand-primary-hover disabled:opacity-50"
          >
            {saving ? getText('Guardando...', 'Saving...') : getText('Confirmar', 'Confirm')}
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
