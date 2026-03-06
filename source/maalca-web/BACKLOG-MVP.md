# 🎯 BACKLOG MVP - MaalCa Ecosystem
**Fecha:** Marzo 2026  
**Estado del Proyecto:** En desarrollo activo  
**Último commit:** `6dc4d8a` - Pegote Barbershop + Login System  

---

## 📊 ESTADO ACTUAL DEL PROYECTO

### ✅ Lo que YA EXISTE (implementado)

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

### ⚠️ Cambios sin commitear (working tree)
- `src/app/dashboard/[affiliateId]/customers/page.tsx`
- `src/app/dashboard/[affiliateId]/invoicing/page.tsx`
- `src/app/dashboard/[affiliateId]/layout.tsx`
- `src/components/dashboard/DashboardHeader.tsx`
- `src/components/dashboard/DashboardSidebar.tsx`
- `src/config/affiliates-config.ts`
- `src/lib/types/index.ts`
- Nuevos: `DashboardLayoutClient.tsx`, `NewSalePanel.tsx`, `ResponsiveTable.tsx`, `reports/`

---

## 🎯 DEFINICIÓN DEL MVP

### ¿Qué es el MVP de MaalCa?

El MVP debe demostrar que el **ecosistema funciona como negocio real**, no solo como portfolio. Esto significa:

1. **Un afiliado real** puede usar su dashboard para gestionar su negocio
2. **Un cliente real** puede contactar/reservar/comprar
3. **El contenido** es gestionable sin tocar código

### MVP Target: **Pegote Barbershop Dashboard Funcional**

Es el más avanzado y tiene más módulos implementados. Si funciona para Pegote, el patrón escala a todos los afiliados.

---

## 📋 ÉPICAS Y TAREAS

---

### 🔴 ÉPICA 1: AUTENTICACIÓN REAL
**Prioridad:** CRÍTICA - Bloquea todo lo demás  
**Estimado:** 2-3 semanas  
**Objetivo:** Login real para afiliados y clientes

#### Tareas:
- [ ] **AUTH-01** - Elegir proveedor auth (Supabase Auth recomendado - gratis tier)
- [ ] **AUTH-02** - Configurar Supabase proyecto + variables de entorno
- [ ] **AUTH-03** - Implementar login/logout real en `/login`
- [ ] **AUTH-04** - Proteger rutas `/dashboard/[affiliateId]/*` con middleware
- [ ] **AUTH-05** - Crear tabla `affiliates` en Supabase con roles
- [ ] **AUTH-06** - Conectar `affiliates-config.ts` con datos de Supabase
- [ ] **AUTH-07** - Session management (JWT + refresh tokens)
- [ ] **AUTH-08** - Página de "acceso denegado" si no autorizado

---

### 🔴 ÉPICA 2: BASE DE DATOS REAL
**Prioridad:** CRÍTICA - Sin esto el dashboard es solo UI  
**Estimado:** 1-2 semanas  
**Objetivo:** Persistencia de datos para el dashboard

#### Tareas:
- [ ] **DB-01** - Setup Supabase (o PostgreSQL en Docker)
- [ ] **DB-02** - Schema: `customers`, `appointments`, `invoices`, `inventory`
- [ ] **DB-03** - API routes para CRUD de clientes (`/api/customers`)
- [ ] **DB-04** - API routes para citas (`/api/appointments`)
- [ ] **DB-05** - API routes para facturas (`/api/invoices`)
- [ ] **DB-06** - API routes para inventario (`/api/inventory`)
- [ ] **DB-07** - Conectar dashboard pages con API routes reales
- [ ] **DB-08** - Loading states y error handling en todas las páginas

---

### 🟡 ÉPICA 3: DASHBOARD PEGOTE - MÓDULOS FUNCIONALES
**Prioridad:** ALTA - Core del MVP  
**Estimado:** 3-4 semanas  
**Objetivo:** Pegote puede gestionar su barbería desde el dashboard

#### Módulos a completar:
- [ ] **DASH-01** - **Clientes**: CRUD real (crear, editar, historial de visitas)
- [ ] **DASH-02** - **Citas**: Calendario funcional con booking real
- [ ] **DASH-03** - **Facturación**: Crear/enviar facturas reales (PDF)
- [ ] **DASH-04** - **Inventario**: Gestión de productos con alertas de stock
- [ ] **DASH-05** - **Cola de espera**: Sistema en tiempo real (WebSockets o polling)
- [ ] **DASH-06** - **Métricas**: Dashboard con datos reales (ingresos, clientes, etc.)
- [ ] **DASH-07** - **Reportes**: Exportar datos a CSV/PDF
- [ ] **DASH-08** - **Configuración**: Editar perfil del negocio, horarios, servicios

