'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { track } from '@/lib/analytics';
import {
  type BillingInterval, type BillingSummary, type PaidPlan,
  extraScreenKey, includedScreensFor, planKey, priceOf, publicPlanName, readApiError,
} from '@/lib/billing';

interface Props {
  slug: string;
  summary: BillingSummary | null;
  /** A dónde vuelve Stripe al pagar / al cancelar (rutas relativas al origen). */
  successPath: string;
  cancelPath: string;
  defaultPlan?: PaidPlan;
  /** Pantallas extra con las que arranca el selector (ej. venir desde "límite de pantallas"). */
  defaultExtraScreens?: number;
  source?: string;
}

const PLANS: { plan: PaidPlan; es: string[]; en: string[] }[] = [
  {
    plan: 'Entrepreneur',
    es: ['Catálogo ilimitado', 'Pedidos y pagos en línea', 'Menu Board: 1 pantalla incluida'],
    en: ['Unlimited catalog', 'Online orders & payments', 'Menu Board: 1 screen included'],
  },
  {
    plan: 'Enterprise',
    es: ['Todo lo de Emprendedor', 'Menu Board: 2 pantallas incluidas', 'Soporte prioritario'],
    en: ['Everything in Growth', 'Menu Board: 2 screens included', 'Priority support'],
  },
];

const money = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

/**
 * Selector de plan → Stripe Checkout. Growth/Professional, mensual/anual, pantallas extra y el
 * setup único (solo si el negocio nunca lo pagó). El total "hoy" es exactamente lo que Stripe
 * cobra en la primera factura.
 */
