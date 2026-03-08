# Integración Next.js con Umbraco Delivery API

## 📦 Tipos TypeScript para Document Types

Copia estos tipos en tu proyecto Next.js (ej: `src/lib/types/umbraco.ts`):

```typescript
// src/lib/types/umbraco.ts

/**
 * Tipos base de Umbraco Delivery API
 */
export interface UmbracoMediaItem {
  url: string;
  width?: number;
  height?: number;
  extension?: string;
  bytes?: number;
}

export interface UmbracoContentBase {
  contentType: string;
  name: string;
  id: string;
  createDate: string;
  updateDate: string;
  route: {
    path: string;
    startItem: {
      id: string;
      path: string;
    };
  };
  properties: Record<string, any>;
}

export interface UmbracoContentList<T> {
  total: number;
  items: T[];
}

/**
 * Element Types (Bloques)
 */
export interface ServiceBlock {
  contentType: 'serviceBlock';
  serviceName: string;
  serviceDescription: string;
  duration?: string;
  price: string;
}

export interface TeamMemberBlock {
  contentType: 'teamMemberBlock';
  memberName: string;
  role?: string;
  bio?: string;
  photo?: UmbracoMediaItem[];
}

export interface MenuItemBlock {
  contentType: 'menuItemBlock';
  dishName: string;
  dishDescription?: string;
  price: string;
  isSpecial?: boolean;
  dishImage?: UmbracoMediaItem[];
}

export interface MenuSectionBlock {
  contentType: 'menuSectionBlock';
  sectionName: string;
  sectionDescription?: string;
  menuItems?: {
    contentData: MenuItemBlock[];
  };
}

export interface PropertyBlock {
  contentType: 'propertyBlock';
  propertyTitle: string;
  propertyDescription?: string;
  location?: string;
  price: string;
  bedrooms?: number;
  bathrooms?: number;
  sqMeters?: number;
  propertyGallery?: UmbracoMediaItem[];
  isFeatured?: boolean;
}

/**
 * Propiedades base de todos los affiliates
 */
export interface BaseAffiliateProperties {
  brandName: string;
  slug: string;
  heroImage: UmbracoMediaItem[];
  heroTitle: string;
  heroDescription: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  socialImage?: UmbracoMediaItem[];
}

/**
 * Document Type: Barbershop
 */
export interface BarbershopProperties extends BaseAffiliateProperties {
  services?: {
    contentData: ServiceBlock[];
  };
  teamMembers?: {
    contentData: TeamMemberBlock[];
  };
  workGallery?: UmbracoMediaItem[];
  businessHours?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  googleMapsUrl?: string;
}

export interface BarbershopContent extends UmbracoContentBase {
  contentType: 'barbershop';
  properties: BarbershopProperties;
}

/**
 * Document Type: Restaurant
 */
export interface RestaurantProperties extends BaseAffiliateProperties {
  menuSections?: {
    contentData: MenuSectionBlock[];
  };
  featuredDishesTitle?: string;
  featuredDishes?: {
    contentData: MenuItemBlock[];
  };
  chefName?: string;
  chefBio?: string; // HTML string from TinyMCE
  chefPhoto?: UmbracoMediaItem[];
  dishGallery?: UmbracoMediaItem[];
  reservationInfo?: string; // HTML string from TinyMCE
  phoneNumber?: string;
  serviceHours?: string;
  email?: string;
  address?: string;
}

export interface RestaurantContent extends UmbracoContentBase {
  contentType: 'restaurant';
  properties: RestaurantProperties;
}

/**
 * Document Type: Real Estate
 */
export interface RealEstateProperties extends BaseAffiliateProperties {
  propertyListings?: {
    contentData: PropertyBlock[];
  };
  featuredPropertiesTitle?: string;
  agents?: {
    contentData: TeamMemberBlock[];
  };
  serviceAreas?: string[]; // Tags array
  areasDescription?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
}

export interface RealEstateContent extends UmbracoContentBase {
  contentType: 'realEstate';
  properties: RealEstateProperties;
}

/**
 * Union type de todos los affiliate types
 */
export type AffiliateContent =
  | BarbershopContent
  | RestaurantContent
  | RealEstateContent;

/**
 * Helper para type guards
 */
export function isBarbershop(content: AffiliateContent): content is BarbershopContent {
  return content.contentType === 'barbershop';
}

export function isRestaurant(content: AffiliateContent): content is RestaurantContent {
  return content.contentType === 'restaurant';
}

export function isRealEstate(content: AffiliateContent): content is RealEstateContent {
  return content.contentType === 'realEstate';
}
```

