'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

interface Props {
  slug: string;
  plan: 'free' | 'entrepreneur';
  trialDaysRemaining: number | null;
}

const FEATURES: { es: string; en: string; free: boolean; entrepreneur: boolean }[] = [
  { es: 'Catálogo (10 items)', en: 'Catalog (10 items)', free: true, entrepreneur: false },
  { es: 'Catálogo ilimitado', en: 'Unlimited catalog', free: false, entrepreneur: true },
  { es: 'Reservas online', en: 'Online booking', free: false, entrepreneur: true },
  { es: 'Pagos con Stripe integrados', en: 'Integrated Stripe payments', free: false, entrepreneur: true },
  { es: 'Automatizaciones básicas', en: 'Basic automations', free: false, entrepreneur: true },
  { es: 'Código QR + contacto directo', en: 'QR code + direct contact', free: true, entrepreneur: true },
];

export function SettingsContent({ slug, plan, trialDaysRemaining }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const router = useRouter();
  const searchParams = useSearchParams();
  const upgraded = searchParams.get('upgraded') === 'true';
  const canceled = searchParams.get('canceled') === 'true';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollCount = useRef(0);

  // Stripe Connect — cuenta donde el afiliado recibe el dinero de SUS clientes.
  // Distinta de la suscripción de arriba. Solo aplica a plan Emprendedor.
  const [connectStatus, setConnectStatus] = useState<{
    connected: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    country: string | null;
  } | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  // Solo se usa una vez, antes de la primera conexión — Stripe no permite cambiar el país
  // de una cuenta conectada después de creada, así que no se vuelve a pedir.
  const [countryChoice, setCountryChoice] = useState('US');

  useEffect(() => {
    if (plan !== 'entrepreneur') return;
    let cancelled = false;
    fetch(`/api/space/${slug}/connect/status`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setConnectStatus({
          connected: !!data?.connected,
          chargesEnabled: !!data?.chargesEnabled,
          payoutsEnabled: !!data?.payoutsEnabled,
          detailsSubmitted: !!data?.detailsSubmitted,
          country: data?.country ?? null,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [plan, slug]);

  async function handleConnectPayments() {
    setConnectLoading(true);
    setConnectError(null);
    try {
      // Primera vez conectando y todavía sin país guardado: lo fijamos antes de crear la
      // cuenta en Stripe, porque después no se puede cambiar. Si este PATCH falla, no seguimos
      // al onboarding-link — el backend ahora rechaza crear la cuenta sin país (ya no adivina
      // "US"), así que seguir de largo solo produciría un segundo error menos claro.
      if (!connectStatus?.connected && !connectStatus?.country) {
        const countryRes = await fetch(`/api/space/${slug}/settings`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: countryChoice }),
        });
        if (!countryRes.ok) {
          throw new Error(
            getText(
              'No pudimos guardar el país del negocio. Intenta de nuevo.',
              "We couldn't save the business country. Please try again.",
            ),
          );
        }
      }
      const origin = window.location.origin;
      const res = await fetch(`/api/space/${slug}/connect/onboarding-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnUrl: `${origin}/space/${slug}/settings?connected=true`,
          refreshUrl: `${origin}/space/${slug}/settings`,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        // Muestra el mensaje real de Stripe/backend cuando viene (error.message), en vez de
        // un genérico siempre igual — así se puede diagnosticar sin tener que ir a los logs.
        const detail = data?.error?.message as string | undefined;
        throw new Error(
          detail ??
            getText(
              'No pudimos iniciar la conexión con Stripe. Intenta de nuevo.',
              "We couldn't start the Stripe connection. Please try again.",
            ),
        );
      }
      window.location.href = data.url;
    } catch (e) {
      setConnectError(e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.'));
      setConnectLoading(false);
    }
  }

  // Stripe's webhook flips the plan async — right after a successful checkout the
  // affiliate is still "free" here for a few seconds. Poll the server component's
  // data (via router.refresh) until the plan updates, capped so it doesn't spin forever
  // if the webhook is misconfigured.
  useEffect(() => {
    if (!upgraded || plan !== 'free') return;
    if (pollCount.current >= 8) return;

    const timer = setTimeout(() => {
      pollCount.current += 1;
      router.refresh();
    }, 3000);

    return () => clearTimeout(timer);
  }, [upgraded, plan, router]);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const origin = window.location.origin;
      const res = await fetch(`/api/space/${slug}/billing/checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          successUrl: `${origin}/space/${slug}/settings?upgraded=true`,
          cancelUrl: `${origin}/space/${slug}/settings?canceled=true`,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        throw new Error(
          getText(
            'No pudimos iniciar el pago. Intenta de nuevo en unos minutos.',
            "We couldn't start checkout. Please try again in a few minutes.",
          ),
        );
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.'));
      setLoading(false);
    }
  }

  const trialExpired = plan === 'free' && trialDaysRemaining !== null && trialDaysRemaining <= 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <div className="px-6 py-12">
        <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
          {getText('Tu espacio', 'Your space')}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
          {getText('Facturación y plan', 'Billing and plan')}
        </h1>

        {upgraded && (
          <div className="mt-6 max-w-3xl rounded-lg border border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-900/20 px-4 py-3">
            <p className="text-sm text-green-700 dark:text-green-400">
              {plan === 'entrepreneur'
                ? getText('¡Listo! Ya estás en el plan Emprendedor. 🎉', "You're all set on the Emprendedor plan. 🎉")
                : getText(
                    'Pago recibido — estamos activando tu plan Emprendedor, puede tardar unos segundos.',
                    'Payment received — activating your Emprendedor plan, this can take a few seconds.',
                  )}
            </p>
          </div>
        )}

        {canceled && (
          <div className="mt-6 max-w-3xl rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3">
            <p className="text-sm text-gray-600 dark:text-neutral-400">
              {getText('Pago cancelado — no se te hizo ningún cargo.', 'Checkout canceled — you were not charged.')}
            </p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {/* Current plan card */}
          <div className="rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                  {getText('Plan actual', 'Current plan')}
                </p>
                <p className="mt-1 text-lg font-bold">
                  {plan === 'entrepreneur' ? getText('Emprendedor', 'Entrepreneur') : getText('Plan Gratis', 'Free plan')}
                </p>
              </div>
              {plan === 'entrepreneur' && (
                <span className="rounded-full bg-[#C8102E]/10 px-3 py-1 text-xs font-medium text-[#C8102E]">
                  $38/{getText('mes', 'mo')}
                </span>
              )}
            </div>

            {plan === 'free' && (
              <p className={`mt-3 text-sm ${trialExpired ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-neutral-400'}`}>
                {trialExpired
                  ? getText('Tu período gratuito de 30 días terminó.', 'Your 30-day free trial has ended.')
                  : trialDaysRemaining !== null
                  ? getText(
                      `Te quedan ${trialDaysRemaining} día${trialDaysRemaining === 1 ? '' : 's'} de tu período gratuito.`,
                      `${trialDaysRemaining} day${trialDaysRemaining === 1 ? '' : 's'} left in your free trial.`,
                    )
                  : null}
              </p>
            )}

            {plan === 'entrepreneur' && (
              <p className="mt-3 text-sm text-gray-500 dark:text-neutral-400">
                {getText(
                  '¿Necesitas cambiar o cancelar tu suscripción? Escríbenos a hello@maalca.com.',
                  'Need to change or cancel your subscription? Email us at hello@maalca.com.',
                )}
              </p>
            )}
          </div>

          {/* Stripe Connect — recibir pagos de tus propios clientes */}
          {plan === 'entrepreneur' && (
            <div className="rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
              <p className="text-xs uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                {getText('Recibir pagos', 'Accept payments')}
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-neutral-300">
                {getText(
                  'Conecta tu cuenta de Stripe para cobrar a tus clientes con tarjeta, Apple Pay y Google Pay — el dinero va directo a tu cuenta.',
                  'Connect your Stripe account to charge your customers with card, Apple Pay, and Google Pay — the money goes straight to your account.',
                )}
              </p>

              {connectStatus?.chargesEnabled ? (
                <p className="mt-4 flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                  <span>✓</span>
                  {getText('Cuenta conectada — ya puedes recibir pagos.', 'Account connected — you can accept payments.')}
                </p>
              ) : (
                <>
                  {!connectStatus?.connected && !connectStatus?.country && (
                    <div className="mt-4">
                      <label className="text-xs font-medium text-gray-500 dark:text-neutral-400">
                        {getText(
                          'País de tu negocio (no se puede cambiar después)',
                          "Your business's country (can't be changed later)",
                        )}
                      </label>
                      <select
                        value={countryChoice}
                        onChange={(e) => setCountryChoice(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
                      >
                        <option value="US">{getText('Estados Unidos', 'United States')}</option>
                        <option value="DO">{getText('República Dominicana', 'Dominican Republic')}</option>
                        <option value="PR">{getText('Puerto Rico', 'Puerto Rico')}</option>
                        <option value="MX">México</option>
                        <option value="ES">España</option>
                        <option value="CA">Canadá / Canada</option>
                      </select>
                    </div>
                  )}
                  {connectError && (
                    <p className="mt-4 text-sm text-red-600 dark:text-red-400">{connectError}</p>
                  )}
                  <button
                    onClick={handleConnectPayments}
                    disabled={connectLoading}
                    className="mt-4 w-full rounded-full border border-gray-300 dark:border-neutral-700 py-3 text-sm font-medium text-gray-900 dark:text-white transition hover:border-[#C8102E] hover:text-[#C8102E] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {connectLoading
                      ? getText('Redirigiendo a Stripe...', 'Redirecting to Stripe...')
                      : connectStatus?.connected
                      ? getText('Terminar configuración en Stripe', 'Finish setup on Stripe')
                      : getText('Conectar cuenta para recibir pagos', 'Connect account to accept payments')}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Feature comparison */}
          {plan === 'free' && (
            <div className="rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
              <p className="text-sm font-semibold">{getText('Qué desbloqueas con Emprendedor', 'What Entrepreneur unlocks')}</p>
              <ul className="mt-3 space-y-2">
                {FEATURES.filter((f) => f.entrepreneur).map((f) => (
                  <li key={f.es} className="flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-300">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    {getText(f.es, f.en)}
                  </li>
                ))}
              </ul>

              {error && (
                <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="mt-5 w-full rounded-full bg-[#C8102E] py-3 text-sm font-medium text-white transition hover:bg-[#A00D26] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? getText('Redirigiendo a Stripe...', 'Redirecting to Stripe...')
                  : getText('Actualizar a Emprendedor — $38/mes', 'Upgrade to Entrepreneur — $38/mo')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
