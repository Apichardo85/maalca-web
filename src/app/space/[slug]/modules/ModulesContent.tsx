'use client';

import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

// token = coincide 1:1 con ModuleCatalog.Whitelist en el backend (Maalca.Application.Common).
// Si el backend algún día agrega un toggle real por afiliado, esta lista ya queda lista para
// reflejarlo — el filtro abajo usa activeTokens, no un array estático.
const ALL_MODULES = [
  { token: 'catalog',      icon: '📦', es: 'Catálogo', en: 'Catalog', descEs: 'Tus items y precios, siempre al día.', descEn: 'Your items and prices, always up to date.' },
  { token: 'page',         icon: '🌐', es: 'Página', en: 'Page', descEs: 'Tu página pública en maalca.com.', descEn: 'Your public page on maalca.com.' },
  { token: 'metrics',      icon: '📊', es: 'Métricas', en: 'Metrics', descEs: 'Visitas y actividad de tu página.', descEn: 'Visits and activity on your page.' },
  { token: 'staff',        icon: '🧑‍🤝‍🧑', es: 'Personal', en: 'Personal', descEs: 'Tu equipo de trabajo — meseros, barberos, etc.', descEn: 'Your operating staff — waiters, barbers, etc.' },
  { token: 'appointments', icon: '📅', es: 'Agenda', en: 'Agenda', descEs: 'Citas agendadas manualmente, asignadas a tu personal.', descEn: 'Manually booked appointments, assigned to your staff.' },
];

const UPCOMING_MODULES = [
  { icon: '🧾', es: 'Facturación', en: 'Billing' },
  { icon: '🎟️', es: 'Cupones', en: 'Coupons' },
  { icon: '🤝', es: 'CRM', en: 'CRM' },
];

interface Props {
  /** Tokens reales de Affiliate.ModulosActivos (ya filtrados por whitelist en el backend). */
  activeTokens: string[];
}

export function ModulesContent({ activeTokens }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  const activeSet = new Set(activeTokens.map((t) => t.toLowerCase()));
  const ACTIVE_MODULES = ALL_MODULES.filter((mod) => activeSet.has(mod.token));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <div className="px-6 py-12">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
            {getText('Tu espacio', 'Your space')}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {getText('Módulos', 'Modules')}
          </h1>
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400">
          {getText(
            'Esto es lo que ya tienes activo y lo que viene en camino.',
            "Here's what you already have active, and what's coming next.",
          )}
        </p>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
            {getText('Activos', 'Active')}
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {ACTIVE_MODULES.map((mod) => (
              <div
                key={mod.es}
                className="rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm"
              >
                <span className="text-2xl">{mod.icon}</span>
                <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
                  {getText(mod.es, mod.en)}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                  {getText(mod.descEs, mod.descEn)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
            {getText('Próximamente', 'Coming soon')}
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {UPCOMING_MODULES.map((mod) => (
              <div
                key={mod.es}
                className="flex items-center gap-3 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 opacity-60"
              >
                <span className="text-xl">{mod.icon}</span>
                <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">
                  {getText(mod.es, mod.en)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
