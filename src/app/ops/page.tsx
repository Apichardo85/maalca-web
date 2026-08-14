import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { OpsContent, type OpsOverview, type OpsAffiliate, type OpsTeamMember } from './OpsContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Fase 60 — panel de operaciones. Ruta de plataforma, no de un afiliado: por eso vive en
// /ops (top-level) y no en /space/{slug}/algo — no tiene sentido colgarla de un negocio.
export default async function OpsPage() {
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const statusRes = await fetch(`${API}/api/me/admin-status`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const status = statusRes.ok ? await statusRes.json() : { isPlatformAdmin: false, role: null };

  // No es "not found" — para todos los demás usuarios /ops simplemente no existe.
  if (!status.isPlatformAdmin) redirect('/');

  const [overviewRes, affiliatesRes, teamRes] = await Promise.all([
    fetch(`${API}/api/ops/overview`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
    fetch(`${API}/api/ops/affiliates`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
    fetch(`${API}/api/ops/team`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
  ]);

  const overview: OpsOverview | null = overviewRes.ok ? await overviewRes.json() : null;
  const affiliates: OpsAffiliate[] = affiliatesRes.ok ? await affiliatesRes.json() : [];
  const team: OpsTeamMember[] = teamRes.ok ? await teamRes.json() : [];

  return (
    <OpsContent
      overview={overview}
      initialAffiliates={affiliates}
      initialTeam={team}
      role={status.role ?? null}
    />
  );
}
