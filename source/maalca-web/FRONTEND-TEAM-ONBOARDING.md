# MaalCa — Frontend Team Onboarding

> Estado a: Marzo 2026
> Para: Equipo frontend que se une al proyecto

---

## 1. Visión general del sistema

MaalCa es un ecosistema multi-tenant. Un solo frontend en Next.js sirve dashboards y páginas públicas para múltiples negocios (afiliados). El backend de contenido editorial es Umbraco CMS con su Delivery API headless.

```
┌─────────────────────────────────────────────────────┐
│                  maalca-web (Next.js 15)             │
│  Marketing site + Dashboard multi-tenant por ruta   │
└──────────┬──────────────────────────┬───────────────┘
           │                          │
           ▼                          ▼
┌──────────────────┐      ┌────────────────────────┐
│  MaalCaCMS       │      │  maalca-api (pendiente) │
│  Umbraco 15.1.0  │      │  REST API propia        │
│  Delivery API    │      │  (appointments, billing,│
│  Puerto 5011     │      │   inventory, campaigns) │
└──────────────────┘      └────────────────────────┘
```

---

## 2. Stack tecnológico

### Frontend (`/source/maalca-web`)
| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 15.5.0 | App Router + Turbopack |
| React | 19 | UI framework |
| TypeScript | 5.x (strict) | Tipado completo |
| Tailwind CSS | 4.x | Estilos — solo clases directas |
| Framer Motion | latest | Animaciones |

### Backend CMS (`/MaalCaCMS`)
| Tecnología | Versión | Uso |
|---|---|---|
| Umbraco CMS | 15.1.0 | Headless CMS |
| ASP.NET Core | .NET 9 | Runtime |
| SQL Server LocalDB | — | BD local (dev) |
| Delivery API | v2 | API pública de contenido |

---

## 3. Estructura de rutas

```
src/app/
  (marketing)/           # Sitio público - homepage
  dashboard/
    page.tsx             # Selector de afiliado
    [affiliateId]/       # Dashboard por afiliado
      layout.tsx         # Layout con sidebar + header
      page.tsx           # Overview/home del dashboard
      appointments/      # Citas
      customers/         # CRM
      campaigns/         # Marketing
      inventory/         # Inventario
      invoicing/         # Facturación
      team/              # Equipo
      queue/             # Fila virtual
      salon/             # Vista salón
      giftcards/         # Gift cards
      reports/           # Reportes
      metrics/           # Analytics
  editorial/             # Contenido editorial (desde Umbraco)
  pegote-barber/         # Landing pública de Pegote
  maalca-properties/     # Landing pública inmobiliaria
  ...                    # Otras landings públicas
```

### Afiliados disponibles en dashboard

| affiliateId | Negocio | Moneda | Módulos activos |
|---|---|---|---|
| `pegote-barbershop` | Pegote Barbershop (NY) | USD | Todos |
| `britocolor` | BritoColor (DO) | DOP | Sin citas/cola/salón |
| `masa-tina` | Masa Tina Catering (NY) | USD | Sin cola/salón |
| `dr-pichardo` | Dr. Pichardo (DO) | DOP | Citas, fila, pacientes |
| `hablando-mierda` | HBM Podcast (NY) | USD | Sin citas/facturación |

Config completa en: `src/config/affiliates-config.ts`

---

## 4. Umbraco Delivery API — Cómo consumirla

### Configuración actual
- **URL local (dev):** `http://localhost:5011`
- **Acceso:** Público, sin API key requerida
- **Versión API:** v2
- **OutputExpansionStrategy:** `ExpandAll` (todos los campos expandidos por defecto)
- **RichText:** retorna como JSON, no HTML

### Endpoints base

```
GET /umbraco/delivery/api/v2/content
GET /umbraco/delivery/api/v2/content/item/{slug}
GET /umbraco/delivery/api/v2/content/{id}
GET /umbraco/delivery/api/v2/media
GET /umbraco/delivery/api/v2/media/{id}
```

### Ejemplos de uso

```ts
// Obtener todo el contenido publicado
const res = await fetch('http://localhost:5011/umbraco/delivery/api/v2/content')
const { items, total } = await res.json()

// Obtener item por slug
const res = await fetch('http://localhost:5011/umbraco/delivery/api/v2/content/item/pegote')
const content = await res.json()

// Filtrar por content type
const res = await fetch(
  'http://localhost:5011/umbraco/delivery/api/v2/content?filter=contentType:barbershop'
)

// Paginar
const res = await fetch(
  'http://localhost:5011/umbraco/delivery/api/v2/content?skip=0&take=10'
)
```

### Estructura de respuesta de un item

```json
{
  "contentType": "barbershop",
  "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "name": "Pegote Barbershop",
  "route": { "path": "/pegote" },
  "properties": {
    "brandName": "Pegote Barbershop",
    "slug": "pegote",
    "heroTitle": "Estilo Dominicano, Calidad Internacional",
    "heroDescription": "La barbería #1...",
    "heroImage": { "mediaType": "Image", "url": "/media/..." },
    "services": {
      "contentData": [
        {
          "contentType": "serviceBlock",
          "properties": {
            "serviceName": "Corte Clásico",
            "serviceDescription": "...",
            "duration": "45 min",
            "price": "RD$ 500"
          }
        }
      ]
    },
    "seoTitle": "...",
    "seoDescription": "..."
  }
}
```

### Content Types disponibles (una vez creados en backoffice)

| Content Type | Descripción |
|---|---|
| `barbershop` | Barbería (hereda baseAffiliate) |
| `restaurant` | Restaurante (hereda baseAffiliate) |
| `realEstate` | Inmobiliaria (hereda baseAffiliate) |
| `editorialContent` | Artículo editorial con EPUB/PDF |
| `epubViewer` | Visor EPUB multilenguaje |

