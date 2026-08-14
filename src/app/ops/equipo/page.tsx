import { getMaalcaApiToken } from '@/lib/api-auth';
import type { OpsTeamMember } from '../types';
import { TeamSection } from './TeamSection';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default async function OpsEquipoPage() {
  const token = await getMaalcaApiToken();
  if (!token) return null;

  const res = await fetch(`${API}/api/ops/team`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const team: OpsTeamMember[] = res.ok ? await res.json() : [];

  return <TeamSection initialTeam={team} />;
}
