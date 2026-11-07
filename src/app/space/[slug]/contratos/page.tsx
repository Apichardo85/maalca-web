import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { ContratosContent } from './ContratosContent';
import type { AgingReport, ContractRow } from '@/lib/receivables';
import { EMPTY_AGING } from '@/lib/receivables';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: {
    id: string;
    name: string;
    businessType: string;
    currency?: 'USD' | 'DOP';
    modulosActivos: string[];
  };
}

interface CustomerRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

// Contratos y cobros — contratos por cliente, cuentas por cobrar (abonos, estado de cuenta, antigüedad) e
// importación masiva de clientes. Gate por módulo activo, repetido acá para que la URL no sea alcanzable a mano.
export default async function ContratosPage({ params }: { params: Promise<{ slug: string }> }) {
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
  if (!space.business.modulosActivos.includes('contracts')) redirect(`/space/${slug}`);

  const headers = { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id };
  const base = `${API}/api/affiliates/${space.business.id}`;

  let customers: CustomerRow[] = [];
  let contracts: ContractRow[] = [];
  let aging: AgingReport = EMPTY_AGING;
  try {
    const [customersRes, contractsRes, agingRes] = await Promise.all([
      fetch(`${base}/customers?limit=1000`, { headers, cache: 'no-store' }),
      fetch(`${base}/contracts`, { headers, cache: 'no-store' }),
      fetch(`${base}/receivables/aging`, { headers, cache: 'no-store' }),
    ]);
    if (customersRes.ok) customers = (await customersRes.json())?.data ?? [];
    if (contractsRes.ok) {
      const body = await contractsRes.json();
      contracts = Array.isArray(body) ? body : (body?.data ?? []);
    }
    if (agingRes.ok) aging = await agingRes.json();
  } catch {
    // Quedan vacíos: ContratosContent muestra el estado vacío en vez de tronar.
  }

  return (
    <ContratosContent
      slug={slug}
      currency={space.business.currency === 'DOP' ? 'DOP' : 'USD'}
      customers={customers}
      initialContracts={contracts}
      initialAging={aging}
    />
  );
}
