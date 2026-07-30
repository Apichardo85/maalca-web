import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { StatsContent, type DetailedMetrics, type MetricsDebugInfo } from './StatsContent';
import type { SpaceKpis } from '@/components/space/KpiTile';
import type { Plan } from '@/lib/plan-limits';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; plan: Plan };
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
  //
  // TEMPORARY — debugInfo is surfaced as a visible banner on the page itself (see
  // StatsContent's DebugBanner) so this can be diagnosed without pulling Vercel Runtime Logs.
  // The KpisDto on /api/space/{slug} above counts ALL-TIME events (no date filter), while
  // /metrics/detailed filters to the last 30 days — if real events are older than 30 days,
  // a 200 OK with all-zero totals is a legitimate answer, not a fetch failure. Remove
  // debugInfo/DebugBanner once the real cause here is confirmed.
  let detailed: DetailedMetrics | null = null;
  let debugInfo: MetricsDebugInfo;
  try {
    const metricsRes = await fetch(`${API}/api/affiliates/${data.business.id}/metrics/detailed?days=30`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': data.business.id },
      cache: 'no-store',
    });
    if (metricsRes.ok) {
      detailed = await metricsRes.json();
      const totals = detailed!.dailyCounts.reduce(
        (acc, d) => ({ pv: acc.pv + d.pageViews, qr: acc.qr + d.qrScans, cc: acc.cc + d.canalClicks }),
        { pv: 0, qr: 0, cc: 0 },
      );
      debugInfo = {
        ok: true,
        status: metricsRes.status,
        dailyCountsLength: detailed!.dailyCounts.length,
        pageViewsSum: totals.pv,
        qrScansSum: totals.qr,
        canalClicksSum: totals.cc,
        byCanalLength: detailed!.byCanal.length,
      };
    } else {
      const body = await metricsRes.text().catch(() => '<unreadable body>');
      debugInfo = { ok: false, status: metricsRes.status, error: body || '<empty body>' };
    }
  } catch (err) {
    debugInfo = { ok: false, status: 0, error: err instanceof Error ? err.message : String(err) };
    // detailed stays null — StatsContent renders the empty state rather than crashing the page.
  }

  return <StatsContent kpis={kpis} plan={data.business.plan} detailed={detailed} debugInfo={debugInfo} />;
}
