'use client';

import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { SpaceTopBarControls } from '@/components/space/SpaceTopBarControls';
import { KpiTile, type SpaceKpis } from '@/components/space/KpiTile';
import type { Plan } from '@/lib/plan-limits';

interface Props {
  kpis: SpaceKpis;
  plan: Plan;
}

export function StatsContent({ kpis, plan }: Props) {
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

        {/* Same KpiTile cards as the Dashboard's own KPI row — same data, same component. */}
        <section className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiTile
            label={getText('Visitas a mi página', 'Visits to my page')}
            value={kpis.visitas.disponible ? String(kpis.visitas.valor) : null}
          />
          <KpiTile
            label={getText('Items publicados', 'Published items')}
            value={kpis.itemsPublicados.disponible ? String(kpis.itemsPublicados.valor) : null}
            suffix={plan === 'free' ? ' / 10' : undefined}
          />
          <KpiTile
            label={getText('Escaneos de QR', 'QR scans')}
            value={kpis.escaneosQr.disponible ? String(kpis.escaneosQr.valor) : null}
          />
          <KpiTile
            label={getText('Clics a canales', 'Channel clicks')}
            value={kpis.clicsCanales.disponible ? String(kpis.clicsCanales.valor) : null}
          />
        </section>

        {(!kpis.visitas.disponible || !kpis.escaneosQr.disponible || !kpis.clicsCanales.disponible) && (
          <p className="mt-4 text-xs text-gray-400 dark:text-neutral-600">
            {getText(
              'Las métricas marcadas "Próximamente" se activan a medida que se conectan.',
              'Metrics marked "Coming soon" turn on as they get wired up.',
            )}
          </p>
        )}
      </div>
    </div>
  );
}
