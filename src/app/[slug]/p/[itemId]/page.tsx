// src/app/[slug]/p/[itemId]/page.tsx
//
// Enlace compartible a UN producto/servicio: maalca.com/{slug}/p/{id}. Muestra la misma página pública del
// negocio (la plantilla lee la ruta y abre el detalle de ese item) pero con metadatos propios, para que
// WhatsApp/iMessage/Facebook muestren la foto, el nombre y el precio del producto en vez de la tarjeta
// genérica del negocio. Si el item ya no existe, se ve la página normal del negocio (no un 404).
import type { Metadata } from 'next';
import PublicAffiliatePage from '../../page';
import { stripRichTextToPlain } from '@/lib/sanitize-html';
import { formatPrice } from '@/lib/currency';

interface PageProps {
  params: Promise<{ slug: string; itemId: string }>;
}

interface CatalogItem {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  image_url?: string | null;
  imageUrl?: string | null;
  images?: string[] | null;
}

interface CatalogResponse {
  affiliate: {
    name: string;
    logoUrl?: string | null;
    currency?: string | null;
  };
  items: CatalogItem[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

async function getCatalog(slug: string): Promise<CatalogResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/catalog`, {
      next: { revalidate: 60, tags: [`affiliate:${slug}`] },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error('[slug/p] getCatalog error', e);
    return null;
  }
}

const isHttpUrl = (u?: string | null): u is string => !!u && /^https?:\/\//i.test(u);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, itemId } = await params;
  const data = await getCatalog(slug);
  if (!data) return { title: 'MaalCa' };

  const { affiliate, items } = data;
  const item = items.find((i) => i.id === itemId);
  if (!item) return { title: affiliate.name };

  const currency = affiliate.currency === 'DOP' ? 'DOP' : 'USD';
  const priceText = item.price != null ? formatPrice(item.price, currency) : null;
  const plain = item.description ? stripRichTextToPlain(item.description).trim() : '';
  const description = (plain ? plain.slice(0, 200) : [priceText, affiliate.name].filter(Boolean).join(' · ')) || affiliate.name;
  const title = `${item.name} · ${affiliate.name}`;
  const url = `https://maalca.com/${slug}/p/${itemId}`;

  // Foto del producto; si no tiene, la tarjeta de identidad del negocio ([slug]/opengraph-image).
  const photo = [item.image_url, item.imageUrl, ...(item.images ?? [])].find(isHttpUrl);
  const images = [photo ?? `https://maalca.com/${slug}/opengraph-image`];

  return {
    title,
    description,
    applicationName: affiliate.name,
    alternates: { canonical: url },
    openGraph: { type: 'website', url, siteName: affiliate.name, title, description, images },
    twitter: { card: 'summary_large_image', title, description, images },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  return PublicAffiliatePage({ params: Promise.resolve({ slug }) });
}
