import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { ClientesContent, type CustomerRow } from './ClientesContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; currency?: 'USD' | 'DOP' };
}

// Clientes (tarea #249) — pantalla CRM mínima: lista + ficha con historial real (citas,
// facturas, reservas, visitas a la fila, propuestas). El backend (Customer.cs) ya existía desde
// antes de esta tarea, con CRUD completo pero sin ninguna pantalla que lo consumiera — esto lo
// termina de cablear. Ver investigación previa: Appointment/Invoice ya vinculaban a Customer,
// Queue/Reservations/Proposals se vincularon recién en esta tarea (#244).
export default async function ClientesPage({
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

  let customers: CustomerRow[] = [];
  try {
    const res = await fetch(`${API}/api/affiliates/${space.business.id}/customers?limit=100`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      customers = json?.data ?? [];
    }
  } catch {
    // Queda vacío — ClientesContent renderiza el estado vacío en vez de tronar.
  }

  return <ClientesContent slug={slug} initialCustomers={customers} />;
}
