"use client";

import { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useAffiliate } from "@/contexts/AffiliateContext";
import type { GA4TrafficData, PageData } from "@/lib/ga4";
import { TLD_AFFILIATE_ID, TLD_KPIS } from "@/lib/mock/tld-dashboard";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang   = "en" | "es";
type Period = "7d" | "30d" | "quarter" | "year";

interface TrafficSource {
  name: string; nameEs: string; value: number; color: string; sessions: number;
}

interface SatisfactionData {
  score:     number;
  scorePrev: number;
  breakdown: { stars: number; pct: number }[];
}

// ─── Affiliate → site page path mapping ──────────────────────────────────────

const AFFILIATE_SITE_PATH: Record<string, string> = {
  "the-little-dominican": "/the-little-dominicana",
  "pegote-barbershop":    "/pegote",
  "britocolor":           "/britocolor",
  "masa-tina":            "/masa-tina",
  "dr-pichardo":          "/dr-pichardo",
  "hablando-mierda":      "/hablando-mierda",
  "ciriwhispers":         "/ciriwhispers",
};

const TAILWIND_HEX: Record<string, string> = {
  "red-600":    "#dc2626",
  "blue-600":   "#2563eb",
  "orange-600": "#ea580c",
  "green-600":  "#16a34a",
  "purple-600": "#9333ea",
  "teal-600":   "#0d9488",
};

// ─── Mock satisfaction (affiliate-specific where available) ───────────────────

const SATISFACTION: Record<string, SatisfactionData> = {
  "the-little-dominican": {
    score: 4.9, scorePrev: 4.7,
    breakdown: [
      { stars: 5, pct: 82 }, { stars: 4, pct: 13 },
      { stars: 3, pct: 3 },  { stars: 2, pct: 2 },
    ],
  },
};

const GENERIC_SATISFACTION: SatisfactionData = {
  score: 4.7, scorePrev: 4.5,
  breakdown: [
    { stars: 5, pct: 68 }, { stars: 4, pct: 22 },
    { stars: 3, pct: 7 },  { stars: 2, pct: 3 },
  ],
};

// ─── i18n ─────────────────────────────────────────────────────────────────────

const PERIOD_LABELS: Record<Lang, Record<Period, string>> = {
  en: { "7d": "Last 7 days", "30d": "Last 30 days", "quarter": "Last quarter", "year": "This year" },
  es: { "7d": "Últimos 7 días", "30d": "Últimos 30 días", "quarter": "Último trimestre", "year": "Este año" },
};

// ─── Semantic delta colors (same as MaalCaMetrics) ────────────────────────────

const UP_COLOR   = "#0F6E56";
const DOWN_COLOR = "#A32D2D";

// ─── Tooltip theme ─────────────────────────────────────────────────────────────

const TOOLTIP_STYLE = {
  backgroundColor: "var(--surface, white)",
  border: "0.5px solid rgba(0,0,0,0.1)",
  borderRadius: 10,
  fontSize: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
};

const SERIF = "var(--font-playfair, Georgia, serif)";

// ─── CSV export ───────────────────────────────────────────────────────────────

