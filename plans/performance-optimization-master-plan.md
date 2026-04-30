# Plan Maestro de Optimización de Rendimiento y Usabilidad
## MaalCa Web - Refactorización Completa

**Fecha:** 2026-03-10  
**Estado:** Planificación  
**Prioridad:** CRÍTICA

---

## 🚨 Resumen Ejecutivo

El sitio web de MaalCa presenta **problemas críticos de rendimiento** que afectan severamente la experiencia del usuario:

- **Navegación lenta y pesada**
- **Caídas frecuentes del sitio**
- **Experiencia de usuario deficiente**
- **Falta de patrones consistentes**

### Problemas Identificados

#### 🔴 CRÍTICO - Arquitectura Fundamental
- ✅ **39/39 páginas son Client Components** - CERO Server Components
- ✅ **Framer Motion en TODAS las páginas** - Overhead masivo
- ✅ **Header es Client Component** - Se rehidrata en cada navegación
- ✅ **CSS global con transiciones en TODOS los elementos** (`* {}`)
- ✅ **Sin estrategia de lazy loading**
- ✅ **Sin code splitting efectivo**

#### 🟡 ALTO - Patrones y Código
- ⚠️ Código duplicado entre páginas
- ⚠️ Sin patrones consistentes de diseño
- ⚠️ Animaciones excesivas e innecesarias
- ⚠️ Componentes monolíticos sin separación
- ⚠️ Bundle size excesivo

#### 🟢 MEDIO - Optimizaciones Específicas
- ℹ️ Imágenes sin optimización consistente
- ℹ️ Falta de estrategia de caching
- ℹ️ No hay prefetching estratégico

---

## 📊 Análisis Técnico Detallado

### 1. Uso de Client Components

**Problema:** TODAS las páginas usan `"use client"` en la primera línea.

```typescript
// ❌ MAL - 39 páginas hacen esto
"use client";

import { motion } from "framer-motion";
// ... resto del código
```

**Impacto:**
- ❌ Sin Server-Side Rendering (SSR)
- ❌ Sin Streaming
- ❌ JavaScript Bundle masivo al cliente
- ❌ Hidratación lenta
- ❌ No aprovecha React Server Components (RSC)
- ❌ SEO comprometido

**Solución:**
```typescript
// ✅ BIEN - Server Component por defecto
// No se necesita "use client"

import { ClientInteractiveSection } from './ClientInteractiveSection';

export default async function Page() {
  // Código del servidor
  const data = await fetchData();
  
  return (
    <div>
      {/* Contenido estático renderizado en servidor */}
      <StaticHero data={data} />
      
      {/* Solo la parte interactiva es cliente */}
      <ClientInteractiveSection />
    </div>
  );
}
```

### 2. Uso Excesivo de Framer Motion

**Problema:** Framer Motion se importa en TODAS las páginas (39/39).

```typescript
// ❌ MAL - Animaciones innecesarias
<motion.div
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1.2, delay: 0.3 }}
>
  <motion.h1
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
  >
    Título
  </motion.h1>
  <motion.p
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
  >
    Párrafo
  </motion.p>
</motion.div>
```

**Impacto:**
- 📦 Bundle size aumenta ~50KB por página
- ⚡ Animaciones causan reflows y repaints constantes
- 🐌 Performance comprometida en móviles
- 🔄 Re-renderizados innecesarios

**Solución:**
```typescript
// ✅ BIEN - CSS animations para la mayoría
<div className="fade-in">
  <h1>Título</h1>
  <p>Párrafo</p>
</div>

// Solo usar Framer Motion para interacciones complejas
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  <button>Click me</button>
</motion.div>
```

### 3. Header Component Problemático

**Archivo:** [`src/components/layout/Header.tsx`](../src/components/layout/Header.tsx)

**Problemas:**
```typescript
"use client"; // ❌ No debería ser client component

// ❌ Múltiples useEffect innecesarios
useEffect(() => {
  const handleScroll = () => setIsScrolled(window.scrollY > 20);
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

// ❌ Animaciones excesivas en cada elemento del nav
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.1 * index + 0.3 }}
>
```

**Impacto:**
- El header se rehidrata en CADA navegación
- Múltiples event listeners en cada página
- Animaciones que bloquean la interacción inicial

**Solución:** Crear estructura híbrida Server/Client

### 4. CSS Global Desastroso

**Archivo:** [`src/app/globals.css`](../src/app/globals.css:76-78)

