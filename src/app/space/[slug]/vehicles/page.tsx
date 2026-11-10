import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { VehiclesContent } from './VehiclesContent';
import type { DealerSettings, VehicleListing } from './types';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; businessType: string; currency?: 'USD' | 'DOP' };
}

const DEFAULT_SETTINGS: DealerSettings = {
  priceDisplay: 'base', usdToDop: null, mileageUnit: 'km', showReserved: true,
  financingEnabled: false, financingRate: null, financingTerms: [24, 36, 48, 60, 72], minDownPercent: 20,
  tradeInEnabled: false, testDriveEnabled: false,
};

// Inventario de vehiculos del Dealer (autoventa). Solo businessType === 'dealer' -- mismo gating que /programs.
export default async function VehiclesPage({
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
  const headers = { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliateId };

  let initialVehicles: VehicleListing[] = [];
  let initialSettings: DealerSettings = DEFAULT_SETTINGS;
  try {
    const [vehiclesRes, settingsRes] = await Promise.all([
      fetch(`${API}/api/affiliates/${affiliateId}/dealer-vehicles`, { headers, cache: 'no-store' }),
      fetch(`${API}/api/affiliates/${affiliateId}/dealer-settings`, { headers, cache: 'no-store' }),
    ]);
    if (vehiclesRes.ok) initialVehicles = await vehiclesRes.json();
    if (settingsRes.ok) initialSettings = await settingsRes.json();
  } catch {
    // El listado arranca vacio en vez de tumbar la pagina entera si el backend no responde.
  }

  return (
    <VehiclesContent
      slug={slug}
      currency={space.business.currency === 'DOP' ? 'DOP' : 'USD'}
      initialVehicles={initialVehicles}
      initialSettings={initialSettings}
    />
  );
}
