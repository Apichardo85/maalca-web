'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { readApiError } from '@/lib/billing';

/**
 * Aviso global (todas las páginas del dashboard) cuando el último cobro de la suscripción falló
 * (invoice.payment_failed → PlanStatus PastDue). Stripe sigue reintentando; el dueño actualiza la
 * tarjeta en el Billing Portal y al pagarse vuelve solo a Active (invoice.paid).
 */
export function PastDueBanner({ slug, canManage }: { slug: string; canManage: boolean }) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/billing/portal-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      if (!res.ok) throw await readApiError(res, getText('No pudimos abrir el portal.', "Couldn't open the portal."));
      const data = await res.json();
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.'));
      setLoading(false);
    }
  }

  return (
    <div className="border-b border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 px-4 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-amber-900 dark:text-amber-300">
          {canManage
            ? getText('⚠️ El último cobro de tu plan falló. Actualiza tu tarjeta para no perder el servicio.', '⚠️ Your last plan payment failed. Update your card to keep your service.')
            : getText('⚠️ El último cobro del plan falló. Avísale al dueño del negocio.', '⚠️ The last plan payment failed. Let the business owner know.')}
        </p>
        {canManage && (
          <button
            type="button"
            onClick={openPortal}
            disabled={loading}
            className="shrink-0 rounded-full bg-amber-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {loading ? getText('Redirigiendo...', 'Redirecting...') : getText('Actualizar tarjeta', 'Update card')}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