function buildCSV(
  brandName: string,
  period: Period,
  lang: Lang,
  sources: TrafficSource[],
  pages: PageData[],
  rt: GA4TrafficData | null,
): string {
  const rows: string[] = [
    `"${brandName} Analytics","${PERIOD_LABELS[lang][period]}"`,
    "",
  ];
  if (rt) {
    rows.push(`"${lang === "en" ? "Page Views" : "Vistas"}","${rt.totalPageViews ?? ""}"`);
    rows.push(`"${lang === "en" ? "Sessions" : "Sesiones"}","${rt.totalSessions}"`);
    rows.push(`"${lang === "en" ? "Active Users" : "Usuarios Activos"}","${rt.activeUsers}"`);
    rows.push("");
  }
  rows.push(`"${lang === "en" ? "Channel" : "Canal"}","%","${lang === "en" ? "Sessions" : "Sesiones"}"`);
  for (const s of sources) {
    rows.push(`"${lang === "en" ? s.name : s.nameEs}","${s.value}","${s.sessions}"`);
  }
  if (pages.length > 0) {
    rows.push("");
    rows.push(`"${lang === "en" ? "Page" : "Página"}","${lang === "en" ? "Views" : "Vistas"}","${lang === "en" ? "Sessions" : "Sesiones"}"`);
    for (const p of pages) {
      rows.push(`"${p.path}","${p.views}","${p.sessions}"`);
    }
  }
  return rows.join("\n");
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-800/70 overflow-hidden ${className}`}
      style={{ borderWidth: "0.5px" }}
    >
      {children}
    </div>
  );
}

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

// ─── Main component ───────────────────────────────────────────────────────────

export function AffiliateMetrics() {
  const { config, brandName } = useAffiliate();
  const [lang,           setLang]           = useState<Lang>("en");
  const [period,         setPeriod]         = useState<Period>("30d");
  const [realTraffic,    setRealTraffic]    = useState<GA4TrafficData | null>(null);
  const [trafficLoading, setTrafficLoading] = useState(false);

  const affiliateId  = config?.id ?? "";
  const sitePath     = AFFILIATE_SITE_PATH[affiliateId] ?? null;
  const brandColor   = TAILWIND_HEX[config?.branding.primaryColor ?? ""] ?? "#C8102E";
  const isTld        = affiliateId === TLD_AFFILIATE_ID;
  const currency     = config?.settings.currency === "USD" ? "$" : "RD$";
  const satisfaction = SATISFACTION[affiliateId] ?? GENERIC_SATISFACTION;

  const fetchTraffic = useCallback(async (p: Period) => {
    setTrafficLoading(true);
    try {
      const pathParam = sitePath ? `&path=${encodeURIComponent(sitePath)}` : "";
      const res = await fetch(`/api/analytics/traffic?period=${p}${pathParam}`);
      if (res.ok) setRealTraffic(await res.json() as GA4TrafficData);
      else setRealTraffic(null);
    } catch {
      setRealTraffic(null);
    } finally {
      setTrafficLoading(false);
    }
  }, [sitePath]);

  useEffect(() => { fetchTraffic(period); }, [period, fetchTraffic]);

  const MOCK_CHANNELS: TrafficSource[] = [
    { name: "Organic",  nameEs: "Orgánico",  value: 45, color: brandColor, sessions: 450 },
    { name: "Direct",   nameEs: "Directo",   value: 28, color: "#1a1a1a",  sessions: 280 },
    { name: "Social",   nameEs: "Redes",     value: 18, color: "#888780",  sessions: 180 },
    { name: "Referral", nameEs: "Referidos", value: 9,  color: "#D3D1C7",  sessions: 90  },
  ];
  const trafficSources: TrafficSource[] = realTraffic
    ? realTraffic.channels.map(c => ({ ...c, sessions: c.sessions }))
    : MOCK_CHANNELS;
  const topPages: PageData[] = realTraffic?.topPages ?? [];
  const isLive = realTraffic !== null;

  const bizKpis = isTld
    ? [
        { label: lang === "en" ? "Monthly Revenue"     : "Ingresos del Mes",    value: TLD_KPIS.revenueUSD,             icon: "💰" },
        { label: lang === "en" ? "Unique Customers"    : "Clientes Únicos",     value: String(TLD_KPIS.totalCustomers), icon: "👥" },
        { label: lang === "en" ? "WhatsApp Conv."      : "Conversión WhatsApp", value: TLD_KPIS.conversionRate,         icon: "💬" },
        { label: lang === "en" ? "Avg Ticket"          : "Ticket Promedio",     value: TLD_KPIS.averageTicketUSD,       icon: "🧾" },
      ]
    : [
        { label: lang === "en" ? `Revenue (${config?.settings.currency})` : `Ingresos (${config?.settings.currency})`, value: currency === "$" ? "$45,231" : "RD$2,548,920", icon: "💰" },
        { label: lang === "en" ? "Total Customers"     : "Clientes Totales",    value: "1,248",                         icon: "👥" },
        { label: lang === "en" ? "Conversion Rate"     : "Tasa de Conversión",  value: "3.24%",                         icon: "📊" },
        { label: lang === "en" ? "Avg Ticket"          : "Ticket Promedio",     value: currency === "$" ? "$156" : "RD$8,760", icon: "💳" },
      ];

  const satDelta     = +(satisfaction.score - satisfaction.scorePrev).toFixed(1);
  const satDeltaStr  = `${satDelta >= 0 ? "↑ +" : "↓ "}${Math.abs(satDelta)}`;

  const handleExport = () => {
    const csv = buildCSV(brandName, period, lang, trafficSources, topPages, realTraffic);
    downloadCSV(csv, `${affiliateId}-analytics-${period}.csv`);
  };

  return (
    <div className="space-y-5" style={{ fontFamily: "var(--font-inter, system-ui, sans-serif)" }}>

      {/* ── 1. Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-gray-900 dark:text-white leading-tight">
            Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {brandName} · {PERIOD_LABELS[lang][period]}
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
            className="text-xs font-medium rounded-lg px-3 py-1.5 border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 focus:outline-none"
          >
            {(Object.keys(PERIOD_LABELS.en) as Period[]).map(p => (
              <option key={p} value={p}>{PERIOD_LABELS[lang][p]}</option>
            ))}
          </select>
          <button
            onClick={handleExport}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            style={{ borderColor: `${brandColor}50`, color: brandColor }}
          >
            ↓ {lang === "en" ? "Export" : "Exportar"}
          </button>
        </div>
      </div>

      {/* ── 2. Business KPI row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {bizKpis.map(kpi => (
          <Card key={kpi.label}>
            <div style={{ padding: "14px 16px" }}>
              <p style={{ fontSize: 12, color: "#888780", marginBottom: 6 }}>
                {kpi.icon} {kpi.label}
              </p>
              <p
                style={{ fontSize: 22, fontWeight: 500, lineHeight: 1 }}
                className="text-gray-900 dark:text-white tabular-nums"
              >
                {kpi.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── 3. Web traffic section label ────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p style={{ fontSize: 14, fontWeight: 500 }} className="text-gray-900 dark:text-white">
            {lang === "en" ? "Website Traffic" : "Tráfico Web"}
          </p>
          {sitePath && (
            <p style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>
              maalca.com{sitePath}
            </p>
          )}
        </div>
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
          textTransform: "uppercase", padding: "2px 7px", borderRadius: 20,
          background: isLive ? "rgba(15,110,86,0.08)" : "rgba(136,135,128,0.08)",
          color: isLive ? "#0F6E56" : "#888780",
          opacity: trafficLoading ? 0.5 : 1,
          transition: "opacity 0.2s",
        }}>
          {trafficLoading ? "…" : isLive
            ? (lang === "en" ? "Live · GA4" : "En vivo · GA4")
            : (lang === "en" ? "Sample data" : "Datos de muestra")}
        </span>
      </div>

      {/* ── 4. Web stats row (3 mini-KPIs) ──────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: lang === "en" ? "Page Views"     : "Vistas",          value: realTraffic?.totalPageViews?.toLocaleString() ?? "—", icon: "👁" },
          { label: lang === "en" ? "Sessions"       : "Sesiones",        value: realTraffic?.totalSessions.toLocaleString()  ?? "—", icon: "📊" },
          { label: lang === "en" ? "Active Users"   : "Usuarios Activos",value: realTraffic?.activeUsers.toLocaleString()    ?? "—", icon: "👥" },
        ].map(kpi => (
          <Card key={kpi.label}>
            <div style={{ padding: "12px 16px" }}>
              <p style={{ fontSize: 11, color: "#888780", marginBottom: 4 }}>
                {kpi.icon} {kpi.label}
              </p>
              <p
                style={{ fontSize: 20, fontWeight: 500, lineHeight: 1 }}
                className="text-gray-900 dark:text-white tabular-nums"
              >
                {kpi.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── 5. Traffic sources + Customer satisfaction ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Traffic sources donut */}
        <Card>
          <div style={{ padding: "18px 20px" }}>
            <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}
               className="text-gray-900 dark:text-white">
              {lang === "en" ? "Traffic sources" : "Fuentes de tráfico"}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
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
                        <Cell
                          key={i}
                          fill={s.color}
                          stroke={s.color === "#D3D1C7" ? "#bbb" : "none"}
                        />
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
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                {trafficSources.map(s => (
                  <div
                    key={s.name}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}
                  >
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                      className="text-gray-700 dark:text-gray-300"
                    >
                      <span style={{
                        width: 8, height: 8, borderRadius: 2,
                        background: s.color, flexShrink: 0,
                        border: s.color === "#D3D1C7" ? "1px solid #bbb" : "none",
                      }} />
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
              {lang === "en" ? "Customer satisfaction" : "Satisfacción del cliente"}
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
              <span style={{ fontFamily: SERIF, fontSize: 32, lineHeight: 1 }}
                    className="text-gray-900 dark:text-white">
                {satisfaction.score}
              </span>
              <span style={{ fontSize: 13, color: "#888780" }}>/&nbsp;5.0</span>
              <span style={{
                fontSize: 11, marginLeft: "auto",
                color: satDelta >= 0 ? UP_COLOR : DOWN_COLOR,
              }}>
                {satDeltaStr} {lang === "en" ? "vs prev period" : "vs período anterior"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {satisfaction.breakdown.map(row => (
                <div
                  key={row.stars}
                  style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}
                >
                  <span style={{ width: 28, color: "#888780", flexShrink: 0 }}>
                    {row.stars === 2 ? "≤2★" : `${row.stars}★`}
                  </span>
                  <div
                    style={{ flex: 1, height: 5, borderRadius: 3, overflow: "hidden" }}
                    className="bg-gray-100 dark:bg-gray-800"
                  >
                    <div style={{
                      width: `${row.pct}%`, height: "100%", borderRadius: 3,
                      background: row.pct >= 50 ? brandColor : row.pct >= 15 ? "#888780" : "#D3D1C7",
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

      {/* ── 6. Top Pages (GA4 real data only) ───────────────────────────────── */}
      {topPages.length > 0 && (
        <Card>
          <div style={{ padding: "18px 20px 4px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                          marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500 }} className="text-gray-900 dark:text-white">
                  {lang === "en" ? "Top Pages" : "Top Páginas"}
                </p>
                <p style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>
                  {lang === "en" ? "Most visited this period" : "Más visitadas este período"}
                </p>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
                textTransform: "uppercase", padding: "2px 7px", borderRadius: 20,
                background: "rgba(15,110,86,0.08)", color: "#0F6E56",
              }}>
                {lang === "en" ? "Live · GA4" : "En vivo · GA4"}
              </span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid" }} className="border-gray-100 dark:border-gray-800">
                  {[lang === "en" ? "Page" : "Página", lang === "en" ? "Views" : "Visitas"].map((h, i) => (
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
                    <tr
                      key={i}
                      style={{ borderBottom: "0.5px solid" }}
                      className="border-gray-100 dark:border-gray-800"
                    >
                      <td style={{ padding: "10px 0", maxWidth: 320 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{ width: 80, height: 4, borderRadius: 2, overflow: "hidden", flexShrink: 0 }}
                            className="bg-gray-100 dark:bg-gray-800"
                          >
                            <div style={{ width: `${barPct}%`, height: "100%", background: brandColor, borderRadius: 2 }} />
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
                      <td
                        style={{ padding: "10px 0", textAlign: "right", fontWeight: 500 }}
                        className="text-gray-900 dark:text-white tabular-nums"
                      >
                        {page.views.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p style={{ fontSize: 11, color: "#888780", padding: "12px 0 8px", textAlign: "right" }}>
              {realTraffic?.totalSessions.toLocaleString()}{" "}
              {lang === "en" ? "total sessions" : "sesiones totales"}{" "}
              · {realTraffic?.activeUsers.toLocaleString()}{" "}
              {lang === "en" ? "active users" : "usuarios activos"}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
