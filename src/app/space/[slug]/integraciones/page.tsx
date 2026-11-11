import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { IntegracionesContent } from './IntegracionesContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Integraciones del negocio con sistemas externos (hoy: Clover). Solo dueño/gerente; la API lo vuelve a validar.
export default async function IntegracionesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const spaceRes = await fetch(`${API}/api/space/${slug}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (spaceRes.status === 404) redirect('/onboarding');
  if (spaceRes.status === 403) redirect('/');
  if (!spaceRes.ok) throw new Error(`Failed to load space: ${spaceRes.status}`);
  const space = await spaceRes.json();

  return <IntegracionesContent slug={slug} currency={space.business.currency === 'DOP' ? 'DOP' : 'USD'} />;
}
