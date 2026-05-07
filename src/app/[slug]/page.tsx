// src/app/[slug]/page.tsx
// Public-facing business page. NO auth required.
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase/server';
import { TEMPLATES, type BusinessType } from '@/lib/templates/registry';
import { getCapabilities } from '@/lib/capabilities';
import type { Plan } from '@/lib/plan-limits';
import type { PublicTemplateProps } from '@/lib/templates/registry';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const RESERVED = new Set([
  'servicios', 'login', 'signup', 'register', 'onboarding', 'space',
  'dashboard', 'admin', 'api', 'auth', 'app', 'www',
  'about', 'contact', 'contacto', 'pricing', 'terms', 'privacy', 'legal',
  'help', 'blog', 'docs', '_next', 'static', 'public', 'assets', 'images',
  'favicon.ico', 'robots.txt', 'sitemap.xml',
  'catering', 'editorial', 'properties', 'ciriwhispers', 'pegote',
  'settings', 'catalog', 'categories', 'upgrade',
]);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED.has(slug)) return { title: 'MaalCa' };

  const supabase = await supabaseServer();
  const { data: business } = await supabase
    .from('businesses')
    .select('name, description')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (!business) return { title: 'MaalCa' };

  return {
    title: `${business.name} | MaalCa`,
    description: business.description ?? `Visita ${business.name} en MaalCa`,
    openGraph: {
      title: business.name,
      description: business.description ?? undefined,
    },
  };
}

export default async function PublicBusinessPage({ params }: PageProps) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();

  const supabase = await supabaseServer();

  const { data: business } = await supabase
    .from('businesses')
    .select('id, slug, name, description, business_type, plan, logo_url, primary_color, whatsapp')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (!business) notFound();

  const [{ data: items }, { data: categories }] = await Promise.all([
    supabase
      .from('catalog_items')
      .select('id, name, description, price, category, category_id, image_url, is_demo')
      .eq('business_id', business.id)
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('categories')
      .select('id, name, sort_order')
      .eq('business_id', business.id)
      .order('sort_order', { ascending: true }),
  ]);

  const Template = TEMPLATES[business.business_type as BusinessType];
  if (!Template) notFound();

  const capabilities = getCapabilities(business.plan as Plan);

  return (
    <Template
      business={business as PublicTemplateProps['business']}
      items={items ?? []}
      categories={categories ?? []}
      capabilities={capabilities}
    />
  );
}
