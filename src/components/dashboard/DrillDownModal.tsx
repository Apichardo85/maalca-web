"use client";

import { useEffect } from "react";
import {
  LineChart, Line, ResponsiveContainer, Tooltip,
} from "recharts";
import {
  type UnitId, type Period, type DrillDownData,
  UNITS, getMaalCaUnitData, buildUnitCSV, triggerCSVDownload,
} from "@/lib/mock/maalca-dashboard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DrillDownModalProps {
  unit:    UnitId;
  period:  Period;
  lang:    "en" | "es";
  onClose: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RED   = "#C8102E";
const SERIF = "var(--font-playfair, Georgia, serif)";

const PERIOD_LABEL: Record<Period, Record<"en" | "es", string>> = {
  "7d":      { en: "Last 7 days",     es: "Últimos 7 días"     },
  "30d":     { en: "Last 30 days",    es: "Últimos 30 días"    },
  "quarter": { en: "Last quarter",    es: "Último trimestre"   },
  "year":    { en: "This year",       es: "Este año"           },
};

const T = {
  en: {
    revenue:    "Revenue",
    customers:  "Customers",
    avgTicket:  "Avg ticket",
    vsPrev:     "vs prev period",
    topItems:   "Top items",
    colItem:    "Item",
    colSales:   "Sales",
    colRevenue: "Revenue",
    colTrend:   "Trend",
    exportBtn:  "Export this unit",
    close:      "Close",
  },
  es: {
    revenue:    "Revenue",
    customers:  "Clientes",
    avgTicket:  "Ticket prom.",
    vsPrev:     "vs período anterior",
    topItems:   "Top items",
    colItem:    "Item",
    colSales:   "Ventas",
    colRevenue: "Revenue",
    colTrend:   "Tendencia",
    exportBtn:  "Exportar esta unidad",
    close:      "Cerrar",
  },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pct(current: number, prev: number): number {
  if (prev === 0) return 0;
  return +((current - prev) / prev * 100).toFixed(1);
}

function trendPill(delta: number, lang: "en" | "es") {
  const abs = Math.abs(delta);
  if (abs < 1) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 3,
        padding: "2px 8px", borderRadius: 12,
        background: "rgba(136,135,128,0.08)", color: "#5F5E5A",
        fontSize: 11, fontWeight: 500,
      }}>
        — {lang === "en" ? "Stable" : "Estable"}
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      padding: "2px 8px", borderRadius: 12,
      background: up ? "rgba(15,110,86,0.08)" : "rgba(163,45,45,0.08)",
      color: up ? "#0F6E56" : "#A32D2D",
      fontSize: 11, fontWeight: 500,
    }}>
      {up ? "↑" : "↓"} {abs}%
    </span>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MiniKPI({
  label, value, prev, prefix = "", suffix = "",
  t,
}: {
  label: string;
  value: number;
  prev:  number;
  prefix?: string;
  suffix?: string;
  t: typeof T[keyof typeof T];
}) {
  const delta = pct(value, prev);
  const up    = delta >= 0;
  return (
    <div style={{
      flex: 1,
      background: "var(--color-background-secondary, #f9fafb)",
      borderRadius: 10,
      padding: "12px 14px",
      border: "0.5px solid rgba(0,0,0,0.06)",
    }} className="dark:bg-gray-800/60 dark:border-gray-700/40">
      <p style={{ fontSize: 11, color: "#888780", marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1, marginBottom: 4 }}
         className="text-gray-900 dark:text-white">
        {prefix}{value.toLocaleString()}{suffix}
      </p>
      <p style={{
        fontSize: 11,
        color: Math.abs(delta) < 1 ? "#5F5E5A" : up ? "#0F6E56" : "#A32D2D",
      }}>
        {Math.abs(delta) < 1 ? "—" : up ? `↑ ${delta}%` : `↓ ${Math.abs(delta)}%`}{" "}
        <span style={{ color: "#888780" }}>{t.vsPrev}</span>
      </p>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function DrillDownModal({ unit, period, lang, onClose }: DrillDownModalProps) {
  const t        = T[lang];
  const unitInfo = UNITS.find(u => u.id === unit)!;
  const data: DrillDownData = getMaalCaUnitData(unit, period);
  const unitName = lang === "en" ? unitInfo.name : unitInfo.nameEs;
  const sparkData = data.trend.map(v => ({ v }));

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleExport = () => {
    const csv = buildUnitCSV(unit, period, lang);
    triggerCSVDownload(csv, `maalca-${unit}-${period}.csv`);
  };

  return (
    /* Backdrop */
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={unitName}
    >
      {/* Panel */}
      <div
        style={{
          width: "100%", maxWidth: 540,
          borderRadius: 16,
          border: "0.5px solid rgba(0,0,0,0.1)",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
        }}
        className="bg-white dark:bg-gray-900 dark:border-gray-700/50"
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "0.5px solid",
        }} className="border-gray-100 dark:border-gray-800">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 10, height: 10, borderRadius: 3,
              background: unitInfo.color, flexShrink: 0,
            }} />
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.2 }}
                 className="text-gray-900 dark:text-white">
                {unitName}
              </p>
              <p style={{ fontSize: 11, color: "#888780", marginTop: 2 }}>
                {PERIOD_LABEL[period][lang]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "none", cursor: "pointer", fontSize: 14,
            }}
            className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={t.close}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "20px" }}>
          {/* KPIs */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <MiniKPI label={t.revenue}   value={data.revenue}   prev={data.revenuePrev}   prefix="$" t={t} />
            <MiniKPI label={t.customers} value={data.customers} prev={data.customersPrev}             t={t} />
            <MiniKPI label={t.avgTicket} value={data.avgTicket} prev={data.avgTicketPrev} prefix="$" t={t} />
          </div>

          {/* Trend chart */}
          <div style={{ height: 80, marginBottom: 20 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={unitInfo.color === "#D3D1C7" ? "#888780" : unitInfo.color}
                  strokeWidth={1.5}
                  dot={false}
                  animationDuration={600}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "0.5px solid rgba(0,0,0,0.1)",
                    background: "var(--surface, white)",
                  }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, ""]}
                  labelFormatter={() => ""}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top items table */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                      textTransform: "uppercase", color: "#888780", marginBottom: 10 }}>
            {t.topItems}
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid" }} className="border-gray-100 dark:border-gray-800">
                {[t.colItem, t.colSales, t.colRevenue, t.colTrend].map((h, i) => (
                  <th key={h} style={{
                    padding: "6px 0",
                    textAlign: i === 0 ? "left" : "right",
                    fontSize: 11, fontWeight: 500,
                    letterSpacing: "0.05em", textTransform: "uppercase",
                    color: "#888780",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.topItems.map(item => (
                <tr key={item.id} style={{ borderBottom: "0.5px solid" }}
                    className="border-gray-100 dark:border-gray-800">
                  <td style={{ padding: "10px 0" }}
                      className="text-gray-900 dark:text-white">
                    {lang === "en" ? item.name : item.nameEs}
                  </td>
                  <td style={{ padding: "10px 0", textAlign: "right" }}
                      className="text-gray-600 dark:text-gray-400 tabular-nums">
                    {item.sales.toLocaleString()}
                  </td>
                  <td style={{ padding: "10px 0", textAlign: "right", fontWeight: 500 }}
                      className="text-gray-900 dark:text-white tabular-nums">
                    ${item.revenue.toLocaleString()}
                  </td>
                  <td style={{ padding: "10px 0", textAlign: "right" }}>
                    {trendPill(item.delta, lang)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Export button */}
          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleExport}
              style={{
                padding: "8px 16px", borderRadius: 20,
                border: `1.5px solid ${RED}`, color: RED,
                background: "transparent", fontSize: 12,
                fontWeight: 600, cursor: "pointer", letterSpacing: "0.01em",
              }}
              className="hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              ↓ {t.exportBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
