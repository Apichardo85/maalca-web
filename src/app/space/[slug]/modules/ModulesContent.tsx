'use client';

import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

const ACTIVE_MODULES = [
  { icon: '📦', es: 'Catálogo', en: 'Catalog', descEs: 'Tus items y precios, siempre al día.', descEn: 'Your items and prices, always up to date.' },
  { icon: '🌐', es: 'Página', en: 'Page', descEs: 'Tu página pública en maalca.com.', descEn: 'Your public page on maalca.com.' },
  { icon: '📊', es: 'Métricas', en: 'Metrics', descEs: 'Visitas y actividad de tu página.', descEn: 'Visits and activity on your page.' },
];

const UPCOMING_MODULES = [
  { icon: '📅', es: 'Citas', en: 'Appointments' },
  { icon: '🧾', es: 'Facturación', en: 'Billing' },
  { icon: '🎟️', es: 'Cupones', en: 'Coupons' },
  { icon: '👨‍💼', es: 'Equipo', en: 'Team' },
  { icon: '🤝', es: 'CRM', en: 'CRM' },
];

export function ModulesContent() {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
          {getText('Tu espacio', 'Your space')}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
          {getText('Módulos', 'Modules')}
        </h1>
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
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
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
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
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