#### Cambios pendientes de commitear:
- [ ] **DASH-09** - Commitear cambios actuales en `customers`, `invoicing`, `layout`, `DashboardHeader`, `DashboardSidebar`
- [ ] **DASH-10** - Commitear nuevos archivos: `DashboardLayoutClient`, `NewSalePanel`, `ResponsiveTable`, `reports/`

---

### 🟡 ÉPICA 4: NEWSLETTER Y COMUNICACIÓN
**Prioridad:** ALTA - Captura de leads  
**Estimado:** 1 semana  
**Objetivo:** Newsletter funcional para todos los proyectos

#### Tareas:
- [ ] **NEWS-01** - Crear cuenta Formspree (gratis) o usar Resend
- [ ] **NEWS-02** - Configurar formulario CiriWhispers newsletter
- [ ] **NEWS-03** - Configurar formulario Editorial MaalCa newsletter
- [ ] **NEWS-04** - Configurar formulario Ecosistema newsletter
- [ ] **NEWS-05** - Actualizar `src/lib/utils/newsletter.ts` con IDs reales
- [ ] **NEWS-06** - Testing de envío de emails
- [ ] **NEWS-07** - Página de confirmación de suscripción

---

### 🟡 ÉPICA 5: SEO Y ANALYTICS
**Prioridad:** ALTA - Visibilidad y métricas  
**Estimado:** 1 semana  
**Objetivo:** Medir tráfico real y aparecer en Google

#### Tareas:
- [ ] **SEO-01** - Crear cuenta Google Analytics 4
- [ ] **SEO-02** - Configurar `.env.local` con `NEXT_PUBLIC_GA_TRACKING_ID`
- [ ] **SEO-03** - Verificar eventos en GA4 Real-time
- [ ] **SEO-04** - Configurar Google Search Console
- [ ] **SEO-05** - Verificar `sitemap.xml` está actualizado con todas las rutas
- [ ] **SEO-06** - Meta tags en todas las páginas principales
- [ ] **SEO-07** - Open Graph images para redes sociales

---

### 🟢 ÉPICA 6: DEPLOYMENT A PRODUCCIÓN
**Prioridad:** MEDIA - Cuando MVP esté listo  
**Estimado:** 1-2 días  
**Objetivo:** El sitio live en maalca.com

#### Tareas:
- [ ] **DEPLOY-01** - Crear cuenta Vercel (gratis tier)
- [ ] **DEPLOY-02** - Conectar repositorio GitHub con Vercel
- [ ] **DEPLOY-03** - Configurar variables de entorno en Vercel
- [ ] **DEPLOY-04** - Configurar dominio `maalca.com` en Vercel
- [ ] **DEPLOY-05** - SSL automático (Vercel lo hace)
- [ ] **DEPLOY-06** - Verificar build en producción
- [ ] **DEPLOY-07** - Configurar preview deployments para PRs

---

### 🟢 ÉPICA 7: CIRIWHISPERS - LECTOR EPUB
**Prioridad:** MEDIA - Producto digital  
**Estimado:** 2-3 semanas  
**Objetivo:** Usuarios pueden leer libros online

#### Tareas:
- [ ] **EPUB-01** - Evaluar `epub.js` vs `Readest` vs solución custom
- [ ] **EPUB-02** - Crear componente `EpubReader` con controles básicos
- [ ] **EPUB-03** - Integrar con página CiriWhispers
- [ ] **EPUB-04** - Tracking de progreso de lectura (localStorage)
- [ ] **EPUB-05** - Sistema de bookmarks básico
- [ ] **EPUB-06** - Responsive en móvil

---

### 🔵 ÉPICA 8: MAALCA PROPERTIES - RESERVAS
**Prioridad:** BAJA (para después del MVP)  
**Estimado:** 4-6 semanas  
**Objetivo:** Clientes pueden agendar visitas a propiedades

#### Tareas:
- [ ] **PROP-01** - Formulario de contacto/reserva funcional
- [ ] **PROP-02** - Integración con calendario (Calendly o custom)
- [ ] **PROP-03** - Notificaciones por email al agente
- [ ] **PROP-04** - Panel de gestión de leads en dashboard

---

## 🗓️ PLAN DE ACCIÓN - SPRINTS

### Sprint 1 (Semanas 1-2): FOUNDATIONS
**Objetivo:** Base técnica para que todo funcione

