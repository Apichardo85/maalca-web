"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  type Period, type ChartMode, type UnitId, type TrafficSource,
  UNITS, getMaalCaData, getMaalCaRevenueChart,
  buildCSV, triggerCSVDownload,
} from "@/lib/mock/maalca-dashboard";
import type { GA4TrafficData, PageData } from "@/lib/ga4";
import { DrillDownModal } from "@/components/dashboard/DrillDownModal";

// ─── Palette ──────────────────────────────────────────────────────────────────

const RED   = "#C8102E";
const SERIF = "var(--font-playfair, Georgia, serif)";
const SANS  = "var(--font-inter, system-ui, sans-serif)";

// Semantic state — never use RED for these
const UP_STYLE   = { color: "#0F6E56" as const };
const DOWN_STYLE = { color: "#A32D2D" as const };
const FLAT_STYLE = { color: "#5F5E5A" as const };

function deltaStyle(delta: number) {
  if (Math.abs(delta) < 1) return FLAT_STYLE;
  return delta > 0 ? UP_STYLE : DOWN_STYLE;
}

function TrendPill({ delta, lang }: { delta: number; lang: Lang }) {
  const abs = Math.abs(delta);
  if (abs < 1) return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3,
      padding: "2px 8px", borderRadius: 12,
      background: "rgba(136,135,128,0.08)", color: "#5F5E5A", fontSize: 11, fontWeight: 500 }}>
      — {lang === "en" ? "Stable" : "Estable"}
    </span>
  );
  const up = delta > 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3,
      padding: "2px 8px", borderRadius: 12,
      background: up ? "rgba(15,110,86,0.08)" : "rgba(163,45,45,0.08)",
      color: up ? "#0F6E56" : "#A32D2D", fontSize: 11, fontWeight: 500 }}>
      {up ? "↑" : "↓"} {abs}%
    </span>
  );
}

// ─── i18n ─────────────────────────────────────────────────────────────────────

const T = {
  en: {
    title:        "Analytics",
    subtitle:     "Ecosystem overview",
    export:       "Export",
    periods:      { "7d": "last 7 days", "30d": "last 30 days", "quarter": "last quarter", "year": "this year" },
    periodOpts:   { "7d": "Last 7 days", "30d": "Last 30 days", "quarter": "Last quarter", "year": "This year" },
    heroLabel:    "Total revenue · all businesses",
    goal:         "Goal",
    reached:      "reached",
    vsPrev:       "vs prev period",
    kpis: {
      customers:   "Active customers",
      conversion:  "Conversion rate",
      avgTicket:   "Avg ticket",
      retention:   "Retention",
    },
    thisPeriod:   "this period",
    pts:          "pts",
    chartTitle:   "Revenue by business unit",
    chartSub:     "Stacked by period",
    chartModes:   { daily: "Daily", weekly: "Weekly", monthly: "Monthly" },
    traffic:      "Traffic sources",
    trafficLive:  "Live · GA4",
    trafficMock:  "Sample data",
    topPages:     "Top pages",
    topPagesSub:  "Most visited on maalca.com",
    colPage:      "Page",
    colViews:     "Views",
    satisfaction: "Customer satisfaction",
    topTitle:     "Top performers",
    topSub:       "Best-selling products and services",
    colItem:      "Item",
    colUnit:      "Unit",
    colSales:     "Sales",
    colRevenue:   "Revenue",
    colTrend:     "Trend",
    viewAll:      "View all",
  },
  es: {
    title:        "Analytics",
    subtitle:     "Ecosistema · resumen",
    export:       "Exportar",
    periods:      { "7d": "últimos 7 días", "30d": "últimos 30 días", "quarter": "último trimestre", "year": "este año" },
    periodOpts:   { "7d": "Últimos 7 días", "30d": "Últimos 30 días", "quarter": "Último trimestre", "year": "Este año" },
    heroLabel:    "Revenue total · todos los negocios",
    goal:         "Meta",
    reached:      "alcanzada",
    vsPrev:       "vs período anterior",
    kpis: {
      customers:   "Clientes activos",
      conversion:  "Tasa de conversión",
      avgTicket:   "Ticket promedio",
      retention:   "Retención",
    },
    thisPeriod:   "este período",
    pts:          "pts",
    chartTitle:   "Revenue por unidad de negocio",
    chartSub:     "Apilado por período",
    chartModes:   { daily: "Diario", weekly: "Semanal", monthly: "Mensual" },
    traffic:      "Fuentes de tráfico",
    trafficLive:  "En vivo · GA4",
    trafficMock:  "Datos de muestra",
    topPages:     "Top páginas",
    topPagesSub:  "Más visitadas en maalca.com",
    colPage:      "Página",
    colViews:     "Visitas",
    satisfaction: "Satisfacción del cliente",
    topTitle:     "Top performers",
    topSub:       "Productos y servicios más vendidos",
    colItem:      "Item",
    colUnit:      "Unidad",
    colSales:     "Ventas",
    colRevenue:   "Revenue",
    colTrend:     "Tendencia",
    viewAll:      "Ver todos",
  },
} as const;
type Lang = keyof typeof T;

