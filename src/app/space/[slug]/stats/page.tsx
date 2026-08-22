import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { StatsContent, type DetailedMetrics, type BusinessReports } from './StatsContent';
import type { SpaceKpis } from '@/components/space/KpiTile';
import type { Plan } from '@/lib/plan-limits';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; plan: Plan; businessType?: string };
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

  return (
    <StatsContent
      slug={slug}
      kpis={kpis}
      plan={data.business.plan}
      detailed={detailed}
      reports={reports}
    />
  );
}
