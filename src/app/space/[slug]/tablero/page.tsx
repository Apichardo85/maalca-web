import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { TableroContent } from './TableroContent';
import type { AgingReport } from '@/lib/receivables';
import type { Anaquel, OwnerBoardToday } from '@/lib/delivery';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Tablero del dueño: lo que pasa hoy en la operación. Gate por módulo de rutas activo, repetido acá para que la URL no sea alcanzable a mano.
export default async function TableroPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const spaceRes = await fetch(`${API}/api/space/${slug}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (spaceRes.status === 404) redirect('/onboarding');
  if (spaceRes.status === 403) redirect('/');
  if (!spaceRes.ok) throw new Error(`Failed to load space: ${spaceRes.status}`);

  const space = await spaceRes.json();
  const active: string[] = space.business.modulosActivos ?? [];
  if (!active.includes('routes')) redirect(`/space/${slug}`);

  const h = { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id };
  const base = `${API}/api/affiliates/${space.business.id}`;
  // Cada pieza falla por separado: si un endpoint no responde, esa tarjeta queda vacía y el resto sigue.
  const getJson = async <T,>(url: string): Promise<T | null> => {
    try {
      const r = await fetch(url, { headers: h, cache: 'no-store' });
      return r.ok ? ((await r.json()) as T) : null;
    } catch {
      return null;
    }
  };
  const [today, aging, anaqueles] = await Promise.all([
    getJson<OwnerBoardToday>(`${base}/board/today`),
    active.includes('contracts') ? getJson<AgingReport>(`${base}/receivables/aging`) : null,
    getJson<Anaquel[]>(`${base}/anaqueles`),
  ]);

  return (
    <TableroContent
      slug={slug}
      currency={space.business.currency === 'DOP' ? 'DOP' : 'USD'}
      hasContracts={active.includes('contracts')}
      initialToday={today}
      initialAging={aging}
      initialAnaqueles={Array.isArray(anaqueles) ? anaqueles : []}
    />
  );
}
