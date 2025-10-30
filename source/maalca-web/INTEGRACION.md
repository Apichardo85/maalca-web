# 📘 INTEGRACIÓN COMPLETA - Editorial MaalCa

## 📋 Tabla de Contenidos

1. [Verificación Inicial](#verificación-inicial)
2. [Arquitectura de Archivos](#arquitectura-de-archivos)
3. [Guía Paso a Paso](#guía-paso-a-paso)
4. [Navegación del Sitio](#navegación-del-sitio)
5. [Newsletter Funcional](#newsletter-funcional)
6. [Rutas Dinámicas](#rutas-dinámicas)
7. [SEO y Metadata](#seo-y-metadata)
8. [Testing y Validación](#testing-y-validación)
9. [Deploy](#deploy)

---

## ✅ Verificación Inicial

### Estado Actual

Editorial MaalCa ya está integrado en tu proyecto. Verifica que todo esté en orden:

```bash
# 1. Navega al proyecto
cd /path/to/maalca-web

# 2. Verifica archivos principales
ls -la src/app/editorial/page.tsx
ls -la src/data/editorialContent.ts
ls -la src/components/editorial/ProfessionalReader.tsx
ls -la src/hooks/useAnalytics.ts

# 3. Verifica que dev funciona
npm run dev

# 4. Abre en navegador
# http://localhost:3000/editorial
```

### Checklist de Archivos

- [ ] `src/app/editorial/page.tsx` (página principal)
- [ ] `src/data/editorialContent.ts` (3 artículos)
- [ ] `src/components/editorial/ProfessionalReader.tsx` (modal)
- [ ] `src/hooks/useAnalytics.ts` (tracking)

---

## 🏗️ Arquitectura de Archivos

### Estructura Completa

```
maalca-web/
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   └── page.tsx                 # Homepage
│   │   ├── editorial/
│   │   │   └── page.tsx                 # Editorial page ✨
│   │   ├── catering/
│   │   │   └── page.tsx                 # Catering page
│   │   ├── layout.tsx                   # Root layout
│   │   └── globals.css                  # Global styles
│   │
│   ├── components/
│   │   ├── editorial/
│   │   │   └── ProfessionalReader.tsx   # Reading modal ✨
│   │   └── ui/
│   │       └── buttons.tsx              # UI components
│   │
│   ├── data/
│   │   └── editorialContent.ts          # Article content ✨
│   │
│   └── hooks/
│       └── useAnalytics.ts              # Analytics hook ✨
│
├── public/
├── CLAUDE.md                             # Project guidelines
├── BRANDING.md                           # Branding rules
├── START-HERE.md                         # Entry point ✨
├── QUICKSTART.md                         # Quick guide ✨
├── INTEGRACION.md                        # This file ✨
└── ARQUITECTURA-ECOSISTEMA.md            # Architecture ✨
```

✨ = Archivos nuevos de Editorial MaalCa

---

## 📝 Guía Paso a Paso

### Fase 1: Navegación del Sitio

#### Objetivo
Agregar link "Editorial" al menú de navegación para que usuarios puedan encontrar la sección.

#### Paso 1.1: Encontrar el Componente de Navegación

```bash
# Buscar archivos de navegación
find src -name "*nav*" -o -name "*header*" -type f
```

Archivos comunes:
- `src/components/Header.tsx`
- `src/components/Navigation.tsx`
- `src/components/layout/Header.tsx`
- `src/app/layout.tsx` (si nav está inline)

#### Paso 1.2: Agregar Link de Editorial

**Opción A: Array de navegación**

Si tienes algo como esto:
```typescript
const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/catering", label: "Catering" },
];
```

Agrega:
```typescript
const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/editorial", label: "Editorial" },  // ✨ Nuevo
  { href: "/catering", label: "Catering" },
];
```

**Opción B: Links inline**

Si tienes JSX directo:
```tsx
<nav>
  <Link href="/">Inicio</Link>
  <Link href="/catering">Catering</Link>
</nav>
```

Agrega:
```tsx
<nav>
  <Link href="/">Inicio</Link>
  <Link href="/editorial">Editorial</Link>  {/* ✨ Nuevo */}
  <Link href="/catering">Catering</Link>
</nav>
```

#### Paso 1.3: Verificar

```bash
npm run dev
```

1. Abre http://localhost:3000
2. Verifica que link "Editorial" aparece en navegación
3. Click en "Editorial" → Debe navegar a `/editorial`
4. Verifica que link se resalta cuando estás en `/editorial`

---

### Fase 2: Newsletter Funcional

#### Objetivo
Hacer que el form de newsletter realmente capture emails y envíe confirmación.

#### Paso 2.1: Crear API Route

```bash
# Crear estructura
mkdir -p src/app/api/newsletter/subscribe
```

**Archivo: `src/app/api/newsletter/subscribe/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validación básica
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // TODO: Guardar en base de datos
    console.log('Nueva suscripción:', email);

    // TODO: Enviar email de confirmación con Resend

    return NextResponse.json(
      { message: 'Suscripción exitosa' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en suscripción:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
```

#### Paso 2.2: Integrar Resend

```bash
# Instalar Resend
npm install resend
```

**Actualizar route.ts:**

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Enviar email de bienvenida
    await resend.emails.send({
      from: 'Editorial MaalCa <noreply@maalca.com>',
      to: email,
      subject: '¡Bienvenido a Editorial MaalCa!',
      html: `
        <h1>¡Gracias por suscribirte!</h1>
        <p>Ahora recibirás nuestros artículos más profundos directamente en tu correo.</p>
        <p>— Editorial MaalCa</p>
      `
    });

    return NextResponse.json(
      { message: 'Suscripción exitosa' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al procesar suscripción' },
      { status: 500 }
    );
  }
}
```

**Agregar a `.env.local`:**
```
RESEND_API_KEY=re_tu_api_key_aqui
```

#### Paso 2.3: Conectar Form en Frontend

**Editar `src/app/editorial/page.tsx`:**

Encuentra la sección de newsletter y actualiza:

```typescript
export default function EditorialPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('¡Suscripción exitosa! Revisa tu email.');
        setEmail('');
      } else {
        setMessage(data.error || 'Error al suscribirse');
      }
    } catch (error) {
      setMessage('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      {/* ... resto del código ... */}

      {/* Newsletter Section */}
      <section className="py-16 md:py-24 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* ... título y descripción ... */}

          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors text-white placeholder-gray-400"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700 px-6 text-white"
              >
                {isSubmitting ? 'Enviando...' : 'Suscribirse'}
              </Button>
            </div>

            {message && (
              <p className={`text-sm mt-2 ${
                message.includes('exitosa') ? 'text-green-400' : 'text-red-400'
              }`}>
                {message}
              </p>
            )}

            <p className="text-xs text-gray-400 mt-2">
              Sin spam. Solo reflexiones profundas cada semana.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
```

#### Paso 2.4: Verificar

```bash
npm run dev
```

1. Ve a `/editorial`
2. Scroll hasta newsletter section
3. Ingresa tu email
4. Click "Suscribirse"
5. Verifica mensaje de éxito
6. Revisa tu email para confirmación

---

### Fase 3: Rutas Dinámicas

#### Objetivo
Crear páginas individuales para cada artículo: `/editorial/articulos/filosofia-calle-2024`

#### Paso 3.1: Crear Estructura

```bash
mkdir -p src/app/editorial/articulos/[slug]
```

#### Paso 3.2: Crear Página Dinámica

**Archivo: `src/app/editorial/articulos/[slug]/page.tsx`**

```typescript
"use client";

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { getArticleContent } from '@/data/editorialContent';

// Metadata de artículos (mover desde page.tsx)
const articlesMetadata = {
  "filosofia-calle-2024": {
    title: "Filosofía de la Calle: Reflexiones desde el Asfalto Dominicano",
    author: "MaalCa Editorial",
    publishDate: "2024-03-15",
    readTime: "12 min",
    category: "Filosofía"
  },
  // ... otros artículos
};

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;

  const metadata = articlesMetadata[slug as keyof typeof articlesMetadata];
  const content = getArticleContent(slug);

  if (!metadata) {
    return (
      <main className="min-h-screen bg-black text-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Artículo no encontrado</h1>
          <a href="/editorial" className="text-red-600 hover:text-red-700">
            Volver a Editorial
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pt-20">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.header
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-600/20 text-red-400 border border-red-600/30">
              {metadata.category}
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {metadata.title}
          </h1>

          <div className="flex items-center gap-4 text-gray-400">
            <span>{metadata.author}</span>
            <span>•</span>
            <time>{new Date(metadata.publishDate).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</time>
            <span>•</span>
            <span>{metadata.readTime} de lectura</span>
          </div>
        </motion.header>

        {/* Content */}
        <motion.div
          className="prose prose-invert prose-red max-w-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Back Button */}
        <motion.div
          className="mt-12 pt-8 border-t border-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <a
            href="/editorial"
            className="inline-flex items-center text-red-600 hover:text-red-700 transition-colors"
          >
            ← Volver a Editorial
          </a>
        </motion.div>
      </article>
    </main>
  );
}
```

#### Paso 3.3: Actualizar Links en Listado

**En `src/app/editorial/page.tsx`:**

```typescript
// Cambiar onClick por Link
import Link from 'next/link';

// Reemplazar:
<motion.article
  onClick={() => {
    trackArticleClick(article.id);
    setSelectedArticle(article.id);
  }}
>

// Por:
<Link href={`/editorial/articulos/${article.id}`}>
  <motion.article
    onClick={() => trackArticleClick(article.id)}
  >
    {/* ... contenido ... */}
  </motion.article>
</Link>
```

#### Paso 3.4: Verificar

```bash
npm run dev
```

1. Ve a `/editorial`
2. Click en un artículo
3. Debe navegar a `/editorial/articulos/filosofia-calle-2024`
4. Verifica que contenido completo se muestra
5. Click "Volver a Editorial" → Debe volver a lista

---

### Fase 4: SEO y Metadata

#### Objetivo
Optimizar para motores de búsqueda y redes sociales.

#### Paso 4.1: Metadata en Página Principal

**Editar `src/app/editorial/page.tsx`:**

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editorial MaalCa | Filosofía y Cultura desde el Caribe',
  description: 'Exploramos la intersección entre filosofía, cultura y sociedad contemporánea. Pensamientos profundos con la autenticidad del Caribe y perspectiva global.',
  keywords: ['filosofía', 'cultura', 'editorial', 'caribe', 'república dominicana', 'pensamiento'],
  authors: [{ name: 'MaalCa Editorial' }],
  openGraph: {
    title: 'Editorial MaalCa',
    description: 'Filosofía y cultura desde el Caribe',
    type: 'website',
    locale: 'es_ES',
    url: 'https://maalca.com/editorial',
    siteName: 'MaalCa',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Editorial MaalCa',
    description: 'Filosofía y cultura desde el Caribe',
  },
};

export default function EditorialPage() {
  // ... código existente
}
```

#### Paso 4.2: Metadata Dinámica para Artículos

**Editar `src/app/editorial/articulos/[slug]/page.tsx`:**

```typescript
import type { Metadata } from 'next';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const metadata = articlesMetadata[params.slug as keyof typeof articlesMetadata];

  if (!metadata) {
    return {
      title: 'Artículo no encontrado | Editorial MaalCa',
    };
  }

  return {
    title: `${metadata.title} | Editorial MaalCa`,
    description: metadata.excerpt,
    authors: [{ name: metadata.author }],
    openGraph: {
      title: metadata.title,
      description: metadata.excerpt,
      type: 'article',
      publishedTime: metadata.publishDate,
      authors: [metadata.author],
    },
  };
}

export default function ArticlePage({ params }: Props) {
  // ... código existente
}
```

#### Paso 4.3: Sitemap

**Crear `src/app/sitemap.ts`:**

```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://maalca.com';

  // Artículos estáticos
  const articles = [
    'filosofia-calle-2024',
    'creatividad-humana-ia',
    'ecosistemas-creativos',
  ];

  const articleUrls = articles.map((slug) => ({
    url: `${baseUrl}/editorial/articulos/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/editorial`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...articleUrls,
  ];
}
```

---

### Fase 5: Testing y Validación

#### Test 1: Funcionalidad

```bash
# Checklist manual
[ ] /editorial carga
[ ] Artículos se muestran
[ ] Filtros funcionan
[ ] Modal abre/cierra
[ ] /editorial/articulos/[slug] carga
[ ] Newsletter funciona
[ ] Navegación funciona
[ ] Responsive en mobile
[ ] Responsive en tablet
[ ] Sin errores en consola
```

#### Test 2: Performance

```bash
# Lighthouse test
npm run build
npm start

# Abrir Chrome DevTools
# Lighthouse tab
# Generar reporte
```

Objetivos:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

#### Test 3: TypeScript

```bash
npx tsc --noEmit
```

Debe salir sin errores.

#### Test 4: Build

```bash
npm run build
```

Debe completar exitosamente.

---

### Fase 6: Deploy

#### Vercel (Recomendado)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Producción
vercel --prod
```

#### Variables de Entorno

En Vercel dashboard:
1. Settings → Environment Variables
2. Agregar:
   - `RESEND_API_KEY` = tu_api_key
3. Redeploy

---

## 🎯 Checklist Final

### Funcionalidad
- [ ] Editorial page funciona (`/editorial`)
- [ ] 6 artículos se muestran
- [ ] Filtros de categoría funcionan
- [ ] Modal de lectura funciona
- [ ] Rutas dinámicas funcionan (`/editorial/articulos/[slug]`)
- [ ] Newsletter captura emails
- [ ] Email de confirmación se envía
- [ ] Navegación incluye link a Editorial

### Calidad de Código
- [ ] Sin errores TypeScript
- [ ] Build funciona
- [ ] Sin errores en consola
- [ ] Sigue reglas de CLAUDE.md
- [ ] Usa clases directas de Tailwind

### SEO
- [ ] Metadata en todas las páginas
- [ ] Sitemap generado
- [ ] URLs amigables
- [ ] Open Graph tags

### Performance
- [ ] Lighthouse > 90 en todas las categorías
- [ ] Imágenes optimizadas
- [ ] No hay JavaScript innecesario

### Responsive
- [ ] Mobile (< 768px) funciona
- [ ] Tablet (768-1024px) funciona
- [ ] Desktop (> 1024px) funciona

---

## 🎉 ¡Completado!

Si completaste todas las fases, Editorial MaalCa está completamente integrado y funcional.

**Próximos pasos:**
1. Escribir más artículos
2. Preparar primer libro para Amazon KDP
3. Promover en redes sociales
4. Analizar métricas de engagement

**Documentación adicional:**
- `docs/plan-2-semanas-kdp.md` - Publicar en Amazon
- `ARQUITECTURA-ECOSISTEMA.md` - Arquitectura completa

---

**Last Updated:** October 30, 2025
**Version:** 1.0
**Status:** ✅ Integration Complete
