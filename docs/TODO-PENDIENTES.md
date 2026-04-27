# TODO Pendientes — Ecosistema MaalCa

> Generado: 2026-04-06
> Para continuar con KiloCode u otra herramienta

---

## 1. maalca-web (Next.js 15) — `C:\Users\apich\source\maalca-web`

**Branch actual:** `feat/remove-framer-motion` (NO mergeado a main)
**Estado:** ~14 archivos modificados sin commit, todos son la refactorizacion de CiriWhispers

### 1A. URGENTE — Commit + Deploy pendiente

Los cambios de CiriWhispers estan listos pero SIN commit. Hay que:

1. **Validar en localhost** (`npm run dev`) que todo funcione:
   - [ ] Abrir `/ciriwhispers` — landing carga con colores cream/warm
   - [ ] Abrir `/ciriwhispers/biblioteca` — filtros y story cards funcionan
   - [ ] Click en un story card — StoryReader abre, body scroll se bloquea, firma dice "CiriWhispers" (no "C.")
   - [ ] Cambiar idioma EN/ES — el contenido del lector cambia (es bilingue nativo, no traduccion de UI)
   - [ ] Abrir `/ciriwhispers/obras` — grid de libros carga
   - [ ] Abrir `/ciriwhispers/obras/amaranta` — detalle del libro con boton de leer
   - [ ] Abrir `/ciriwhispers/manifiesto` — pagina del autor
   - [ ] Abrir `/ciriwhispers/contacto` — cards de contacto
   - [ ] Dark mode: en consola del browser poner `document.documentElement.setAttribute('data-theme', 'dark')` — todos los colores cambian
   - [ ] Mobile: reducir a 375px — nav horizontal scrolleable, contenido responsive

2. **Commit todo** en la rama `feat/remove-framer-motion`
3. **Merge a main** y deploy a Vercel (`npx vercel --prod` o push a main que triggerea auto-deploy)

### 1B. CiriWhispers — Fixes menores pendientes

| # | Archivo | Que falta | Prioridad |
|---|---------|-----------|-----------|
| 1 | `src/components/ui/SensitiveNotice.tsx` | Usa colores hardcoded (`bg-red-900/10`, `text-slate-300`, `text-red-400`). Cambiar a CSS vars: `var(--ciri-brand)`, `var(--ciri-text-muted)`, etc. para que funcione en dark mode | Media |
| 2 | `public/images/projects/` | Solo existe `ciriwhispers.png` (logo claro). Falta un `ciriwhispers-dark.png` para dark mode. El CSS ya tiene `--ciri-logo-filter` preparado pero el CiriNav no usa logo imagen, usa texto "CiriWhispers" | Baja |
| 3 | `src/app/ciriwhispers/obras/[bookId]/page.tsx` | Ya usa CSS vars en la mayoria pero verificar que NO queden hex hardcoded. Buscar `#` o `slate-` en el archivo | Baja |
| 4 | Hamburger menu mobile | CiriNav en mobile muestra links en scroll horizontal debajo del nav, NO tiene hamburger menu. Funciona pero es mejorable | Baja |

### 1C. Accessibility — AudioEye reporta 20 issues en maalca.com

Scan de AudioEye en la homepage detectó:

| Issue | Count | Como fix |
|-------|-------|----------|
| **Non-text contrast ratio too low** | 9 | Revisar bordes, iconos, separadores que no cumplan 3:1 contra fondo. Tipicamente `text-gray-600` sobre `bg-gray-900` |
| **Form fields missing labels** | 3 | Newsletter signup y otros forms necesitan `<label>` o `aria-label` |
| **SVG accessible name missing** | 2 | Agregar `aria-label` o `<title>` a SVGs decorativos/funcionales |
| **Skip link missing** | 1 | Agregar `<a href="#main-content" class="sr-only focus:not-sr-only">Skip to content</a>` en layout.tsx |
| **Accessible name != visible text** | 1 | Un boton/link cuyo `aria-label` no coincide con el texto visible |

