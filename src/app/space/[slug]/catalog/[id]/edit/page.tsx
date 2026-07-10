import { notFound, redirect } from 'next/navigation';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';
import EditForm from './EditForm';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

export default async function EditCatalogItemPage({ params }: PageProps) {
  const { slug, id } = await params;
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
    periods:     Array.isArray(raw.periods) ? raw.periods : [],
    weekDays:    Array.isArray(raw.weekDays) ? raw.weekDays : [],
    flags:       Array.isArray(raw.flags) ? raw.flags : [],
    featured:    raw.featured ?? false,
    popular:     raw.popular ?? false,
  };

  return <EditForm slug={slug} item={item} businessType={businessType} />;
}
