import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { ProposalsContent, type ProposalRow } from './ProposalsContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; businessType: string; currency?: 'USD' | 'DOP'; modulosActivos: string[] };
}

interface CustomerRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

// Propuestas con firma/aceptación pública — Servicios/Profesionales (task #194). El cliente
// recibe un link con token, escribe su nombre y acepta — no es una firma dibujada/certificada,
// coincide con la simplicidad ya establecida en booking/reservas/checkout público.
export default async function ProposalsPage({
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
  // Proposal es genérico (título + monto + firma), sin nada atado a service/professional. Antes:
  // businessType hardcoded dejaba el módulo inalcanzable aunque /ops lo activara para otro tipo
  // de negocio. Gate real ahora es el módulo activo, igual que Facturación.
  if (!space.business.modulosActivos.includes('proposals')) {
    redirect(`/space/${slug}`);
  }

  let proposals: ProposalRow[] = [];
  let customers: CustomerRow[] = [];
  try {
    const [proposalsRes, customersRes] = await Promise.all([
      fetch(`${API}/api/affiliates/${space.business.id}/proposals`, {
        headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
        cache: 'no-store',
      }),
      fetch(`${API}/api/affiliates/${space.business.id}/customers?limit=100`, {
        headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
        cache: 'no-store',
      }),
    ]);
    if (proposalsRes.ok) proposals = await proposalsRes.json();
    if (customersRes.ok) {
      const page = await customersRes.json();
      customers = page?.data ?? [];
    }
  } catch {
    // Queda vacío — ProposalsContent renderiza el estado vacío en vez de tronar.
  }

  const currency = space.business.currency === 'DOP' ? 'DOP' : 'USD';

  return <ProposalsContent slug={slug} currency={currency} initialProposals={proposals} customers={customers} />;
}
