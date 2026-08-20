import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { QueueContent, type QueueEntryRow } from './QueueContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; businessType: string; modulosActivos: string[] };
}

interface ServiceRow {
  id: string;
  name: string;
}

interface TeamMemberRow {
  id: string;
  name: string;
  isActive: boolean;
}

// Fila de espera para walk-ins. QueueEntry es genérico (serviceId + staff asignado) -- no hay
// nada específico de barbería en el dato, solo en el copy ("Barbero preferido"). Antes: solo
// Barber (businessType hardcoded), dejaba el módulo inalcanzable aunque /ops lo activara para
// otro tipo de negocio walk-in. Gate real ahora es el módulo activo, igual que Facturación.
export default async function QueuePage({
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
  if (!space.business.modulosActivos.includes('queue')) redirect(`/space/${slug}`);

  let entries: QueueEntryRow[] = [];
  let services: ServiceRow[] = [];
  let barbers: TeamMemberRow[] = [];
  try {
    const [queueRes, servicesRes, teamRes] = await Promise.all([
      fetch(`${API}/api/affiliates/${space.business.id}/queue`, {
        headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
        cache: 'no-store',
      }),
      fetch(`${API}/api/affiliates/${space.business.id}/services`, {
        headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
        cache: 'no-store',
      }),
      fetch(`${API}/api/affiliates/${space.business.id}/team`, {
        headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
        cache: 'no-store',
      }),
    ]);
    if (queueRes.ok) entries = await queueRes.json();
    if (servicesRes.ok) services = await servicesRes.json();
    if (teamRes.ok) barbers = await teamRes.json();
  } catch {
    // Todo queda en su default vacío — QueueContent renderiza el estado vacío en vez de tronar.
  }

  return (
    <QueueContent
      slug={slug}
      affiliateId={space.business.id}
      initialEntries={entries}
      services={services}
      barbers={barbers.filter((b) => b.isActive)}
    />
  );
}
