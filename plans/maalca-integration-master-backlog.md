# MaalCa — Master Integration Backlog
> **Versión:** 1.0 — Marzo 2026
> **Scope:** maalca-web como consumidor. Contratos para maalca-api y maalCa CMS.
> **Regla:** maalca-web define QUÉ necesita. Los otros equipos implementan para satisfacer esas necesidades.

---

## 📊 Resumen Ejecutivo

| Proyecto | Epics | Tasks WEB | Contratos → API | Contratos → CMS |
|----------|-------|-----------|-----------------|-----------------|
| Dashboard | 12 | 26 | 13 | 2 |
| Homepage | 2 | 2 | 1 | 1 |
| Ecosistema | 1 | 2 | 0 | 0 (unificado) |
| Editorial | 3 | 4 | 0 | 2 |
| Properties | 2 | 2 | 1 | 1 |
| Dr. Pichardo | 2 | 2 | 1 | 1 |
| CiriWhispers | 2 | 2 | 0 | 1 |
| CiriSonic | 2 | 2 | 1 | 1 |
| Login | 1 | 1 | 0 (→ API-REQ-001) | 0 |
| **TOTAL** | **27** | **43** | **17** | **9** |

---

## 🌐 PARTE 1 — maalca-web Tasks (Para el equipo Frontend)

### DASHBOARD `/dashboard/[affiliateId]`

#### [EPIC-DASH-1] Authentication & Authorization
- [x] **WEB-001**: Implementar login consumiendo auth API real
  - What I need: `POST /api/auth/login` con `{email, password}` → `{token, user: {id, email, affiliateId, role}}`
  - Current state: ✅ IMPLEMENTADO - `src/lib/auth/auth-service.ts` + `src/app/login/page.tsx`
  - Acceptance criteria: Login real con JWT, redirect a dashboard
- [x] **WEB-002**: Middleware de rutas protegidas `/dashboard/*`
  - What I need: Validación de JWT en Next.js middleware
  - Current state: ✅ IMPLEMENTADO - `src/middleware.ts`
  - Acceptance criteria: Sin JWT → redirect a `/login`

#### [EPIC-DASH-2] Multi-Tenant Configuration
- [x] **WEB-003**: Fetch configuración de afiliado desde API
  - What I need: `GET /api/affiliates/{affiliateId}` → `{id, branding, modules, features, settings}`
  - Current state: ✅ IMPLEMENTADO - `src/lib/affiliates/affiliate-service.ts`
  - Acceptance criteria: Dashboard carga config desde API con theme dinámico

#### [EPIC-DASH-3] Customer Management (CRM)
- [x] **WEB-004**: Listar clientes desde API
  - What I need: `GET /api/affiliates/{affiliateId}/customers?page=1&limit=20&search=&status=` → `{data, total, page, totalPages}`
  - Current state: ✅ SERVICIO CREADO - `src/lib/dashboard/customer-service.ts` (pendiente conexión)
- [x] **WEB-005**: Crear cliente via API
  - What I need: `POST /api/affiliates/{affiliateId}/customers` con `{name, email, phone, notes}`
  - Current state: ✅ SERVICIO CREADO - pendiente conexión
- [x] **WEB-006**: Editar cliente via API
  - What I need: `PUT /api/affiliates/{affiliateId}/customers/{id}`
  - Current state: ✅ SERVICIO CREADO - pendiente conexión
- [x] **WEB-007**: Eliminar cliente via API
  - What I need: `DELETE /api/affiliates/{affiliateId}/customers/{id}`
  - Current state: ✅ SERVICIO CREADO - pendiente conexión

#### [EPIC-DASH-4] Appointment Scheduling
- [x] **WEB-008**: Listar citas desde API
  - What I need: `GET /api/affiliates/{affiliateId}/appointments?date=&status=&page=1` → `{data, total, page, totalPages}`
  - Current state: ✅ SERVICIO CREADO - `src/lib/dashboard/appointment-service.ts`
- [x] **WEB-009**: Crear cita via API
  - What I need: `POST /api/affiliates/{affiliateId}/appointments` con `{customerId, serviceId, date, time, notes}`
  - Current state: ✅ SERVICIO CREADO
- [x] **WEB-010**: Actualizar estado de cita
  - What I need: `PATCH /api/affiliates/{affiliateId}/appointments/{id}` con `{status}`
  - Current state: ✅ SERVICIO CREADO