```css
/* ❌ TERRIBLE - Transiciones en TODOS los elementos */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

**Impacto:**
- 🐌 Browser tiene que calcular transiciones para CADA elemento
- 🎨 Repaints constantes
- 📱 Performance móvil destruida
- 🔋 Consumo de batería aumentado

**Solución:**
```css
/* ✅ BIEN - Transiciones solo donde se necesitan */
.theme-transition {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

---

## 🏗️ Arquitectura Propuesta

### Jerarquía de Componentes

```
app/
├── layout.tsx (Server)
│   └── Header (Híbrido)
│       ├── NavBar (Server)
│       └── MobileMenu (Client)
├── page.tsx (Server)
│   ├── HeroSection (Server)
│   ├── ProjectsSection (Server)
│   └── InteractiveMap (Client)
└── [pages]/
    └── page.tsx (Server con secciones Client según necesidad)
```

### Principios de Diseño

1. **Server-First:** Todas las páginas son Server Components por defecto
2. **Client Solo Cuando Necesario:** `"use client"` solo para interactividad
3. **Lazy Loading Agresivo:** Componentes pesados se cargan bajo demanda
4. **CSS sobre JS:** Animaciones simples con CSS, Framer Motion solo para complejas
5. **Composición:** Componentes pequeños y reutilizables

---

## 📋 Patrones por Tipo de Página

### Patrón 1: Landing Pages (Marketing)

**Aplicable a:**
- [`/`](../src/app/page.tsx)
- [`/editorial`](../src/app/editorial/page.tsx)
- [`/servicios`](../src/app/servicios/page.tsx)
- [`/ecosistema`](../src/app/ecosistema/page.tsx)

**Estructura Propuesta:**

```typescript
// app/[page]/page.tsx (SERVER COMPONENT)
import { Suspense } from 'react';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { CTASection } from '@/components/sections/CTASection';
import { LoadingFallback } from '@/components/ui/LoadingFallback';

// Componentes client solo cuando necesario
const InteractiveDemo = lazy(() => import('@/components/interactive/Demo'));
const ContactForm = lazy(() => import('@/components/forms/ContactForm'));

export default async function LandingPage() {
  // Data fetching en servidor
  const data = await fetchPageData();
  
  return (
    <main className="page-container">
      {/* Hero - Server Component */}
      <HeroSection data={data.hero} />
      
      {/* Features - Server Component */}
      <FeaturesSection features={data.features} />
      
      {/* Demo Interactivo - Client Component Lazy */}
      <Suspense fallback={<LoadingFallback />}>
        <InteractiveDemo />
      </Suspense>
      
      {/* CTA - Server Component */}
      <CTASection />
      
      {/* Formulario - Client Component Lazy */}
      <Suspense fallback={<LoadingFallback />}>
        <ContactForm />
      </Suspense>
    </main>
  );
}

// Metadata (Server)
export const metadata = {
  title: 'Página de Ejemplo',
  description: 'Descripción SEO'
};
```

**Componentes Compartidos:**
- `<HeroSection />` - Título, descripción, CTA (Server)
- `<FeaturesGrid />` - Grid de características (Server)
- `<CTASection />` - Call to action (Server)
- `<NewsletterForm />` - Formulario newsletter (Client)

---

### Patrón 2: Páginas de Afiliados/Negocios

**Aplicable a:**
- [`/pegote-barber`](../src/app/pegote-barber/page.tsx)
- [`/verde-prive`](../src/app/verde-prive/page.tsx)
- [`/masa-tina`](../src/app/masa-tina/page.tsx)
- [`/dr-pichardo`](../src/app/dr-pichardo/page.tsx)
- Todos en [`/affiliates/[id]`](../src/app/affiliates/[id]/page.tsx)

**Estructura Propuesta:**

```typescript
// app/[affiliate]/page.tsx (SERVER COMPONENT)
import { notFound } from 'next/navigation';
import { AffiliateHero } from '@/components/affiliate/AffiliateHero';
import { ServicesList } from '@/components/affiliate/ServicesList';
import { TeamGrid } from '@/components/affiliate/TeamGrid';
import { Gallery } from '@/components/affiliate/Gallery';

// Solo lo interactivo es client
const BookingWidget = lazy(() => import('@/components/affiliate/BookingWidget'));
const ShoppingCart = lazy(() => import('@/components/commerce/ShoppingCart'));

interface Props {
  params: { id: string };
}

export default async function AffiliatePage({ params }: Props) {
  // Fetch data en servidor
  const affiliate = await getAffiliateData(params.id);
  
  if (!affiliate) notFound();
  
  return (
    <main className="affiliate-page">
      {/* Hero con información básica - Server */}
      <AffiliateHero affiliate={affiliate} />
      
      {/* Servicios - Server */}
      <ServicesList services={affiliate.services} />
      
      {/* Widget de reservas - Client (lazy) */}
      <Suspense fallback={<LoadingFallback />}>
        <BookingWidget affiliateId={affiliate.id} />
      </Suspense>
      
      {/* Equipo - Server */}
      <TeamGrid team={affiliate.team} />
      
      {/* Galería - Server con lazy images */}
      <Gallery images={affiliate.gallery} />
      
      {/* Ecommerce si aplica - Client (lazy) */}
      {affiliate.hasStore && (
        <Suspense fallback={<LoadingFallback />}>
          <ShoppingCart />
        </Suspense>
      )}
    </main>
  );
}

// Dynamic metadata
export async function generateMetadata({ params }: Props) {
  const affiliate = await getAffiliateData(params.id);
  return {
    title: affiliate.name,
    description: affiliate.description
  };
}

// Static paths para pre-rendering
export async function generateStaticParams() {
  const affiliates = await getAllAffiliates();
  return affiliates.map(a => ({ id: a.id }));
}
```

**Componentes Compartidos:**
- `<AffiliateHero />` - Hero section (Server)
- `<ServiceCard />` - Tarjeta de servicio (Server)
- `<TeamMember />` - Miembro del equipo (Server)
- `<BookingWidget />` - Widget de reservas (Client)
- `<ShoppingCart />` - Carrito de compras (Client)
- `<Gallery />` - Galería de imágenes (Server)

---

### Patrón 3: Dashboard/Aplicación

**Aplicable a:**
- [`/dashboard`](../src/app/dashboard/page.tsx)
- [`/dashboard/[affiliateId]/*`](../src/app/dashboard/[affiliateId]/page.tsx)

**Estructura Propuesta:**

```typescript
// app/dashboard/[affiliateId]/layout.tsx (CLIENT - Necesario para estado)
"use client";

import { AffiliateProvider } from '@/contexts/AffiliateContext';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function DashboardLayout({ children, params }) {
  return (
    <AffiliateProvider affiliateId={params.affiliateId}>
      <div className="dashboard-layout">
        <DashboardSidebar />
        <div className="dashboard-content">
          <DashboardHeader />
          <main className="dashboard-main">
            {children}
          </main>
        </div>
      </div>
    </AffiliateProvider>
  );
}
```

```typescript
// app/dashboard/[affiliateId]/page.tsx (SERVER COMPONENT)
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';

export default async function DashboardPage({ params }) {
  // Fetch inicial en servidor
  const metrics = await getAffiliateMetrics(params.affiliateId);
  
  return (
    <div className="dashboard-page">
      {/* Métricas con datos iniciales del servidor */}
      <DashboardMetrics initialData={metrics} />
      
      {/* Actividad reciente */}
      <RecentActivity affiliateId={params.affiliateId} />
      
      {/* Acciones rápidas */}
      <QuickActions />
    </div>
  );
}
```

**Nota:** Dashboard necesita ser más client-heavy por naturaleza interactiva, pero:
- ✅ Layout es client (tiene estado global)
- ✅ Pages pueden ser Server Components con datos iniciales
- ✅ Componentes individuales son Client solo si necesitan interactividad

---

### Patrón 4: Páginas de Contenido (Editorial)

**Aplicable a:**
- [`/editorial`](../src/app/editorial/page.tsx)
- [`/hablando-mierda`](../src/app/hablando-mierda/page.tsx)
- [`/cirisonic`](../src/app/cirisonic/page.tsx)
- [`/ciriwhispers`](../src/app/ciriwhispers/page.tsx)

**Estructura Propuesta:**

```typescript
// app/editorial/page.tsx (SERVER COMPONENT)
import { BookGrid } from '@/components/editorial/BookGrid';
import { FeaturedBook } from '@/components/editorial/FeaturedBook';
import { NewsletterSignup } from '@/components/editorial/NewsletterSignup';

// Reader es pesado - lazy load
const DigitalReader = lazy(() => import('@/components/editorial/DigitalReader'));

export default async function EditorialPage() {
  // Fetch books en servidor
  const books = await getPublishedBooks();
  const featured = books.find(b => b.featured);
  
  return (
    <main className="editorial-page">
      {/* Hero con libro destacado - Server */}
      <FeaturedBook book={featured} />
      
      {/* Grid de libros - Server */}
      <BookGrid books={books} />
      
      {/* Reader solo se carga cuando se selecciona un libro - Client */}
      <Suspense fallback={<LoadingFallback />}>
        <DigitalReader />
      </Suspense>
      
      {/* Newsletter - Client (formulario) */}
      <NewsletterSignup />
    </main>
  );
}
```

---

### Patrón 5: Páginas con Mapas (Propiedades)

**Aplicable a:**
- [`/maalca-properties`](../src/app/maalca-properties/page.tsx)

**Estructura Propuesta:**

```typescript
// app/maalca-properties/page.tsx (SERVER COMPONENT)
import { PropertyHero } from '@/components/property/PropertyHero';
import { PropertyFilters } from '@/components/property/PropertyFilters';
import { PropertyGrid } from '@/components/property/PropertyGrid';

// Mapa es pesado - lazy load
const PropertyMap = lazy(() => import('@/components/property/PropertyMap'));

export default async function PropertiesPage() {
  // Fetch properties en servidor
  const properties = await getAvailableProperties();
  
  return (
    <main className="properties-page">
      {/* Hero - Server */}
      <PropertyHero />
      
      {/* Layout con filtros y resultados */}
      <div className="properties-content">
        {/* Filtros - Client (interactivos) */}
        <PropertyFilters />
        
        {/* Grid de propiedades - Server */}
        <PropertyGrid properties={properties} />
        
        {/* Mapa - Client (lazy) */}
        <Suspense fallback={<LoadingFallback />}>
          <PropertyMap properties={properties} />
        </Suspense>
      </div>
    </main>
  );
}
```

---

## 🎨 Sistema de Componentes Compartidos

### Estructura de Carpetas Propuesta

```
src/components/
├── layout/               # Componentes de layout
│   ├── Header.tsx       # Híbrido Server/Client
│   ├── Footer.tsx       # Server
│   └── Container.tsx    # Server
│
├── sections/            # Secciones reutilizables
│   ├── HeroSection.tsx  # Server
│   ├── CTASection.tsx   # Server
│   └── FeaturesGrid.tsx # Server
│
├── ui/                  # UI components básicos
│   ├── Button.tsx       # Server (con variante Client si necesita)
│   ├── Card.tsx         # Server
│   ├── Modal.tsx        # Client
│   └── Form.tsx         # Client
│
├── interactive/         # Componentes interactivos (Client)
│   ├── BookingWidget.tsx
│   ├── ShoppingCart.tsx
│   └── ContactForm.tsx
│
└── shared/             # Componentes compartidos específicos
    ├── affiliate/      # Para páginas de afiliados
    ├── dashboard/      # Para dashboard
    └── editorial/      # Para editorial
```

### Componente Base: Button

```typescript
// components/ui/Button.tsx (Server Component por defecto)
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'button-base',
          `button-${variant}`,
          `button-${size}`,
          className
        )}
        {...props}
      />
    );
  }
);
```

### Header Optimizado (Híbrido)

```typescript
// components/layout/Header.tsx (Server Component)
import { NavBar } from './NavBar';
import { MobileMenuTrigger } from './MobileMenuTrigger';
import { Logo } from '@/components/ui/Logo';

export async function Header() {
  // Fetch navigation data en servidor si es necesario
  const navItems = await getNavigation();
  
  return (
    <header className="header">
      <div className="header-container">
        <Logo />
        
        {/* NavBar es Server Component */}
        <NavBar items={navItems} />
        
        {/* Solo el trigger del mobile menu es client */}
        <MobileMenuTrigger items={navItems} />
      </div>
    </header>
  );
}
```

```typescript
// components/layout/MobileMenuTrigger.tsx (Client)
"use client";

import { useState } from 'react';
import { MobileMenu } from './MobileMenu';

export function MobileMenuTrigger({ items }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="mobile-menu-trigger"
        aria-label="Open menu"
      >
        <MenuIcon />
      </button>
      
      <MobileMenu 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        items={items}
      />
    </>
  );
}
```

---

## ⚡ Optimización de Framer Motion

### Guía de Uso

#### ❌ NO USAR para:
- Fade-ins simples al cargar página
- Animaciones de entrada de texto
- Hover effects simples
- Transiciones de color

#### ✅ USAR para:
- Drag & drop
- Gestos complejos (swipe, pan)
- Animaciones de layout (layoutId)
- Animaciones coordinadas complejas

### Reemplazos CSS

```css
/* ANTES (Framer Motion) */
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>

/* DESPUÉS (CSS) */
<div className="fade-in-up">
  Content
</div>

/* globals.css */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}
```

### Componente de Animación Reutilizable

```typescript
// components/ui/Animate.tsx (Client)
"use client";

import { motion, HTMLMotionProps } from 'framer-motion';

interface AnimateProps extends HTMLMotionProps<"div"> {
  type?: 'fade' | 'slide' | 'scale';
  delay?: number;
}

export function Animate({ 
  type = 'fade', 
  delay = 0, 
  children, 
  ...props 
}: AnimateProps) {
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 }
    },
    slide: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 }
    }
  };
  
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants[type]}
      transition={{ duration: 0.4, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Uso:
<Animate type="slide" delay={0.1}>
  <Card />
</Animate>
```

---

## 🎯 CSS Optimizado

### globals.css Refactorizado

```css
@import "tailwindcss";

:root {
  /* Theme variables */
  --background: #fefefe;
  --foreground: #1a1a1a;
  /* ... resto de variables ... */
}

[data-theme="dark"] {
  /* Dark theme */
  --background: #0a0a0a;
  --foreground: #ffffff;
  /* ... resto de variables ... */
}

/* ❌ ELIMINAR ESTO */
/* * {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
} */

/* ✅ AGREGAR ESTO */
/* Solo transiciones en elementos específicos */
.theme-transition,
[data-theme-transition] {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Animation classes */
.fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

.fade-in-down {
  animation: fadeInDown 0.6s ease-out forwards;
}

.slide-in-left {
  animation: slideInLeft 0.6s ease-out forwards;
}

.slide-in-right {
  animation: slideInRight 0.6s ease-out forwards;
}

.scale-in {
  animation: scaleIn 0.4s ease-out forwards;
}

/* Animation delays */
.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }
.delay-400 { animation-delay: 400ms; }
.delay-500 { animation-delay: 500ms; }

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Performance optimizations */
.will-animate {
  will-change: transform, opacity;
}

.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

---

## 🚀 Estrategia de Lazy Loading

### 1. Route-based Code Splitting (Automático en Next.js)

Next.js ya hace code splitting por ruta, pero debemos aprovecharlo:

```typescript
// ✅ Cada página es un chunk separado automáticamente
app/
├── page.tsx           → page.js
├── editorial/
│   └── page.tsx       → editorial-page.js
└── dashboard/
    └── page.tsx       → dashboard-page.js
```

### 2. Component-based Lazy Loading

```typescript
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// ✅ Componentes pesados lazy-loaded
const PropertyMap = lazy(() => import('@/components/property/PropertyMap'));
const DigitalReader = lazy(() => import('@/components/editorial/DigitalReader'));
const ShoppingCart = lazy(() => import('@/components/commerce/ShoppingCart'));

export default function Page() {
  return (
    <main>
      {/* Contenido inicial carga rápido */}
      <Hero />
      <Features />
      
      {/* Componentes pesados lazy-loaded */}
      <Suspense fallback={<LoadingSpinner />}>
        <PropertyMap />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <DigitalReader />
      </Suspense>
    </main>
  );
}
```

### 3. Dynamic Imports con Loading States

```typescript
"use client";

import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  {
    loading: () => <LoadingFallback />,
    ssr: false, // Si no necesita SSR
  }
);

