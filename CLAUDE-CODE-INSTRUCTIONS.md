# INSTRUCCIONES PARA CLAUDE CODE

## 🎯 OBJETIVO
Integrar Editorial MaalCa en el ecosistema Next.js existente de MaalCa.com siguiendo las reglas de branding establecidas en CLAUDE.md.

---

## 📋 CONTEXTO DEL PROYECTO

### Arquitectura Actual
```
MaalCa.com (Next.js 15 + App Router)
├── src/app/(marketing)/page.tsx    # Homepage principal
├── src/app/catering/page.tsx       # Ya existe
└── src/app/globals.css

Branding estricto:
- SOLO clases directas: text-red-600, bg-gray-900, text-white
- NUNCA semantic: text-brand-primary, bg-surface, etc.
- Dark theme fijo (no toggle)
```

### Lo Que Se Agrega
```
src/app/editorial/                  # NUEVA RUTA
├── page.tsx                       # Página principal
└── (rutas dinámicas después)

src/data/
└── editorialContent.ts            # Contenido

src/components/editorial/
└── ProfessionalReader.tsx         # Modal de lectura

src/hooks/
└── useAnalytics.ts                # Analytics
```

---

## 🚨 REGLAS CRÍTICAS (del CLAUDE.md)

### ✅ HACER:
- Usar clases directas: `text-white`, `bg-gray-900`, `text-red-600`
- Componentes inline cuando sea posible
- Seguir estructura de `src/app/(marketing)/page.tsx`
- Mantener branding consistente
- Dark theme fijo

### ❌ NO HACER:
- NO usar clases semánticas (`text-brand-primary`, `bg-surface`)
- NO crear carpetas nuevas sin preguntar
- NO refactorizar código sin aprobación
- NO implementar dark mode toggle
- NO usar emojis en código

---

## 📁 ARCHIVOS A CREAR

### 1. src/app/editorial/page.tsx

**Características:**
- ✅ Usa `text-red-600`, `bg-gray-900`, `text-white`
- ✅ Componentes Button inline o de UI library
- ✅ Animaciones con Framer Motion
- ✅ Grid de artículos con filtros
- ✅ Modal de lectura con ProfessionalReader

**Estructura:**
```typescript
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import { useAnalytics } from "@/hooks/useAnalytics";
import ProfessionalReader from "@/components/editorial/ProfessionalReader";
import { editorialArticles } from "@/data/editorialContent";

// Articles data array
const articles = [...];

// Categories for filtering
const categories = ["Todos", "Filosofía", "Tecnología", ...];

// Books data
const books = [...];

export default function EditorialPage() {
  // State management
  // Article grid with filters
  // Featured articles section
  // Books section
  // Newsletter section
  // Reader modal
}
```

---

### 2. src/data/editorialContent.ts

**Sistema completo de gestión de contenido:**

```typescript
export const editorialArticles = {
  "filosofia-calle-2024": `
    <div>Full HTML article content...</div>
  `,
  "creatividad-humana-ia": `...`,
  "ecosistemas-creativos": `...`
};

// Función para obtener contenido por ID
export const getArticleContent = (articleId: string): string => {
  return editorialArticles[articleId as keyof typeof editorialArticles] || '<p>Artículo no encontrado</p>';
};

// Lista de artículos disponibles
export const availableArticles = Object.keys(editorialArticles);
```

**Características:**
- 3 artículos completos (3000+ palabras c/u)
- HTML formatting para styling rico
- Sistema de exportación para libros
- Búsqueda y filtrado

---

### 3. src/hooks/useAnalytics.ts

```typescript
"use client";
import { useCallback } from 'react';

export function useAnalytics(section: string) {
  const trackArticleClick = useCallback((articleId: string) => {
    console.log(`[Analytics] ${section}: Article clicked - ${articleId}`);

    // TODO: Implementar tracking real
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('event', 'article_click', {
    //     section,
    //     article_id: articleId,
    //   });
    // }
  }, [section]);

  const trackBookView = useCallback((bookId: string) => {
    console.log(`[Analytics] ${section}: Book viewed - ${bookId}`);
  }, [section]);

  const trackNewsletterSubscribe = useCallback((email: string) => {
    console.log(`[Analytics] ${section}: Newsletter subscribe - ${email}`);
  }, [section]);

  return { trackArticleClick, trackBookView, trackNewsletterSubscribe };
}
```

---

### 4. src/components/editorial/ProfessionalReader.tsx

