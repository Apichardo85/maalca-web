import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { PosContent, type PosItem } from './PosContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; businessType: string; plan: 'free' | 'entrepreneur'; currency?: 'USD' | 'DOP' };
}

export default async function PosPage({
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

  // Mismo endpoint unificado que usa el editor de catálogo (Producto/Servicio/InventoryItem
  // según BusinessType, todos mapeados a la misma forma) — el POS no necesita distinguirlos.
  let items: PosItem[] = [];
  try {
    const itemsRes = await fetch(`${API}/api/affiliates/${space.business.id}/catalog-items`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
      cache: 'no-store',
    });
    if (itemsRes.ok) items = await itemsRes.json();
  } catch {
    // items stays [] — PosContent renders the empty state rather than crashing the page.
  }

  // Solo items activos y con precio > 0 tienen sentido para cobrar en el mostrador.
  const sellable = items.filter((i) => i.status !== 'Inactive' && !i.isDemo);

  // `??` no basta — la API puede mandar "" (string vacío), no solo null/undefined, y eso
  // rompe Intl.NumberFormat con "Invalid currency code" (causó un 500 en TLD).
  const currency = space.business.currency === 'DOP' ? 'DOP' : 'USD';

  return (
    <PosContent
      slug={slug}
      affiliateId={space.business.id}
      currency={currency}
      items={sellable}
    />
  );
}
