// src/app/[slug]/page.tsx
// Public business page — SSR via maalca-api public endpoint. No auth required.
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { TEMPLATES, type BusinessType, type PublicTemplateProps, type Plan } from '@/lib/templates/registry';
import { ApiError } from '@/lib/api-client';
import type { PublicCanal } from '@/lib/public-contact';
import { PageViewTracker } from '@/components/public/PageViewTracker';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

const RESERVED = new Set([
  'servicios', 'login', 'signup', 'register', 'onboarding', 'space',
  'dashboard', 'admin', 'api', 'auth', 'app', 'www',
  'about', 'contact', 'contacto', 'pricing', 'terms', 'privacy', 'legal',
  'help', 'blog', 'docs', '_next', 'static', 'public', 'assets', 'images',
  'favicon.ico', 'robots.txt', 'sitemap.xml',
  'catering', 'editorial', 'properties', 'ciriwhispers', 'pegote',
  'settings', 'catalog', 'categories', 'upgrade',
  'the-little-dominicana', 'masa-tina',
  'dr-pichardo', 'hablando-mierda', 'casos-estudio', 'ecosistema',
  'affiliates', 'tarjeta',
]);

async function getCatalog(slug: string): Promise<PublicCatalogResponse | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/public/affiliates/${slug}/catalog`,
      { next: { revalidate: 60, tags: [`affiliate:${slug}`] } },
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new ApiError(res.status, res.statusText);
    return res.json();
  } catch (e) {
    console.error('[slug] getCatalog error', e);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED.has(slug)) return { title: 'MaalCa' };

  const data = await getCatalog(slug);
  if (!data) return { title: 'MaalCa' };

  return {
    title: `${data.affiliate.name} | MaalCa`,
    description: data.affiliate.description ?? `Visita ${data.affiliate.name} en MaalCa`,
    openGraph: {
      title: data.affiliate.name,
      description: data.affiliate.description ?? undefined,
    },
  };
}

export default async function PublicAffiliatePage({ params }: PageProps) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();

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
  console.log('[slug] whatsapp keys — whatsapp:', affiliate.whatsapp, 'whatsApp:', rawAffiliate.whatsApp, 'resolved:', whatsappValue);

  return (
    <>
      <PageViewTracker slug={affiliate.slug} />
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
          timezone: affiliate.timezone ?? null,
        }}
        items={mappedItems}
        categories={categories}
        capabilities={capabilities}
      />
    </>
  );
}

// DTO shapes from maalca-api (§2.4 of MODEL_PLAN_v2)
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
    timezone?: string | null;
  };
  categories?: PublicTemplateProps['categories'];
  items: PublicTemplateProps['items'];
  capabilities: PublicTemplateProps['capabilities'];
}
