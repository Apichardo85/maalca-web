import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { KitchenContent } from './KitchenContent';
import type { OrderRow } from '../orders/OrdersContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; plan: 'free' | 'entrepreneur'; businessType: string; modulosActivos: string[] };
}

// Misma carga que orders/page.tsx (mismo endpoint, mismo shape de OrderRow) — el Kitchen
// Display es otra vista sobre los mismos pedidos, filtrada a Paid/Preparing/Fulfilled en
// KitchenContent, no una fuente de datos distinta.
export default async function KitchenPage({
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

  // Cocina corre sobre el mismo Order/OrderStatus que Pedidos -- no hay nada específico de
  // restaurante en el dato, es un panel de picking/preparación genérico. Antes: solo restaurant
  // (businessType hardcoded), lo que dejaba el módulo inalcanzable aunque /ops lo activara para
  // otro tipo de negocio. Gate real ahora es el módulo activo, igual que Facturación.
  if (!space.business.modulosActivos.includes('kitchen')) redirect(`/space/${slug}/orders`);

  let orders: OrderRow[] = [];
  try {
    const ordersRes = await fetch(`${API}/api/affiliates/${space.business.id}/orders`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
      cache: 'no-store',
    });
    if (ordersRes.ok) orders = await ordersRes.json();
  } catch {
    // orders stays [] — KitchenContent renders the empty state rather than crashing the page.
  }

  return <KitchenContent slug={slug} plan={space.business.plan} affiliateId={space.business.id} initialOrders={orders} />;
}
