import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { CalidadContent } from './CalidadContent';
import type { WaterMaintenance, WaterSummary, WaterTest } from '@/lib/water-quality';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Calidad del agua. Gate por módulo activo, repetido acá para que la URL no sea alcanzable a mano.
export default async function CalidadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const spaceRes = await fetch(`${API}/api/space/${slug}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (spaceRes.status === 404) redirect('/onboarding');
  if (spaceRes.status === 403) redirect('/');
  if (!spaceRes.ok) throw new Error(`Failed to load space: ${spaceRes.status}`);

  const space = await spaceRes.json();
  if (!space.business.modulosActivos.includes('quality')) redirect(`/space/${slug}`);

  const headers = { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id };
  const base = `${API}/api/affiliates/${space.business.id}/water-quality`;

  let tests: WaterTest[] = [];
  let maintenance: WaterMaintenance[] = [];
  let summary: WaterSummary | null = null;
  try {
    const [tRes, mRes, sRes] = await Promise.all([
      fetch(`${base}/tests`, { headers, cache: 'no-store' }),
      fetch(`${base}/maintenance`, { headers, cache: 'no-store' }),
      fetch(`${base}/summary`, { headers, cache: 'no-store' }),
    ]);
    if (tRes.ok) tests = await tRes.json();
    if (mRes.ok) maintenance = await mRes.json();
    if (sRes.ok) summary = await sRes.json();
  } catch {
    // Queda vacío: CalidadContent muestra el estado vacío en vez de tronar.
  }

  return <CalidadContent slug={slug} initialTests={tests} initialMaintenance={maintenance} initialSummary={summary} />;
}
