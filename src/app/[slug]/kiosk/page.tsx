// Kiosko de autopedidos (Etapa E) — pantalla táctil pública, sin login, pensada para vivir en
// una tableta fija dentro del negocio. Reutiliza el mismo endpoint público de catálogo que la
// página normal del afiliado ([slug]/page.tsx) y el mismo endpoint de checkout real de Stripe
// que ya usa CartDrawer en el storefront — la diferencia es la UI (pantalla completa, botones
// grandes, sin navegación del sitio) y que después de pagar se reinicia sola para el próximo
// cliente en vez de quedarse en la página del pedido.
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { KioskContent, type KioskItem } from './KioskContent';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface PublicCatalogResponse {
  affiliate: {
    id: string;
    slug: string;
    name: string;
    businessType: string;
    logoUrl?: string | null;
    primaryColor?: string | null;
    currency?: string | null;
  };
  items: Array<{
    id: string;
    name: string;
    description?: string | null;
    price?: number | null;
    category?: string | null;
    image_url?: string | null;
    imageUrl?: string | null;
    status?: string | null;
    is_demo?: boolean;
  }>;
  capabilities: { onlinePayments?: boolean };
}

async function getCatalog(slug: string): Promise<PublicCatalogResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/catalog`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCatalog(slug);
  return { title: data ? `Autopedido — ${data.affiliate.name}` : 'MaalCa' };
}

export default async function KioskPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCatalog(slug);
  if (!data) notFound();

  // Fase 1 del kiosko — mismo alcance que el POS: solo restaurantes por ahora, mismo criterio
  // que Kitchen Display y POS ya usan para gatear sus rutas.
  if (data.affiliate.businessType.toLowerCase() !== 'restaurant') notFound();

  const items: KioskItem[] = data.items
    .filter((i) => i.status !== 'Inactive' && !i.is_demo && (i.price ?? 0) > 0)
    .map((i) => ({
      id: i.id,
      name: i.name,
      description: i.description ?? null,
      price: i.price ?? 0,
      category: i.category ?? null,
      imageUrl: i.image_url ?? i.imageUrl ?? null,
    }));

  const currency = data.affiliate.currency === 'DOP' ? 'DOP' : 'USD';

  return (
    <KioskContent
      slug={slug}
      businessName={data.affiliate.name}
      logoUrl={data.affiliate.logoUrl ?? null}
      currency={currency}
      items={items}
      onlinePayments={data.capabilities?.onlinePayments ?? false}
    />
  );
}