```typescript
"use client";
import { motion } from "framer-motion";
import { useState } from "react";

interface ProfessionalReaderProps {
  articleId: string;
  title: string;
  author: string;
  content: string;
  onClose: () => void;
}

export default function ProfessionalReader({
  articleId,
  title,
  author,
  content,
  onClose
}: ProfessionalReaderProps) {
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with title, author, and font size controls */}
        {/* Content area with scrolling */}
        {/* Footer with close button */}
      </motion.div>
    </motion.div>
  );
}
```

**Características:**
- Font size controls (small/medium/large)
- Smooth animations
- Click outside to close
- Responsive design
- HTML content rendering

---

## 🔧 PASOS DE EJECUCIÓN

### Paso 1: Verificar Proyecto Actual
```bash
# Confirmar que estás en el proyecto correcto
pwd  # Debería mostrar: .../maalca-web

# Verificar que dev server funciona
npm run dev

# Verificar git status
git status
```

### Paso 2: Crear Estructura
```bash
# Solo si no existen
mkdir -p src/app/editorial
mkdir -p src/data
mkdir -p src/hooks
mkdir -p src/components/editorial
```

### Paso 3: Crear Archivos
Crear en este orden:

1. `src/hooks/useAnalytics.ts` (más simple, sin dependencias)
2. `src/data/editorialContent.ts` (data layer)
3. `src/components/editorial/ProfessionalReader.tsx` (component)
4. `src/app/editorial/page.tsx` (página principal)

### Paso 4: Verificar
```bash
# TypeScript check
npx tsc --noEmit

# Start dev server
npm run dev

# Visit page
# http://localhost:3000/editorial
```

### Paso 5: Agregar Navegación (Opcional)
En el componente de navegación principal, agregar:
```typescript
{ href: "/editorial", label: "Editorial" }
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Estructura ✓
- [ ] Carpeta `src/app/editorial/` creada
- [ ] Archivo `src/app/editorial/page.tsx` existe
- [ ] Carpeta `src/data/` creada
- [ ] Archivo `src/data/editorialContent.ts` existe
- [ ] Carpeta `src/hooks/` creada
- [ ] Archivo `src/hooks/useAnalytics.ts` existe
- [ ] Carpeta `src/components/editorial/` creada
- [ ] Archivo `src/components/editorial/ProfessionalReader.tsx` existe

### Dependencias ✓
- [ ] `framer-motion` instalado (debería estar)
- [ ] No hay errores de TypeScript
- [ ] `npm run build` funciona sin errores

### Branding ✓
- [ ] Usa `text-red-600` (NO `text-brand-primary`)
- [ ] Usa `bg-gray-900`, `bg-gray-800` (NO `bg-surface`)
- [ ] Usa `text-white`, `text-gray-300` (NO `text-text-primary`)
- [ ] Usa `border-gray-700` (NO `border-border`)
- [ ] Usa `hover:bg-red-700` (NO `hover:bg-brand-hover`)

### Funcionalidad ✓
- [ ] `/editorial` carga sin errores
- [ ] Se ven 6 artículos en el grid
- [ ] Filtros de categoría funcionan
- [ ] Click en artículo abre modal
- [ ] Modal muestra contenido completo
- [ ] Modal se cierra con X
- [ ] Modal se cierra con click fuera
- [ ] Sección de libros renderiza (3 libros)
- [ ] Newsletter form existe (aunque no funcione)

### Responsive ✓
- [ ] Mobile (< 768px) funciona
- [ ] Tablet (768-1024px) funciona
- [ ] Desktop (> 1024px) funciona

---

## 🐛 TROUBLESHOOTING

### Error: "Cannot find module '@/data/editorialContent'"
**Causa:** Archivo no existe o path alias mal configurado

**Solución:**
```bash
# Verificar que existe
ls src/data/editorialContent.ts

# Verificar tsconfig.json paths
cat tsconfig.json | grep -A 5 "paths"

# Debería mostrar:
# "paths": {
#   "@/*": ["./src/*"]
# }
```

### Error: "ProfessionalReader is not defined"
**Causa:** Componente no existe o import incorrecto

**Solución:**
```bash
# Verificar que existe
ls src/components/editorial/ProfessionalReader.tsx

# Verificar export en el archivo
# Debe tener: export default function ProfessionalReader

# Verificar import en page.tsx
# Debe ser: import ProfessionalReader from "@/components/editorial/ProfessionalReader";
```

### Error: "useAnalytics is not defined"
**Causa:** Hook no existe

**Solución:**
```bash
# Verificar que existe
ls src/hooks/useAnalytics.ts

# Verificar export
# Debe tener: export function useAnalytics
```

### Clases de Tailwind no funcionan
**Causa:** Usando clases semánticas en lugar de directas

**Solución:**
```bash
# Buscar clases semánticas prohibidas
grep -r "text-brand-primary" src/app/editorial/
grep -r "bg-surface" src/app/editorial/
grep -r "text-text-primary" src/app/editorial/