export function Page() {
  return (
    <div>
      <HeavyComponent />
    </div>
  );
}
```

### 4. Intersection Observer para Lazy Load

```typescript
"use client";

import { useEffect, useRef, useState } from 'react';

export function LazySection({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // Cargar 100px antes de ser visible
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={ref}>
      {isVisible ? children : <LoadingPlaceholder />}
    </div>
  );
}
```

---

## 📱 Optimización de Imágenes

### Next.js Image Component

```typescript
import Image from 'next/image';

// ✅ BIEN - Optimización automática
<Image
  src="/images/hero.jpg"
  alt="Hero image"
  width={1920}
  height={1080}
  priority // Solo en above-the-fold
  placeholder="blur" // Blur placeholder mientras carga
  blurDataURL="data:image/..." // Data URL del blur
/>

// ✅ BIEN - Lazy loading por defecto
<Image
  src="/images/gallery-1.jpg"
  alt="Gallery image"
  width={800}
  height={600}
  loading="lazy" // Default, pero explícito
/>

// ✅ BIEN - Responsive images
<Image
  src="/images/responsive.jpg"
  alt="Responsive"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>
```

### Componente de Imagen Optimizado

```typescript
// components/ui/OptimizedImage.tsx
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false 
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <div className="relative">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={`
          transition-opacity duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
        `}
        onLoadingComplete={() => setIsLoading(false)}
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-surface-muted animate-pulse" />
      )}
    </div>
  );
}
```

---

## 🔍 SEO y Metadata

### Metadata en Server Components

```typescript
// app/[page]/page.tsx
import { Metadata } from 'next';

