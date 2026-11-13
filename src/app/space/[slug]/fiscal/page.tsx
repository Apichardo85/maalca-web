import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { FiscalContent } from './FiscalContent';
import type { ElectronicInvoice, FiscalOverview } from '@/lib/fiscal';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Factura electrónica (e-CF, DGII). Gate por módulo activo, repetido acá para que la URL no sea alcanzable a mano.
export default async function FiscalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const spaceRes = await fetch(`${API}/api/space/${slug}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (spaceRes.status === 404) redirect('/onboarding');
  if (spaceRes.status === 403) redirect('/');
  if (!spaceRes.ok) throw new Error(`Failed to load space: ${spaceRes.status}`);

  const space = await spaceRes.json();
  if (!space.business.modulosActivos.includes('fiscal')) redirect(`/space/${slug}`);

  const headers = { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id };
  const base = `${API}/api/affiliates/${space.business.id}/fiscal`;

  let overview: FiscalOverview | null = null;
  let invoices: ElectronicInvoice[] = [];
  try {
    const [oRes, iRes] = await Promise.all([
      fetch(base, { headers, cache: 'no-store' }),
      fetch(`${base}/invoices?limit=50`, { headers, cache: 'no-store' }),
    ]);
    if (oRes.ok) overview = await oRes.json();
    if (iRes.ok) invoices = await iRes.json();
  } catch {
    // Queda vacío: FiscalContent muestra el estado inicial en vez de tronar.
  }

  return (
    <FiscalContent
      slug={slug}
      currency={space.business.currency === 'DOP' ? 'DOP' : 'USD'}
      initialOverview={overview}
      initialInvoices={invoices}
    />
  );
}
