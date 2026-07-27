'use client';

// src/components/space/KpiTile.tsx
// Extracted from SpaceDashboard.tsx so StatsContent.tsx (the Estadísticas tab)
// can reuse the exact same KPI card instead of rebuilding its own.
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

export interface SpaceKpi {
  valor: number | null;
  disponible: boolean;
}

export interface SpaceKpis {
  visitas: SpaceKpi;
  itemsPublicados: SpaceKpi;
  escaneosQr: SpaceKpi;
  clicsCanales: SpaceKpi;
}

interface KpiTileProps {
  label: string;
  /** null renders a "Próximamente" state instead of a fabricated number. */
  value: string | null;
  suffix?: string;
}

export function KpiTile({ label, value, suffix }: KpiTileProps) {
  const { language } = useSimpleLanguage();

  return (
    <div className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200/70 dark:border-neutral-800 p-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1">
        {label}
      </p>
      {value === null ? (
        <p className="text-sm font-semibold text-gray-400 dark:text-neutral-500">
          {language === 'es' ? 'Próximamente' : 'Coming soon'}
        </p>
      ) : (
        <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
          {value}
          {suffix && (
            <span className="text-sm font-normal text-neutral-400 dark:text-neutral-500">{suffix}</span>
          )}
        </p>
      )}
    </div>
  );
}
