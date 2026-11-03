import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import type { ShippingMethodRow } from '@/lib/commerce';
import { ShippingContent } from './ShippingContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; modulosActivos: string[]; currency?: string | null };
}

// Envíos a domicilio — módulo "shipping". Mismo patrón que modifiers/page.tsx.
export default async function ShippingPage({ params }: { params: Promise<{ slug: string }> }) {
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
  if (!space.business.modulosActivos.includes('shipping')) redirect(`/space/${slug}`);

  let methods: ShippingMethodRow[] = [];
  try {
    const res = await fetch(`${API}/api/affiliates/${space.business.id}/shipping-methods`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
      cache: 'no-store',
    });
    if (res.ok) methods = await res.json();
  } catch {
    // Queda vacío — ShippingContent muestra el estado vacío.
  }

  return <ShippingContent slug={slug} initialMethods={methods} currency={space.business.currency === 'DOP' ? 'DOP' : 'USD'} />;
}
