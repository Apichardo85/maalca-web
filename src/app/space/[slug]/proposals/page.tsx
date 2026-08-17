import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { ProposalsContent, type ProposalRow } from './ProposalsContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; businessType: string; currency?: 'USD' | 'DOP' };
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
  if (!['service', 'professional'].includes(space.business.businessType.toLowerCase())) {
    redirect(`/space/${slug}`);
  }

  let proposals: ProposalRow[] = [];
  try {
    const res = await fetch(`${API}/api/affiliates/${space.business.id}/proposals`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id },
      cache: 'no-store',
    });
    if (res.ok) proposals = await res.json();
  } catch {
    // Queda vacío — ProposalsContent renderiza el estado vacío en vez de tronar.
  }

  const currency = space.business.currency === 'DOP' ? 'DOP' : 'USD';

  return <ProposalsContent slug={slug} currency={currency} initialProposals={proposals} />;
}