function pct(current: number, prev: number) {
  if (prev === 0) return 0;
  return +((current - prev) / prev * 100).toFixed(1);
}

// ─── Segmented control (reuses the same pattern as BusinessCard) ──────────────

function Seg<V extends string>({
  opts, value, onChange, small,
}: { opts: { v: V; label: string }[]; value: V; onChange: (v: V) => void; small?: boolean }) {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg gap-0.5">
      {opts.map(({ v, label }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`rounded-md font-semibold transition-all ${small ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-xs"} ${
            v === value
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Card shell ───────────────────────────────────────────────────────────────

function Card({ children, onClick, className = "" }: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-800/70 overflow-hidden ${onClick ? "cursor-pointer hover:border-gray-300 dark:hover:border-gray-700 transition-colors" : ""} ${className}`}
      style={{ borderWidth: "0.5px" }}
    >
      {children}
    </div>
  );
}

// ─── Tooltip theme ────────────────────────────────────────────────────────────

const TOOLTIP_STYLE = {
  backgroundColor: "var(--surface, white)",
  border: "0.5px solid rgba(0,0,0,0.1)",
  borderRadius: 10,
  fontSize: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
};

// ─── Main component ───────────────────────────────────────────────────────────

export function MaalCaMetrics() {
  const [lang,        setLang]        = useState<Lang>("en");
  const [period,      setPeriod]      = useState<Period>("30d");
  const [chartMode,   setChartMode]   = useState<ChartMode>("weekly");
  const [modal,       setModal]       = useState<UnitId | null>(null);
  const [showAll,     setShowAll]     = useState(false);
  const [realTraffic, setRealTraffic] = useState<GA4TrafficData | null>(null);
  const [trafficLoading, setTrafficLoading] = useState(false);

  const t    = T[lang];
  const data = useMemo(() => getMaalCaData(period), [period]);
  const chartData = useMemo(
    () => getMaalCaRevenueChart(period, chartMode),
    [period, chartMode],
  );

  // Reset showAll when period changes
  useEffect(() => setShowAll(false), [period]);

  // Fetch real GA4 traffic data — falls back to mock if endpoint returns 503
  const fetchTraffic = useCallback(async (p: Period) => {
    setTrafficLoading(true);
    try {
      const res = await fetch(`/api/analytics/traffic?period=${p}`);
      if (res.ok) {
        const json = await res.json() as GA4TrafficData;
        setRealTraffic(json);
      } else {
        setRealTraffic(null); // 503 = not configured, use mock
      }
    } catch {
      setRealTraffic(null);
    } finally {
      setTrafficLoading(false);
    }
  }, []);

  useEffect(() => { fetchTraffic(period); }, [period, fetchTraffic]);

  const { kpis, trafficSources: mockTraffic, satisfaction, topPerformers } = data;

  // Use real GA4 channels when available, otherwise mock
  const trafficSources: TrafficSource[] = realTraffic
    ? realTraffic.channels.map(c => ({
        name:    c.name,
        nameEs:  c.nameEs,
        value:   c.value,
        color:   c.color,
      }))
    : mockTraffic;

  const topPages: PageData[] = realTraffic?.topPages ?? [];
  const isRealTraffic = realTraffic !== null;

  const revDelta   = pct(kpis.totalRevenue, kpis.totalRevenuePrev);
  const goalPct    = Math.min(100, Math.round((kpis.totalRevenue / kpis.revenueGoal) * 100));
  const sparkData  = kpis.sparkline.map(v => ({ v }));
  const custDelta  = pct(kpis.activeCustomers, kpis.activeCustomersPrev);
  const convDelta  = +(kpis.conversionRate - kpis.conversionRatePrev).toFixed(2);
  const tickDelta  = pct(kpis.avgTicket, kpis.avgTicketPrev);
  const retDelta   = +(kpis.retention - kpis.retentionPrev).toFixed(0);

  const visiblePerformers = showAll ? topPerformers : topPerformers.slice(0, 5);

  const handleExport = () => {
    const csv = buildCSV(data, period, lang);
    triggerCSVDownload(csv, `maalca-analytics-${period}.csv`);
  };

  // Available chart modes per period
  const availableModes = useMemo((): ChartMode[] => {
    if (period === "7d")      return ["daily"];
    if (period === "30d")     return ["daily", "weekly"];
    if (period === "quarter") return ["weekly", "monthly"];
    return ["monthly"];
  }, [period]);

  // Auto-fix chartMode when period changes and current mode is unavailable
  useEffect(() => {
    if (!availableModes.includes(chartMode)) setChartMode(availableModes[0]);
  }, [availableModes, chartMode]);

  return (
    <div className="space-y-5" style={{ fontFamily: SANS }}>

      {/* ── 1. Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-gray-900 dark:text-white leading-tight">
            {t.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {t.subtitle} · {t.periods[period]}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Seg<Lang>
            opts={[{ v: "en", label: "EN" }, { v: "es", label: "ES" }]}
            value={lang}
            onChange={setLang}
            small
          />
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as Period)}
            className="text-xs font-medium rounded-lg px-3 py-1.5 border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            {(Object.keys(t.periodOpts) as Period[]).map(p => (
              <option key={p} value={p}>{t.periodOpts[p]}</option>
            ))}
          </select>
          <button
            onClick={handleExport}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            style={{ borderColor: `${RED}50`, color: RED }}
          >
            ↓ {t.export}
          </button>
        </div>
      </div>

      {/* ── 2. Hero card ─────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#0a0a0f",
          borderRadius: 16,
          padding: "24px",
          position: "relative",
          overflow: "hidden",
          border: "0.5px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Red top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: RED }} />

        <div className="grid grid-cols-1 sm:grid-cols-[1.3fr_1fr] gap-6 items-center">
          {/* Left: numbers */}
          <div>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: "0.18em",
                        textTransform: "uppercase", marginBottom: 10 }}>
              {t.heroLabel}
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
              <span style={{ fontFamily: SERIF, fontSize: 38, color: "white", lineHeight: 1 }}>
                ${kpis.totalRevenue.toLocaleString()}
              </span>
              <span style={{ fontSize: 13, ...deltaStyle(revDelta) }}>
                {revDelta >= 0 ? "↑" : "↓"} {Math.abs(revDelta)}%{" "}
                <span style={{ color: "rgba(255,255,255,0.35)" }}>{t.vsPrev}</span>
              </span>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
              {t.goal}: ${kpis.revenueGoal.toLocaleString()} · {goalPct}% {t.reached}
            </p>
            {/* Progress bar */}
            <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${goalPct}%`, height: "100%", background: RED, borderRadius: 2,
                            transition: "width 0.6s ease" }} />
            </div>
          </div>

          {/* Right: sparkline */}
          <div className="hidden sm:block" style={{ height: 80 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <Line
                  type="monotone" dataKey="v"
                  stroke={RED} strokeWidth={1.5} dot={false}
                  animationDuration={800}
                />
                <Tooltip
                  contentStyle={{ ...TOOLTIP_STYLE, background: "#1a1a1a", border: "0.5px solid rgba(255,255,255,0.1)", color: "white" }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, ""]}
                  labelFormatter={() => ""}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── 3. KPI grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label:   t.kpis.customers,
            value:   kpis.activeCustomers.toLocaleString(),
            delta:   custDelta,
            ctx:     `+${kpis.activeCustomersDelta} ${t.thisPeriod}`,
            unit:    "",
          },
          {
            label:   t.kpis.conversion,
            value:   `${kpis.conversionRate}%`,
            delta:   convDelta,
            ctx:     `${convDelta >= 0 ? "+" : ""}${convDelta} ${t.pts} ${t.vsPrev}`,
            unit:    "pts",
          },
          {
            label:   t.kpis.avgTicket,
            value:   `$${kpis.avgTicket}`,
            delta:   tickDelta,
            ctx:     `${tickDelta >= 0 ? "↑" : "↓"} ${Math.abs(tickDelta)}% ${t.vsPrev}`,
            unit:    "",
          },
          {
            label:   t.kpis.retention,
            value:   `${kpis.retention}%`,
            delta:   retDelta,
            ctx:     `${retDelta >= 0 ? "+" : ""}${retDelta} ${t.pts} ${t.vsPrev}`,
            unit:    "pts",
          },
        ].map(kpi => (
          <Card key={kpi.label}>
            <div style={{ padding: "14px 16px" }}>
              <p style={{ fontSize: 12, color: "#888780", marginBottom: 6 }}>{kpi.label}</p>
              <p style={{ fontSize: 22, fontWeight: 500, lineHeight: 1, marginBottom: 4 }}
                 className="text-gray-900 dark:text-white tabular-nums">
                {kpi.value}
              </p>
              <p style={{ fontSize: 11, ...deltaStyle(kpi.delta) }}>
                {kpi.delta >= 0 ? "↑" : "↓"} {kpi.ctx}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── 4. Revenue chart ─────────────────────────────────────────────────── */}
      <Card>
        <div style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                        marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500 }}
                 className="text-gray-900 dark:text-white">
                {t.chartTitle}
              </p>
              <p style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>{t.chartSub}</p>
            </div>
            <Seg<ChartMode>
              opts={availableModes.map(m => ({ v: m, label: t.chartModes[m] }))}
              value={chartMode}
              onChange={setChartMode}
              small
            />
          </div>

          {/* Legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 18px", marginBottom: 14 }}>
            {UNITS.map(u => {
              const total = chartData.reduce((sum, pt) => sum + (pt[u.id] ?? 0), 0);
              return (
                <button
                  key={u.id}
                  onClick={() => setModal(u.id)}
                  style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12,
                           background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  <span style={{ width: 10, height: 10, borderRadius: 2,
                                 background: u.color, flexShrink: 0,
                                 border: u.color === "#D3D1C7" ? "1px solid #bbb" : "none" }} />
                  {lang === "en" ? u.name : u.nameEs}
                  {total > 0 && (
                    <span style={{ color: "#888780" }}>· ${total.toLocaleString()}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis dataKey="label" stroke="#888780" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888780" fontSize={11} tickLine={false} axisLine={false}
                       tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: number, name: string) => {
                    const u = UNITS.find(u => u.id === name);
                    const label = u ? (lang === "en" ? u.name : u.nameEs) : name;
                    return [`$${v.toLocaleString()}`, label];
                  }}
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                />
                {UNITS.map((u, i) => (
                  <Bar
                    key={u.id}
                    dataKey={u.id}
                    stackId="a"
                    fill={u.color}
                    radius={i === UNITS.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* ── 5. Traffic + Satisfaction ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Traffic sources */}
        <Card>
          <div style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 500 }}
                 className="text-gray-900 dark:text-white">
                {t.traffic}
              </p>
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
                textTransform: "uppercase", padding: "2px 7px", borderRadius: 20,
                background: isRealTraffic ? "rgba(15,110,86,0.08)" : "rgba(136,135,128,0.08)",
                color: isRealTraffic ? "#0F6E56" : "#888780",
                opacity: trafficLoading ? 0.5 : 1,
              }}>
                {trafficLoading ? "…" : isRealTraffic ? t.trafficLive : t.trafficMock}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              {/* Donut */}
              <div style={{ width: 110, height: 110, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      data={trafficSources as any}
                      cx="50%" cy="50%"
                      innerRadius={36} outerRadius={52}
                      paddingAngle={2}
                      dataKey="value"
                      animationDuration={600}
                    >
                      {trafficSources.map((s, i) => (
                        <Cell key={i} fill={s.color}
                              stroke={s.color === "#D3D1C7" ? "#bbb" : "none"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(v: number, _: string, p) => [
                        `${v}%`,
                        lang === "en" ? p.payload.name : p.payload.nameEs,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend table */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                {trafficSources.map(s => (
                  <div key={s.name}
                       style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}
                          className="text-gray-700 dark:text-gray-300">
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0,
                                     border: s.color === "#D3D1C7" ? "1px solid #bbb" : "none" }} />
                      {lang === "en" ? s.name : s.nameEs}
                    </span>
                    <span style={{ fontWeight: 500 }} className="text-gray-900 dark:text-white tabular-nums">
                      {s.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Customer satisfaction */}
        <Card>
          <div style={{ padding: "18px 20px" }}>
            <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}
               className="text-gray-900 dark:text-white">
              {t.satisfaction}
            </p>
            {/* Score row */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
              <span style={{ fontFamily: SERIF, fontSize: 32, lineHeight: 1 }}
                    className="text-gray-900 dark:text-white">
                {satisfaction.score}
              </span>
              <span style={{ fontSize: 13, color: "#888780" }}>/&nbsp;5.0</span>
              <span style={{ fontSize: 11, marginLeft: "auto", ...deltaStyle(satisfaction.score - satisfaction.scorePrev) }}>
                ↑ +{(satisfaction.score - satisfaction.scorePrev).toFixed(1)} {t.vsPrev}
              </span>
            </div>
            {/* Star breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {satisfaction.breakdown.map(row => (
                <div key={row.stars}
                     style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                  <span style={{ width: 28, color: "#888780", flexShrink: 0 }}>
                    {row.stars === 2 ? "≤2★" : `${row.stars}★`}
                  </span>
                  <div style={{ flex: 1, height: 5, borderRadius: 3, overflow: "hidden" }}
                       className="bg-gray-100 dark:bg-gray-800">
                    <div style={{
                      width: `${row.pct}%`, height: "100%", borderRadius: 3,
                      background: row.pct >= 50 ? RED : row.pct >= 15 ? "#888780" : "#D3D1C7",
                      transition: "width 0.6s ease",
                    }} />
                  </div>
                  <span style={{ width: 30, textAlign: "right", color: "#888780" }}
                        className="tabular-nums">
                    {row.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── 5b. Top Pages (real GA4 data only) ───────────────────────────────── */}
      {topPages.length > 0 && (
        <Card>
          <div style={{ padding: "18px 20px 4px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                          marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500 }}
                   className="text-gray-900 dark:text-white">
                  {t.topPages}
                </p>
                <p style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>{t.topPagesSub}</p>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
                             textTransform: "uppercase", padding: "2px 7px", borderRadius: 20,
                             background: "rgba(15,110,86,0.08)", color: "#0F6E56" }}>
                {t.trafficLive}
              </span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid" }}
                    className="border-gray-100 dark:border-gray-800">
                  {[t.colPage, t.colViews].map((h, i) => (
                    <th key={h} style={{
                      padding: "6px 0", fontWeight: 500, fontSize: 11,
                      color: "#888780", letterSpacing: "0.05em", textTransform: "uppercase",
                      textAlign: i === 0 ? "left" : "right",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topPages.map((page, i) => {
                  const maxViews = topPages[0]?.views ?? 1;
                  const barPct   = Math.round((page.views / maxViews) * 100);
                  return (
                    <tr key={i} style={{ borderBottom: "0.5px solid" }}
                        className="border-gray-100 dark:border-gray-800">
                      <td style={{ padding: "10px 0", maxWidth: 320 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 80, height: 4, borderRadius: 2, overflow: "hidden", flexShrink: 0 }}
                               className="bg-gray-100 dark:bg-gray-800">
                            <div style={{ width: `${barPct}%`, height: "100%",
                                          background: RED, borderRadius: 2 }} />
                          </div>
                          <a
                            href={`https://maalca.com${page.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "inherit", textDecoration: "none", fontSize: 13,
                                     overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                            className="text-gray-800 dark:text-gray-200 hover:underline"
                          >
                            {page.path === "/" ? "/ (home)" : page.path}
                          </a>
                        </div>
                      </td>
                      <td style={{ padding: "10px 0", textAlign: "right", fontWeight: 500 }}
                          className="text-gray-900 dark:text-white tabular-nums">
                        {page.views.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p style={{ fontSize: 11, color: "#888780", padding: "12px 0 8px", textAlign: "right" }}>
              {realTraffic?.totalSessions.toLocaleString()} {lang === "en" ? "total sessions" : "sesiones totales"}{" "}
              · {realTraffic?.activeUsers.toLocaleString()} {lang === "en" ? "active users" : "usuarios activos"}
            </p>
          </div>
        </Card>
      )}

      {/* ── 6. Top performers ────────────────────────────────────────────────── */}
      <Card>
        <div style={{ padding: "18px 20px 4px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                        marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500 }}
                 className="text-gray-900 dark:text-white">
                {t.topTitle}
              </p>
              <p style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>{t.topSub}</p>
            </div>
            {topPerformers.length > 5 && (
              <button
                onClick={() => setShowAll(v => !v)}
                style={{ fontSize: 12, color: RED, background: "none", border: "none",
                         cursor: "pointer", fontWeight: 500 }}
              >
                {showAll
                  ? (lang === "en" ? "Show less" : "Mostrar menos")
                  : t.viewAll}
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid" }}
                    className="border-gray-100 dark:border-gray-800">
                  {[t.colItem, t.colUnit, t.colSales, t.colRevenue, t.colTrend].map((h, i) => (
                    <th key={h} style={{
                      padding: "8px 0", fontWeight: 500, fontSize: 11, color: "#888780",
                      letterSpacing: "0.05em", textTransform: "uppercase",
                      textAlign: i < 2 ? "left" : "right",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visiblePerformers.map(p => {
                  const unitInfo = UNITS.find(u => u.id === p.unit)!;
                  return (
                    <tr
                      key={p.id}
                      style={{ borderBottom: "0.5px solid", cursor: "pointer" }}
                      className="border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                      onClick={() => setModal(p.unit)}
                    >
                      <td style={{ padding: "12px 0" }}
                          className="text-gray-900 dark:text-white font-medium">
                        {lang === "en" ? p.name : p.nameEs}
                      </td>
                      <td style={{ padding: "12px 0" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5,
                                       fontSize: 12, color: "#888780" }}>
                          <span style={{ width: 7, height: 7, borderRadius: 2,
                                         background: unitInfo.color, flexShrink: 0,
                                         border: unitInfo.color === "#D3D1C7" ? "1px solid #bbb" : "none" }} />
                          {lang === "en" ? unitInfo.name : unitInfo.nameEs}
                        </span>
                      </td>
                      <td style={{ padding: "12px 0", textAlign: "right" }}
                          className="text-gray-600 dark:text-gray-400 tabular-nums">
                        {p.sales.toLocaleString()}
                      </td>
                      <td style={{ padding: "12px 0", textAlign: "right", fontWeight: 500 }}
                          className="text-gray-900 dark:text-white tabular-nums">
                        ${p.revenue.toLocaleString()}
                      </td>
                      <td style={{ padding: "12px 0", textAlign: "right" }}>
                        <TrendPill delta={p.delta} lang={lang} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* ── Drill-down modal ──────────────────────────────────────────────────── */}
      {modal !== null && (
        <DrillDownModal
          unit={modal}
          period={period}
          lang={lang}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
