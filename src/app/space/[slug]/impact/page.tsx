import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { ImpactContent } from './ImpactContent';
import type { CommunityInventoryItem, CommunityRecipe, CommunityCombo, CommunityMetrics } from './types';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: { id: string; businessType: string };
}

// MaalCa Comunidad — insumos, recetas y combos que alimentan la Calculadora de impacto de la
// vitrina publica (Community.tsx: "comidas servidas este mes" / "costo promedio por plato").
// Sin esta pantalla no habia forma de cargar esos datos — el backend (CommunityService.cs) ya
// existia completo, solo faltaba la UI. Solo aplica a businessType === 'community'.
export default async function ImpactPage({
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
  if (space.business.businessType.toLowerCase() !== 'community') redirect(`/space/${slug}`);

  const affiliateId = space.business.id;
  const authHeaders = { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliateId };

  async function safeFetch<T>(path: string, fallback: T): Promise<T> {
    try {
      const res = await fetch(`${API}/api/affiliates/${affiliateId}${path}`, {
        headers: authHeaders,
        cache: 'no-store',
      });
      if (!res.ok) return fallback;
      return await res.json();
    } catch {
      return fallback;
    }
  }

  const [inventoryItems, recipes, combos, metrics] = await Promise.all([
    safeFetch<CommunityInventoryItem[]>('/inventory-items', []),
    safeFetch<CommunityRecipe[]>('/recipes', []),
    safeFetch<CommunityCombo[]>('/combos', []),
    safeFetch<CommunityMetrics | null>('/community-metrics', null),
  ]);

  return (
    <ImpactContent
      slug={slug}
      initialInventoryItems={inventoryItems}
      initialRecipes={recipes}
      initialCombos={combos}
      initialMetrics={metrics}
    />
  );
}
