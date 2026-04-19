"use client";

/**
 * DashboardHome — home unificada del dashboard multi-tenant.
 *
 * Un solo componente. Cada sección decide si renderizarse según:
 *   - businessType (vertical del negocio)
 *   - hasModule(x)  (módulos habilitados para el afiliado)
 *
 * Data mockeada por businessType en MOCK_BY_TYPE (al final del archivo).
 * Para habilitar un nuevo vertical: agregar la entrada correspondiente al
 * objeto MOCK_BY_TYPE. Si falta el mock, cada sección cae a un fallback
 * inofensivo (no rompe render — solo se oculta la sección).
 *
 * Piloto actual: `the-little-dominican` (restaurant). Ver ENABLED_AFFILIATES
 * en `../page.tsx` para activar otros.
 */

import Link from "next/link";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { PLAN_META, type BusinessType } from "@/config/affiliates-config";
import { useAffiliateNavigation } from "@/hooks/useAffiliateNavigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { chartTheme } from "@/components/dashboard/shared/ChartCard";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Kpi {
  label: string;
  value: string;
  delta?: string;                      // e.g. "+12.5%"
  deltaTone?: "up" | "down" | "neutral";
  icon: string;
  hint?: string;                       // subtítulo pequeño ("vs ayer", "mesas activas")
  module?: string;                     // se oculta si hasModule(module) === false
}

interface QuickAction {
  label: string;
  icon: string;
  module?: string;                     // se oculta si hasModule(module) === false
  href?: string;                       // absoluto, sobrescribe module-based URL
}

interface Alert {
  tone: "critical" | "warning";
  icon: string;
  title: string;
  detail: string;
  module?: string;                     // CTA navega al módulo
}

interface LivePerson {
  name: string;
  meta: string;                        // "Mesa 4 · 3 items" | "Corte + barba"
  status: string;                      // "En cocina" | "En espera"
  tone: "active" | "pending" | "done";
  since?: string;                      // "hace 5 min"
}

interface TopItem {
  name: string;
  count: number;
  revenue?: string;                    // opcional ("$540")
  category?: string;
}

interface TrendPoint {
  label: string;                       // "10am", "Lun"
  value: number;
}

interface MockHomeData {
  greetingHint: string;                // "Servicio del almuerzo en curso"
  kpis: Kpi[];
  quickActions: QuickAction[];
  alerts: Alert[];                     // [] si no hay
  live: {
    enabledVia: "orders" | "queue" | "appointments";
    title: string;                     // "Comandas Activas" | "Fila de Hoy"
    items: LivePerson[];
    seeAllHref?: string;
  } | null;
  topItems: {
    enabledVia: "menu" | "ecommerce" | "reports";
    title: string;                     // "Top Platos de Hoy"
    items: TopItem[];
  } | null;
  trend: {
    title: string;
    subtitle: string;                  // "Últimas 8 horas"
    data: TrendPoint[];
    valueLabel: string;                // "Ventas"
  } | null;
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  icon,
  children,
  action,
  className = "",
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-800 shadow-sm overflow-hidden ${className}`}
    >
      <header className="px-6 pt-5 pb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {icon && <span className="text-lg">{icon}</span>}
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action}
      </header>
      <div className="px-6 pb-6">{children}</div>
    </section>
  );
}

function KpiCard({ kpi, index }: { kpi: Kpi; index: number }) {
  const toneStyles =
    kpi.deltaTone === "up"
      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
      : kpi.deltaTone === "down"
      ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40"
      : "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800";

  return (
    <div
      className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-800 p-5 shadow-sm animate-fade-in-up overflow-hidden group hover:shadow-md transition-shadow"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* subtle brand tint in corner */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none"
        style={{ background: "var(--brand-primary)" }}
      />
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{kpi.icon}</span>
        {kpi.delta && (
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${toneStyles}`}
          >
            {kpi.delta}
          </span>
        )}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
        {kpi.label}
      </p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
        {kpi.value}
      </p>
      {kpi.hint && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kpi.hint}</p>
      )}
    </div>
  );
}