export function PlanPicker({ slug, summary, successPath, cancelPath, defaultPlan = 'Entrepreneur', defaultExtraScreens = 0, source = 'settings' }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  const [plan, setPlan] = useState<PaidPlan>(defaultPlan);
  const [interval, setBillingInterval] = useState<BillingInterval>('month');
  const [extras, setExtras] = useState(Math.max(0, Math.min(20, defaultExtraScreens)));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const per = interval === 'year' ? getText('/año', '/yr') : getText('/mes', '/mo');
  const planPrice = priceOf(summary, planKey(plan, interval));
  const extraPrice = priceOf(summary, extraScreenKey(interval));
  const setupDue = summary?.setupFeeDue ?? true;
  const setup = setupDue ? priceOf(summary, 'maalca_setup_fee') : 0;
  const recurring = planPrice + extras * extraPrice;
  const today = recurring + setup;
  const monthlyEquivalent = (p: PaidPlan) => priceOf(summary, planKey(p, 'month')) * 12;
  const used = summary?.screensUsed ?? 0;
  const screensWithPlan = includedScreensFor(plan) + extras;

  async function checkout() {
    setLoading(true);
    setError(null);
    track('upgrade_clicked', { source, plan, interval, extras });
    try {
      const origin = window.location.origin;
      const res = await fetch(`/api/space/${slug}/billing/checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          successUrl: `${origin}${successPath}`,
          cancelUrl: `${origin}${cancelPath}`,
          plan,
          interval,
          extraScreens: extras,
        }),
      });
      if (!res.ok) throw await readApiError(res, getText('No pudimos iniciar el pago. Intenta de nuevo.', "We couldn't start checkout. Please try again."));
      const data = await res.json();
      if (!data?.url) throw new Error(getText('Stripe no devolvió el enlace de pago.', 'Stripe did not return a checkout link.'));
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.'));
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Mensual / Anual */}
      <div className="inline-flex rounded-full border border-gray-200 dark:border-neutral-700 p-1 text-xs font-medium">
        {(['month', 'year'] as const).map((iv) => (
          <button
            key={iv}
            type="button"
            onClick={() => setBillingInterval(iv)}
            className={`rounded-full px-4 py-1.5 transition ${interval === iv ? 'bg-brand-primary text-white' : 'text-gray-600 dark:text-neutral-300'}`}
          >
            {iv === 'month' ? getText('Mensual', 'Monthly') : getText('Anual · 2 meses gratis', 'Yearly · 2 months free')}
          </button>
        ))}
      </div>

      {/* Planes */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PLANS.map((p) => {
          const selected = plan === p.plan;
          const price = priceOf(summary, planKey(p.plan, interval));
          const saving = interval === 'year' ? monthlyEquivalent(p.plan) - price : 0;
          return (
            <button
              key={p.plan}
              type="button"
              onClick={() => setPlan(p.plan)}
              className={`rounded-xl border p-4 text-left transition ${selected
                ? 'border-brand-primary ring-2 ring-brand-primary/30 bg-brand-primary/5'
                : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'}`}
            >
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{publicPlanName(p.plan, language)}</p>
              <p className="mt-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{money(price)}</span>
                <span className="text-sm text-gray-500 dark:text-neutral-400">{per}</span>
              </p>
              {saving > 0 && (
                <p className="text-xs font-medium text-green-600 dark:text-green-400">
                  {getText(`Ahorras ${money(saving)} al año`, `Save ${money(saving)} a year`)}
                </p>
              )}
              <ul className="mt-3 space-y-1">
                {(language === 'es' ? p.es : p.en).map((f) => (
                  <li key={f} className="text-xs text-gray-600 dark:text-neutral-300">✓ {f}</li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Pantallas extra */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-neutral-700 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{getText('Pantallas extra', 'Extra screens')}</p>
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            {getText(
              `${money(extraPrice)}${per} c/u · tendrás ${screensWithPlan} pantalla${screensWithPlan === 1 ? '' : 's'} (usas ${used})`,
              `${money(extraPrice)}${per} each · you'll have ${screensWithPlan} screen${screensWithPlan === 1 ? '' : 's'} (using ${used})`,
            )}
          </p>
        </div>
        <Stepper value={extras} onChange={setExtras} min={0} max={20} />
      </div>

      {/* Resumen */}
      <div className="mt-4 space-y-1 rounded-xl bg-gray-50 dark:bg-neutral-800/60 px-4 py-3 text-sm">
        <Row label={`${publicPlanName(plan, language)} ${interval === 'year' ? getText('anual', 'yearly') : getText('mensual', 'monthly')}`} value={money(planPrice)} />
        {extras > 0 && <Row label={`${extras} × ${getText('pantalla extra', 'extra screen')}`} value={money(extras * extraPrice)} />}
        {setupDue && <Row label={getText('Setup (una sola vez)', 'Setup (one time)')} value={money(setup)} />}
        <div className="mt-1 flex items-baseline justify-between border-t border-gray-200 dark:border-neutral-700 pt-2 font-semibold text-gray-900 dark:text-white">
          <span>{getText('Hoy pagas', 'Due today')}</span>
          <span>{money(today)}</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-neutral-400">
          {getText(`Luego ${money(recurring)}${per}. Cancelas cuando quieras.`, `Then ${money(recurring)}${per}. Cancel anytime.`)}
        </p>
      </div>

      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="button"
        onClick={checkout}
        disabled={loading}
        className="mt-4 w-full rounded-full bg-brand-primary py-3 text-sm font-medium text-white transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? getText('Redirigiendo a Stripe...', 'Redirecting to Stripe...') : getText(`Continuar al pago — ${money(today)}`, `Continue to payment — ${money(today)}`)}
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-gray-600 dark:text-neutral-300">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function Stepper({ value, onChange, min, max, disabled }: { value: number; onChange: (v: number) => void; min: number; max: number; disabled?: boolean }) {
  const btn = 'h-8 w-8 rounded-full border border-gray-300 dark:border-neutral-600 text-base font-medium text-gray-700 dark:text-neutral-200 hover:border-brand-primary hover:text-brand-primary disabled:opacity-40';
  return (
    <div className="flex shrink-0 items-center gap-3">
      <button type="button" className={btn} disabled={disabled || value <= min} onClick={() => onChange(value - 1)} aria-label="-">−</button>
      <span className="w-6 text-center text-sm font-semibold tabular-nums text-gray-900 dark:text-white">{value}</span>
      <button type="button" className={btn} disabled={disabled || value >= max} onClick={() => onChange(value + 1)} aria-label="+">+</button>
    </div>
  );
}
