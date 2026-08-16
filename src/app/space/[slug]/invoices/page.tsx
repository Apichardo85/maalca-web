import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { InvoicesContent, type InvoiceRow } from './InvoicesContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; businessType: string; currency?: 'USD' | 'DOP' };
}

interface CustomerRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

// Facturación — Servicios/Profesionales, negocios que cobran por trabajo realizado en vez de
// por item de catálogo. Mismo criterio de gating que Cocina/POS/Fila: repetido acá para que la
// URL no sea alcanzable a mano si el negocio no es de este tipo.
export default async function InvoicesPage({
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
  if (!['service', 'professional'].includes(space.business.businessType.toLowerCase())) {
    redirect(`/space/${slug}`);
  }

  let invoices: InvoiceRow[] = [];
  let customers: CustomerRow[] = [];
  try {
    const [invoicesRes, customersRes] = await Promise.all([
      fetch(`${API}/api/affiliates/${space.business.id}/invoices`, {
        headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
        cache: 'no-store',
      }),
      fetch(`${API}/api/affiliates/${space.business.id}/customers?limit=100`, {
        headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
        cache: 'no-store',
      }),
    ]);
    if (invoicesRes.ok) {
      const page = await invoicesRes.json();
      invoices = page?.data ?? [];
    }
    if (customersRes.ok) {
      const page = await customersRes.json();
      customers = page?.data ?? [];
    }
  } catch {
    // Todo queda vacío — InvoicesContent renderiza el estado vacío en vez de tronar.
  }

  const currency = space.business.currency === 'DOP' ? 'DOP' : 'USD';

  return (
    <InvoicesContent
      slug={slug}
      currency={currency}
      initialInvoices={invoices}
      customers={customers}
    />
  );
}