function PulseDot({ tone }: { tone: LivePerson["tone"] }) {
  const color =
    tone === "active" ? "bg-emerald-500" : tone === "pending" ? "bg-amber-500" : "bg-gray-400";
  const ring =
    tone === "active"
      ? "bg-emerald-400"
      : tone === "pending"
      ? "bg-amber-400"
      : "bg-gray-300";
  return (
    <span className="relative flex w-2.5 h-2.5 flex-shrink-0">
      {tone !== "done" && (
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${ring}`}
        />
      )}
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
    </span>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function DashboardHome() {
  const { config, brandName, businessType, hasModule, plan } = useAffiliate();
  const { getModuleUrl } = useAffiliateNavigation();

  // Pick mock by businessType; if not available, show a polite fallback
  const data = businessType ? MOCK_BY_TYPE[businessType] : undefined;

  const now = new Date();
  const hours = now.getHours();
  const greeting =
    hours < 12 ? "Buen día" : hours < 19 ? "Buenas tardes" : "Buenas noches";
  const dateLabel = now.toLocaleDateString("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (!data) {
    // Placeholder inofensivo para verticales sin mock aún
    return (
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {brandName}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {config?.branding.description}
        </p>
        <div className="mt-6 p-6 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            🚧 La vista de inicio para esta vertical (<strong>{businessType}</strong>) todavía
            está en construcción. Mientras tanto, usa el menú lateral para navegar los módulos.
          </p>
        </div>
      </div>
    );
  }

  // Filter quick actions by enabled modules
  const visibleActions = data.quickActions.filter(
    (a) => !a.module || hasModule(a.module as Parameters<typeof hasModule>[0])
  );

  // Filter KPIs and alerts by plan-gated modules
  const visibleKpis = data.kpis.filter(
    (k) => !k.module || hasModule(k.module as Parameters<typeof hasModule>[0])
  );
  const visibleAlerts = data.alerts.filter(
    (a) => !a.module || hasModule(a.module as Parameters<typeof hasModule>[0])
  );

  const showAlerts = visibleAlerts.length > 0;
  const showLive = data.live && hasModule(data.live.enabledVia as Parameters<typeof hasModule>[0]);
  const showTop =
    data.topItems && hasModule(data.topItems.enabledVia as Parameters<typeof hasModule>[0]);
  const showTrend = data.trend && hasModule("metrics");

  return (
    <div className="space-y-6">
      {/* ─── Hero header ─────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            background:
              "radial-gradient(ellipse at top right, var(--brand-primary), transparent 60%)",
          }}
        />
        <div className="relative px-6 py-6 sm:py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-gray-500">
              {greeting} · {dateLabel}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {brandName}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {data.greetingHint}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: "color-mix(in srgb, var(--brand-light) 50%, transparent)",
                color: "var(--brand-primary)",
              }}
            >
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping bg-current" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
              </span>
              En vivo
            </span>
            <Link
              href="/servicios"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-brand-primary transition-colors"
              title="Ver planes / upgrade"
            >
              {PLAN_META[plan].label}
            </Link>
          </div>
        </div>
      </header>

      {/* ─── KPIs ────────────────────────────────────────────────────────── */}
      {visibleKpis.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleKpis.map((kpi, i) => (
            <KpiCard key={kpi.label} kpi={kpi} index={i} />
          ))}
        </div>
      )}

      {/* ─── Quick actions ──────────────────────────────────────────────── */}
      {visibleActions.length > 0 && (
        <SectionCard title="Acciones rápidas" icon="⚡">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {visibleActions.map((a) => {
              const href = a.href ?? (a.module ? getModuleUrl(a.module) : "#");
              return (
                <Link
                  key={a.label}
                  href={href}
                  className="group flex flex-col items-start gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md hover:-translate-y-0.5 transition-all"
                  style={{
                    borderColor: "color-mix(in srgb, var(--brand-light) 30%, transparent)",
                  }}
                >
                  <span className="text-2xl">{a.icon}</span>
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">
                    {a.label}
                  </span>
                  <span
                    className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--brand-primary)" }}
                  >
                    Abrir →
                  </span>
                </Link>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* ─── Alerts + Live activity (2-col split) ───────────────────────── */}
      {(showAlerts || showLive) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {showAlerts && (
            <SectionCard
              title="Atención requerida"
              subtitle={`${visibleAlerts.length} ${visibleAlerts.length === 1 ? "alerta" : "alertas"} pendiente${visibleAlerts.length === 1 ? "" : "s"}`}
              icon="⚠️"
            >
              <ul className="space-y-3">
                {visibleAlerts.map((alert, i) => {
                  const tone =
                    alert.tone === "critical"
                      ? "border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20"
                      : "border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20";
                  const toneText =
                    alert.tone === "critical"
                      ? "text-red-700 dark:text-red-400"
                      : "text-amber-700 dark:text-amber-400";
                  const content = (
                    <div className={`flex items-start gap-3 p-3 rounded-xl border ${tone}`}>
                      <span className="text-xl flex-shrink-0">{alert.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${toneText}`}>{alert.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          {alert.detail}
                        </p>
                      </div>
                      {alert.module && (
                        <span className={`text-xs font-bold ${toneText}`} aria-hidden>
                          →
                        </span>
                      )}
                    </div>
                  );
                  return (
                    <li key={i}>
                      {alert.module ? (
                        <Link href={getModuleUrl(alert.module)} className="block">
                          {content}
                        </Link>
                      ) : (
                        content
                      )}
                    </li>
                  );
                })}
              </ul>
            </SectionCard>
          )}

          {showLive && data.live && (
            <SectionCard
              title={data.live.title}
              icon="🔴"
              subtitle={`${data.live.items.length} activos`}
              action={
                data.live.seeAllHref && (
                  <Link
                    href={data.live.seeAllHref}
                    className="text-xs font-semibold"
                    style={{ color: "var(--brand-primary)" }}
                  >
                    Ver todo →
                  </Link>
                )
              }
            >
              <ul className="space-y-2.5">
                {data.live.items.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <PulseDot tone={p.tone} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {p.meta}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {p.status}
                      </p>
                      {p.since && (
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                          {p.since}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
        </div>
      )}

      {/* ─── Top items + Trend (2-col split) ────────────────────────────── */}
      {(showTop || showTrend) && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {showTop && data.topItems && (
            <SectionCard
              title={data.topItems.title}
              icon="🏆"
              className="lg:col-span-2"
            >
              <ol className="space-y-2.5">
                {data.topItems.items.map((item, i) => (
                  <li
                    key={item.name}
                    className="flex items-center gap-3 p-2 rounded-lg"
                  >
                    <span
                      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold ${
                        i === 0
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : i === 1
                          ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          : i === 2
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                          : "bg-gray-50 text-gray-500 dark:bg-gray-800/50 dark:text-gray-500"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {item.name}
                      </p>
                      {item.category && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {item.category}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold tabular-nums text-gray-900 dark:text-white">
                        {item.count}
                      </p>
                      {item.revenue && (
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 tabular-nums">
                          {item.revenue}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </SectionCard>
          )}

          {showTrend && data.trend && (
            <SectionCard
              title={data.trend.title}
              subtitle={data.trend.subtitle}
              icon="📈"
              className="lg:col-span-3"
            >
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.trend.data}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={chartTheme.grid.stroke}
                      strokeOpacity={chartTheme.grid.strokeOpacity}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      stroke={chartTheme.axis.stroke}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke={chartTheme.axis.stroke}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={chartTheme.tooltip.contentStyle}
                      formatter={(v: number) => [v, data.trend!.valueLabel]}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--brand-primary)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: "var(--brand-primary)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Mock data by businessType ──────────────────────────────────────────────
// Para agregar un vertical: poblar la entrada correspondiente. Cada sección
// auto-se-oculta si `enabledVia` apunta a un módulo que el afiliado no tiene.

const MOCK_BY_TYPE: Partial<Record<BusinessType, MockHomeData>> = {
  // ─── Restaurant (piloto: The Little Dominican) ──────────────────────────
  restaurant: {
    greetingHint: "Servicio del almuerzo en curso — la cocina está al 78% de capacidad",
    kpis: [
      {
        label: "Ventas hoy",
        value: "$2,450",
        delta: "+12.5%",
        deltaTone: "up",
        icon: "💰",
        hint: "vs ayer a esta hora",
      },
      {
        label: "Órdenes activas",
        value: "47",
        delta: "8 mesas",
        deltaTone: "neutral",
        icon: "🍽️",
        hint: "en cocina o servidas",
        module: "orders",
      },
      {
        label: "Ticket promedio",
        value: "$52",
        delta: "+3.1%",
        deltaTone: "up",
        icon: "💳",
        hint: "vs semana anterior",
      },
      {
        label: "Reservas próximas",
        value: "5",
        delta: "próx. 3h",
        deltaTone: "neutral",
        icon: "📅",
        hint: "2 para cena",
        module: "appointments",
      },
    ],
    quickActions: [
      { label: "Nueva orden", icon: "➕", module: "orders" },
      { label: "Ver comandas", icon: "📋", module: "orders" },
      { label: "Editar carta", icon: "📖", module: "menu" },
      { label: "Reservación", icon: "📅", module: "appointments" },
      { label: "Stock crítico", icon: "📦", module: "inventory" },
      { label: "Facturas", icon: "💰", module: "invoicing" },
      { label: "QR mesas", icon: "📱", module: "qrCodes" },
    ],
    alerts: [
      {
        tone: "critical",
        icon: "📦",
        title: "2 ingredientes en stock crítico",
        detail: "Plátanos verdes (15%) y snapper fresco (25%) — reponer hoy",
        module: "inventory",
      },
      {
        tone: "warning",
        icon: "🧾",
        title: "2 facturas vencidas",
        detail: "$340 pendientes de cobro · proveedor y catering corporativo",
        module: "invoicing",
      },
      {
        tone: "warning",
        icon: "⭐",
        title: "3 reseñas nuevas sin responder",
        detail: "Google Reviews — promedio 4.7★ esta semana",
      },
    ],
    live: {
      enabledVia: "orders",
      title: "Comandas activas",
      items: [
        {
          name: "Mesa 4 · 3 items",
          meta: "Mofongo · Pollo guisado · Jugo de chinola",
          status: "En cocina",
          tone: "active",
          since: "hace 6 min",
        },
        {
          name: "Mesa 2 · 2 items",
          meta: "Arroz con pollo · Morir soñando",
          status: "Servida",
          tone: "done",
          since: "hace 12 min",
        },
        {
          name: "Mesa 7 · 4 items",
          meta: "Bandera dominicana x2 · Malta · Tres leches",
          status: "En espera",
          tone: "pending",
          since: "hace 2 min",
        },
        {
          name: "Delivery #1284",
          meta: "La Pica Pollo · 6 items",
          status: "Empacando",
          tone: "active",
          since: "hace 4 min",
        },
      ],
      seeAllHref: undefined, // se setea en runtime vía module
    },
    topItems: {
      enabledVia: "menu",
      title: "Top platos de hoy",
      items: [
        { name: "Mofongo de cerdo", count: 18, revenue: "$540", category: "Plato fuerte" },
        { name: "Pollo guisado",    count: 14, revenue: "$406", category: "Plato del día" },
        { name: "Arroz con pollo",  count: 11, revenue: "$297", category: "Plato fuerte" },
        { name: "Tostones rellenos",count:  9, revenue: "$126", category: "Entrada" },
        { name: "Tres leches",      count:  7, revenue: "$84",  category: "Postre" },
      ],
    },
    trend: {
      title: "Ventas de hoy",
      subtitle: "Últimas 8 horas · en vivo",
      valueLabel: "USD",
      data: [
        { label: "11am", value: 180 },
        { label: "12pm", value: 420 },
        { label: "1pm",  value: 640 },
        { label: "2pm",  value: 510 },
        { label: "3pm",  value: 290 },
        { label: "4pm",  value: 180 },
        { label: "5pm",  value: 120 },
        { label: "6pm",  value: 110 },
      ],
    },
  },

  // ─── Otros verticales: agregar cuando pasen a piloto ─────────────────────
  // barbershop:  {...}
  // beauty:      {...}
  // retail:      {...}
  // health:      {...}
  // media:       {...}
};
