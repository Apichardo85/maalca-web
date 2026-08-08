// Digital menu board — public, 16:9, meant to stay open fullscreen on a Smart TV browser.
// Same public catalog endpoint as the regular business page (no auth), but a completely
// separate layout: no nav/footer/marketing chrome, big type for viewing at a distance,
// content rotates on its own. See plans/spec-maalca-web-espacio-v2.md, Fase 7.
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MenuBoard } from '@/components/public/MenuBoard';
import type { PublicTemplateProps } from '@/lib/templates/registry';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Same reserved list as [slug]/page.tsx would apply to — a board only makes sense for a
// real affiliate slug, so any of those top-level paths 404 here too rather than trying
// (and failing) to resolve them as a business.
const RESERVED = new Set([
  'servicios', 'login', 'signup', 'register', 'onboarding', 'space',
  'dashboard', 'admin', 'api', 'auth', 'app', 'www',
  'about', 'contact', 'contacto', 'pricing', 'terms', 'privacy', 'legal',
  'help', 'blog', 'docs', '_next', 'static', 'public', 'assets', 'images',
  'catering', 'editorial', 'properties', 'ciriwhispers', 'pegote',
  'settings', 'catalog', 'categories', 'upgrade',
  'masa-tina', 'dr-pichardo', 'hablando-mierda', 'casos-estudio', 'ecosistema',
  'affiliates', 'tarjeta',
]);

async function getCatalog(slug: string): Promise<BoardCatalogResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/catalog`, {
      next: { revalidate: 30, tags: [`affiliate:${slug}`] },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED.has(slug)) return { title: 'MaalCa' };
  const data = await getCatalog(slug);
  return { title: data ? `${data.affiliate.name} — Menu` : 'MaalCa' };
}

export default async function MenuBoardPage({ params }: PageProps) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();

  const data = await getCatalog(slug);
  if (!data) notFound();

  const mappedItems = data.items.map((item) => ({
    ...item,
    image_url: item.image_url ?? (item as typeof item & { imageUrl?: string | null }).imageUrl ?? null,
  }));

  return (
    <MenuBoard
      slug={slug}
      business={{
        name: data.affiliate.name,
        logoUrl: data.affiliate.logoUrl ?? null,
        primaryColor: data.affiliate.primaryColor ?? '#C8102E',
      }}
      initialItems={mappedItems}
      initialCategories={data.categories ?? []}
    />
  );
}

interface BoardCatalogResponse {
  affiliate: {
    name: string;
    logoUrl?: string | null;
    primaryColor?: string | null;
  };
  categories?: PublicTemplateProps['categories'];
  items: PublicTemplateProps['items'];
}
