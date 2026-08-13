import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { TeamContent, type TeamMember } from './TeamContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; plan: 'free' | 'entrepreneur' };
  role: string;
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const spaceRes = await fetch(`${API}/api/space/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (spaceRes.status === 404) redirect('/onboarding');
  if (spaceRes.status === 403) redirect('/');
  if (!spaceRes.ok) throw new Error(`Failed to load space: ${spaceRes.status}`);

  const space: SpaceResponse = await spaceRes.json();

  // Equipo es solo para el Owner del negocio — un Manager/Staff que escriba la URL a mano cae
  // acá pero no ve nada útil, así que lo mandamos al Dashboard directamente.
  if (space.role !== 'Owner') redirect(`/space/${slug}`);

  let team: TeamMember[] = [];
  try {
    const teamRes = await fetch(`${API}/api/affiliates/${space.business.id}/collaborators`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
      cache: 'no-store',
    });
    if (teamRes.ok) team = await teamRes.json();
  } catch {
    // team stays [] — TeamContent renders the empty state rather than crashing the page.
  }

  return <TeamContent slug={slug} plan={space.business.plan} initialTeam={team} />;
}
