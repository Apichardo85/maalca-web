'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { KpiTile, type SpaceKpis } from '@/components/space/KpiTile';
import type { Plan } from '@/lib/plan-limits';
import { CONTACT_ICON_BY_TIPO } from '@/components/public/ContactIcons';
import { SOCIAL_ICON_BY_TIPO } from '@/components/public/SocialIcons';

// Same shape as maalca-api's DetailedMetricsResponse/DailyCountDto/CanalBreakdownDto
// (MetricsDtos.cs), serialized camelCase by the default System.Text.Json policy.
export interface DailyCount {
  date: string; // "yyyy-MM-dd"
  pageViews: number;
  qrScans: number;
  canalClicks: number;
  paidOrders: number;
}

export interface CanalBreakdown {
  canalId: string;
  tipo: string;
  nombreVisible: string | null;
  clicks: number;
}

export interface ConversionSummary {
  visits: number;
  paidOrders: number;
  conversionRatePct: number;
  revenue: number;
  currency: string;
}

export interface DetailedMetrics {
  dailyCounts: DailyCount[];
  byCanal: CanalBreakdown[];
  conversion: ConversionSummary;
}

interface Props {
  kpis: SpaceKpis;
  plan: Plan;
  detailed: DetailedMetrics | null;
}

type MetricKey = 'pageViews' | 'qrScans' | 'canalClicks' | 'paidOrders';

// WhatsApp/Telefono/Email (ContactIcons) + Facebook/Instagram/TikTok (SocialIcons) — the full
// CanalTipo enum (CanalTipo.cs) — same icon set the public templates already render, reused
// instead of a third icon set for this breakdown.
const ICON_BY_TIPO = { ...CONTACT_ICON_BY_TIPO, ...SOCIAL_ICON_BY_TIPO };

function sumMetric(daily: DailyCount[], key: MetricKey): number {
  return daily.reduce((sum, d) => sum + d[key], 0);
}

/** "yyyy-MM-dd" parsed as local midnight (not UTC) so the displayed day never shifts by one. */
function formatShortDate(date: string, language: 'es' | 'en'): string {
  const d = new Date(`${date}T00:00:00`);
  return new Intl.DateTimeFormat(language === 'es' ? 'es-DO' : 'en-US', { day: 'numeric', month: 'short' }).format(d);
}

