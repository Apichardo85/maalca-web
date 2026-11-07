import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { RutaContent } from './RutaContent';
import type { RouteSummary } from '@/lib/delivery';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Ruta del conductor — lista de las rutas de hoy. Gate por módulo activo, repetido acá para que la URL no sea alcanzable a mano.
export default async function RutaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const spaceRes = await fetch(`${API}/api/space/${slug}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (spaceRes.status === 404) redirect('/onboarding');
  if (spaceRes.status === 403) redirect('/');
  if (!spaceRes.ok) throw new Error(`Failed to load space: ${spaceRes.status}`);

  const space = await spaceRes.json();
  if (!space.business.modulosActivos.includes('routes')) redirect(`/space/${slug}`);

  let routes: RouteSummary[] = [];
  try {
    const res = await fetch(`${API}/api/affiliates/${space.business.id}/routes/mine`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
      cache: 'no-store',
    });
    if (res.ok) routes = await res.json();
  } catch {
    // Queda vacío: RutaContent muestra el estado vacío en vez de tronar.
  }

  return <RutaContent slug={slug} routes={routes} />;
}
