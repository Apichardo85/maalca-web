import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { InventoryContent, type InventoryItemRow } from './InventoryContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; businessType: string; modulosActivos: string[] };
}

// Inventario de insumos/consumibles (Restaurante/Retail) — separado de Product.Stock (que se
// descuenta solo al vender, ver tarea #175). Acá el dueño ve el stock actual, recibe alerta de
// mínimo y registra entradas/salidas manuales (recibir mercancía, ajustar por pérdida, etc.).
export default async function InventoryPage({
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
  if (!space.business.modulosActivos.includes('inventory')) redirect(`/space/${slug}`);

  let items: InventoryItemRow[] = [];
  try {
    const res = await fetch(`${API}/api/affiliates/${space.business.id}/inventory?page=1`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
      cache: 'no-store',
    });
    if (res.ok) {
      const page = await res.json();
      items = page?.data ?? [];
    }
  } catch {
    // Queda vacío — InventoryContent renderiza el estado vacío en vez de tronar.
  }

  return <InventoryContent slug={slug} affiliateId={space.business.id} initialItems={items} />;
}
