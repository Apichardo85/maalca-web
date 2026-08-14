import Link from 'next/link';
import { getMaalcaApiToken } from '@/lib/api-auth';
import type { OpsOverview, OpsAffiliate } from './types';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

// Resumen — lo primero que ves al entrar a /ops. Solo KPIs + lo urgente (negocios con
// alertas activas); la tabla completa vive en /ops/negocios.
export default async function OpsResumenPage() {
  const token = await getMaalcaApiToken();
  if (!token) return null; // el layout ya validó auth/admin — esto es solo defensivo

  const [overviewRes, affiliatesRes] = await Promise.all([
    fetch(`${API}/api/ops/overview`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
    fetch(`${API}/api/ops/affiliates`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
  ]);

  const overview: OpsOverview | null = overviewRes.ok ? await overviewRes.json() : null;
  const affiliates: OpsAffiliate[] = affiliatesRes.ok ? await affiliatesRes.json() : [];
  const topAlerts = affiliates.filter((a) => a.alerts.length > 0).slice(0, 5);

  return (
    <div>
      {overview && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Kpi label="Negocios" value={String(overview.totalAffiliates)} />
          <Kpi label="Emprendedor" value={String(overview.entrepreneurCount)} />
          <Kpi label="Gratis" value={String(overview.freeCount)} />
          <Kpi label="MRR" value={`$${overview.mrrUsd.toLocaleString()}`} />
          <Kpi label="Nuevos este mes" value={String(overview.newThisMonth)} />
          <Kpi label="Publicados" value={String(overview.publishedCount)} />
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Necesitan atención</h2>
        <Link href="/ops/negocios" className="text-xs font-medium text-[#C8102E] hover:underline">
          Ver todos los negocios →
        </Link>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        {topAlerts.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400 dark:text-neutral-500">
            Nada urgente por ahora.
          </p>
        ) : (
          topAlerts.map((a) => (
            <Link
              key={a.id}
              href={`/ops/negocios/${a.id}`}
              className="flex items-center justify-between gap-4 border-b border-gray-100 dark:border-neutral-800/60 px-4 py-3 last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-800/40"
            >
              <div>
                <p className="text-sm font-medium">{a.name}</p>
                <p className="text-xs text-gray-400 dark:text-neutral-500">/{a.slug}</p>
              </div>
              <div className="flex flex-wrap justify-end gap-1">
                {a.alerts.map((alert) => (
                  <span
                    key={alert}
                    className="inline-block rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 text-[11px] font-medium text-yellow-700 dark:text-yellow-400"
                  >
                    {alert}
                  </span>
                ))}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
