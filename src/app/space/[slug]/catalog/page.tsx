import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { CatalogView } from './CatalogView';
import type { Plan } from '@/lib/plan-limits';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface CatalogItem {
  id: string;
  name: string;
  category: string | null;
  isDemo: boolean;
  active: boolean;
  imageUrl?: string | null;
}

interface RawCatalogItem extends CatalogItem {
  image_url?: string | null;
}

interface SpaceData {
  business: { plan: Plan };
  items: RawCatalogItem[];
  productCount: number;
}

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  // Deduped with layout.tsx fetch — no extra network round-trip
  const res = await fetch(`${API}/api/space/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (res.status === 404) redirect('/onboarding');
  if (res.status === 403) redirect('/');
  if (!res.ok) throw new Error(`Failed to load space: ${res.status}`);

  const data: SpaceData = await res.json();

  const items: CatalogItem[] = data.items.map((item) => ({
    id:       item.id,
    name:     item.name,
    category: item.category,
    isDemo:   item.isDemo,
    active:   item.active,
    imageUrl: item.imageUrl ?? item.image_url ?? null,
  }));

  return (
    <CatalogView
      slug={slug}
      plan={data.business.plan}
      items={items}
      productCount={data.productCount}
    />
  );
}
