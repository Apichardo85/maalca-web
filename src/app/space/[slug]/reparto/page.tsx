import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { RepartoContent } from './RepartoContent';
import type { AdminRoute, DriverOption, UnbilledReport, Vehicle } from '@/lib/delivery';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface CustomerRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface TeamRow {
  id: string;
  name: string;
  isActive?: boolean;
}

// Reparto (admin): vehículos, planificador de rutas y facturación por ciclo. La PWA del conductor vive en /ruta.
export default async function RepartoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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

  let customers: CustomerRow[] = [];
  let vehicles: Vehicle[] = [];
  let routes: AdminRoute[] = [];
  let drivers: DriverOption[] = [];
  let unbilled: UnbilledReport | null = null;
  try {
    const [cRes, vRes, rRes, tRes, uRes] = await Promise.all([
      fetch(`${base}/customers?limit=1000`, { headers, cache: 'no-store' }),
      fetch(`${base}/vehicles`, { headers, cache: 'no-store' }),
      fetch(`${base}/routes`, { headers, cache: 'no-store' }),
      fetch(`${base}/team`, { headers, cache: 'no-store' }),
      fetch(`${base}/billing/unbilled-deliveries`, { headers, cache: 'no-store' }),
    ]);
    if (cRes.ok) customers = (await cRes.json())?.data ?? [];
    if (vRes.ok) vehicles = await vRes.json();
    if (rRes.ok) routes = await rRes.json();
    if (tRes.ok) {
      const body = await tRes.json();
      const list: TeamRow[] = Array.isArray(body) ? body : (body?.data ?? []);
      drivers = list.filter((t) => t.isActive !== false).map((t) => ({ id: t.id, name: t.name }));
    }
    if (uRes.ok) unbilled = await uRes.json();
  } catch {
    // Quedan vacíos: RepartoContent muestra estados vacíos en vez de tronar.
  }

  return (
    <RepartoContent
      slug={slug}
      currency={space.business.currency === 'DOP' ? 'DOP' : 'USD'}
      customers={customers}
      initialVehicles={vehicles}
      initialRoutes={routes}
      drivers={drivers}
      initialUnbilled={unbilled}
    />
  );
}
