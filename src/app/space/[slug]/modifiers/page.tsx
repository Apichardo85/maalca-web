import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { ModifiersContent, type ModifierGroupRow } from './ModifiersContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; businessType: string; modulosActivos: string[] };
}

// Guarniciones/modificadores reusables (Restaurante) — grupos a nivel de afiliado que luego se
// asignan a platos individuales desde Catálogo (ver EditForm.tsx). Mismo patrón que
// inventory/page.tsx.
export default async function ModifiersPage({
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
  if (!space.business.modulosActivos.includes('modifiers')) redirect(`/space/${slug}`);

  let groups: ModifierGroupRow[] = [];
  try {
    const res = await fetch(`${API}/api/affiliates/${space.business.id}/modifier-groups`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
      cache: 'no-store',
    });
    if (res.ok) groups = await res.json();
  } catch {
    // Queda vacío — ModifiersContent renderiza el estado vacío en vez de tronar.
  }

  return <ModifiersContent slug={slug} initialGroups={groups} />;
}