// ✅ Static metadata
export const metadata: Metadata = {
  title: 'Página de Ejemplo',
  description: 'Descripción para SEO',
  openGraph: {
    title: 'Página de Ejemplo',
    description: 'Descripción para redes sociales',
    images: ['/og-image.jpg'],
  },
};

// ✅ Dynamic metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const data = await fetchPageData(params.id);
  
  return {
    title: data.title,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      images: [data.image],
    },
  };
}

export default async function Page({ params }) {
  // ...
}
```

---

## 📊 Monitoreo de Performance

### Web Vitals

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
```

### Performance Debugger

```typescript
// components/dev/PerformanceDebugger.tsx
"use client";

import { useEffect } from 'react';

export function PerformanceDebugger() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Log render times
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log('Performance:', entry.name, entry.duration);
        }
      });
      
      observer.observe({ entryTypes: ['measure'] });
      
      return () => observer.disconnect();
    }
  }, []);
  
  return null;
}
```

---

## 🗺️ Mapa de Refactorización por Página

### Prioridad Alta (Páginas Principales)

| Página | Archivo | Problemas | Estrategia | Esfuerzo |
|--------|---------|-----------|------------|----------|
| Home | [`page.tsx`](../src/app/page.tsx) | Client component, animaciones excesivas | Convertir a Server, CSS animations | Alto |
| Editorial | [`editorial/page.tsx`](../src/app/editorial/page.tsx) | Client component, reader pesado | Server + lazy reader | Alto |
| Ecosistema | [`ecosistema/page.tsx`](../src/app/ecosistema/page.tsx) | Client component, animaciones | Server + CSS animations | Medio |
| Servicios | [`servicios/page.tsx`](../src/app/servicios/page.tsx) | Client component | Server component | Bajo |