**Archivos clave a revisar:**
- `src/app/layout.tsx` — agregar skip link
- `src/components/ui/NewsletterSignup.tsx` — labels en form fields
- `src/app/(marketing)/page.tsx` — SVGs sin nombre, contraste bajo

### 1D. Dashboard / Multi-tenant — Estado actual

El dashboard multi-tenant funciona para afiliados existentes. Estado:

| Modulo | Estado | Notas |
|--------|--------|-------|
| Menu (TLD) | ✅ Funcional | `/dashboard/[affiliateId]/menu` |
| Orders (TLD) | ✅ Funcional | `/dashboard/[affiliateId]/orders` |
| QR (TLD) | ✅ Funcional | `/dashboard/[affiliateId]/qr` |
| Metricas | ⚠️ Mock data | Datos hardcoded, no conecta a API |
| Inventario | ⚠️ Placeholder | Pagina existe pero sin funcionalidad |
| Facturacion | ⚠️ Placeholder | Pagina existe pero sin funcionalidad |
| Gift Cards | ⚠️ Placeholder | Pagina existe pero sin funcionalidad |
| Campanas | ⚠️ Placeholder | Pagina existe pero sin funcionalidad |
| Clientes | ⚠️ Placeholder | Pagina existe pero sin funcionalidad |

**Archivos borrados (staged):** Toda la carpeta `src/app/dashboard/the-little-dominican/` fue eliminada y reemplazada por `src/app/dashboard/[affiliateId]/` (multi-tenant con slug dinamico).

**Config de afiliados:** `src/config/affiliates-config.ts` tiene 6 afiliados:
- pegote-barbershop, britocolor, masa-tina, dr-pichardo, the-little-dominican, hablando-mierda

### 1E. General web — Otras mejoras pendientes

- [ ] **Framer Motion removal** — Rama se llama `feat/remove-framer-motion`. La mayoria de animaciones ya usan CSS/Tailwind. Verificar que `framer-motion` se puede quitar de `package.json` sin romper nada. Hacer `grep -r "framer-motion" src/` para ver si queda algun import.
- [ ] **SEO** — ya tiene sitemap, robots.txt, JSON-LD, og:tags. Funcional.
- [ ] **Newsletter** — integrado con Resend. Funcional.
- [ ] **Analytics** — GA4 integrado. Funcional.

---

## 2. maalca-api (.NET 8) — `C:\Users\apich\source\maalca-api`

**Branch:** `develop`
**Ultimo commit:** `feat: add agent_executions table and endpoints for AI observability`
**Deploy:** Railway
**Estado:** Solo cambios de build artifacts (`.vs/`, `bin/`, `obj/`). No hay codigo fuente pendiente.

### Pendientes:

| # | Tarea | Prioridad |
|---|-------|-----------|
| 1 | **Agregar .gitignore** para `.vs/`, `bin/`, `obj/` — estan trackeando basura de Visual Studio | Alta |
| 2 | **Conectar dashboard metricas** — endpoints de metricas existen pero el frontend usa mock data | Media |
| 3 | **Conectar modulos placeholder** (inventario, facturacion, gift cards, campanas, clientes) — necesitan endpoints en API | Baja (futuro) |
| 4 | **Agent executions** — tabla y endpoints recien creados, necesita integracion con n8n pipeline | Media |

---

## 3. maalca-cms (Umbraco 17) — `C:\Users\apich\source\UMBRACO\MiSitioUmbraco`

**Branch:** `develop`
**Ultimo commit:** `feat: add affiliate document types + seed Pegote Barbershop content`
**Estado:** Archivos de deploy sin commit (Dockerfile, railway.toml, etc.)

### Pendientes:

| # | Tarea | Prioridad |
|---|-------|-----------|
| 1 | **Commit archivos de deploy** — Dockerfile, railway.toml, entrypoint.sh estan como untracked | Alta |
| 2 | **Deploy a Railway** — no esta en produccion todavia | Alta |
| 3 | **Conectar Delivery API con maalca-web** — el CMS tiene document types pero el frontend no consume la API | Media |
| 4 | **Content types para CiriWhispers** — stories, books podrian venir del CMS en vez de archivos TS hardcoded | Baja (futuro) |

---

## 4. Arquitectura n8n / Agentes AI — MVP-0

**Infra:** Railway (n8n)
**Estado:** Planificado, no implementado

### MVP-0 Pipeline (lo que bloquea todo lo demas):

| # | Paso | Estado |
|---|------|--------|
| 1 | GitHub Issue → n8n webhook trigger | ❌ No implementado |
| 2 | n8n dispatcher → clasificar issue por dominio | ❌ No implementado |
| 3 | Orchestrator → asignar a agent-executor | ❌ No implementado |
| 4 | Agent executor → generar codigo con LLM | ❌ No implementado |
| 5 | QA validator → lint + tests | ❌ No implementado |
| 6 | PR creator → abrir PR automatico | ❌ No implementado |
| 7 | Learning loop → guardar resultado | ❌ No implementado |

**LLM Tiers definidos:**
- Premium: Claude Sonnet 4 (solo para tareas complejas)
- Standard: DeepSeek V3 / Gemini Flash 2.0
- Free: Groq Llama 3.3 / Qwen

**Tabla `agent_executions`** ya existe en maalca-api para observabilidad.

---

## 5. Resumen ejecutivo — Que hacer primero

### Prioridad 1 (hoy):
1. ✅ Validar CiriWhispers en localhost
2. ✅ Commit + push rama `feat/remove-framer-motion`
3. ✅ Merge a main + deploy Vercel

### Prioridad 2 (esta semana):
4. Fix SensitiveNotice.tsx colores hardcoded
5. Fix 5 issues de accessibility (skip link, form labels, SVG names)
6. Commit archivos de deploy en maalca-cms
7. .gitignore en maalca-api

### Prioridad 3 (proximo sprint):
8. Deploy maalca-cms a Railway
9. Conectar metricas dashboard con API real
10. Empezar MVP-0 pipeline n8n (webhook + dispatcher)

### Prioridad 4 (futuro):
11. Modulos placeholder del dashboard (inventario, facturacion, etc.)
12. Migrar contenido CiriWhispers de archivos TS a Umbraco CMS
13. 28 agentes AI completos

---

## Contexto tecnico para KiloCode

### maalca-web
- **Framework:** Next.js 15 + React 19 + Tailwind CSS 4 + TypeScript
- **Build:** Turbopack (`npm run dev`, `npm run build`)
- **Deploy:** Vercel (auto-deploy on push to main)
- **Dark mode:** `data-theme="dark"` en `<html>`, NO usar next-themes, NO usar `.dark` class
- **CiriWhispers theme:** CSS vars en `src/app/ciriwhispers/ciri.css`, clase `.ciri-theme` en layout
- **Traducciones:** `useTranslation()` de `src/hooks/useSimpleLanguage.tsx` — hook global sin provider
- **Estilos:** Tailwind directo, NO clases semanticas (`text-brand-primary` prohibido)
- **Colores brand principal:** `text-red-600`, `bg-red-600` (fuera de CiriWhispers)
- **Colores CiriWhispers:** `var(--ciri-brand)` = `#8B1A1A` light / `#C4302B` dark

### maalca-api
- **Framework:** .NET 8 Clean Architecture (Api, Application, Domain, Infrastructure)
- **DB:** PostgreSQL
- **Deploy:** Railway via Dockerfile
- **Auth:** JWT con tenant scoping por affiliate

### maalca-cms
- **Framework:** Umbraco 17 (.NET 8)
- **API:** Delivery API (headless)
- **Deploy:** Railway (pendiente)
