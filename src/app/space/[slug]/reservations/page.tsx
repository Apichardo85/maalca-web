import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { ReservationsContent, type ReservationRow } from './ReservationsContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; businessType: string };
}

interface CustomerRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

// Reservas de mesa — solo Restaurante. Deliberadamente separado de /agenda (Appointment): ver
// docs/audits/business-type-flows-audit.md y TableReservation.cs en maalca-api para el porqué.
// Mismo criterio de gating que Cocina/POS/Fila, repetido acá para que la URL no sea alcanzable a
// mano si el negocio no es Restaurant.
export default async function ReservationsPage({
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
  if (space.business.businessType.toLowerCase() !== 'restaurant') redirect(`/space/${slug}`);

  let reservations: ReservationRow[] = [];
  let customers: CustomerRow[] = [];
  try {
    const [reservationsRes, customersRes] = await Promise.all([
      fetch(`${API}/api/affiliates/${space.business.id}/reservations`, {
        headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
        cache: 'no-store',
      }),
      fetch(`${API}/api/affiliates/${space.business.id}/customers?limit=100`, {
        headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
        cache: 'no-store',
      }),
    ]);
    if (reservationsRes.ok) {
      const paginated = await reservationsRes.json();
      reservations = paginated.data ?? [];
    }
    if (customersRes.ok) {
      const page = await customersRes.json();
      customers = page?.data ?? [];
    }
  } catch {
    // Queda vacío — ReservationsContent renderiza el estado vacío en vez de tronar.
  }

  return (
    <ReservationsContent
      slug={slug}
      affiliateId={space.business.id}
      initialReservations={reservations}
      customers={customers}
    />
  );
}
