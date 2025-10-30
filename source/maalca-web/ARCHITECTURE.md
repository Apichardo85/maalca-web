# ARQUITECTURA - MaalCa Web

**Versión:** 1.0
**Última Actualización:** 2025-10-29
**Commit Base:** 8e9adb4

---

## 📋 Índice

1. [Stack Tecnológico](#stack-tecnológico)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Integración con Umbraco CMS](#integración-con-umbraco-cms)
4. [Flujo de Datos](#flujo-de-datos)
5. [Sistema de Tipos TypeScript](#sistema-de-tipos-typescript)
6. [Hooks Personalizados](#hooks-personalizados)
7. [Componentes Principales](#componentes-principales)
8. [Páginas y Rutas](#páginas-y-rutas)
9. [Estrategia de Fallback](#estrategia-de-fallback)
10. [Variables de Entorno](#variables-de-entorno)

---

## 🛠 Stack Tecnológico

### Core Framework
```json
{
  "next": "15.5.0",        // Next.js con App Router + Turbopack
  "react": "19.1.0",       // React 19 con concurrent features
  "typescript": "^5"       // TypeScript strict mode
}
```

### UI & Styling
```json
{
  "tailwindcss": "^4",           // Tailwind CSS 4 con PostCSS
  "framer-motion": "^12.23.12",  // Animaciones y transiciones
  "clsx": "^2.1.1",              // Conditional classes
  "tailwind-merge": "^3.3.1"     // Merge Tailwind classes
}
```

### Maps & Geolocation
```json
{
  "mapbox-gl": "^2.15.0",     // Mapbox GL para mapas
  "react-map-gl": "^7.1.7",   // React wrapper para Mapbox
  "@types/mapbox-gl": "^3.4.1"
}
```

### Content & Media
```json
{
  "react-reader": "^2.0.13",      // EPUB reader para libros
  "epubjs": "^0.3.93",            // EPUB.js library
  "epub-gen-memory": "^1.1.2",    // EPUB generation
  "nodepub": "^3.2.1"             // Node.js EPUB publisher
}
```

---

## 📂 Estructura del Proyecto

```
maalca-web/
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (marketing)/              # Route group (no afecta URL)
│   │   │   ├── page.tsx              # ✅ HOMEPAGE ACTIVA
│   │   │   ├── catering/
│   │   │   ├── galeria/
│   │   │   └── propiedades/
│   │   │
│   │   ├── page.tsx                  # Homepage alternativa
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Estilos globales
│   │   │
│   │   ├── casos-estudio/            # Case studies
│   │   ├── cirisonic/                # CiriSonic project
│   │   ├── ciriwhispers/             # CiriWhispers project
│   │   ├── contacto/                 # Contact page
│   │   ├── dr-pichardo/              # Medical services
│   │   │   ├── operativos/
│   │   │   ├── portal/
│   │   │   └── servicios/
│   │   ├── ecosistema/               # Ecosystem overview
│   │   ├── editorial/                # Editorial MaalCa
│   │   ├── hablando-mierda/          # HBM Podcast
│   │   ├── maalca-properties/        # ⭐ Real Estate Platform
│   │   ├── masa-tina/                # Gastronomy project
│   │   ├── pegote-barber/            # Barbershop
│   │   ├── servicios/                # Services
│   │   └── verde-prive/              # Cannabis lifestyle
│   │
│   ├── components/                   # Componentes React
│   │   ├── brands/                   # Brand components
│   │   ├── dev/                      # Development tools
│   │   │   └── PerformanceDebugger.tsx
│   │   ├── layout/                   # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── sections/                 # Page sections
│   │   │   ├── ServicesSection.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   └── gallery/
│   │   └── ui/                       # UI components library
│   │       ├── buttons/
│   │       │   └── button.tsx
│   │       ├── ConsultationBooking.tsx
│   │       ├── PropertyGallery.tsx
│   │       ├── PropertyMap.tsx
│   │       ├── PropertyListWithMap.tsx
│   │       ├── ThemeSwitch.tsx
│   │       ├── DigitalReader.tsx
│   │       ├── FirstChapter.tsx
│   │       └── ... (50+ componentes)
│   │
│   ├── data/                         # Data layer
│   │   ├── index.ts                  # Barrel exports
│   │   ├── bookContent.ts            # Book content data
│   │   ├── editorialContent.ts       # Editorial data
│   │   ├── properties-mock.ts        # ⭐ Mock properties
│   │   ├── properties-i18n.ts        # i18n for properties
│   │   └── mock/                     # Mock data
│   │       ├── projects.ts
│   │       ├── affiliates.ts
│   │       └── services.ts
│   │
│   ├── hooks/                        # Custom React Hooks
│   │   ├── index.ts
│   │   ├── useAnalytics.ts          # Analytics tracking
│   │   ├── useContactForm.ts        # Contact form logic
│   │   ├── useFormValidation.ts     # Form validation
│   │   ├── useLanguage.tsx          # i18n language switching
│   │   ├── useLazyLoading.ts        # Lazy load images
│   │   ├── useProperties.ts         # ⭐ Properties data
│   │   ├── usePropertiesI18n.ts     # ⭐ Properties i18n
│   │   ├── useOptimizedProperties.ts # ⭐ Optimized property loading
│   │   └── useUrlState.ts           # URL state management
│   │
│   ├── lib/                          # Libraries & utilities
│   │   ├── umbraco-client.ts         # ⭐ Umbraco API client
│   │   ├── performance.ts            # Performance utilities
│   │   ├── types/                    # TypeScript types
│   │   │   ├── index.ts
│   │   │   ├── property.ts           # ⭐ Property types
│   │   │   ├── property.types.ts
│   │   │   ├── property-i18n.ts
│   │   │   ├── gallery.types.ts
│   │   │   ├── project.types.ts
│   │   │   ├── affiliate.types.ts
│   │   │   ├── button.types.ts
│   │   │   └── navigation.types.ts
│   │   └── utils/                    # Utility functions
│   │       ├── index.ts
│   │       ├── cn.ts                 # Class name utilities
│   │       └── newsletter.ts         # Newsletter utilities
│   │
│   └── styles/                       # Style files
│       ├── components/
│       └── tokens/
│
├── public/                           # Static assets
│   └── images/
│       ├── projects/                 # Project images
│       └── properties/               # Property images
│
├── ARCHITECTURE.md                   # Este documento
├── BRANDING.md                       # Branding guidelines
├── CLAUDE.md                         # Claude Code instructions
├── MAALCA_PROPERTIES_READY.md       # Properties feature docs
│
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript config
├── tailwind.config.css               # Tailwind config
├── postcss.config.mjs                # PostCSS config
└── package.json                      # Dependencies

```

**Total:** ~109 archivos TypeScript/TSX

---

## 🔌 Integración con Umbraco CMS

### Overview

MaalCa Web utiliza **Umbraco CMS** como backend headless para gestionar contenido dinámico, especialmente para **MaalCa Properties** (propiedades inmobiliarias).

### Umbraco Client (`src/lib/umbraco-client.ts`)

#### Arquitectura

```typescript
class UmbracoClient {
  private baseUrl: string;           // API URL de Umbraco
  private mediaUrl: string;          // Media CDN URL
  private apiKey?: string;           // API Key para autenticación

  constructor() {
    this.baseUrl = UMBRACO_API_URL;
    this.mediaUrl = UMBRACO_MEDIA_URL;
    this.apiKey = UMBRACO_API_KEY;
  }
}

export const umbracoClient = new UmbracoClient(); // Singleton
```

#### Métodos Principales

| Método | Descripción | Endpoint |
|--------|-------------|----------|
| `getProperties()` | Obtiene todas las propiedades | `/umbraco/delivery/api/v2/content?filter=contentType:property` |
| `getProperty(id)` | Obtiene una propiedad específica | `/umbraco/delivery/api/v2/content/{id}` |
| `getFeaturedProperties()` | Obtiene propiedades destacadas | Filtra `featured: true` |
| `getFilteredProperties(filters)` | Filtra propiedades por criterios | Client-side filtering |
| `getPropertyTypes()` | Obtiene tipos de propiedades | Extrae de todas las properties |
| `getAvailablePriceRanges()` | Obtiene rangos de precios | Hardcoded ranges |
| `getMediaUrl(path)` | Convierte path relativo a URL completa | Media URL transformation |

#### Estrategia de Fallback

**CRÍTICO:** El sistema usa fallback automático a datos mock si Umbraco no está disponible:

```typescript
private async fetchWithFallback<T>(
  endpoint: string,
  fallbackData: T
): Promise<T> {
  // Si no hay URL configurada → usar mock data
  if (!this.baseUrl) {
    console.warn('Umbraco API not configured, using fallback data');
    return fallbackData;
  }

  try {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) throw new Error();
    return await response.json();
  } catch (error) {
    // Si falla la API → usar mock data
    console.error('Umbraco API error, using fallback:', error);
    return fallbackData;
  }
}
```

**Beneficios:**
- ✅ El sitio funciona sin Umbraco configurado
- ✅ Desarrollo local sin dependencias externas
- ✅ Resiliente a fallos de API
- ✅ Fácil demostración con datos de ejemplo

#### Mapeo de Datos

Umbraco → TypeScript Property Interface:

```typescript
private mapUmbracoProperty(umbracoData: any): Property {
  const properties = umbracoData.properties || {};

  return {
    id: umbracoData.id || umbracoData.key,
    name: properties.title?.value || umbracoData.name,
    location: properties.location?.value || '',
    priceFrom: properties.price?.value || 0,
    bedrooms: properties.bedrooms?.value || 0,
    bathrooms: properties.bathrooms?.value || 0,
    sqft: properties.sqft?.value || 0,
    lotSize: properties.lotSize?.value || '',
    type: properties.propertyType?.value || 'Property',
    amenities: this.parseAmenities(properties.amenities?.value),
    description: this.stripHtml(properties.description?.value || ''),
    images: this.parseGallery(properties.gallery?.value),
    featured: properties.featured?.value === true,
    status: properties.status?.value || 'Available',
    virtualTour: properties.virtualTourUrl?.value || '',
    videoUrl: properties.videoUrl?.value || '',
    coordinates: this.parseCoordinates(properties.coordinates?.value)
  };
}
```

#### Content Type en Umbraco

**Estructura esperada del Content Type "Property":**

```
Property (Document Type)
├── title (Text String)
├── location (Text String)
├── price (Decimal)
├── bedrooms (Numeric)
├── bathrooms (Numeric)
├── sqft (Numeric)
├── lotSize (Text String)
├── propertyType (Dropdown/Text)
├── amenities (Repeater/Tags/Text)
├── description (Rich Text Editor)
├── gallery (Media Picker - Multiple)
├── featured (True/False)
├── status (Dropdown: Available/Sold/Reserved)
├── virtualTourUrl (Text String - URL)
├── videoUrl (Text String - URL)
└── coordinates (Text String - "lat,lng")
```

---

## 🔄 Flujo de Datos

### Flujo Completo: Umbraco → Frontend

```
┌─────────────────────────────────────────────────────────────────┐
│                         UMBRACO CMS                             │
│  (Content Management)                                           │
│  - Create/Edit Properties                                       │
│  - Upload Images to Media Library                               │
│  - Publish Content                                              │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ Umbraco Delivery API v2
                 │ (REST API)
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    UMBRACO CLIENT                               │
│  (src/lib/umbraco-client.ts)                                    │
│                                                                 │
│  - Fetch data from API                                          │
│  - Transform Umbraco format → Property interface                │
│  - Handle errors with fallback                                  │
│  - Cache (Next.js: revalidate: 300s)                           │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ Property[] | Property
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CUSTOM HOOKS                               │
│  (src/hooks/)                                                   │
│                                                                 │
│  useProperties()         → Fetch all properties                 │
│  usePropertiesI18n()     → i18n translations                    │
│  useOptimizedProperties() → Lazy loading + optimization         │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ Property Data + i18n
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     REACT COMPONENTS                            │
│  (src/components/ui/)                                           │
│                                                                 │
│  PropertyGallery         → Image carousel                       │
│  PropertyMap             → Mapbox GL map                        │
│  PropertyListWithMap     → List + Map split view                │
│  ConsultationBooking     → Lead capture form                    │
│  PropertyLoadingStates   → Skeleton loaders                     │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ Rendered UI
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       PAGE: /maalca-properties                  │
│  (src/app/maalca-properties/page.tsx)                          │
│                                                                 │
│  - Display properties                                           │
│  - Interactive filters                                          │
│  - Map view                                                     │
│  - Consultation booking                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Fallback Flow (Sin Umbraco)

```
┌──────────────────────────────┐
│  UMBRACO_API_URL not set     │
│  or API request fails        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  MOCK DATA                   │
│  (src/data/properties-mock.ts)│
│                              │
│  - 6 propiedades de ejemplo  │
│  - Datos completos           │
│  - Imágenes placeholder      │
└──────────────┬───────────────┘
               │
               ▼
        (Same flow as above)
```

---

## 📝 Sistema de Tipos TypeScript

### Property Type (`src/lib/types/property.ts`)

```typescript
export interface Property {
  id: string;                          // Unique identifier
  name: string;                        // Property name
  location: string;                    // Location description
  priceFrom: number;                   // Starting price (USD)
  bedrooms: number;                    // Number of bedrooms
  bathrooms: number;                   // Number of bathrooms
  sqft: number;                        // Square footage
  lotSize: string;                     // Lot size (e.g., "2.5 acres")
  type: string;                        // Property type
  amenities: string[];                 // List of amenities
  description: string;                 // Full description
  images: string[];                    // Image URLs
  featured: boolean;                   // Is featured property?
  status: 'Available' | 'Sold' | 'Reserved';
  virtualTour?: string;                // Virtual tour URL
  videoUrl?: string;                   // Video URL
  coordinates: {                       // GPS coordinates
    lat: number;
    lng: number;
  } | null;
}

export interface PropertyFilter {
  type?: string;                       // Filter by type
  priceRange?: string;                 // Filter by price range
  location?: string;                   // Filter by location
  minBedrooms?: number;                // Minimum bedrooms
  minBathrooms?: number;               // Minimum bathrooms
  amenities?: string[];                // Required amenities
}
```

### Otros Tipos Principales

```typescript
// src/lib/types/project.types.ts
export interface Project {
  title: string;
  description: string;
  category: string;
  outcome: string;
  color: "red" | "gray";
  image: string;
  href: string;
}

// src/lib/types/affiliate.types.ts
export interface Affiliate {
  name: string;
  description: string;
  href: string;
  initials: string;
}

// src/lib/types/button.types.ts
export interface ButtonProps {
  variant?: 'default' | 'primary' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

// src/lib/types/gallery.types.ts
export interface GalleryImage {
  url: string;
  alt: string;
  caption?: string;
}
```

---

## 🪝 Hooks Personalizados

### Properties Hooks

#### `useProperties()`
```typescript
// Obtiene propiedades desde Umbraco o mock
const { properties, loading, error } = useProperties();
```

#### `usePropertiesI18n(lang: 'en' | 'es')`
```typescript
// Traduce contenido de propiedades
const { t, currentLang } = usePropertiesI18n('es');
```

#### `useOptimizedProperties()`
```typescript
// Carga optimizada con lazy loading
const {
  properties,
  loading,
  hasMore,
  loadMore
} = useOptimizedProperties();
```

### Form Hooks

#### `useContactForm()`
```typescript
// Maneja lógica de formulario de contacto
const {
  formData,
  handleChange,
  handleSubmit,
  loading,
  success
} = useContactForm();
```

#### `useFormValidation(schema)`
```typescript
// Validación de formularios
const {
  errors,
  validate,
  isValid
} = useFormValidation(validationSchema);
```

### Utility Hooks

#### `useLazyLoading()`
```typescript
// Lazy load de imágenes
const { ref, inView } = useLazyLoading();
```

#### `useUrlState()`
```typescript
// Sincroniza estado con URL params
const [filters, setFilters] = useUrlState<PropertyFilter>({
  initialState: { type: 'All Properties' }
});
```

#### `useLanguage()`
```typescript
// Cambio de idioma global
const { lang, setLang, t } = useLanguage();
```

#### `useAnalytics()`
```typescript
// Tracking de analytics
const { trackEvent, trackPageView } = useAnalytics();
```

---

## 🧩 Componentes Principales

### Property Components

| Componente | Ubicación | Propósito |
|------------|-----------|-----------|
| `PropertyGallery` | `ui/PropertyGallery.tsx` | Carousel de imágenes con thumbnails |
| `PropertyMap` | `ui/PropertyMap.tsx` | Mapa interactivo Mapbox GL |
| `PropertyListWithMap` | `ui/PropertyListWithMap.tsx` | Vista lista + mapa split |
| `ConsultationBooking` | `ui/ConsultationBooking.tsx` | Formulario de consulta/lead |
| `PropertyLoadingStates` | `ui/PropertyLoadingStates.tsx` | Skeleton loaders |

### Reader Components (Editorial)

| Componente | Propósito |
|------------|-----------|
| `DigitalReader` | EPUB reader completo |
| `ProfessionalReader` | Reader avanzado con features |
| `SimpleReader` | Reader básico |
| `FirstChapter` | Preview de primer capítulo |

### Layout Components

| Componente | Propósito |
|------------|-----------|
| `Header` | Navigation header con theme toggle |
| `Footer` | Site footer |
| `ThemeSwitch` | Dark/Light mode toggle |
| `Logo` | MaalCa logo component |

### UI Components

| Componente | Propósito |
|------------|-----------|
| `Button` | Button reutilizable con variantes |
| `ProjectImage` | Optimized project images |
| `LanguageToggle` | Selector de idioma EN/ES |

---

## 🗺 Páginas y Rutas

### Estructura de Rutas

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `(marketing)/page.tsx` | ✅ Homepage activa |
| `/catering` | `(marketing)/catering/page.tsx` | Catering services |
| `/galeria` | `(marketing)/galeria/page.tsx` | Gallery |
| `/propiedades` | `(marketing)/propiedades/page.tsx` | Alternative properties |
| `/maalca-properties` | `maalca-properties/page.tsx` | ⭐ Main real estate platform |
| `/editorial` | `editorial/page.tsx` | Editorial MaalCa |
| `/ciriwhispers` | `ciriwhispers/page.tsx` | CiriWhispers project |
| `/cirisonic` | `cirisonic/page.tsx` | CiriSonic AI factory |
| `/hablando-mierda` | `hablando-mierda/page.tsx` | HBM Podcast |
| `/masa-tina` | `masa-tina/page.tsx` | Gastronomy |
| `/verde-prive` | `verde-prive/page.tsx` | Cannabis lifestyle |
| `/pegote-barber` | `pegote-barber/page.tsx` | Barbershop |
| `/dr-pichardo` | `dr-pichardo/page.tsx` | Medical services |
| `/dr-pichardo/portal` | `dr-pichardo/portal/page.tsx` | Patient portal |
| `/dr-pichardo/servicios` | `dr-pichardo/servicios/page.tsx` | Medical services |
| `/ecosistema` | `ecosistema/page.tsx` | Ecosystem overview |
| `/servicios` | `servicios/page.tsx` | Services |
| `/contacto` | `contacto/page.tsx` | Contact page |
| `/casos-estudio` | `casos-estudio/page.tsx` | Case studies |

### Route Group `(marketing)`

**Importante:** El folder `(marketing)` es un **Route Group** de Next.js:
- ✅ No afecta la URL (invisible en routing)
- ✅ Permite organización lógica
- ✅ Puede tener layout propio
- ✅ `(marketing)/page.tsx` se sirve en `/` (raíz)

---

## 🛡 Estrategia de Fallback

### Niveles de Fallback

```
┌──────────────────────────────────────────────────────┐
│ Nivel 1: Umbraco API (Producción)                   │
│ - Live data desde CMS                                │
│ - Actualizado por editores                           │
│ - Cacheo: 5 minutos (revalidate: 300)              │
└──────────────────┬───────────────────────────────────┘
                   │ ✗ Falla
                   ▼
┌──────────────────────────────────────────────────────┐
│ Nivel 2: Mock Data (Desarrollo/Fallback)            │
│ - src/data/properties-mock.ts                        │
│ - 6 propiedades de ejemplo                           │
│ - Datos completos y consistentes                     │
└──────────────────┬───────────────────────────────────┘
                   │ ✗ Falla
                   ▼
┌──────────────────────────────────────────────────────┐
│ Nivel 3: Empty State UI                             │
│ - "No properties available"                          │
│ - Error boundaries                                   │
│ - Retry buttons                                      │
└──────────────────────────────────────────────────────┘
```

### Ventajas del Sistema

1. **Desarrollo Sin Dependencias**: Devs pueden trabajar sin Umbraco configurado
2. **Resilencia**: Site funciona incluso si Umbraco está caído
3. **Demo-Friendly**: Fácil demostrar features sin backend
4. **Consistent Data**: Mock data tiene estructura idéntica a producción
5. **Fast Development**: No waiting para API calls durante dev

---

## 🔐 Variables de Entorno

### Archivo: `.env.local`

```bash
# Umbraco API Configuration
UMBRACO_API_URL=https://your-umbraco-instance.com
UMBRACO_API_KEY=your-api-key-here

# Umbraco Media (Public)
NEXT_PUBLIC_UMBRACO_MEDIA_URL=https://media.your-umbraco-instance.com

# Mapbox (Public)
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token-here

# Analytics (si aplica)
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### Variables Requeridas vs Opcionales

| Variable | Requerida | Default Behavior |
|----------|-----------|------------------|
| `UMBRACO_API_URL` | ❌ | Usa mock data |
| `UMBRACO_API_KEY` | ❌ | Request sin auth |
| `NEXT_PUBLIC_UMBRACO_MEDIA_URL` | ❌ | Usa relative paths |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | ✅ | Maps no funcionan |

**Nota:** El sitio funciona sin ninguna variable de entorno configurada, usando mock data para todo.

---

## 📊 Performance & Optimización

### Estrategias Implementadas

1. **Next.js Turbopack**: Build times mejorados
2. **Image Optimization**: `next/image` para todas las imágenes
3. **Code Splitting**: Automático por rutas
4. **Lazy Loading**: Componentes y imágenes
5. **API Caching**: `revalidate: 300` (5 min)
6. **Framer Motion**: Animaciones GPU-accelerated
7. **React 19**: Concurrent rendering features

### Métricas Monitoreadas

- **PerformanceDebugger** component en development
- Web Vitals tracking
- API response times
- Image load times

---

## 🚀 Deployment

### Configuración Vercel (Recomendada)

```bash
# Environment Variables en Vercel
UMBRACO_API_URL=https://prod-umbraco.com
UMBRACO_API_KEY=prod_api_key_secret
NEXT_PUBLIC_UMBRACO_MEDIA_URL=https://cdn.prod-umbraco.com
NEXT_PUBLIC_MAPBOX_TOKEN=pk.production_token
```

### Build Command
```bash
npm run build --turbopack
```

### Deploy Targets
- **Vercel** (Recommended)
- **Netlify** (Compatible)
- **Docker** (Dockerfile incluido)
- **Self-hosted** (Node.js)

---

## 🧪 Testing Strategy

### Current State
- **TypeScript Strict Mode**: Type checking en build
- **ESLint**: Code quality checks
- **Manual QA**: Visual testing

### Future Additions
- Unit tests (Jest + React Testing Library)
- E2E tests (Playwright)
- Visual regression tests
- API integration tests

---

## 📚 Documentación Relacionada

| Documento | Propósito |
|-----------|-----------|
| `ARCHITECTURE.md` | Este documento - Overview técnico |
| `BRANDING.md` | Guías de branding y estilos |
| `CLAUDE.md` | Instrucciones para Claude Code |
| `MAALCA_PROPERTIES_READY.md` | Docs específicos de Properties |

---

## 🔄 Roadmap Técnico

### Próximas Mejoras

1. **API Routes en Next.js**: Crear endpoints propios para proxy Umbraco
2. **Server Actions**: Usar React Server Actions para forms
3. **Streaming SSR**: Aprovechar React 19 streaming
4. **Analytics Integration**: Google Analytics / Mixpanel
5. **SEO Optimization**: Metatags dinámicos desde Umbraco
6. **Newsletter Integration**: Mailchimp / SendGrid
7. **CRM Integration**: Para leads de MaalCa Properties
8. **Search**: Algolia / Elasticsearch para búsqueda avanzada

---

## 📞 Contacto Técnico

Para preguntas sobre la arquitectura:
- **Email**: hello@maalca.com
- **GitHub**: [Repository URL]

---

**Versión del Documento:** 1.0
**Última Actualización:** 2025-10-29
**Mantenido por:** MaalCa Development Team