---

## 🔌 Cliente de Delivery API

Crea `src/lib/umbraco/client.ts`:

```typescript
// src/lib/umbraco/client.ts
import {
  AffiliateContent,
  BarbershopContent,
  RestaurantContent,
  RealEstateContent,
  UmbracoContentList,
  UmbracoContentBase
} from '@/lib/types/umbraco';

const UMBRACO_API_BASE = process.env.NEXT_PUBLIC_UMBRACO_API_URL || 'http://localhost:5011';
const UMBRACO_API_KEY = process.env.UMBRACO_API_KEY;

interface FetchOptions {
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
}

/**
 * Cliente base para Umbraco Delivery API
 */
async function umbracoFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${UMBRACO_API_BASE}/umbraco/delivery/api/v2${endpoint}`;

  const headers: HeadersInit = {
    'Accept': 'application/json',
  };

  // Agregar API Key si está configurada
  if (UMBRACO_API_KEY) {
    headers['Api-Key'] = UMBRACO_API_KEY;
  }

  const fetchOptions: RequestInit = {
    headers,
    cache: options.cache,
    ...(options.revalidate && { next: { revalidate: options.revalidate } }),
    ...(options.tags && { next: { tags: options.tags } }),
  };

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(
        `Umbraco API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching from Umbraco: ${url}`, error);
    throw error;
  }
}

/**
 * Obtener todo el contenido (útil para SSG)
 */
export async function getAllContent(
  options: FetchOptions = { revalidate: 3600 }
): Promise<UmbracoContentList<AffiliateContent>> {
  return umbracoFetch<UmbracoContentList<AffiliateContent>>(
    '/content',
    options
  );
}

/**
 * Obtener contenido por slug/path
 */
export async function getContentByPath(
  path: string,
  options: FetchOptions = { revalidate: 60 }
): Promise<AffiliateContent> {
  return umbracoFetch<AffiliateContent>(
    `/content/item/${path}`,
    options
  );
}

/**
 * Obtener contenido por ID
 */
export async function getContentById(
  id: string,
  options: FetchOptions = { revalidate: 60 }
): Promise<AffiliateContent> {
  return umbracoFetch<AffiliateContent>(
    `/content/item/${id}`,
    options
  );
}

/**
 * Funciones específicas por tipo de affiliate
 */

export async function getBarbershop(
  slug: string,
  options: FetchOptions = { revalidate: 60, tags: ['barbershop'] }
): Promise<BarbershopContent> {
  const content = await getContentByPath(slug, options);

  if (content.contentType !== 'barbershop') {
    throw new Error(`Content at ${slug} is not a barbershop`);
  }

  return content as BarbershopContent;
}

export async function getRestaurant(
  slug: string,
  options: FetchOptions = { revalidate: 60, tags: ['restaurant'] }
): Promise<RestaurantContent> {
  const content = await getContentByPath(slug, options);

  if (content.contentType !== 'restaurant') {
    throw new Error(`Content at ${slug} is not a restaurant`);
  }

  return content as RestaurantContent;
}

export async function getRealEstate(
  slug: string,
  options: FetchOptions = { revalidate: 60, tags: ['realEstate'] }
): Promise<RealEstateContent> {
  const content = await getContentByPath(slug, options);

  if (content.contentType !== 'realEstate') {
    throw new Error(`Content at ${slug} is not a real estate agency`);
  }

  return content as RealEstateContent;
}

