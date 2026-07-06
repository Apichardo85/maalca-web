// src/app/preview/[slug]/page.tsx
// INTERNAL TOOL — not linked from anywhere in the public site.
// Renders the dynamic template system ([slug]/page.tsx + templates/registry.ts)
// for ANY slug, bypassing the RESERVED set in src/app/[slug]/page.tsx. Lets us
// compare a legacy static page (e.g. /the-little-dominicana) against what the
// dynamic RestaurantTemplate/ServiceTemplate/etc. would render for the same
// affiliate, before deciding to cut a real slug over from legacy.
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { TEMPLATES, type BusinessType, type PublicTemplateProps, type Plan } from '@/lib/templates/registry';
import { ApiError } from '@/lib/api-client';
import type { PublicCanal } from '@/lib/public-contact';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

async function getCatalog(slug: string): Promise<PublicCatalogResponse | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/public/affiliates/${slug}/catalog`,
      { cache: 'no-store' },
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new ApiError(res.status, res.statusText);
    return res.json();
  } catch (e) {
    console.error('[preview/slug] getCatalog error', e);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCatalog(slug);
  return {
    title: data ? `[preview] ${data.affiliate.name} | MaalCa` : 'MaalCa preview',
    robots: { index: false, follow: false },
  };
}

export default async function PreviewAffiliatePage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCatalog(slug);
  if (!data) notFound();

  const { affiliate, categories = [], items, capabilities } = data;

  const mappedItems = items.map((item) => ({
    ...item,
    image_url: item.image_url ?? (item as typeof item & { imageUrl?: string | null }).imageUrl ?? null,
  }));

  const Template = TEMPLATES[affiliate.businessType.toLowerCase() as BusinessType];
  if (!Template) notFound();

  const rawAffiliate = affiliate as typeof affiliate & { whatsApp?: string | null };
  const whatsappValue = affiliate.whatsapp ?? rawAffiliate.whatsApp ?? null;

  return (
    <Template
      business={{
        id: affiliate.id,
        slug: affiliate.slug,
        name: affiliate.name,
        plan: (affiliate.plan?.toLowerCase() ?? 'free') as Plan,
        description: affiliate.description,
        logo_url: affiliate.logoUrl,
        cover_image_url: affiliate.coverImageUrl ?? null,
        primary_color: affiliate.primaryColor,
        whatsapp: whatsappValue,
        address: affiliate.address ?? null,
        contactEmail: affiliate.contactEmail ?? null,
        canales: affiliate.canales ?? [],
        business_type: affiliate.businessType as BusinessType,
        processSteps: affiliate.processSteps ?? null,
        faq: affiliate.faq ?? null,
      }}
      items={mappedItems}
      categories={categories}
      capabilities={capabilities}
    />
  );
}

// DTO shape from maalca-api — kept in sync with src/app/[slug]/page.tsx
interface PublicCatalogResponse {
  affiliate: {
    id: string;
    slug: string;
    name: string;
    description?: string | null;
    businessType: string;
    plan: string;
    logoUrl?: string | null;
    coverImageUrl?: string | null;
    primaryColor?: string | null;
    whatsapp?: string | null;
    address?: string | null;
    contactEmail?: string | null;
    canales?: PublicCanal[];
    processSteps?: PublicTemplateProps['business']['processSteps'];
    faq?: PublicTemplateProps['business']['faq'];
  };
  categories?: PublicTemplateProps['categories'];
  items: PublicTemplateProps['items'];
  capabilities: PublicTemplateProps['capabilities'];
}