#### [EPIC-DASH-5] Inventory Management
- [x] **WEB-011**: Listar inventario desde API
  - What I need: `GET /api/affiliates/{affiliateId}/inventory?category=&status=&page=1` → `{data, total}`
  - Current state: ✅ SERVICIO CREADO - `src/lib/dashboard/inventory-service.ts`
- [x] **WEB-012**: Registrar movimiento de inventario
  - What I need: `POST /api/affiliates/{affiliateId}/inventory/movements` con `{itemId, type: "in"|"out", quantity, notes}`
  - Current state: ✅ SERVICIO CREADO

#### [EPIC-DASH-6] Virtual Queue (Real-time)
- [x] **WEB-013**: Fetch cola + suscripción SignalR
  - What I need: `GET /api/affiliates/{affiliateId}/queue` + SignalR Hub `/hubs/queue?affiliateId={id}`
  - Current state: ✅ SERVICIO CREADO - `src/lib/dashboard/queue-service.ts`
- [x] **WEB-014**: Agregar entrada a la cola
  - What I need: `POST /api/affiliates/{affiliateId}/queue` con `{displayName, phone, serviceId, preferredBarberId, notes, channel}`
  - Current state: ✅ SERVICIO CREADO
- [x] **WEB-015**: Actualizar estado de entrada en cola
  - What I need: `PATCH /api/affiliates/{affiliateId}/queue/{id}` con `{status, barberId}`
  - Current state: ✅ SERVICIO CREADO
  - Acceptance criteria: Call next / in service / complete / no-show

#### [EPIC-DASH-7] Team Management
- [x] **WEB-016**: Listar equipo desde API
  - What I need: `GET /api/affiliates/{affiliateId}/team?department=&status=` → `{data, total}`
  - Current state: ✅ SERVICIO CREADO - `src/lib/dashboard/team-service.ts`
- [x] **WEB-017**: Agregar miembro del equipo
  - What I need: `POST /api/affiliates/{affiliateId}/team` con `{name, email, role, department, joinDate}`
  - Current state: ✅ SERVICIO CREADO

#### [EPIC-DASH-8] Store / Products
- [x] **WEB-018**: Listar productos desde API
  - What I need: `GET /api/affiliates/{affiliateId}/products?category=&status=` → `{data, total}`
  - Current state: ✅ SERVICIO CREADO - `src/lib/dashboard/product-service.ts`
- [x] **WEB-019**: Crear/editar producto
  - What I need: `POST/PUT /api/affiliates/{affiliateId}/products` con `{name, category, price, stock, status}`
  - Current state: ✅ SERVICIO CREADO

#### [EPIC-DASH-9] Invoicing
- [x] **WEB-020**: Listar facturas desde API
  - What I need: `GET /api/affiliates/{affiliateId}/invoices?status=&dateFrom=&dateTo=` → `{data, total}`
  - Current state: ✅ SERVICIO CREADO - `src/lib/dashboard/invoice-service.ts`
- [x] **WEB-021**: Crear factura via API
  - What I need: `POST /api/affiliates/{affiliateId}/invoices` con `{customerId, items: [], dueDate}`
  - Current state: ✅ SERVICIO CREADO

#### [EPIC-DASH-10] Gift Cards
- [x] **WEB-022**: Listar gift cards desde API
  - What I need: `GET /api/affiliates/{affiliateId}/giftcards?status=` → `{data, total}`
  - Current state: ✅ SERVICIO CREADO - `src/lib/dashboard/giftcard-service.ts`
- [x] **WEB-023**: Crear gift card via API
  - What I need: `POST /api/affiliates/{affiliateId}/giftcards` con `{amount, recipientEmail, message}`
  - Current state: ✅ SERVICIO CREADO

#### [EPIC-DASH-11] Metrics & Analytics
- [x] **WEB-024**: Fetch métricas de negocio desde API
  - What I need: `GET /api/affiliates/{affiliateId}/metrics` → `{revenue, appointments, customers, inventoryValue, ...}`
  - Current state: ✅ IMPLEMENTADO en `src/lib/affiliates/affiliate-service.ts`

#### [EPIC-DASH-12] Campaigns
- [x] **WEB-025**: Listar campañas desde API
  - What I need: `GET /api/affiliates/{affiliateId}/campaigns?status=` → `{data, total}`
  - Current state: ✅ SERVICIO CREADO - `src/lib/dashboard/campaign-service.ts`
- [x] **WEB-026**: Crear campaña via API
  - What I need: `POST /api/affiliates/{affiliateId}/campaigns` con `{name, type, targetAudience, content, schedule}`
  - Current state: ✅ SERVICIO CREADO

---

### HOMEPAGE `/`

