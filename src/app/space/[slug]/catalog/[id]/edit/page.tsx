import { notFound, redirect } from 'next/navigation';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';
import EditForm from './EditForm';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function EditCatalogItemPage({ params, searchParams }: PageProps) {
  const { slug, id } = await params;
  const { from } = await searchParams;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) notFound();

  // Needed to gate the Restaurant-only fields (periods/weekDays/flags/featured/popular).
  const spaceRes = await fetch(`${API}/api/space/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const spaceData = spaceRes.ok ? await spaceRes.json() : null;
  const businessType: string | null = spaceData?.business?.businessType ?? null;

  const res = await fetch(
    `${API}/api/affiliates/${affiliate.id}/catalog-items/${id}`,
    {
      headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliate.id },
      cache: 'no-store',
    },
  );

  if (res.status === 404) notFound();
  if (res.status === 403) redirect('/');
  if (!res.ok) throw new Error(`Failed to load item: ${res.status}`);

  const raw = await res.json();
  const item = {
    id:          String(raw.id),
    name:        String(raw.name),
    description: raw.description ?? null,
    descriptionEn: raw.descriptionEn ?? null,
    category:    raw.category ?? null,
    price:       raw.price != null ? Number(raw.price) : null,
    is_demo:     raw.is_demo ?? raw.isDemo ?? false,
    active:      raw.active ?? true,
    imageUrl:    raw.imageUrl ?? raw.image_url ?? null,
    images:      Array.isArray(raw.images) ? raw.images : [],
    periods:     Array.isArray(raw.periods) ? raw.periods : [],
    weekDays:    Array.isArray(raw.weekDays) ? raw.weekDays : [],
    flags:       Array.isArray(raw.flags) ? raw.flags : [],
    featured:    raw.featured ?? false,
    popular:     raw.popular ?? false,
    durationMinutes: raw.durationMinutes ?? null,
  };

  // Receta (Restaurante) — solo carga si aplica, para no pagar el round-trip en los demás tipos
  // de negocio. Si el módulo de inventario aún no está activo o falla, la receta simplemente
  // queda vacía (RecipeEditor lo maneja como "sin ingredientes disponibles").
  let inventoryItems: { id: string; name: string; unitPrice?: number }[] = [];
  let recipe: { inventoryItemId: string; inventoryItemName: string; quantity: number }[] = [];
  if (businessType === 'Restaurant') {
    const [invRes, recipeRes] = await Promise.all([
      fetch(`${API}/api/affiliates/${affiliate.id}/inventory?page=1`, {
        headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliate.id },
        cache: 'no-store',
      }),
      fetch(`${API}/api/affiliates/${affiliate.id}/products/${id}/ingredients`, {
        headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliate.id },
        cache: 'no-store',
      }),
    ]);
    if (invRes.ok) {
      const page = await invRes.json().catch(() => null);
      inventoryItems = Array.isArray(page?.data)
        ? page.data.map((i: { id: string; name: string; unitPrice?: number }) => ({ id: i.id, name: i.name, unitPrice: i.unitPrice }))
        : [];
    }
    if (recipeRes.ok) {
      const rows = await recipeRes.json().catch(() => []);
      recipe = Array.isArray(rows)
        ? rows.map((r: { inventoryItemId: string; inventoryItemName: string; quantity: number }) => ({
            inventoryItemId: r.inventoryItemId,
            inventoryItemName: r.inventoryItemName,
            quantity: r.quantity,
          }))
        : [];
    }
  }

  return (
    <EditForm
      slug={slug}
      item={item}
      businessType={businessType}
      from={from}
      inventoryItems={inventoryItems}
      initialRecipe={recipe}
    />
  );
}
