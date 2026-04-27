# 📚 MAALCA WEB - MASTER DOCUMENTATION

> **Estado:** Marzo 2026
> **Consolidado:** Marzo 2026
> **Versión:** 1.0

---

## 📋 ÍNDICE MAESTRO

### 1. ARQUITECTURA Y DISEÑO
- [1.1 Arquitectura General](#11-arquitectura-general)
- [1.2 Arquitectura del Ecosistema](#12-arquitectura-del-ecosistema)
- [1.3 Arquitectura de Temas](#13-arquitectura-de-temas)
- [1.4 Guía de Migración de Temas](#14-guía-de-migración-de-temas)
- [1.5 Branding y Dark Mode](#15-branding-y-dark-mode)

### 2. ESTADO DEL PROYECTO
- [2.1 Backlog MVP](#21-backlog-mvp)
- [2.2 MaalCa Properties Ready](#22-maalca-properties-ready)
- [2.3 Multi-Tenant Dashboard](#23-multi-tenant-dashboard)
- [2.4 Estado del Sistema de Idiomas](#24-estado-del-sistema-de-idiomas)

### 3. INTEGRACIÓN Y GUÍAS
- [3.1 Start Here](#31-start-here)
- [3.2 Quickstart](#32-quickstart)
- [3.3 Integración Editorial](#33-integración-editorial)
- [3.4 Frontend Team Onboarding](#34-frontend-team-onboarding)
- [3.5 Setup Umbraco](#35-setup-umbraco)
- [3.6 Deploy](#36-deploy)

### 4. ANÁLISIS Y ESTRATEGIAS
- [4.1 Affiliate System Analysis](#41-affiliate-system-analysis)
- [4.2 Resumen Ejecutivo Editorial](#42-resumen-ejecutivo-editorial)
- [4.3 Missing Features Analysis](#43-missing-features-analysis)
- [4.4 Ecosystem Audit Report](#44-ecosystem-audit-report)

### 5. IMPLEMENTACIONES
- [5.1 Newsletter Implementation](#51-newsletter-implementation)
- [5.2 Analytics Implementation](#52-analytics-implementation)
- [5.3 Contact Forms Implementation](#53-contact-forms-implementation)
- [5.4 Digital Reader Implementation](#54-digital-reader-implementation)
- [5.5 Social Share Implementation](#55-social-share-implementation)
- [5.6 Pending Implementations](#56-pending-implementations)
- [5.7 AI Architecture](#57-ai-architecture)
- [5.8 Consultation Booking Integration](#58-consultation-booking-integration)

### 6. MEJORAS IMPLEMENTADAS
- [6.1 Mejoras Implementadas](#61-mejoras-implementadas)
- [6.2 Dashboard Improvements](#62-dashboard-improvements)
- [6.3 Mobile Dashboard Implementation](#63-mobile-dashboard-implementation)
- [6.4 Interactive Maps Implemented](#64-interactive-maps-implemented)
- [6.5 Pegote Commerce Completado](#65-pegote-commerce-completado)
- [6.6 Pegote Enhancement Roadmap](#66-pegote-enhancement-roadmap)
- [6.7 Pegote Improvements](#67-pegote-improvements)

---

# 1. ARQUITECTURA Y DISEÑO

## 1.1 Arquitectura General

### Stack Tecnológico

#### Core Framework
```json
{
  "next": "15.5.0",        // Next.js con App Router + Turbopack
  "react": "19.1.0",       // React 19 con concurrent features
  "typescript": "^5"       // TypeScript strict mode
}
```

#### UI & Styling
```json
{
  "tailwindcss": "^4",           // Tailwind CSS 4 con PostCSS
  "framer-motion": "^12.23.12",  // Animaciones y transiciones
  "clsx": "^2.1.1",              // Conditional classes
  "tailwind-merge": "^3.3.1"     // Merge Tailwind classes
}
```

#### Maps & Geolocation
```json
{
  "mapbox-gl": "^2.15.0",     // Mapbox GL para mapas
  "react-map-gl": "^7.1.7",   // React wrapper para Mapbox
  "@types/mapbox-gl": "^3.4.1"
}
```

#### Content & Media
```json
{
  "react-reader": "^2.0.13",      // EPUB reader para libros
  "epubjs": "^0.3.93",            // EPUB.js library
  "epub-gen-memory": "^1.1.2",    // EPUB generation
  "nodepub": "^3.2.1"             // Node.js EPUB publisher
}
```

### Estructura del Proyecto

```
maalca-web/
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (marketing)/              # Route group (no afecta URL)
│   │   │   └── page.tsx              # ✅ HOMEPAGE ACTIVA
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
│   │   ├── ecosistema/               # Ecosystem overview
│   │   ├── editorial/                # Editorial MaalCa
│   │   ├── maalca-properties/        # Real Estate Platform
│   │   └── dashboard/[affiliateId]/ # Multi-tenant Dashboard
│   │
│   ├── components/                   # Componentes React
│   │   ├── brands/                   # Brand components
│   │   ├── layout/                   # Layout components
│   │   ├── ui/                       # UI components library
│   │   └── editorial/                # Editorial components
│   │
│   ├── data/                         # Data layer
│   │   ├── editorialContent.ts       # Editorial data
│   │   ├── properties-mock.ts        # Mock properties
│   │   └── mock/                     # Mock data
│   │
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useAnalytics.ts          # Analytics tracking
│   │   ├── useContactForm.ts         # Contact form logic
│   │   ├── useProperties.ts          # Properties data
│   │   └── useLanguage.tsx           # i18n language switching
│   │
│   ├── lib/                          # Libraries & utilities
│   │   ├── umbraco-client.ts         # Umbraco API client
│   │   ├── types/                    # TypeScript types
│   │   └── utils/                    # Utility functions
│   │
│   └── config/
│       └── affiliates-config.ts      # Affiliate configuration
│
├── docs/                             # Documentación técnica
├── public/                           # Static assets
├── ARCHITECTURE.md                   # Este documento
├── BR # Branding guidelines
ANDING.md                      └── package.json                      # Dependencies
```

### Integración con Umbraco CMS

El sistema usa **Umbraco CMS** como backend headless con fallback automático a datos mock:

```typescript
class UmbracoClient {
  private baseUrl: string;
  private mediaUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = UMBRACO_API_URL;
    this.mediaUrl = UMBRACO_MEDIA_URL;
  }

  async getProperties(): Promise<Property[]> {
    // Si no hay URL configurada → usar mock data
    if (!this.baseUrl) {
      return mockProperties;
    }
    // Fetch from Umbraco API
  }
}
```

**Beneficios del fallback:**
- ✅ El sitio funciona sin Umbraco configurado
- ✅ Desarrollo local sin dependencias externas
- ✅ Resiliente a fallos de API

---

## 1.2 Arquitectura del Ecosistema

### ¿Qué es MaalCa?

MaalCa es un ecosistema creativo multi-tenant que incluye:

```
MaalCa.com (Ecosistema Creativo)
│
├── Homepage                 # Presentación general
├── Editorial MaalCa ⭐      # Contenido y pensamiento
├── CiriWhispers            # Audio/Podcast
├── CiriSonic               # Servicios de audio
├── MaalCa Properties       # Bienes raíces
├── Dr. Pichardo            # Consultas médicas
├── Pegote Barbershop       # Barbería
├── BritoColor              # Servicios
├── Masa Tina               # Gastronomía
└── Dashboard Multi-tenant # Panel de control para afiliados
```

### Stack Tecnológico Completo

```
Frontend
├── Next.js 15              # React framework con App Router
├── TypeScript              # Type safety
├── Tailwind CSS 4          # Styling
├── Framer Motion           # Animations
└── React 19                # UI library

Backend (API Routes)
├── Next.js API Routes      # Serverless functions
├── Resend                  # Email service
└── (Future) Database       # PostgreSQL/Supabase

Content Management
├── Static Data (Current)   # TypeScript files
└── (Future) CMS            # Umbraco CMS

Deployment
├── Vercel                  # Hosting & CI/CD
└── GitHub                  # Version control
```

### Roadmap de Escalabilidad

#### Fase 1: MVP (Actual)
- Datos hardcoded
- Sin base de datos
- Deployment en Vercel

#### Fase 2: CMS Integration (3-6 meses)
- Notion API o Umbraco CMS
- Edición sin código
- Webhook triggers rebuild

#### Fase 3: Database & Users (6-12 meses)
- PostgreSQL/Supabase
- User authentication
- Comentarios y favoritos

#### Fase 4: Premium Content (12+ meses)
- Paywall para contenido premium
- Suscripciones mensuales
- Comunidad privada

---

## 1.3 Arquitectura de Temas

### Principios de Arquitectura

1. **Single Source of Truth**
   - Todos los temas controlados via `data-theme` attribute en `<html>`
   - No hay sistemas conflictivos de classes
   - Gestión centralizada de estado de tema

2. **Semantic Design Tokens**
   - Colores definidos por propósito, no apariencia
   - Nombrado consistente entre todos los temas
   - Fácil creación y mantenimiento de temas

3. **Component Isolation**
   - Componentes se adaptan automáticamente a cambios de tema
   - No se requiere lógica de tema específica en componentes
   - Reutilizable entre diferentes contextos de tema

4. **Progressive Enhancement**
   - Detección y respeto de tema del sistema
   - Degradación graceful sin JavaScript
   - Transiciones suaves entre estados de tema

### Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Components  │  Hooks  │  Pages  │  Layout  │  Providers   │
├─────────────────────────────────────────────────────────────┤
│                    Theme Provider Layer                     │
├─────────────────────────────────────────────────────────────┤
│  UnifiedThemeProvider  │  Theme Context  │  State Manager  │
├─────────────────────────────────────────────────────────────┤
│                    Design Token Layer                       │
├─────────────────────────────────────────────────────────────┤
│   Colors   │  Typography  │  Spacing  │  Effects  │  etc   │
├─────────────────────────────────────────────────────────────┤
│                    CSS Custom Properties                   │
├─────────────────────────────────────────────────────────────┤
│  --color-text-primary  │  --spacing-md  │  --radius-lg     │
└─────────────────────────────────────────────────────────────┘
```

---

## 1.4 Guía de Migración de Temas

### Problemas Resueltos

#### Antes (Problemático)
- ❌ 4 diferentes sistemas de temas
- ❌ Texto azul ilegible en dark mode
- ❌ Mezcla inconsistente de colores HSL/hex
- ❌ Código de cambio de tema manual espalhado
- ❌ Lógica de tema específica por componente

#### Después (Solución)
- ✅ Sistema unificado `data-theme`
- ✅ Design tokens semánticos
- ✅ Contraste de texto accesible en todos los temas
- ✅ Gestión centralizada de temas
- ✅ Arquitectura de componentes escalable

### Pasos Rápidos

```bash
# Step 1: Backup archivos actuales
cp src/app/globals.css src/app/globals.css.backup
cp src/app/layout.tsx src/app/layout.tsx.backup

# Step 2: Usar nuevos archivos migrados
mv src/app/globals-new.css src/app/globals.css
mv src/app/layout-new.tsx src/app/layout.tsx

# Step 3: Actualizar cambios de tema
import { UnifiedThemeSwitch } from "@/components/ui/UnifiedThemeSwitch";
```

---

## 1.5 Branding y Dark Mode

### Reglas Críticas

#### Arquitectura de Páginas

**PÁGINA PRINCIPAL ACTIVA:**
- ✅ `src/app/(marketing)/page.tsx` - Esta es la página que Next.js sirve en la ruta `/`
- ❌ `src/app/page.tsx` - NO USAR - Solo existe por estructura de Next.js

#### Sistema de Estilos Correcto

**USAR: Clases Directas de Tailwind**
```tsx
// CORRECTO - Clases directas
<h1 className="text-white">MaalCa</h1>
<span className="text-red-600">Ecosistema</span>
<p className="text-gray-300">Descripción</p>
<div className="bg-black">Content</div>
<button className="bg-red-600 hover:bg-red-700">CTA</button>
```

**NO USAR: Clases Semánticas**
```tsx
// INCORRECTO - NO usar estas clases
<h1 className="text-text-primary">MaalCa</h1>
<span className="text-brand-primary">Ecosistema</span>
```

### Paleta de Colores Oficial

#### Rojo MaalCa (Brand Color)
- `text-red-600` - Títulos de marca, CTAs principales
- `bg-red-600` - Backgrounds de botones primarios
- `hover:bg-red-700` - Estados hover

#### Blancos y Grises
- `text-white` - Títulos principales
- `text-gray-300` - Descripciones
- `text-gray-400` - Textos secundarios
- `bg-black` - Background principal
- `bg-gray-900` - Secciones alternas

### Estructura de Hero Section

```tsx
<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
  {/* Animated Background */}
  <div className="absolute inset-0">
    <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-red-900/20" />
  </div>

  {/* Título con patrón de branding */}
  <motion.h1 className="font-display text-6xl sm:text-8xl lg:text-9xl font-bold mb-8 leading-tight">
    <span className="text-white">MaalCa</span>
    <br />
    <span className="text-red-600">Ecosistema</span>
  </motion.h1>
</section>
```

---

# 2. ESTADO DEL PROYECTO

## 2.1 Backlog MVP

**Fecha:** Marzo 2026  
**Estado del Proyecto:** En desarrollo activo  
**Último commit:** `6dc4d8a` - Pegote Barbershop + Login System

### Lo que YA EXISTE (implementado)

| Módulo | Estado | Notas |
|--------|--------|-------|
| **Homepage** (`/`) | ✅ Producción | `src/app/(marketing)/page.tsx` |
| **Ecosistema** (`/ecosistema`) | ✅ Producción | Muestra proyectos activos |
| **Editorial MaalCa** (`/editorial`) | ✅ UI completa | Artículos estáticos, sin CMS |
| **CiriWhispers** (`/ciriwhispers`) | ✅ UI completa | Sin lector EPUB real |
| **CiriSonic** (`/cirisonic`) | ✅ UI/Mockup | Sin API de contenido |
| **MaalCa Properties** (`/maalca-properties`) | ✅ UI completa | Sin backend de reservas |
| **Dr. Pichardo** (`/dr-pichardo`) | ✅ UI completa | Sin sistema de citas real |
| **Hablando Mierda** (`/hablando-mierda`) | ✅ UI completa | Sin infraestructura podcast |
| **Login** (`/login`) | ✅ UI completa | Sin auth backend real |
| **Dashboard Multi-tenant** (`/dashboard/[id]`) | ✅ UI completa | Sin datos reales |
| **Pegote Barbershop** (`/dashboard/pegote-barbershop`) | ✅ UI completa | Sin backend |
| **Newsletter API** (`/api/newsletter/subscribe`) | ✅ Implementado | Necesita Formspree ID real |

### Épicas y Prioridades

#### 🔴 ÉPICA 1: AUTENTICACIÓN REAL
**Prioridad:** CRÍTICA - Bloquea todo lo demás
- [ ] AUTH-01 - Elegir proveedor auth (Supabase Auth recomendado)
- [ ] AUTH-02 - Configurar Supabase proyecto
- [ ] AUTH-03 - Implementar login/logout real
- [ ] AUTH-04 - Proteger rutas de dashboard con middleware
- [ ] AUTH-05 - Crear tabla `affiliates` en Supabase

#### 🔴 ÉPICA 2: BASE DE DATOS REAL
**Prioridad:** CRÍTICA - Sin esto el dashboard es solo UI
- [ ] DB-01 - Setup Supabase
- [ ] DB-02 - Schema: `customers`, `appointments`, `invoices`, `inventory`
- [ ] DB-03 - API routes para CRUD

#### 🟡 ÉPICA 3: DASHBOARD PEGOTE - MÓDULOS FUNCIONALES
**Prioridad:** ALTA - Core del MVP
- [ ] DASH-01 - Clientes: CRUD real
- [ ] DASH-02 - Citas: Calendario funcional
- [ ] DASH-03 - Facturación: Crear/enviar facturas
- [ ] DASH-04 - Inventario: Gestión de productos
- [ ] DASH-05 - Cola de espera: Sistema en tiempo real
- [ ] DASH-06 - Métricas: Dashboard con datos reales

---

## 2.2 MaalCa Properties Ready

### Estado Actual: Listo para Umbraco

El frontend de MaalCa Properties ha sido completamente preparado para integración con Umbraco CMS. Todo funciona con datos mock y está listo para recibir contenido real.

### Archivos Implementados

1. **Umbraco Integration**
   - `UMBRACO_SETUP.md` - Guía completa
   - `src/lib/umbraco-client.ts` - Cliente API con fallback
   - `src/lib/types/property.ts` - TypeScript interfaces
   - `src/data/properties-mock.ts` - Datos de fallback

2. **Enhanced Components**
   - `PropertyGallery.tsx` - Galería con lightbox
   - `useProperties.ts` - Hooks personalizados
   - `maalca-properties/page.tsx` - Página actualizada

### Datos Mock Incluidos

6 Propiedades Completas:
1. **Villa Paraíso Oceanfront** ($850K) - 4 bed/4 bath
2. **Caribbean Penthouse Dreams** ($1.2M) - 3 bed/3 bath
3. **Tropical Estate Sanctuary** ($2.5M) - 6 bed/7 bath
4. **Modern Beach House** ($650K) - 3 bed/2 bath
5. **Marina Luxury Residences** ($450K) - 2 bed/2 bath
6. **Eco-Luxury Retreat** ($950K) - 4 bed/3 bath

---

## 2.3 Multi-Tenant Dashboard

Sistema de dashboards multi-tenant implementado para el ecosistema MaalCa, permitiendo que cada afiliado tenga su propio panel de control personalizado.

### Características

- ✅ Dashboard personalizado con branding propio
- ✅ Módulos condicionales según tipo de negocio
- ✅ Configuración de características
- ✅ Métricas y analytics específicas
- ✅ Navegación adaptativa

### Estructura

```
src/
├── config/
│   └── affiliates-config.ts          # Configuración de cada afiliado
├── app/dashboard/[affiliateId]/
│   ├── layout.tsx                    # Layout común
│   ├── page.tsx                      # Dashboard principal
│   ├── metrics/page.tsx              # Módulo de métricas
│   ├── customers/page.tsx            # Módulo CRM
│   ├── appointments/page.tsx        # Módulo de citas
│   └── settings/page.tsx            # Configuración
└── components/dashboard/
    ├── DashboardHeader.tsx           # Header con branding
    └── DashboardSidebar.tsx          # Sidebar con navegación
```

### Afiliados Configurados

- pegote-barbershop
- britocolor
- dr-pichardo
- masa-tina
- hablando-mierda-podcast

---

## 2.4 Estado del Sistema de Idiomas

El sistema de idiomas está implementado con soporte para:
- Español (es) - Idioma principal
- Inglés (en) - Idioma secundario

### Implementación

```typescript
// useLanguage hook
const { locale, setLocale, t } = useLanguage();

// Uso en componentes
<p>{t('welcome')}</p>
<button onClick={() => setLocale('en')}>English</button>
```

---

# 3. INTEGRACIÓN Y GUÍAS

## 3.1 Start Here

### Estado Rápido

Editorial MaalCa ya está integrado. Esto es lo que existe:

**Archivos Creados:**
- ✅ `src/app/editorial/page.tsx` - Página principal
- ✅ `src/data/editorialContent.ts` - 3 artículos completos
- ✅ `src/components/editorial/ProfessionalReader.tsx` - Modal de lectura
- ✅ `src/hooks/useAnalytics.ts` - Tracking de analytics

**Características Disponibles:**
- ✅ Hero section con branding
- ✅ 6 article cards con filtros de categoría
- ✅ Modal de lectura profesional
- ✅ Sección de libros (3 libros)
- ✅ Formulario de newsletter
- ✅ Diseño responsive con Framer Motion

### Primeros Pasos

```bash
npm run dev
# Visitar: http://localhost:3000/editorial
```

---

## 3.2 Quickstart

### En 5 Minutos

**Step 1: Iniciar Dev Server**
```bash
npm run dev
# Visit: http://localhost:3000/editorial
```

**Step 2: Verificar Archivos**
```bash
ls src/app/editorial/page.tsx
ls src/data/editorialContent.ts
ls src/components/editorial/ProfessionalReader.tsx
```

**Step 3: Verificar Build**
```bash
npx tsc --noEmit
npm run build
```

---

## 3.3 Integración Editorial

### Verificación Inicial

```bash
ls -la src/app/editorial/page.tsx
ls -la src/data/editorialContent.ts
ls -la src/components/editorial/ProfessionalReader.tsx
```

### Guía Paso a Paso

#### Fase 1: Navegación del Sitio
Agregar link "Editorial" al menú de navegación.

#### Fase 2: Newsletter Funcional
Crear API route en `src/app/api/newsletter/subscribe/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const { email } = await request.json();
  
  // Validación
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  }
  
  // TODO: Guardar en base de datos
  // TODO: Enviar email con Resend
  
  return NextResponse.json({ message: 'Suscripción exitosa' });
}
```

---

## 3.4 Frontend Team Onboarding

### Visión General del Sistema

MaalCa es un ecosistema multi-tenant. Un solo frontend en Next.js sirve dashboards y páginas públicas para múltiples negocios (afiliados).

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
│  Delivery API    │      │  (appointments, billing)│
└──────────────────┘      └────────────────────────┘
```

### Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 15.5.0 | App Router + Turbopack |
| React | 19 | UI framework |
| TypeScript | 5.x | Tipado completo |
| Tailwind CSS | 4.x | Estilos |
| Framer Motion | latest | Animaciones |

---

## 3.5 Setup Umbraco

### Configuración Requerida

```bash
# Variables de entorno necesarias
UMBRACO_API_URL=https://tu-umbraco.com
NEXT_PUBLIC_UMBRACO_MEDIA_URL=https://tu-umbraco.com
UMBRACO_API_KEY=opcional
```

### Content Types

Crear Document Type "Property" con:
- title (Text String)
- location (Text String)
- price (Decimal)
- bedrooms/bathrooms (Numeric)
- amenities (Repeater/Tags)
- description (Rich Text)
- gallery (Media Picker)
- coordinates (Text String)

---

## 3.6 Deploy

### Estado del Proyecto ✅

- ✅ Proyecto construido exitosamente con Next.js 15 y Turbopack
- ✅ Todas las funcionalidades MaalCa Properties implementadas
- ✅ CiriWhispers Reader actualizado
- ✅ Build exitoso sin errores críticos

### Opciones de Despliegue

#### Opción 1: Auto-Deploy desde GitHub (Recomendado)
Si Vercel está configurado, el push ya activó el despliegue.

#### Opción 2: Dashboard de Vercel
1. Ir a https://vercel.com/dashboard
2. Seleccionar proyecto 'maalca-web'
3. Click en "Deploy"

#### Opción 3: CLI
```bash
vercel login
vercel --prod
```

---

# 4. ANÁLISIS Y ESTRATEGIAS

## 4.1 Affiliate System Analysis

[Contenido completo en AFFILIATE-SYSTEM-ANALYSIS.md]

El sistema de afiliados permite que múltiples negocios operen bajo el mismo ecosistema MaalCa, cada uno con su propio:
- Dashboard personalizado
- Configuración de módulos
- Branding
- Datos

---

## 4.2 Resumen Ejecutivo Editorial

[Contenido completo en RESUMEN-EJECUTIVO-EDITORIAL.md]

Editorial MaalCa es el corazón intelectual del ecosistema:
- Publicar artículos de reflexión
- Compilar libros para Amazon KDP
- Construir audiencia comprometida
- Generar ingresos

---

## 4.3 Missing Features Analysis

[Contenido completo en docs/missing-features-analysis.md]

Análisis de features críticas necesarias para lanzar los proyectos principales.

---

## 4.4 Ecosystem Audit Report

[Contenido completo en docs/ecosystem-audit-report.md]

Informe completo de auditoría estratégica del ecosistema.

---

# 5. IMPLEMENTACIONES

## 5.1 Newsletter Implementation

[Contenido completo en docs/newsletter-implementation.md]

Sistema de suscripción a newsletter con:
- Validación de emails
- Integración con Resend
- Tracking de analytics

## 5.2 Analytics Implementation

[Contenido completo en docs/analytics-implementation.md]

Sistema de tracking con Google Analytics 4.

## 5.3 Contact Forms Implementation

[Contenido completo en docs/contact-forms-implementation.md]

Formularios de contacto mejorados con validación y UX.

## 5.4 Digital Reader Implementation

[Contenido completo en docs/digital-reader-implementation.md]

Lector EPUB inmersivo con react-reader.

## 5.5 Social Share Implementation

[Contenido completo en docs/social-share-implementation.md]

Componentes para compartir en redes sociales.

## 5.6 Pending Implementations

[Contenido completo en docs/pending-implementations.md]

Tareas pendientes y futuras implementaciones.

## 5.7 AI Architecture

[Contenido completo en docs/ai-architecture.md]

Arquitectura de servidor AI y plan de implementación.

## 5.8 Consultation Booking Integration

[Contenido completo en CONSULTATION_BOOKING_INTEGRATION.md]

Sistema de reservas de consultas con validación completa.

---

# 6. MEJORAS IMPLEMENTADAS

## 6.1 Mejoras Implementadas

[Contenido completo en MEJORAS-IMPLEMENTADAS.md]

Lista de mejoras implementadas en el proyecto.

## 6.2 Dashboard Improvements

[Contenido completo en DASHBOARD-IMPROVEMENTS-COMPLETE.md]

Mejoras completadas en el dashboard.

## 6.3 Mobile Dashboard Implementation

[Contenido completo en MOBILE-DASHBOARD-IMPLEMENTATION.md]

Implementación del dashboard móvil.

## 6.4 Interactive Maps Implemented

[Contenido completo en INTERACTIVE_MAPS_IMPLEMENTED.md]

Mapas interactivos implementados.

## 6.5 Pegote Commerce Completado

[Contenido completo en PEGOTE-COMMERCE-COMPLETADO.md]

Commerce para Pegote Barbershop completado.

## 6.6 Pegote Enhancement Roadmap

[Contenido completo en PEGOTE-ENHANCEMENT-ROADMAP.md]

 roadmap de mejoras para Pegote.

## 6.7 Pegote Improvements

[Contenido completo en PEGOTE-IMPROVEMENTS.md]

Mejoras específicas de Pegote.

---

# 📁 Archivos de Documentación

Esta documentación consolidada incluye contenido de los siguientes archivos:

## Raíz del Proyecto
- `ARCHITECTURE.md` - Arquitectura técnica
- `ARQUITECTURA-ECOSISTEMA.md` - Arquitectura del ecosistema
- `BACKLOG-MVP.md` - Backlog del MVP
- `BRANDING.md` - Guía de branding
- `START-HERE.md` - Punto de entrada
- `QUICKSTART.md` - Guía rápida
- `INTEGRACION.md` - Guía de integración
- `MAALCA_PROPERTIES_READY.md` - Estado de properties
- `MULTI-TENANT-DASHBOARD.md` - Dashboard multi-tenant
- `THEME_ARCHITECTURE.md` - Arquitectura de temas
- `THEME_MIGRATION_GUIDE.md` - Guía de migración
- `FRONTEND-TEAM-ONBOARDING.md` - Onboarding
- `deploy.md` - Guía de despliegue

## Carpeta docs/
- `docs/ai-architecture.md`
- `docs/analytics-implementation.md`
- `docs/contact-forms-implementation.md`
- `docs/digital-reader-implementation.md`
- `docs/digital-reader-requirements.md`
- `docs/ecosystem-audit-prompt.md`
- `docs/ecosystem-audit-report.md`
- `docs/missing-features-analysis.md`
- `docs/newsletter-implementation.md`
- `docs/pending-implementations.md`
- `docs/social-share-implementation.md`

---

**Documento consolidado el:** Marzo 2026
**Versión:** 1.0
