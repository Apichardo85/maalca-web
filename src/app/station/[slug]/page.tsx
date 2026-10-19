import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { StationContent } from './StationContent';
import type { OrderRow } from '@/lib/orderTicket';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: {
    id: string;
    plan: 'free' | 'entrepreneur' | 'enterprise';
    businessType: string;
    modulosActivos: string[];
    name: string;
    timezone?: string | null;
    logoUrl?: string | null;
    primaryColor?: string | null;
  };
}

export const metadata: Metadata = { title: 'Estación de pedidos — MaalCa', robots: { index: false } };

// MODO KIOSKO: esta ruta está a propósito fuera de /space/{slug} — sin el layout del dashboard
// (sidebar, menú móvil, selector de negocios, campana de notificaciones). En la tablet de la
// cocina (Fully Kiosk) el personal solo ve esta pantalla y no tiene a dónde navegar.
// Requiere sesión igual que el dashboard (middleware protege /station).
//
// Estación de pedidos (Fase 3 del plan de La Catrina): pantalla dedicada, a diferencia de
// Cocina (kanban de 3 columnas) o Pedidos (lista administrativa) — acá solo entra lo que
// todavía NADIE atendió: pedidos Pending por aceptar (PayAtPickup/PayAtTable) y pedidos Paid
// sin AcknowledgedAt (pagados online, nadie los vio aún). Mismo gate que Cocina (módulo
// 'kitchen'): es la misma operación de pedidos, no un módulo aparte que haya que activar por
// separado en /ops.
export default async function StationPage({
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
  if (!space.business.modulosActivos.includes('kitchen')) redirect(`/space/${slug}/station`);

  let orders: OrderRow[] = [];
  try {
    const ordersRes = await fetch(`${API}/api/affiliates/${space.business.id}/orders`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
      cache: 'no-store',
    });
    if (ordersRes.ok) orders = await ordersRes.json();
  } catch {
    // orders stays [] — StationContent renders the empty ("sin pedidos pendientes") state.
  }

  return (
    <StationContent
      slug={slug}
      plan={space.business.plan}
      affiliateId={space.business.id}
      businessName={space.business.name}
      logoUrl={space.business.logoUrl ?? null}
      primaryColor={space.business.primaryColor ?? null}
      timezone={space.business.timezone ?? undefined}
      initialOrders={orders}
    />
  );
}