#### [EPIC-HOME-1] Dynamic Ecosystem Projects
- [ ] **WEB-HOME-001**: Fetch proyectos desde CMS
  - What I need: `GET /umbraco/delivery/api/v2/content?contentType=ecosystemProject`
  - Current state: ⏳ PENDIENTE - usa datos de `src/data/ecosystem-projects.ts`
  - Acceptance criteria: Homepage muestra proyectos desde CMS con filtro por categoría
  - Blocked until: CMS-REQ-ECO-001

#### [EPIC-HOME-2] Dynamic Stats
- [ ] **WEB-HOME-002**: Fetch métricas globales desde API
  - What I need: `GET /api/metrics/overview` → `{activeProjects, collaborators, customers, yearsExperience}`
  - Current state: Números hardcoded en `page.tsx` línea 183
  - Blocked until: API-REQ-HOME-001

---

### ECOSISTEMA `/ecosistema`

#### [EPIC-ECO-1] Dynamic Project Catalog
- [ ] **WEB-ECO-001**: Fetch todos los proyectos desde CMS
  - What I need: `GET /umbraco/delivery/api/v2/content?contentType=ecosystemProject&includeInactive=true`
  - Current state: Array hardcoded en `ecosistema/page.tsx` línea 9
  - Blocked until: CMS-REQ-ECO-001
- [ ] **WEB-ECO-002**: Fetch proyecto individual por slug
  - What I need: `GET /umbraco/delivery/api/v2/content/item/{slug}`
  - Current state: No implementado
  - Blocked until: CMS-REQ-ECO-001

---

### EDITORIAL `/editorial`

#### [EPIC-EDIT-1] Article Listing
- [ ] **WEB-EDIT-001**: Fetch artículos desde CMS con paginación
  - What I need: `GET /umbraco/delivery/api/v2/content?contentType=article&page=1&pageSize=10&category=&featured=`
  - Current state: Array hardcoded en `editorial/page.tsx` línea 12
  - Blocked until: CMS-REQ-EDIT-001

#### [EPIC-EDIT-2] Article Content
- [ ] **WEB-EDIT-002**: Fetch contenido completo de artículo
  - What I need: `GET /umbraco/delivery/api/v2/content/item/{slug}` → `{title, content: RichText, category, readTime, publishDate, tags, author}`
  - Current state: Reader usa mock content
  - Blocked until: CMS-REQ-EDIT-001

#### [EPIC-EDIT-3] Digital Books
- [ ] **WEB-EDIT-003**: Fetch catálogo de libros desde CMS
  - What I need: `GET /umbraco/delivery/api/v2/content?contentType=book`
  - Current state: Hardcoded en `booksData`, EPUBs en `/public`
  - Blocked until: CMS-REQ-EDIT-002
- [ ] **WEB-EDIT-004**: Stream EPUB desde CMS media
  - What I need: URL de media del campo `epubFile` del Document Type Book
  - Current state: Archivos estáticos en `/public/books/`
  - Blocked until: CMS-REQ-EDIT-002

---

### MAALCA PROPERTIES `/maalca-properties`

#### [EPIC-PROP-1] Property Listings
- [ ] **WEB-PROP-001**: Fetch propiedades desde CMS
  - What I need: `GET /umbraco/delivery/api/v2/content?contentType=property&type=&priceRange=&page=1`
  - Current state: Hook `usePropertiesI18n` con fallback a mock
  - Blocked until: CMS-REQ-PROP-001

#### [EPIC-PROP-2] Lead Capture
- [ ] **WEB-PROP-002**: Enviar lead a API
  - What I need: `POST /api/leads/properties` con `{name, email, phone, country, propertyId, message}`
  - Current state: Modal existe, sin API call
  - Blocked until: API-REQ-PROP-001

---

### DR. PICHARDO `/dr-pichardo`

#### [EPIC-DRP-1] Doctor Profile
- [ ] **WEB-DRP-001**: Fetch perfil del doctor desde CMS
  - What I need: `GET /umbraco/delivery/api/v2/content/item/doctor-pichardo`
  - Current state: Hardcoded en `page.tsx` líneas 14-35
  - Blocked until: CMS-REQ-DRP-001

#### [EPIC-DRP-2] Services & Booking
- [ ] **WEB-DRP-002**: Fetch servicios médicos y reservar citas
  - What I need: `GET /api/affiliates/dr-pichardo/services` + `POST /api/affiliates/dr-pichardo/appointments`
  - Current state: Hardcoded en `page.tsx` líneas 37+
  - Blocked until: API-REQ-004, API-REQ-004b

