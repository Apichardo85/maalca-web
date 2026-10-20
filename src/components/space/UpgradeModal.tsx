'use client';

import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useBillingSummary } from '@/lib/billing';
import { PlanPicker } from './billing/PlanPicker';

interface Props {
  businessId: string;
  businessSlug: string;
  onClose: () => void;
}

/** Upgrade desde cualquier parte del dashboard: el mismo selector de Configuración (Growth /
 *  Professional, mensual/anual, pantallas extra, setup) → Stripe Checkout. */
export function UpgradeModal({ businessId, businessSlug, onClose }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const { summary } = useBillingSummary(businessSlug);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        data-business-id={businessId}
      >
        <div className="text-center">
          <p className="text-3xl">🔥</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{getText('Estás creciendo', "You're growing")}</h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            {getText('Elige el plan que va con tu negocio.', 'Pick the plan that fits your business.')}
          </p>
        </div>

        <div className="mt-6">
          <PlanPicker
            slug={businessSlug}
            summary={summary}
            successPath={`/space/${businessSlug}/settings?upgraded=true`}
            cancelPath={`/space/${businessSlug}`}
            source="modal_cta"
          />
        </div>

        <button
          onClick={onClose}
          className="mt-3 w-full text-center text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          {getText('Más tarde', 'Later')}
        </button>
      </div>
    </div>
  );
}
