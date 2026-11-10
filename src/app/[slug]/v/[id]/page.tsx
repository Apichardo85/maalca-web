// src/app/[slug]/v/[id]/page.tsx
//
// Enlace compartible a UN vehículo: maalca.com/{slug}/v/{id}. Mismo patrón que /{slug}/p/{itemId}: renderiza la
// página pública del negocio (la plantilla Dealer lee la ruta y abre la ficha) con metadatos propios, para que
// WhatsApp/Facebook muestren la foto, el nombre y el precio del vehículo. Si el vehículo ya no es público
// (vendido u oculto) la plantilla muestra un aviso amable sobre el inventario, no un 404.
import type { Metadata } from 'next';
import PublicAffiliatePage from '../../page';
import { formatPrice } from '@/lib/currency';
import { formatVehiclePrices, vehicleTitle } from '@/lib/dealer';
import type { DealerPublicSettings, PublicVehicle } from '@/lib/templates/registry';

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

interface DealerResponse {
  baseCurrency: 'USD' | 'DOP';
  settings: DealerPublicSettings;
  vehicles: PublicVehicle[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

async function getDealer(slug: string): Promise<DealerResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/dealer-vehicles`, {
      next: { revalidate: 60, tags: [`affiliate:${slug}`] },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error('[slug/v] getDealer error', e);
    return null;
  }
}

const isHttpUrl = (u?: string | null): u is string => !!u && /^https?:\/\//i.test(u);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, id } = await params;
  const data = await getDealer(slug);
  const vehicle = data?.vehicles.find((v) => v.id === id);
  if (!data || !vehicle) return { title: 'MaalCa' };

  const title = vehicleTitle(vehicle);
  const prices = formatVehiclePrices(vehicle.price, data.baseCurrency, data.settings);
  // formatPrice queda como respaldo si formatVehiclePrices no devolvió nada (no debería pasar).
  const priceText = prices.length > 0 ? prices.join(' / ') : formatPrice(vehicle.price, data.baseCurrency);
  const plain = vehicle.description?.trim() ?? '';
  const description = plain ? `${priceText} · ${plain.slice(0, 180)}` : priceText;
  const url = `https://maalca.com/${slug}/v/${id}`;
  const photo = [vehicle.imageUrl, ...(vehicle.images ?? [])].find(isHttpUrl);
  const images = [photo ?? `https://maalca.com/${slug}/opengraph-image`];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', url, title, description, images },
    twitter: { card: 'summary_large_image', title, description, images },
  };
}

export default async function VehiclePage({ params }: PageProps) {
  const { slug } = await params;
  return PublicAffiliatePage({ params: Promise.resolve({ slug }) });
}
