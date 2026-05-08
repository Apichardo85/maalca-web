// src/app/[slug]/page.tsx
// Public business page — SSR via maalca-api public endpoint. No auth required.
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { TEMPLATES, type BusinessType, type PublicTemplateProps } from '@/lib/templates/registry';
import { ApiError } from '@/lib/api-client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:5000';

const RESERVED = new Set([
  'servicios', 'login', 'signup', 'register', 'onboarding', 'space',
  'dashboard', 'admin', 'api', 'auth', 'app', 'www',
  'about', 'contact', 'contacto', 'pricing', 'terms', 'privacy', 'legal',
  'help', 'blog', 'docs', '_next', 'static', 'public', 'assets', 'images',
  'favicon.ico', 'robots.txt', 'sitemap.xml',
  'catering', 'editorial', 'properties', 'ciriwhispers', 'pegote',
  'settings', 'catalog', 'categories', 'upgrade',
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
    if (e instanceof ApiError && e.status === 404) return null;
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

  const { affiliate, categories, items, capabilities } = data;

  const Template = TEMPLATES[affiliate.businessType as BusinessType];
  if (!Template) notFound();

  return (
    <Template
      business={{
        id: affiliate.id,
        slug: affiliate.slug,
        name: affiliate.name,
        plan: affiliate.plan,
        description: affiliate.description,
        logo_url: affiliate.logoUrl,
        primary_color: affiliate.primaryColor,
        whatsapp: affiliate.whatsapp,
        business_type: affiliate.businessType as BusinessType,
      }}
      items={items}
      categories={categories}
      capabilities={capabilities}
    />
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
    plan: 'free' | 'entrepreneur';
    logoUrl?: string | null;
    primaryColor?: string | null;
    whatsapp?: string | null;
  };
  categories: PublicTemplateProps['categories'];
  items: PublicTemplateProps['items'];
  capabilities: PublicTemplateProps['capabilities'];
}
