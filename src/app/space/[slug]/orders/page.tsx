import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { OrdersContent, type OrderRow } from './OrdersContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; plan: 'free' | 'entrepreneur' };
}

export default async function OrdersPage({
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

  // Mismo patrón que stats/page.tsx: X-Affiliate-Id junto al bearer token, tenant-scoped.
  let orders: OrderRow[] = [];
  try {
    const ordersRes = await fetch(`${API}/api/affiliates/${space.business.id}/orders`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
      cache: 'no-store',
    });
    if (ordersRes.ok) orders = await ordersRes.json();
  } catch {
    // orders stays [] — OrdersContent renders the empty state rather than crashing the page.
  }

  return <OrdersContent slug={slug} plan={space.business.plan} initialOrders={orders} />;
}