> **IMPORTANTE:** Los Document Types en Umbraco aún necesitan crearse manualmente
> en el backoffice (`http://localhost:5011/umbraco`). Ver `CHECKLIST-IMPLEMENTACION.md`.

### Cliente TypeScript recomendado para Delivery API

Crea un archivo `src/lib/umbraco/deliveryClient.ts`:

```ts
const UMBRACO_BASE = process.env.NEXT_PUBLIC_UMBRACO_URL ?? 'http://localhost:5011'
const DELIVERY_BASE = `${UMBRACO_BASE}/umbraco/delivery/api/v2`

export interface UmbracoItem<T = Record<string, unknown>> {
  id: string
  name: string
  contentType: string
  route: { path: string }
  properties: T
}

export interface UmbracoListResponse<T> {
  total: number
  items: UmbracoItem<T>[]
}

export async function getContentBySlug<T>(slug: string): Promise<UmbracoItem<T>> {
  const res = await fetch(`${DELIVERY_BASE}/content/item/${slug}`, {
    next: { revalidate: 60 } // ISR: revalida cada 60s
  })
  if (!res.ok) throw new Error(`Umbraco 404: ${slug}`)
  return res.json()
}

export async function getContentByType<T>(
  contentType: string,
  { skip = 0, take = 10 } = {}
): Promise<UmbracoListResponse<T>> {
  const url = new URL(`${DELIVERY_BASE}/content`)
  url.searchParams.set('filter', `contentType:${contentType}`)
  url.searchParams.set('skip', String(skip))
  url.searchParams.set('take', String(take))

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 }
  })
  if (!res.ok) throw new Error(`Umbraco error: ${res.status}`)
  return res.json()
}
```

---

## 5. API interna de la plataforma (maalca-api)

El cliente ya está construido en `src/lib/api/`. Apunta a `NEXT_PUBLIC_API_BASE_URL`.

### Módulos disponibles

```ts
import { appointmentsApi } from '@/lib/api'
import { billingApi }      from '@/lib/api'
import { campaignsApi }    from '@/lib/api'
import { inventoryApi }    from '@/lib/api'
```

### Ejemplo de uso en un componente

```tsx
// Server component (Next.js 15 App Router)
import { appointmentsApi } from '@/lib/api'

export default async function AppointmentsPage({ params }) {
  const { affiliateId } = await params
  const { data, total } = await appointmentsApi.getAppointments({
    tenantId: affiliateId,
    status: 'scheduled',
    page: 1,
    pageSize: 20
  })

  return <AppointmentsList items={data} total={total} />
}
```

### Context multi-tenant (header X-Tenant-Id)

```ts
import { createTenantApiClient } from '@/lib/api'

// Crea cliente ya configurado con el tenant
const api = createTenantApiClient('pegote-barbershop')
const stats = await api.get('/api/appointments/stats')
```

> **NOTA:** El backend `maalca-api` aún no está implementado. Los métodos del cliente
> están listos pero los endpoints del servidor devuelven 404 hasta que el API esté arriba.

---

## 6. Variables de entorno

Crear `.env.local` en la raíz de `maalca-web`:

```env
# Umbraco Delivery API
NEXT_PUBLIC_UMBRACO_URL=http://localhost:5011

# API interna MaalCa (cuando esté lista)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

# Para producción en Vercel, configurar en el dashboard de Vercel
```

---

## 7. Reglas de estilo — LEER ANTES DE TOCAR CSS

El proyecto tiene reglas estrictas en `CLAUDE.md` y `BRANDING.md`:

- **SOLO clases Tailwind directas:** `text-white`, `bg-red-600`, `text-gray-300`
- **NUNCA clases semánticas:** NO `text-brand-primary`, NO `bg-surface`, NO `text-text-primary`
- **Tema fijo oscuro:** negro (`bg-black`, `bg-gray-900`) con rojo (`red-600`) como color de marca
- **NO dark mode toggle** — el sitio siempre es dark

---

## 8. Comandos esenciales

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev          # http://localhost:3000

# Build producción
npm run build
npm start

# Verificar tipos
npx tsc --noEmit

# Lint
npm run lint
```

---

## 9. Estado actual del proyecto

| Componente | Estado | Notas |
|---|---|---|
| Next.js frontend | **Produccion** | Deployado en Vercel |
| Marketing site | **Completo** | Landing pages por afiliado |
| Dashboard multi-tenant | **En desarrollo** | UI lista, API pendiente |
| Umbraco CMS | **Local solamente** | LocalDB, no en produccion |
| Delivery API | **Habilitada** | Content types pendientes de crear |
| maalca-api | **Pendiente** | Cliente listo, servidor no |
| Azure AI Search | **Pendiente** | Credenciales placeholder |

---

## 10. Preguntas frecuentes

**P: ¿Cómo sé qué módulos mostrar para un afiliado?**
R: Leer `src/config/affiliates-config.ts` — cada afiliado tiene un objeto `modules` con booleanos.

**P: ¿Cómo agrego un nuevo afiliado al dashboard?**
R: Agregar una entrada en `affiliatesConfig` en `src/config/affiliates-config.ts` con su `id`, `branding`, `modules` y `features`.

**P: ¿El Delivery API necesita autenticación?**
R: No, está configurado con `PublicAccess: true` y sin API key.

**P: ¿Dónde está el repo de Umbraco?**
R: `C:\Users\apich\MaalCaCMS` — es un proyecto local, no tiene remote de git propio aún.

**P: ¿Cómo agrego datos de prueba al dashboard mientras el API no existe?**
R: Usar mock data directo en el componente o crear un archivo en `src/lib/mock/`.