### Prioridad Media (Páginas de Afiliados)

| Página | Archivo | Problemas | Estrategia | Esfuerzo |
|--------|---------|-----------|------------|----------|
| Pegote Barber | [`pegote-barber/page.tsx`](../src/app/pegote-barber/page.tsx) | Client, commerce pesado | Server + lazy cart | Alto |
| Verde Privé | [`verde-prive/page.tsx`](../src/app/verde-prive/page.tsx) | Client, animaciones | Server + CSS | Medio |
| Masa Tina | [`masa-tina/page.tsx`](../src/app/masa-tina/page.tsx) | Client, menú pesado | Server + lazy components | Medio |
| Dr. Pichardo | [`dr-pichardo/page.tsx`](../src/app/dr-pichardo/page.tsx) | Client, múltiples modales | Server + lazy modals | Alto |

### Prioridad Baja (Otras Páginas)

| Página | Archivo | Problemas | Estrategia | Esfuerzo |
|--------|---------|-----------|------------|----------|
| Contacto | [`contacto/page.tsx`](../src/app/contacto/page.tsx) | Client, formulario | Server + client form | Bajo |
| Login | [`login/page.tsx`](../src/app/login/page.tsx) | Client necesario | Optimizar, mantener client | Bajo |

### Dashboard (Especial)