---

### CIRIWHISPERS `/ciriwhispers`

#### [EPIC-CW-1] Books Catalog
- [ ] **WEB-CW-001**: Fetch catálogo de libros desde CMS
  - What I need: `GET /umbraco/delivery/api/v2/content?contentType=ciriWhispersBook`
  - Current state: Hardcoded en `page.tsx` líneas 26+
  - Blocked until: CMS-REQ-CW-001

#### [EPIC-CW-2] Digital Reader
- [ ] **WEB-CW-002**: Stream EPUB desde CMS media
  - What I need: URL del campo `epubFile` del Document Type CiriWhispersBook
  - Current state: Archivos estáticos en `/public/books/`
  - Blocked until: CMS-REQ-CW-001

---

### CIRISONIC `/cirisonic`

#### [EPIC-CS-1] Services
- [ ] **WEB-CS-001**: Fetch servicios desde CMS
  - What I need: `GET /umbraco/delivery/api/v2/content?contentType=ciriSonicService`
  - Current state: Hardcoded en `page.tsx` líneas 15+
  - Blocked until: CMS-REQ-CS-001

#### [EPIC-CS-2] Lead Capture
- [ ] **WEB-CS-002**: Enviar lead a API
  - What I need: `POST /api/leads/cirisonic` con `{name, email, phone, projectType, message}`
  - Current state: Email signup sin API call
  - Blocked until: API-REQ-CS-001

---

### LOGIN `/login`

#### [EPIC-AUTH-1] Real Authentication
- [x] **WEB-AUTH-001**: Conectar login a auth API real
  - What I need: Ver API-REQ-001 (ya cubierto en EPIC-DASH-1)
  - Current state: ✅ IMPLEMENTADO - `src/app/login/page.tsx` + `src/lib/auth/auth-service.ts`

---

## ⚙️ PARTE 2 — Contratos para maalca-api (.NET 8)

> Estos son REQUERIMIENTOS de maalca-web. El equipo .NET implementa para satisfacerlos.

### Auth
- [ ] **API-REQ-001**: `POST /api/auth/login` → `{token: string, refreshToken: string, user: {id, email, affiliateId, role}}` — Autenticación core
- [ ] **API-REQ-001b**: `POST /api/auth/refresh` → nuevo `{token, refreshToken}` — Refresh token rotation

### Multi-Tenant
- [ ] **API-REQ-002**: `GET /api/affiliates/{affiliateId}` → `{id, branding: {logo, primaryColor, secondaryColor, heroImage}, modules: string[], features: Record<string,boolean>, settings: {}}` — Configuración del tenant

### Business Modules (todos bajo `/api/affiliates/{affiliateId}/`)
- [ ] **API-REQ-003**: `GET/POST/PUT/DELETE /customers` — CRM completo con paginación y búsqueda
- [ ] **API-REQ-004**: `GET/POST/PATCH /appointments` — Scheduling con conflicto de horarios
- [ ] **API-REQ-004b**: `GET/POST/PUT/DELETE /services` — Catálogo de servicios (nombre, precio, duración, categoría) — lógica de negocio, no CMS
- [ ] **API-REQ-005**: `GET/POST /inventory` + `POST /inventory/movements` — Stock con movimientos in/out
- [ ] **API-REQ-006**: `GET/POST/PATCH /queue` + **SignalR Hub** `/hubs/queue?affiliateId={id}` — Cola virtual en tiempo real
- [ ] **API-REQ-007**: `GET/POST/PUT/DELETE /team` — Gestión de empleados
- [ ] **API-REQ-008**: `GET/POST/PUT/DELETE /products` — Catálogo de productos
- [ ] **API-REQ-009**: `GET/POST /invoices` — Facturación
- [ ] **API-REQ-010**: `GET/POST /giftcards` — Gift cards con código único
- [ ] **API-REQ-011**: `GET /metrics` → `{revenue, appointments, customers, inventoryValue, queueLength, ...}` — KPIs del dashboard
- [ ] **API-REQ-012**: `GET/POST /campaigns` — Campañas de marketing

### Leads (público, sin afiliado en path)
- [ ] **API-REQ-HOME-001**: `GET /api/metrics/overview` → `{activeProjects, collaborators, customers, yearsExperience}` — Stats de homepage
- [ ] **API-REQ-PROP-001**: `POST /api/leads/properties` con `{name, email, phone, country, propertyId, message}` — Leads de propiedades
- [ ] **API-REQ-CS-001**: `POST /api/leads/cirisonic` con `{name, email, phone, projectType, message}` — Leads de CiriSonic

