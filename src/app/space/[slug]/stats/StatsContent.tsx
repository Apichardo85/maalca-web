'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { KpiTile, type SpaceKpis } from '@/components/space/KpiTile';
import type { Plan } from '@/lib/plan-limits';
import { CONTACT_ICON_BY_TIPO } from '@/components/public/ContactIcons';
import { SOCIAL_ICON_BY_TIPO } from '@/components/public/SocialIcons';

// Same shape as maalca-api's BusinessReportsResponse (ReportsDtos.cs) — reportes ampliados
// (ventas por día/canal/método de pago, top productos, clientes, facturas, equipo) que
// complementan a DetailedMetrics de arriba (visitas/QR/canales/conversión).
export interface RevenueDay {
  date: string;
  revenue: number;
  ordersCount: number;
}
export interface TopItem {
  name: string;
  qty: number;
  revenue: number;
}
export interface ChannelBreakdown {
  channel: string;
  revenue: number;
  count: number;
}
export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  revenue: number;
}
export interface CustomerSegment {
  newCustomers: number;
  returningCustomers: number;
}
export interface InvoiceStatusBreakdown {
  status: string;
  count: number;
  amount: number;
}
export interface StaffActivity {
  name: string;
  count: number;
}
export interface BusinessReports {
  revenueByDay: RevenueDay[];
  topItems: TopItem[];
  byChannel: ChannelBreakdown[];
  byPaymentMethod: PaymentMethodBreakdown[];
  customers: CustomerSegment;
  invoiceStatus: InvoiceStatusBreakdown[];
  staffActivity: StaffActivity[];
  currency: string;
}

const PIE_COLORS = ['#C8102E', '#0EA5E9', '#16A34A', '#9333EA', '#F59E0B', '#EC4899', '#14B8A6', '#6366F1'];

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
  slug: string;
  kpis: SpaceKpis;
  plan: Plan;
  detailed: DetailedMetrics | null;
  reports: BusinessReports | null;
}

const RANGE_OPTIONS = [7, 30, 90] as const;

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