| Página | Archivo | Problemas | Estrategia | Esfuerzo |
|--------|---------|-----------|------------|----------|
| Dashboard Layout | [`dashboard/[affiliateId]/layout.tsx`](../src/app/dashboard/[affiliateId]/layout.tsx) | Cliente necesario | Mantener, optimizar | Medio |
| Dashboard Pages | `dashboard/**/page.tsx` | Todos client | Convertir a Server con datos iniciales | Alto |

---

## 🎯 Plan de Implementación

### Fase 1: Fundamentos (Semana 1-2)

#### 1.1 Optimización CSS Global
- [ ] Eliminar `* { transition: ... }` de globals.css
- [ ] Crear classes específicas para theme transitions
- [ ] Agregar animation keyframes CSS
- [ ] Agregar animation utility classes
- [ ] Probar en todas las páginas

#### 1.2 Header Refactorizado
- [ ] Separar Header en Server/Client components
- [ ] NavBar como Server Component
- [ ] MobileMenu como Client Component lazy
- [ ] Eliminar animaciones innecesarias
- [ ] Probar navegación

#### 1.3 Sistema de Componentes Base
- [ ] Crear carpeta `components/ui/base/`
- [ ] Button component optimizado
- [ ] Card component
- [ ] Modal component
- [ ] LoadingFallback component
- [ ] Documentar uso

---

### Fase 2: Páginas Principales (Semana 3-4)

