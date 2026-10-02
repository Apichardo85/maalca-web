import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { InscripcionesContent } from './InscripcionesContent';
import type { EventSummary, Signup } from './types';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; businessType: string };
  role: string;
}

// Inscripciones de Comunidad: voluntarios (causas de tipo "tiempo") y registros a eventos con cupo.
// Solo businessType === 'community' -- mismo gating que /activities e /impact.
export default async function InscripcionesPage({
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
  const headers = { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliateId };

  let signups: Signup[] = [];
  let events: EventSummary[] = [];
  try {
    const [signupsRes, activitiesRes] = await Promise.all([
      fetch(`${API}/api/affiliates/${affiliateId}/signups`, { headers, cache: 'no-store' }),
      fetch(`${API}/api/affiliates/${affiliateId}/activities`, { headers, cache: 'no-store' }),
    ]);
    if (signupsRes.ok) signups = await signupsRes.json();
    if (activitiesRes.ok) {
      const raw: Array<{ id: string; title: string; startsAt: string; capacity?: number | null }> = await activitiesRes.json();
      events = raw.map((a) => ({ id: a.id, title: a.title, startsAt: a.startsAt, capacity: a.capacity ?? null }));
    }
  } catch {
    // La lista arranca vacía en vez de tumbar la página si el backend no responde.
  }

  return <InscripcionesContent slug={slug} canManage={space.role !== 'Staff'} initialSignups={signups} events={events} />;
}