export function StatsContent({ slug, kpis, plan, detailed: initialDetailed, reports: initialReports }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  // Rango de días — 7/30/90. El server ya trae 30 días de una vez (sin round-trip extra al
  // cargar la página); cambiar de rango refresca ambos endpoints desde el cliente vía los
  // proxies /api/space/{slug}/metrics y /reports, mismo patrón de fetch que el resto de /space.
  const [days, setDays] = useState<(typeof RANGE_OPTIONS)[number]>(30);
  const [detailed, setDetailed] = useState(initialDetailed);
  const [reports, setReports] = useState(initialReports);
  const [loadingRange, setLoadingRange] = useState(false);

  useEffect(() => {
    if (days === 30) {
      setDetailed(initialDetailed);
      setReports(initialReports);
      return;
    }
    let cancelled = false;
    setLoadingRange(true);
    Promise.all([
      fetch(`/api/space/${slug}/metrics?days=${days}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/space/${slug}/reports?days=${days}`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([m, r]) => {
        if (cancelled) return;
        if (m) setDetailed(m);
        if (r) setReports(r);
      })
      .finally(() => {
        if (!cancelled) setLoadingRange(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, slug]);

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

        {/* Detailed section — trend + per-canal breakdown, from
            GET /api/affiliates/{id}/metrics/detailed */}
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500">
              {getText(`Últimos ${days} días`, `Last ${days} days`)}
            </h2>
            <div className="flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-neutral-800 p-1">
              {RANGE_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setDays(r)}
                  disabled={loadingRange}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                    days === r
                      ? 'bg-[#C8102E] text-white'
                      : 'text-gray-500 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                  }`}
                >
                  {r}d
                </button>
              ))}
            </div>
          </div>

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

        {/* Reportes ampliados — ventas por día/canal/método de pago, top productos, clientes,
            facturas, equipo. GET /api/affiliates/{id}/metrics/reports. Cada bloque se oculta solo
            si viene vacío (ej. un negocio de Servicios no tiene topItems porque no vende
            productos con carrito, pero sí tiene facturas y actividad de equipo). */}
        {reports && (
          <section className="mt-10">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500">
              {getText('Reportes', 'Reports')}
            </h2>

            {reports.revenueByDay.some((d) => d.revenue > 0) && (
              <div className="mt-4 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500">
                  {getText('Ingresos por día', 'Revenue by day')}
                </h3>
                <div className="mt-4 h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reports.revenueByDay}>
                      <defs>
                        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C8102E" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#C8102E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-neutral-800" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(d: string) => formatShortDate(d, language)}
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        minTickGap={24}
                      />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} width={40} />
                      <Tooltip
                        labelFormatter={(d: string) => formatShortDate(d, language)}
                        formatter={(v: number) => [`${reports.currency} ${v.toFixed(2)}`, getText('Ingresos', 'Revenue')]}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#C8102E" fill="url(#revenueFill)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {reports.topItems.length > 0 && (
                <ReportPieCard
                  title={getText('Más vendidos', 'Top sellers')}
                  data={reports.topItems.map((t) => ({ name: t.name, value: t.revenue }))}
                  valueLabel={(v) => `${reports.currency} ${v.toFixed(2)}`}
                />
              )}

              {reports.byChannel.length > 1 && (
                <ReportPieCard
                  title={getText('Ventas por canal', 'Sales by channel')}
                  data={reports.byChannel.map((c) => ({
                    name: c.channel === 'POS' ? getText('Mostrador (POS)', 'Counter (POS)') : getText('En línea', 'Online'),
                    value: c.revenue,
                  }))}
                  valueLabel={(v) => `${reports.currency} ${v.toFixed(2)}`}
                />
              )}

              {reports.byPaymentMethod.length > 0 && (
                <ReportPieCard
                  title={getText('Método de pago (mostrador)', 'Payment method (counter)')}
                  data={reports.byPaymentMethod.map((p) => ({
                    name: p.method === 'Cash' ? getText('Efectivo', 'Cash') : p.method === 'Card' ? getText('Tarjeta', 'Card') : getText('Otro', 'Other'),
                    value: p.revenue,
                  }))}
                  valueLabel={(v) => `${reports.currency} ${v.toFixed(2)}`}
                />
              )}

              {(reports.customers.newCustomers > 0 || reports.customers.returningCustomers > 0) && (
                <ReportPieCard
                  title={getText('Clientes nuevos vs. recurrentes', 'New vs. returning customers')}
                  data={[
                    { name: getText('Nuevos', 'New'), value: reports.customers.newCustomers },
                    { name: getText('Recurrentes', 'Returning'), value: reports.customers.returningCustomers },
                  ]}
                  valueLabel={(v) => String(v)}
                />
              )}

              {reports.invoiceStatus.length > 0 && (
                <ReportPieCard
                  title={getText('Estado de facturas', 'Invoice status')}
                  data={reports.invoiceStatus.map((s) => ({
                    name: getText(
                      s.status === 'Paid' ? 'Pagadas' : s.status === 'Overdue' ? 'Vencidas' : s.status === 'Cancelled' ? 'Canceladas' : 'Pendientes',
                      s.status === 'Paid' ? 'Paid' : s.status === 'Overdue' ? 'Overdue' : s.status === 'Cancelled' ? 'Cancelled' : 'Pending',
                    ),
                    value: s.amount,
                  }))}
                  valueLabel={(v) => `${reports.currency} ${v.toFixed(2)}`}
                />
              )}
            </div>

            {reports.staffActivity.length > 0 && (
              <div className="mt-4 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500">
                  {getText('Actividad por miembro del equipo', 'Activity by team member')}
                </h3>
                <div className="mt-4 h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reports.staffActivity} layout="vertical" margin={{ left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-neutral-800" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} width={90} />
                      <Tooltip formatter={(v: number) => [v, getText('Atendidos', 'Handled')]} />
                      <Bar dataKey="count" fill="#C8102E" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {reports.topItems.length === 0 &&
              reports.byChannel.length <= 1 &&
              reports.byPaymentMethod.length === 0 &&
              reports.customers.newCustomers === 0 &&
              reports.customers.returningCustomers === 0 &&
              reports.invoiceStatus.length === 0 &&
              reports.staffActivity.length === 0 &&
              !reports.revenueByDay.some((d) => d.revenue > 0) && (
                <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-14 text-center">
                  <span className="text-3xl">📈</span>
                  <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">
                    {getText('Todavía no hay ventas ni actividad para reportar.', 'No sales or activity to report yet.')}
                  </p>
                </div>
              )}
          </section>
        )}
      </div>
    </div>
  );
}

/** Tarjeta de gráfico de pastel reutilizable — título + Pie + leyenda con montos, usada por
 *  todas las secciones de "reportes" (top productos, canal, método de pago, clientes, facturas).
 *  Filtra entradas en cero para no ensuciar el pastel con slices invisibles. */
function ReportPieCard({
  title,
  data,
  valueLabel,
}: {
  title: string;
  data: { name: string; value: number }[];
  valueLabel: (v: number) => string;
}) {
  const filtered = data.filter((d) => d.value > 0);
  if (filtered.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500">{title}</h3>
      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={filtered} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
              {filtered.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => valueLabel(v)} />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              iconSize={8}
              wrapperStyle={{ fontSize: 11 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
