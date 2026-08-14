import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { PersonalContent, type PersonalMember } from './PersonalContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; businessType: string; plan: 'free' | 'entrepreneur' };
  role: string;
}

export default async function PersonalPage({
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

  // Staff no gestiona al resto del personal, solo lo consulta — igual que otras acciones de
  // negocio (ver gating "role != Staff" en Program.cs para /api/affiliates/{id}/team).
  const canManage = space.role !== 'Staff';

  let personal: PersonalMember[] = [];
  try {
    const res = await fetch(`${API}/api/affiliates/${space.business.id}/team`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
      cache: 'no-store',
    });
    if (res.ok) personal = await res.json();
  } catch {
    // personal stays [] — PersonalContent renders the empty state rather than crashing.
  }

  return (
    <PersonalContent
      slug={slug}
      businessType={space.business.businessType}
      canManage={canManage}
      initialPersonal={personal}
    />
  );
}
