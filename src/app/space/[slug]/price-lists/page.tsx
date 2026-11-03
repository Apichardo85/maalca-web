import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { PriceListsContent, type PriceListRow } from './PriceListsContent';
import type { StoreCustomerRow, StoreSettings } from './MembersPanel';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; modulosActivos: string[]; currency?: string | null };
}

// Listas de precio (Miembro, Mayorista…) — módulo "pricelists". Mismo patrón que modifiers/page.tsx.
export default async function PriceListsPage({ params }: { params: Promise<{ slug: string }> }) {
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
  if (!space.business.modulosActivos.includes('pricelists')) redirect(`/space/${slug}`);

  let lists: PriceListRow[] = [];
  try {
    const res = await fetch(`${API}/api/affiliates/${space.business.id}/price-lists`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
      cache: 'no-store',
    });
    if (res.ok) lists = await res.json();
  } catch {
    // Queda vacío — PriceListsContent muestra el estado vacío.
  }

  const headers = { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id };
  let members: StoreCustomerRow[] = [];
  let settings: StoreSettings | null = null;
  try {
    const [mRes, sRes] = await Promise.all([
      fetch(`${API}/api/affiliates/${space.business.id}/store-customers`, { headers, cache: 'no-store' }),
      fetch(`${API}/api/affiliates/${space.business.id}/store-settings`, { headers, cache: 'no-store' }),
    ]);
    if (mRes.ok) members = await mRes.json();
    if (sRes.ok) settings = await sRes.json();
  } catch {
    // Vacío/null — el panel de miembros usa los defaults (con aprobación, sin miembros).
  }

  return (
    <PriceListsContent
      slug={slug}
      initialLists={lists}
      currency={space.business.currency === 'DOP' ? 'DOP' : 'USD'}
      initialMembers={members}
      initialSettings={settings}
    />
  );
}