# Si encuentra algo, reemplazar:
# text-brand-primary → text-red-600
# bg-surface → bg-gray-900
# text-text-primary → text-white
# border-border → border-gray-700
```

### TypeScript Errors
**Problemas comunes y soluciones:**

```typescript
// Error: Property 'onClick' does not exist
// Solución: Tipar correctamente
onClick={(e: React.MouseEvent<HTMLDivElement>) => ...}

// Error: Type 'string | undefined' is not assignable
// Solución: Usar optional chaining
articles.find(a => a.id === selectedArticle)?.title || "Artículo"

// Error: Cannot find name 'motion'
// Solución: Import correcto
import { motion } from "framer-motion";
```

### Modal no se cierra
**Causa:** Event propagation o estado

**Solución:**
```typescript
// Verificar que el overlay tiene onClick
<div onClick={onClose}>

// Verificar que el contenido detiene propagación
<div onClick={(e) => e.stopPropagation()}>

// Verificar que el botón X llama onClose
<button onClick={onClose}>×</button>
```

---

## 📝 NOTAS IMPORTANTES

### 1. Path Aliases
El proyecto usa `@/` para imports:
```typescript
import { Button } from '@/components/ui/buttons';
// Equivale a: import { Button } from '../../components/ui/buttons';
```

**Configuración en `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 2. Fonts
Ya configuradas en `src/app/layout.tsx`:
- **Display:** Playfair Display (next/font/google)
- **Body:** Inter (next/font/google)

**Variables CSS:**
- `--font-playfair` para títulos
- `--font-inter` para body

**Uso en componentes:**
```typescript
className="font-display"  // Playfair
className="font-sans"     // Inter (default)
```

### 3. Framer Motion Patterns
**Page transitions:**
```typescript
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
```

**Scroll animations:**
```typescript
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
```

**Staggered children:**
```typescript
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
  >
))}
```

### 4. Responsive Breakpoints
```typescript
// Tailwind breakpoints
sm: 640px   → className="sm:text-lg"
md: 768px   → className="md:text-xl"
lg: 1024px  → className="lg:text-2xl"
xl: 1280px  → className="xl:text-3xl"
2xl: 1536px → className="2xl:text-4xl"

// Common patterns
className="text-4xl md:text-6xl lg:text-7xl"
className="px-4 sm:px-6 lg:px-8"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

### 5. Color System
**Brand Colors:**
```typescript
// Primary brand (RED)
text-red-600        // Text
bg-red-600          // Backgrounds
border-red-600      // Borders
hover:bg-red-700    // Hover states
ring-red-600        // Focus rings

// Backgrounds
bg-black            // Main background
bg-gray-900         // Sections
bg-gray-800         // Cards
bg-gray-700         // Borders

// Text
text-white          // Primary text
text-gray-300       // Secondary text
text-gray-400       // Tertiary text
```

---

## 🎯 SIGUIENTE FASE (Después de integración básica)

### Fase 2: Navegación
**Objetivo:** Hacer Editorial accesible desde el sitio

**Tareas:**
1. Agregar link "Editorial" en header/nav
2. Agregar Editorial a sitemap
3. Agregar metadata SEO

**Código de ejemplo para nav:**
```typescript
const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/editorial", label: "Editorial" },
  { href: "/catering", label: "Catering" },
  // ... otros items
];
```

---

### Fase 3: Newsletter Funcional
**Objetivo:** Capturar suscriptores reales

**Tareas:**
1. Crear API route `/api/newsletter/subscribe`
2. Integrar Resend para emails
3. Guardar suscriptores en base de datos
4. Email de confirmación

**Estructura:**
```
src/app/api/
└── newsletter/
    └── subscribe/
        └── route.ts
```

---

### Fase 4: Rutas Dinámicas
**Objetivo:** Páginas individuales para cada artículo

**Estructura:**
```
src/app/editorial/
├── page.tsx                    # Lista de artículos
├── articulos/
│   └── [slug]/
│       └── page.tsx           # Artículo individual
└── libros/
    └── [id]/
        └── page.tsx           # Página de libro