### Notas técnicas para maalca-api
- Todos los endpoints de afiliado requieren `X-Tenant-Id` o `{affiliateId}` en path para aislamiento de datos
- Error format estándar: `{error: {code: string, message: string, details?: any}}`
- Paginación estándar: `?page=1&limit=20` → `{data: [], total, page, totalPages}`
- API-REQ-006: SignalR Hub requiere `Access-Control-Allow-Credentials: true`, no wildcard origin (ver restricciones CORS conocidas)

---

## 🌐 PARTE 3 — Contratos para maalCa CMS (Umbraco 17)

> Estos son REQUERIMIENTOS de maalca-web. El equipo Umbraco crea los Document Types y expone via Delivery API v2.

### Document Types requeridos

| ID | Document Type | Usado en | Campos requeridos |
|----|--------------|----------|-------------------|
| **CMS-REQ-ECO-001** | `EcosystemProject` | Homepage + Ecosistema | `title: Text, slug: Text, description: Text, category: Text, color: Text, active: Boolean, image: MediaPicker, details: Text[], status: Text, launched: Text, href: Text` |
| **CMS-REQ-EDIT-001** | `Article` | Editorial | `title: Text, slug: Text, excerpt: Text, content: RichText, category: Text, readTime: Integer, publishDate: Date, featured: Boolean, tags: Text[], author: Text` |
| **CMS-REQ-EDIT-002** | `Book` | Editorial + CiriWhispers | `title: Text, slug: Text, description: RichText, cover: MediaPicker, epubFile: MediaPicker, author: Text, status: Text` |
| **CMS-REQ-PROP-001** | `Property` | MaalCa Properties | `title: Text, price: Decimal, location: Text, beds: Integer, baths: Integer, sqft: Integer, images: MediaPicker[], type: Text, features: Text[], description: RichText` |
| **CMS-REQ-DRP-001** | `DoctorProfile` | Dr. Pichardo | `name: Text, bio: RichText, license: Text, photo: MediaPicker, specialties: Text[], contactPhone: Text, address: Text` |
| **CMS-REQ-CW-001** | `CiriWhispersBook` | CiriWhispers | `title: Text, slug: Text, description: RichText, cover: MediaPicker, epubFile: MediaPicker, author: Text, genre: Text, status: Text` |
| **CMS-REQ-CS-001** | `CiriSonicService` | CiriSonic | `title: Text, description: RichText, icon: Text, price: Text, category: Text, featured: Boolean` |
| **CMS-REQ-DASH-001** | `AffiliateLanding` | Dashboard (landing pública) | `affiliateId: Text, logo: MediaPicker, heroImage: MediaPicker, description: Text, primaryColor: Text, secondaryColor: Text` |
| **CMS-REQ-DASH-002** | `Testimonial` | Páginas de afiliados | `customerName: Text, quote: RichText, rating: Integer, photo: MediaPicker, affiliateId: Text` |

### Notas técnicas para maalCa CMS
- Delivery API v2 debe estar habilitada y con CORS configurado hacia `maalca-web` (dominio de producción + localhost:3000)
- `CMS-REQ-ECO-001` es un único Document Type — usado tanto en Homepage como en Ecosistema (no crear duplicado)
- `CMS-REQ-EDIT-002` y `CMS-REQ-CW-001` pueden consolidarse en un único tipo `DigitalBook` si el equipo lo prefiere — el frontend adaptará el fetch por categoría
- EPUBs se sirven via Umbraco Media — el frontend necesita la URL pública del archivo, no streaming especial

---

## 🔄 Orden de Implementación Recomendado

```
Fase 1 — Desbloquear todo (maalca-api)
  API-REQ-001 (auth)
  API-REQ-002 (tenant config)
    ↓
Fase 2 — Dashboard funcional (maalca-api)
  API-REQ-003 customers
  API-REQ-004 appointments + 004b services
  API-REQ-005 inventory
  API-REQ-011 metrics
    ↓
Fase 3 — Contenido vivo (maalCa CMS)
  CMS-REQ-ECO-001 EcosystemProject
  CMS-REQ-EDIT-001 Article
  CMS-REQ-PROP-001 Property
    ↓
Fase 4 — Features avanzadas
  API-REQ-006 SignalR Queue
  API-REQ-009 Invoices
  API-REQ-010 GiftCards
  CMS-REQ-EDIT-002 Book / EPUB
```

---

*Documento generado: Marzo 2026 — maalca-web Integration Architecture*
