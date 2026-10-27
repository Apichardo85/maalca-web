import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { StationSetup } from './StationSetup';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Página del DASHBOARD para la Estación de pedidos (no la estación en sí). La estación vive en
// /station/{slug} — fuera del dashboard, en modo kiosko, sin salida — así que desde el menú no
// se entra directo ahí (el dueño quedaría atrapado en su celular): se llega aquí, con el link,
// QR, "abrir en esta pantalla" y la guía de Fully Kiosk. Todo se configura de punta a punta.
export default async function StationSetupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const res = await fetch(`${API}/api/space/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (res.status === 404) redirect('/onboarding');
  if (res.status === 403) redirect('/');
  if (!res.ok) throw new Error(`Failed to load space: ${res.status}`);
  const { business } = await res.json();
  if (!business.modulosActivos?.includes('station')) redirect(`/space/${slug}/orders`);

  return <StationSetup slug={slug} plan={business.plan} businessName={business.name} />;
}
