import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { LeadsContent } from './LeadsContent';
import type { VehicleLead } from '../types';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; businessType: string; currency?: 'USD' | 'DOP' };
}

// Interesados del Dealer: financiamientos, "vendo mi carro", pruebas de manejo y consultas de la vitrina.
export default async function DealerLeadsPage({
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
  if (space.business.businessType.toLowerCase() !== 'dealer') redirect(`/space/${slug}`);

  const affiliateId = space.business.id;
  let initialLeads: VehicleLead[] = [];
  try {
    const res = await fetch(`${API}/api/affiliates/${affiliateId}/dealer-leads`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliateId },
      cache: 'no-store',
    });
    if (res.ok) initialLeads = await res.json();
  } catch {
    // Lista vacía en vez de tumbar la página si el backend no responde.
  }

  return (
    <LeadsContent
      slug={slug}
      currency={space.business.currency === 'DOP' ? 'DOP' : 'USD'}
      initialLeads={initialLeads}
    />
  );
}
