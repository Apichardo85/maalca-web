import { redirect } from 'next/navigation';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';
import NewItemForm from './NewItemForm';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function NewCatalogItemPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { from } = await searchParams;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const affiliate = await resolveAffiliateIdBySlug(slug, token);

  // Needed to gate the Restaurant-only fields (periods/weekDays/flags/featured/popular).
  const spaceRes = await fetch(`${API}/api/space/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const spaceData = spaceRes.ok ? await spaceRes.json() : null;
  const businessType: string | null = spaceData?.business?.businessType ?? null;

  // Receta (Restaurante) — igual que en edit/page.tsx: solo carga el inventario si aplica,
  // para no pagar el round-trip en los demás tipos de negocio.
  let inventoryItems: { id: string; name: string; unitPrice?: number }[] = [];
  if (businessType === 'Restaurant' && affiliate) {
    const invRes = await fetch(`${API}/api/affiliates/${affiliate.id}/inventory?page=1`, {
      headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliate.id },
      cache: 'no-store',
    });
    if (invRes.ok) {
      const page = await invRes.json().catch(() => null);
      inventoryItems = Array.isArray(page?.data)
        ? page.data.map((i: { id: string; name: string; unitPrice?: number }) => ({ id: i.id, name: i.name, unitPrice: i.unitPrice }))
        : [];
    }
  }

  return <NewItemForm slug={slug} businessType={businessType} from={from} inventoryItems={inventoryItems} />;
}