export function StatsContent({ kpis, plan, detailed }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  const hasEvents = !!detailed && (
    detailed.byCanal.length > 0 ||
    detailed.dailyCounts.some((d) => d.pageViews > 0 || d.qrScans > 0 || d.canalClicks > 0 || d.paidOrders > 0)
  );

  // Defaults to whichever metric actually has data this period, so a business that only gets
  // QR scans (no page views yet) doesn't land on a flat, misleadingly-empty-looking chart.
  const [activeMetric, setActiveMetric] = useState<MetricKey>(() => {
    if (!detailed) return 'pageViews';
    const sums: Record<MetricKey, number> = {
      pageViews: sumMetric(detailed.dailyCounts, 'pageViews'),
      qrScans: sumMetric(detailed.dailyCounts, 'qrScans'),
      canalClicks: sumMetric(detailed.dailyCounts, 'canalClicks'),
      paidOrders: sumMetric(detailed.dailyCounts, 'paidOrders'),
    };
    return (Object.keys(sums) as MetricKey[]).reduce((best, k) => (sums[k] > sums[best] ? k : best), 'pageViews');
  });

  const METRIC_TABS: { key: MetricKey; label: string; color: string }[] = [
    { key: 'pageViews', label: getText('Visitas', 'Visits'), color: '#C8102E' },
    { key: 'qrScans', label: getText('Escaneos QR', 'QR scans'), color: '#0EA5E9' },
    { key: 'canalClicks', label: getText('Clics a canales', 'Channel clicks'), color: '#16A34A' },
    { key: 'paidOrders', label: getText('Pedidos pagados', 'Paid orders'), color: '#9333EA' },
  ];
  const activeColor = METRIC_TABS.find((t) => t.key === activeMetric)!.color;
  const maxValue = detailed ? Math.max(1, ...detailed.dailyCounts.map((d) => d[activeMetric])) : 1;
  const maxClicks = detailed ? Math.max(1, ...detailed.byCanal.map((c) => c.clicks)) : 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <div className="px-6 py-12">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
            {getText('Tu espacio', 'Your space')}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {getText('Estadísticas', 'Stats')}
          </h1>
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

        {/* Conversión: la pregunta que las 4 tarjetas de arriba no responden — de esas visitas,
            ¿cuántas se volvieron ventas reales? Solo aparece si hay `detailed` (requiere al
            menos un pedido pagado en el historial para que "Próximamente" no aplique aquí — a
            diferencia de los KPIs de arriba, esto nace ya con datos reales de Orders). */}
        {detailed && (
          <section className="mt-6">
            <div className="rounded-2xl border border-[#C8102E]/20 bg-[#C8102E]/[0.03] dark:bg-[#C8102E]/[0.06] p-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#C8102E]">
                {getText('Conversión', 'Conversion')}
              </h2>
              <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-neutral-400">
                    {getText('Visitas', 'Visits')}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
                    {detailed.conversion.visits}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-neutral-400">
                    {getText('Pedidos pagados', 'Paid orders')}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
                    {detailed.conversion.paidOrders}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-neutral-400">
                    {getText('Tasa de conversión', 'Conversion rate')}
                  </p>
                  <p className="text-xl font-bold text-[#C8102E] tabular-nums">
                    {detailed.conversion.conversionRatePct}%
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-neutral-400">
                    {getText('Ingresos', 'Revenue')}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
                    {detailed.conversion.currency} {detailed.conversion.revenue.toFixed(2)}
                  </p>
                </div>
              </div>
              {detailed.conversion.visits === 0 && (
                <p className="mt-3 text-xs text-gray-400 dark:text-neutral-600">
                  {getText(
                    'Sin visitas registradas en este período — la tasa de conversión se activa junto con las visitas.',
                    'No visits recorded this period — conversion rate turns on alongside visits.',
                  )}
                </p>
              )}
            </div>
          </section>
        )}

        {(!kpis.visitas.disponible || !kpis.escaneosQr.disponible || !kpis.clicsCanales.disponible) && (
          <p className="mt-4 text-xs text-gray-400 dark:text-neutral-600">
            {getText(
              'Las métricas marcadas "Próximamente" se activan a medida que se conectan.',
              'Metrics marked "Coming soon" turn on as they get wired up.',
            )}
          </p>
        )}

        {/* Detailed section — 30-day trend + per-canal breakdown, from
            GET /api/affiliates/{id}/metrics/detailed */}
        <section className="mt-10">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500">
            {getText('Últimos 30 días', 'Last 30 days')}
          </h2>

          {!hasEvents ? (
            <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-14 text-center">
              <span className="text-3xl">📊</span>
              <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">
                {getText('Todavía no hay actividad registrada.', 'No activity recorded yet.')}
              </p>
              <p className="max-w-xs text-xs text-gray-400 dark:text-neutral-600">
                {getText(
                  'Cuando alguien visite tu página, escanee tu QR o toque un canal, lo vas a ver aquí.',
                  "Once someone visits your page, scans your QR, or taps a channel, you'll see it here.",
                )}
              </p>
            </div>
          ) : (
            <>
              <div className="mt-4 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
                <div className="flex flex-wrap gap-1.5">
                  {METRIC_TABS.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setActiveMetric(t.key)}
                      className="rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
                      style={
                        activeMetric === t.key
                          ? { backgroundColor: t.color, color: '#fff' }
                          : { backgroundColor: 'transparent', color: '#9ca3af' }
                      }
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Horizontally scrollable rather than squeezed to fit — 30 daily bars go
                    unreadably thin on a narrow phone otherwise; scrolling keeps every bar
                    a fixed, tappable/legible width at any viewport. */}
                <div className="mt-5 overflow-x-auto">
                  <div
                    className="flex h-32 items-end gap-1"
                    style={{ minWidth: `${detailed!.dailyCounts.length * 12}px` }}
                  >
                    {detailed!.dailyCounts.map((d) => {
                      const value = d[activeMetric];
                      const heightPct = Math.max(3, (value / maxValue) * 100);
                      return (
                        <div key={d.date} className="flex h-full flex-1 items-end" style={{ minWidth: '8px' }}>
                          <div
                            className="w-full rounded-t"
                            style={{
                              height: `${heightPct}%`,
                              backgroundColor: activeColor,
                              opacity: value === 0 ? 0.15 : 1,
                            }}
                            title={`${d.date}: ${value}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-gray-400 dark:text-neutral-600">
                  <span>{formatShortDate(detailed!.dailyCounts[0].date, language)}</span>
                  <span>{formatShortDate(detailed!.dailyCounts[detailed!.dailyCounts.length - 1].date, language)}</span>
                </div>
              </div>

              {detailed!.byCanal.length > 0 && (
                <div className="mt-4 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500">
                    {getText('Clics por canal', 'Clicks by channel')}
                  </h3>
                  <div className="mt-4 space-y-3">
                    {detailed!.byCanal.map((c) => {
                      const Icon = ICON_BY_TIPO[c.tipo];
                      const widthPct = Math.max(4, (c.clicks / maxClicks) * 100);
                      return (
                        <div key={c.canalId} className="flex items-center gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400">
                            {Icon && <Icon size={14} />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate text-xs font-medium text-gray-700 dark:text-neutral-300">
                                {c.nombreVisible || c.tipo}
                              </span>
                              <span className="shrink-0 text-xs font-bold tabular-nums text-gray-900 dark:text-white">
                                {c.clicks}
                              </span>
                            </div>
                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800">
                              <div className="h-full rounded-full bg-[#C8102E]" style={{ width: `${widthPct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