#### 2.1 Home Page
- [ ] Convertir a Server Component
- [ ] Separar secciones en componentes Server
- [ ] Identificar partes interactivas (Client)
- [ ] Reemplazar Framer Motion con CSS
- [ ] Implementar lazy loading
- [ ] Probar performance
- [ ] Medir Web Vitals

#### 2.2 Editorial Page
- [ ] Convertir a Server Component
- [ ] Grid de libros como Server
- [ ] Reader como lazy Client component
- [ ] Optimizar imágenes de portadas
- [ ] Newsletter form lazy loaded
- [ ] Probar performance

#### 2.3 Ecosistema Page
- [ ] Convertir a Server Component
- [ ] Grid de proyectos Server
- [ ] Modals lazy loaded
- [ ] CSS animations
- [ ] Optimizar imágenes

#### 2.4 Servicios Page
- [ ] Convertir a Server Component
- [ ] Cards de servicios Server
- [ ] Contact forms lazy
- [ ] CSS animations

---

### Fase 3: Páginas de Afiliados (Semana 5-6)

#### 3.1 Crear Template Base de Afiliado
- [ ] `components/affiliate/AffiliateLayout.tsx` (Server)
- [ ] `components/affiliate/AffiliateHero.tsx` (Server)
- [ ] `components/affiliate/ServicesList.tsx` (Server)
- [ ] `components/affiliate/BookingWidget.tsx` (Client, lazy)
- [ ] `components/affiliate/Gallery.tsx` (Server, lazy images)

#### 3.2 Refactorizar Páginas Individuales
- [ ] Pegote Barber (incluye commerce)
- [ ] Verde Privé (incluye menú)
- [ ] Masa Tina (incluye menú)
- [ ] Dr. Pichardo (incluye sistema médico)
- [ ] Hablando Mierda (podcast)
- [ ] Cirisonic (música)
- [ ] Ciriwhispers (contenido)
- [ ] BritoColor (servicios)

---

### Fase 4: Properties & Maps (Semana 7)

#### 4.1 MaalCa Properties
- [ ] Convertir a Server Component
- [ ] PropertyGrid Server
- [ ] PropertyMap Client lazy
- [ ] Filters Client
- [ ] Modal detalles lazy
- [ ] Optimizar imágenes de propiedades
- [ ] Probar Mapbox performance

---

### Fase 5: Dashboard (Semana 8-9)

#### 5.1 Dashboard Layout
- [ ] Optimizar layout actual (mantener Client)
- [ ] Sidebar optimizado
- [ ] Header optimizado
- [ ] Reducir re-renders

#### 5.2 Dashboard Pages
- [ ] Convertir pages a Server con datos iniciales
- [ ] Metrics page
- [ ] Appointments page
- [ ] Customers page
- [ ] Inventory page
- [ ] Team page
- [ ] Queue page
- [ ] Store page
- [ ] Giftcards page
- [ ] Campaigns page
- [ ] Invoicing page
- [ ] Reports page
- [ ] Settings page

---

### Fase 6: Testing & Optimización Final (Semana 10)

#### 6.1 Performance Testing
- [ ] Lighthouse scores todas las páginas
- [ ] Web Vitals (LCP, FID, CLS)
- [ ] Bundle size analysis
- [ ] Load time testing
- [ ] Mobile performance testing

#### 6.2 Cross-browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

#### 6.3 Optimizaciones Finales
- [ ] Implementar prefetching estratégico
- [ ] Optimizar imágenes pendientes
- [ ] Cache strategies
- [ ] Service Worker (opcional)

---

## 📈 Métricas de Éxito

### Antes de la Refactorización (Estimado)

| Métrica | Valor Actual | Objetivo |
|---------|--------------|----------|
| Lighthouse Performance | ~40-50 | 90+ |
| First Contentful Paint (FCP) | ~3-4s | <1.8s |
| Largest Contentful Paint (LCP) | ~5-7s | <2.5s |
| Time to Interactive (TTI) | ~7-10s | <3.8s |
| Cumulative Layout Shift (CLS) | ~0.2-0.3 | <0.1 |
| Total Blocking Time (TBT) | ~1000-2000ms | <300ms |
| Bundle Size (JS) | ~500KB+ | <200KB |

### Targets por Página

| Página | LCP Target | TTI Target | Bundle Size Target |
|--------|------------|------------|--------------------|
| Home | <2.0s | <3.0s | <150KB |
| Editorial | <2.5s | <3.5s | <180KB |
| Afiliados | <2.0s | <3.0s | <160KB |
| Properties | <2.5s | <4.0s | <200KB (con mapa) |
| Dashboard | <3.0s | <4.0s | <250KB (más interactivo) |