| Tarea | Responsable | Estado |
|-------|-------------|--------|
| AUTH-01: Elegir Supabase | Dev | ⏳ |
| AUTH-02: Setup Supabase | Dev | ⏳ |
| DB-01: Schema base de datos | Dev | ⏳ |
| DASH-09: Commitear cambios pendientes | Dev | ⏳ |
| NEWS-01: Setup Formspree | Dev | ⏳ |

### Sprint 2 (Semanas 3-4): AUTH + DB
**Objetivo:** Login real y datos persistentes

| Tarea | Responsable | Estado |
|-------|-------------|--------|
| AUTH-03 a AUTH-08 | Dev | ⏳ |
| DB-02 a DB-08 | Dev | ⏳ |
| SEO-01 a SEO-03 | Dev | ⏳ |

### Sprint 3 (Semanas 5-7): DASHBOARD FUNCIONAL
**Objetivo:** Pegote puede usar su dashboard

| Tarea | Responsable | Estado |
|-------|-------------|--------|
| DASH-01 a DASH-08 | Dev | ⏳ |
| NEWS-02 a NEWS-07 | Dev | ⏳ |

### Sprint 4 (Semana 8): DEPLOY + POLISH
**Objetivo:** MVP live en producción

| Tarea | Responsable | Estado |
|-------|-------------|--------|
| DEPLOY-01 a DEPLOY-07 | Dev | ⏳ |
| SEO-04 a SEO-07 | Dev | ⏳ |

---

## 🛠️ HERRAMIENTAS PARA EL BACKLOG

### Opción A: Notion (Recomendado)
**Pros:**
- Gratis para uso personal
- Kanban board visual
- Integración con GitHub
- Fácil de compartir con el equipo
- Templates de backlog ya disponibles

**Setup:**
1. Crear workspace en notion.so
2. Usar template "Engineering Wiki" o "Product Roadmap"
3. Importar este documento como base
4. Crear vistas: Kanban, Timeline, Table

### Opción B: GitHub Projects
**Pros:**
- Integrado con el repositorio
- Issues vinculados a commits
- Gratis
- Automatización con GitHub Actions

**Setup:**
1. Ir a github.com/[tu-repo]/projects
2. Crear nuevo proyecto tipo "Board"
3. Crear issues por cada tarea de este backlog
4. Asignar labels: `epic`, `mvp`, `bug`, `feature`

### Opción C: Linear (Recomendado para equipos)
**Pros:**
- Diseñado para desarrollo de software
- Integración con GitHub
- Sprints y roadmaps
- Gratis hasta 250 issues

**Setup:**
1. linear.app → crear workspace
2. Importar issues desde GitHub
3. Crear ciclos (sprints)

### 🏆 Mi Recomendación
**Para solo tú:** GitHub Projects (ya tienes el repo)  
**Para equipo pequeño:** Notion (más flexible)  
**Para equipo técnico:** Linear (mejor UX para devs)

---

## 📌 PRÓXIMOS PASOS INMEDIATOS

### Esta semana (Quick wins):
1. **Commitear cambios pendientes** del dashboard (DASH-09, DASH-10)
2. **Setup Formspree** para newsletter (15 min, gratis)
3. **Crear cuenta GA4** para analytics (15 min, gratis)
4. **Decidir herramienta de backlog** (Notion vs GitHub Projects)

### Próximas 2 semanas:
1. **Setup Supabase** para auth y base de datos
2. **Implementar login real** con Supabase Auth
3. **Primer módulo funcional**: Clientes de Pegote con datos reales

---

## 💡 DECISIONES TÉCNICAS PENDIENTES

| Decisión | Opciones | Recomendación |
|----------|----------|---------------|
| **Auth Provider** | Supabase, NextAuth, Clerk | **Supabase** (gratis, PostgreSQL incluido) |
| **Base de datos** | Supabase, PlanetScale, Neon | **Supabase** (mismo proveedor que auth) |
| **Email** | Resend, Formspree, SendGrid | **Resend** (gratis 3k emails/mes) |
| **Hosting** | Vercel, Netlify, Railway | **Vercel** (optimizado para Next.js) |
| **Backlog tool** | Notion, GitHub Projects, Linear | **GitHub Projects** (integrado) |
| **Pagos (futuro)** | Stripe, PayPal | **Stripe** (mejor DX) |

---

**Última actualización:** Marzo 2026  
**Próxima revisión:** Semanal  
**Responsable:** Equipo MaalCa