/**
 * Helper: Obtener affiliate por slug (detecta tipo automáticamente)
 */
export async function getAffiliate(
  slug: string,
  options: FetchOptions = { revalidate: 60 }
): Promise<AffiliateContent> {
  return getContentByPath(slug, options);
}

/**
 * Helper: Construir URL absoluta para media
 */
export function getMediaUrl(mediaItem: { url: string }): string {
  if (mediaItem.url.startsWith('http')) {
    return mediaItem.url;
  }
  return `${UMBRACO_API_BASE}${mediaItem.url}`;
}
```

---

## 🎨 Componentes React de Ejemplo

### Hero Section (Reutilizable)

```typescript
// src/components/umbraco/HeroSection.tsx
import Image from 'next/image';
import { BaseAffiliateProperties } from '@/lib/types/umbraco';
import { getMediaUrl } from '@/lib/umbraco/client';

interface HeroSectionProps {
  content: BaseAffiliateProperties;
}

export function HeroSection({ content }: HeroSectionProps) {
  const heroImage = content.heroImage[0];

  return (
    <section className="relative h-[600px] w-full">
      {heroImage && (
        <Image
          src={getMediaUrl(heroImage)}
          alt={content.heroTitle}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex h-full items-center justify-center text-center">
        <div className="max-w-4xl px-4">
          <h1 className="mb-4 text-5xl font-bold text-white">
            {content.heroTitle}
          </h1>
          <p className="text-xl text-white/90">
            {content.heroDescription}
          </p>
        </div>
      </div>
    </section>
  );
}
```

### Services List (Barbershop)

```typescript
// src/components/umbraco/ServicesList.tsx
import { ServiceBlock } from '@/lib/types/umbraco';

interface ServicesListProps {
  services: ServiceBlock[];
}

export function ServicesList({ services }: ServicesListProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-4xl font-bold text-center">
          Nuestros Servicios
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="mb-2 text-2xl font-semibold">
                {service.serviceName}
              </h3>
              <p className="mb-4 text-gray-600">
                {service.serviceDescription}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                {service.duration && (
                  <span>⏱️ {service.duration}</span>
                )}
                <span className="font-bold text-lg text-blue-600">
                  {service.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Menu Section (Restaurant)

```typescript
// src/components/umbraco/MenuSection.tsx
import Image from 'next/image';
import { MenuSectionBlock } from '@/lib/types/umbraco';
import { getMediaUrl } from '@/lib/umbraco/client';

interface MenuSectionProps {
  section: MenuSectionBlock;
}

export function MenuSection({ section }: MenuSectionProps) {
  const menuItems = section.menuItems?.contentData || [];

  return (
    <div className="mb-12">
      <h3 className="mb-2 text-3xl font-bold border-b-2 border-red-500 pb-2">
        {section.sectionName}
      </h3>
      {section.sectionDescription && (
        <p className="mb-6 text-gray-600">{section.sectionDescription}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="flex gap-4 items-start"
          >
            {item.dishImage && item.dishImage[0] && (
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={getMediaUrl(item.dishImage[0])}
                  alt={item.dishName}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-lg">
                  {item.dishName}
                  {item.isSpecial && (
                    <span className="ml-2 text-red-500">⭐</span>
                  )}
                </h4>
                <span className="font-bold text-red-600">
                  {item.price}
                </span>
              </div>
              {item.dishDescription && (
                <p className="text-sm text-gray-600 mt-1">
                  {item.dishDescription}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📄 Páginas de Ejemplo

### Página de Barbershop

```typescript
// app/barbershop/[slug]/page.tsx
import { getBarbershop } from '@/lib/umbraco/client';
import { HeroSection } from '@/components/umbraco/HeroSection';
import { ServicesList } from '@/components/umbraco/ServicesList';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const barbershop = await getBarbershop(slug);

  return {
    title: barbershop.properties.seoTitle || barbershop.properties.heroTitle,
    description: barbershop.properties.seoDescription || barbershop.properties.heroDescription,
    keywords: barbershop.properties.seoKeywords,
    openGraph: {
      images: barbershop.properties.socialImage
        ? [barbershop.properties.socialImage[0].url]
        : undefined,
    },
  };
}

export default async function BarbershopPage({ params }: PageProps) {
  const { slug } = await params;
  const barbershop = await getBarbershop(slug);
  const { properties } = barbershop;
  const services = properties.services?.contentData || [];
  const teamMembers = properties.teamMembers?.contentData || [];

  return (
    <main>
      <HeroSection content={properties} />

      {services.length > 0 && (
        <ServicesList services={services} />
      )}

      {teamMembers.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-4xl font-bold text-center">
              Nuestro Equipo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="text-center">
                  {member.photo && member.photo[0] && (
                    <img
                      src={member.photo[0].url}
                      alt={member.memberName}
                      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                    />
                  )}
                  <h3 className="text-xl font-semibold">{member.memberName}</h3>
                  {member.role && (
                    <p className="text-gray-600 mb-2">{member.role}</p>
                  )}
                  {member.bio && (
                    <p className="text-sm text-gray-500">{member.bio}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {properties.businessHours && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-3xl font-bold text-center">
              Información de Contacto
            </h2>
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Horario</h3>
                  <p className="whitespace-pre-line">{properties.businessHours}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Contacto</h3>
                  {properties.phoneNumber && (
                    <p>📞 {properties.phoneNumber}</p>
                  )}
                  {properties.email && (
                    <p>📧 {properties.email}</p>
                  )}
                  {properties.address && (
                    <p className="mt-2">📍 {properties.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
```

---

## ⚙️ Variables de Entorno

Crea `.env.local` en tu proyecto Next.js:

```bash
# Umbraco CMS Configuration
NEXT_PUBLIC_UMBRACO_API_URL=http://localhost:5011
UMBRACO_API_KEY=

# Si usas API Key en producción:
# UMBRACO_API_KEY=your-secure-api-key-here
```

---

## 🚀 Estrategias de Rendering

### Static Site Generation (SSG) - Recomendado

```typescript
// Genera páginas estáticas en build time
export async function generateStaticParams() {
  const content = await getAllContent({ cache: 'no-store' });

  return content.items.map((item) => ({
    slug: item.properties.slug,
  }));
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  // Revalidar cada hora
  const content = await getContentByPath(slug, { revalidate: 3600 });
  return <div>{/* ... */}</div>;
}
```

### Incremental Static Regeneration (ISR)

```typescript
// Regenera la página cada 60 segundos si hay requests
export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const content = await getContentByPath(slug, {
    revalidate: 60 // ISR: regenera cada 60s
  });
  return <div>{/* ... */}</div>;
}
```

### Server-Side Rendering (SSR)

```typescript
// Renderiza en cada request (siempre fresco)
export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const content = await getContentByPath(slug, {
    cache: 'no-store' // SSR
  });
  return <div>{/* ... */}</div>;
}
```

---

## 🔄 Revalidación On-Demand

Para invalidar cache cuando se publica contenido en Umbraco:

```typescript
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ message: 'Invalid secret' }, { status: 401 });
  }

  const tag = request.nextUrl.searchParams.get('tag');

  if (tag) {
    revalidateTag(tag);
    return Response.json({ revalidated: true, tag });
  }

  return Response.json({ message: 'No tag provided' }, { status: 400 });
}
```

Configura webhook en Umbraco para llamar:
```
POST https://tu-sitio.com/api/revalidate?secret=tu-secreto&tag=barbershop
```

---

## 📚 Recursos Adicionales

- **Next.js Data Fetching**: https://nextjs.org/docs/app/building-your-application/data-fetching
- **Umbraco Delivery API Docs**: https://docs.umbraco.com/umbraco-cms/v/15.latest/reference/delivery-api
- **TypeScript Types**: https://www.typescriptlang.org/docs/handbook/2/objects.html

---

**¿Listo para construir tu frontend con Next.js?** 🎯