---

## 🚨 Riesgos y Mitigaciones

### Riesgo 1: Breaking Changes en Client Components
**Riesgo:** Componentes que esperan ser Client pueden fallar en Server  
**Mitigación:**
- Testing exhaustivo por página
- Implementación incremental
- Rollback plan preparado

### Riesgo 2: Pérdida de Funcionalidad Interactiva
**Riesgo:** Al convertir a Server, perder interactividad  
**Mitigación:**
- Identificar todas las interacciones antes de migrar
- Mantener lista de Client components necesarios
- Testing de UX

### Riesgo 3: Problemas con Librerías Third-party
**Riesgo:** Librerías que solo funcionan en cliente (mapbox, epub.js, etc.)  
**Mitigación:**
- Usar dynamic imports con `ssr: false`
- Lazy loading
- Buscar alternativas server-friendly si es posible

### Riesgo 4: SEO Temporal Afectado
**Riesgo:** Durante migración, SEO puede verse afectado  
**Mitigación:**
- Migrar una página a la vez
- Verificar metadata en cada paso
- Monitorear Google Search Console

---

## 📚 Recursos y Referencias

### Documentación Next.js 15
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Lazy Loading](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)

### Performance Best Practices
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)

### Framer Motion
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Reduce Bundle Size](https://www.framer.com/motion/guide-reduce-bundle-size/)

---

## 🎉 Beneficios Esperados

### Performance
- ⚡ **50-70% reducción** en tiempo de carga inicial
- 📦 **60-70% reducción** en bundle size
- 🚀 **Lighthouse score** de 40-50 a 90+
- 📱 **Performance móvil** drásticamente mejorada

### Desarrollo
- 🧩 **Componentes reutilizables** - Menos duplicación
- 📐 **Patrones consistentes** - Más fácil mantener
- 🔧 **Mejor DX** - Más fácil agregar nuevas páginas
- 📝 **Código más limpio** - Mejor organización

### Usuario
- ⚡ **Navegación fluida** - Sin lag
- 🎯 **Mejor UX** - Interacciones responsive
- 📱 **Móvil optimizado** - Experiencia nativa
- ♿ **Accesibilidad** - Mejor soporte

### Negocio
- 🔍 **Mejor SEO** - Server rendering
- 💰 **Menor bounce rate** - Carga rápida
- 📈 **Mayor conversión** - Mejor UX
- 🎯 **Retención** - Experiencia consistente

---

## ✅ Checklist de Validación Final

### Performance
- [ ] Lighthouse Performance Score > 90
- [ ] LCP < 2.5s en todas las páginas
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Bundle size reducido > 50%

### Funcionalidad
- [ ] Todas las páginas funcionan correctamente
- [ ] Todas las interacciones funcionan
- [ ] Formularios funcionan
- [ ] Navegación funciona
- [ ] Modales y popups funcionan

### UX
- [ ] Animaciones suaves
- [ ] Loading states apropiados
- [ ] Feedback visual en interacciones
- [ ] Responsive en todos los breakpoints
- [ ] Accesibilidad (WCAG 2.1 AA)

### SEO
- [ ] Metadata correcta en todas las páginas
- [ ] Open Graph tags
- [ ] Twitter cards
- [ ] Sitemap actualizado
- [ ] Robots.txt correcto

### Cross-browser
- [ ] Chrome funciona
- [ ] Firefox funciona
- [ ] Safari funciona
- [ ] Edge funciona
- [ ] Mobile browsers funcionan

---

## 🎯 Siguientes Pasos Inmediatos

1. **Revisar y aprobar este plan** con el equipo
2. **Crear tickets/issues** para cada fase
3. **Configurar ambiente de pruebas** para validar cambios
4. **Iniciar Fase 1** con optimización CSS y Header
5. **Establecer métricas baseline** para comparación

---

## 📞 Preguntas para Decisión

Antes de iniciar la implementación, necesitamos decidir:

1. **¿Cuál es la prioridad de páginas?** (¿Empezar por las más visitadas?)
2. **¿Tenemos analytics** para saber cuáles páginas son más críticas?
3. **¿Hay deadline específico** para completar la refactorización?
4. **¿Podemos hacer cambios incrementales** en producción o necesitamos feature branch?
5. **¿Hay presupuesto** para herramientas de monitoreo (Vercel Speed Insights, etc.)?

---

**Documento creado:** 2026-03-10  
**Última actualización:** 2026-03-10  
**Versión:** 1.0  
**Estado:** Pendiente de Aprobación
