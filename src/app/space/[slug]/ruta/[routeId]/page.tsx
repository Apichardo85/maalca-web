import { redirect, notFound } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { RouteContent } from './RouteContent';
import type { DriverSheet, ProductLite } from '@/lib/delivery';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Items del catálogo del negocio (retail): mismo endpoint que usa el punto de venta.
interface CatalogItemApi {
  id: string;
  name: string;
  price: number | null;
  status?: string | null;
  isDemo?: boolean;
}

// Una ruta del conductor: paradas, entregas, cobros y cierre. La hoja de reparto trae todo en una sola llamada.
export default async function RouteDetailPage({ params }: { params: Promise<{ slug: string; routeId: string }> }) {
  const { slug, routeId } = await params;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const spaceRes = await fetch(`${API}/api/space/${slug}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (spaceRes.status === 404) redirect('/onboarding');
  if (spaceRes.status === 403) redirect('/');
  if (!spaceRes.ok) throw new Error(`Failed to load space: ${spaceRes.status}`);

  const space = await spaceRes.json();
  if (!space.business.modulosActivos.includes('routes')) redirect(`/space/${slug}`);

  const headers = { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id };
  const base = `${API}/api/affiliates/${space.business.id}`;

  const [sheetRes, productsRes] = await Promise.all([
    fetch(`${base}/routes/${routeId}/driver-sheet`, { headers, cache: 'no-store' }),
    fetch(`${base}/catalog-items`, { headers, cache: 'no-store' }),
  ]);
  if (sheetRes.status === 404) notFound();
  if (!sheetRes.ok) throw new Error(`Failed to load route: ${sheetRes.status}`);
  const sheet: DriverSheet = await sheetRes.json();

  let products: ProductLite[] = [];
  if (productsRes.ok) {
    const body = await productsRes.json();
    const list: CatalogItemApi[] = Array.isArray(body) ? body : (body?.data ?? []);
    products = list
      .filter((p) => p.status !== 'Inactive' && !p.isDemo && p.price != null && p.price > 0)
      .map((p) => ({ id: p.id, name: p.name, price: p.price as number }));
  }

  return (
    <RouteContent
      slug={slug}
      currency={space.business.currency === 'DOP' ? 'DOP' : 'USD'}
      initialSheet={sheet}
      products={products}
    />
  );
}
