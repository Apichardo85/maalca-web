import Link from 'next/link';
import { getMaalcaApiToken } from '@/lib/api-auth';
import type { OpsOverview, OpsAffiliate } from './types';
import { BusinessAvatar } from './negocios/NegociosTable';

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
  // Notas nuevas del afiliado (📝) van primero — es comunicación directa esperando respuesta, no
  // un problema detectado por el sistema, y no debería poder quedar fuera del top 5 por simple
  // orden de creación del negocio.
  const topAlerts = affiliates
    .filter((a) => a.alerts.length > 0)
    .sort((a, b) => Number(b.alerts.some((x) => x.startsWith('📝'))) - Number(a.alerts.some((x) => x.startsWith('📝'))))
    .slice(0, 5);

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

      {topAlerts.length === 0 ? (
        <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <p className="px-4 py-8 text-center text-sm text-gray-400 dark:text-neutral-500">
            Nada urgente por ahora.
          </p>
        </div>
      ) : (
        // Mismas tarjetas con logo que /ops/negocios (BusinessAvatar), en vez de una lista
        // plana de texto — consistencia visual entre las dos pantallas.
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topAlerts.map((a) => (
            <Link
              key={a.id}
              href={`/ops/negocios/${a.id}`}
              className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 hover:border-[#C8102E]"
            >
              <div className="flex items-center gap-3">
                <BusinessAvatar a={a} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-gray-400 dark:text-neutral-500">/{a.slug}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {a.alerts.map((alert) => (
                  <span
                    key={alert}
                    // Mismo criterio que NegociosTable.AlertBadges — notas del afiliado (📝) en
                    // azul, alertas detectadas por el sistema en amarillo.
                    className={
                      alert.startsWith('📝')
                        ? 'inline-block rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-400'
                        : 'inline-block rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 text-[11px] font-medium text-yellow-700 dark:text-yellow-400'
                    }
                  >
                    {alert}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