```

**Benefits:**
- URLs amigables: `/editorial/articulos/filosofia-calle-2024`
- Better SEO
- Sharing individual articles
- Reading progress tracking

---

### Fase 5: CMS Integration
**Objetivo:** Gestión de contenido sin código

**Opciones:**
1. **Notion API** (Recomendado para MVP)
   - Fácil de usar
   - Editor familiar
   - API gratuita

2. **Sanity.io**
   - Más potente
   - Customizable
   - Paid tier required

3. **Custom Admin**
   - Control total
   - Más trabajo
   - Need database

---

## 📚 RECURSOS ADICIONALES

### Documentación del Proyecto
- `START-HERE.md` - Punto de entrada
- `QUICKSTART.md` - Guía rápida
- `INTEGRACION.md` - Guía detallada
- `ARQUITECTURA-ECOSISTEMA.md` - Visión completa
- `BRANDING.md` - Reglas de branding
- `CLAUDE.md` - Guías del proyecto

### Referencias de Código
- `src/app/(marketing)/page.tsx` - Homepage (referencia de estilo)
- `src/app/catering/page.tsx` - Otra página del sitio
- `src/components/ui/buttons.tsx` - Componentes UI

### Publicación
- `docs/plan-2-semanas-kdp.md` - Plan de publicación Amazon KDP
- `docs/editorial-maalca-architecture.md` - Arquitectura técnica

---

## 🎓 PARA CLAUDE CODE

### Antes de Empezar:
1. ✅ Leer este archivo completo
2. ✅ Leer `CLAUDE.md` del proyecto
3. ✅ Verificar estructura actual: `ls -la src/app/`
4. ✅ Confirmar con usuario antes de crear archivos

### Durante Implementación:
1. ✅ Seguir reglas de branding ESTRICTAMENTE
2. ❌ NO refactorizar código existente
3. ❌ NO crear carpetas sin preguntar
4. ✅ Usar clases directas de Tailwind
5. ✅ Probar cada archivo después de crearlo

### Al Terminar:
1. ✅ Ejecutar checklist de verificación completo
2. ✅ Probar en dev: `npm run dev`
3. ✅ Verificar build: `npm run build`
4. ✅ Confirmar branding correcto
5. ✅ Reportar al usuario

### Si Encuentras Problemas:
1. Consultar sección Troubleshooting
2. Verificar archivos de referencia
3. Preguntar al usuario antes de asumir
4. NO hacer cambios no solicitados

---

## ❓ PREGUNTAS PARA EL USUARIO

Antes de empezar, confirmar:

1. **Git Status**
   - ¿El proyecto está en Git?
   - ¿Hay cambios sin commitear?
   - ¿Quieres hacer commit antes de continuar?

2. **Estado Actual**
   - ¿Funciona `npm run dev` correctamente?
   - ¿Hay errores de TypeScript actualmente?
   - ¿Todas las páginas existentes funcionan?

3. **Preferencias de Implementación**
   - ¿Crear todos los archivos de una vez?
   - ¿Ir paso a paso con confirmación?
   - ¿Quieres revisar cada archivo antes de continuar?

4. **Prioridades**
   - ¿Qué es más importante: funcionalidad o contenido?
   - ¿Necesitas newsletter funcional ahora o después?
   - ¿Quieres agregar a navegación inmediatamente?

---

## 🚀 COMANDO DE INICIO RECOMENDADO

```bash
# 1. Verificar estado actual
git status
npm run dev

# 2. Crear rama para feature
git checkout -b feature/editorial-integration

# 3. Crear estructura de carpetas
mkdir -p src/app/editorial src/data src/hooks src/components/editorial

# 4. Crear archivos en orden
# (Claude Code creará estos archivos)

# 5. Verificar
npx tsc --noEmit
npm run build

# 6. Probar
npm run dev
# Visitar http://localhost:3000/editorial

# 7. Commit
git add .
git commit -m "Add Editorial MaalCa feature

- Created /editorial route
- Added article content system
- Implemented reading modal
- Added analytics tracking

🤖 Generated with Claude Code"
```

---

## ⚠️ ADVERTENCIAS FINALES

### NUNCA HACER:
1. ❌ Modificar `CLAUDE.md` o `BRANDING.md` sin aprobación
2. ❌ Cambiar estructura de carpetas existentes
3. ❌ Refactorizar componentes que funcionan
4. ❌ Usar clases CSS semánticas
5. ❌ Implementar features no solicitados

### SIEMPRE HACER:
1. ✅ Seguir patrones existentes en el proyecto
2. ✅ Usar TypeScript con tipos estrictos
3. ✅ Probar en dev antes de decir "listo"
4. ✅ Verificar responsive design
5. ✅ Mantener branding consistente

---

**IMPORTANTE:** Este archivo es la fuente de verdad para la integración de Editorial MaalCa. Si hay conflictos entre este archivo y otros, seguir lo que dice este archivo.

**VERSIÓN:** 1.0
**FECHA:** 30 octubre 2025
**ESTADO:** ✅ Listo para implementación

---

**¿Listo para empezar? ¡Vamos a construir Editorial MaalCa! 🚀**
