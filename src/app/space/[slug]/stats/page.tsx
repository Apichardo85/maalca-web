import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { StatsContent, type DetailedMetrics, type BusinessReports } from './StatsContent';
import type { SpaceKpis } from '@/components/space/KpiTile';
import type { Plan } from '@/lib/plan-limits';
import type { OperationData, MonthPoint } from './OperationStats';
import type { AgingReport } from '@/lib/receivables';
import type { AdminRoute, Anaquel } from '@/lib/delivery';
import { currentMonth, shiftMonth, type ProfitReport } from '@/lib/expenses';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; plan: Plan; businessType?: string; currency?: string; modulosActivos?: string[] };
  productCount: number;
  /** Guarded with a fallback below in case a given deploy predates this field. */
  kpis?: SpaceKpis;
}

export default async function StatsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const res = await fetch(`${API}/api/space/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (res.status === 404) redirect('/onboarding');
  if (res.status === 403) redirect('/');
  if (!res.ok) throw new Error(`Failed to load space: ${res.status}`);

  const data: SpaceResponse = await res.json();
  const kpis: SpaceKpis = data.kpis ?? {
    visitas:         { valor: null, disponible: false },
    itemsPublicados: { valor: data.productCount, disponible: true },
    escaneosQr:      { valor: null, disponible: false },
    clicsCanales:    { valor: null, disponible: false },
  };

  // GET /api/affiliates/{id}/metrics/detailed — same maalca-api tenant-scoped route family as
  // the canales/catalog proxies. X-Affiliate-Id is required alongside the bearer token: the
  // API's auth middleware resolves the `active_affiliate_id` claim from that header (falling
  // back to the user's oldest affiliate otherwise), not from the token alone — a user managing
  // more than one business would silently get the wrong one's data without it.
  let detailed: DetailedMetrics | null = null;
  let reports: BusinessReports | null = null;
  try {
    const [metricsRes, reportsRes] = await Promise.all([
      fetch(`${API}/api/affiliates/${data.business.id}/metrics/detailed?days=30`, {
        headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': data.business.id },
        cache: 'no-store',
      }),
      fetch(`${API}/api/affiliates/${data.business.id}/metrics/reports?days=30`, {
        headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': data.business.id },
        cache: 'no-store',
      }),
    ]);
    if (metricsRes.ok) detailed = await metricsRes.json();
    if (reportsRes.ok) reports = await reportsRes.json();
  } catch {
    // detailed/reports stay null — StatsContent renders the empty state rather than crashing.
  }

  // Operación (cobros, utilidad, reparto): solo para los módulos que el negocio tiene activos. Cada pieza
  // falla por separado: si un endpoint no responde, esa sección se muestra vacía y el resto sigue.
  const active = data.business.modulosActivos ?? [];
  const hasContracts = active.includes('contracts');
  const hasExpenses = active.includes('expenses');
  const hasRoutes = active.includes('routes');
  let operation: OperationData | null = null;
  if (hasContracts || hasExpenses || hasRoutes) {
    const base = `${API}/api/affiliates/${data.business.id}`;
    const h = { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': data.business.id };
    const getJson = async <T,>(url: string): Promise<T | null> => {
      try {
        const r = await fetch(url, { headers: h, cache: 'no-store' });
        return r.ok ? ((await r.json()) as T) : null;
      } catch {
        return null;
      }
    };
    const thisMonth = currentMonth();
    const monthKeys = [5, 4, 3, 2, 1, 0].map((n) => shiftMonth(thisMonth, -n));
    const [aging, profits, routes, anaqueles] = await Promise.all([
      hasContracts ? getJson<AgingReport>(`${base}/receivables/aging`) : null,
      hasExpenses ? Promise.all(monthKeys.map((m) => getJson<ProfitReport>(`${base}/reports/profit?month=${m}`))) : [],
      hasRoutes ? getJson<AdminRoute[]>(`${base}/routes`) : null,
      hasRoutes ? getJson<Anaquel[]>(`${base}/anaqueles`) : null,
    ]);
    const months: MonthPoint[] = hasExpenses
      ? monthKeys.map((m, i) => ({
          month: m,
          salesTotal: profits[i]?.salesTotal ?? 0,
          expensesTotal: profits[i]?.expensesTotal ?? 0,
          cashProfit: profits[i]?.cashProfit ?? 0,
        }))
      : [];
    const monthRoutes = (Array.isArray(routes) ? routes : []).filter((r) => r.routeDate?.startsWith(thisMonth) && r.status !== 'cancelled');
    const shelves = Array.isArray(anaqueles) ? anaqueles : [];
    operation = {
      currency: data.business.currency === 'DOP' ? 'DOP' : 'USD',
      hasContracts,
      hasExpenses,
      hasRoutes,
      aging,
      months,
      routes: hasRoutes
        ? {
            total: monthRoutes.length,
            completed: monthRoutes.filter((r) => r.status === 'completed').length,
            stopsDone: monthRoutes.reduce((n, r) => n + r.stopsDone, 0),
            stopsTotal: monthRoutes.reduce((n, r) => n + r.stopsTotal, 0),
          }
        : null,
      anaqueles: hasRoutes
        ? {
            total: shelves.length,
            needsRestock: shelves.filter((a) => a.status === 'pendiente_reposicion').length,
            outOfService: shelves.filter((a) => a.status === 'fuera_servicio').length,
          }
        : null,
    };
  }

  return (
    <StatsContent
      slug={slug}
      kpis={kpis}
      plan={data.business.plan}
      detailed={detailed}
      reports={reports}
      operation={operation}
    />
  );
}
