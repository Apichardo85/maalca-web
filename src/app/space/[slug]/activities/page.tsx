import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { ActivitiesContent } from './ActivitiesContent';
import type { Activity } from './types';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; businessType: string };
}

// Modulo Eventos/Actividades (backlog 2026-09-25, ver comentario en registry.ts y en
// Activity.cs). Lanzamiento inicial solo businessType === 'community' -- mismo gating que
// /impact. Se puede activar para otros tipos de negocio despues sin tocar el backend (la
// entidad ya es transversal), solo quitando este redirect y agregando el nav item.
export default async function ActivitiesPage({
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
  if (space.business.businessType.toLowerCase() !== 'community') redirect(`/space/${slug}`);

  const affiliateId = space.business.id;

  let initialActivities: Activity[] = [];
  try {
    const res = await fetch(`${API}/api/affiliates/${affiliateId}/activities`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliateId },
      cache: 'no-store',
    });
    if (res.ok) initialActivities = await res.json();
  } catch {
    // El listado arranca vacío en vez de tumbar la página entera si el backend no responde.
  }

  return <ActivitiesContent slug={slug} initialActivities={initialActivities} />;
}
