'use client';

import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { SpaceTopBarControls } from '@/components/space/SpaceTopBarControls';

export function StatsContent() {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <div className="px-6 py-12">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
              {getText('Tu espacio', 'Your space')}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {getText('Estadísticas', 'Stats')}
            </h1>
          </div>
          <SpaceTopBarControls />
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center shadow-sm">
          <span className="text-3xl">📊</span>
          <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
            {getText('Muy pronto', 'Coming soon')}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
            {getText(
              'Aquí verás visitas a tu página, escaneos de QR y clics a tus canales en cuanto estén conectados.',
              "Here you'll see visits to your page, QR scans, and clicks to your channels once they're wired up.",
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
