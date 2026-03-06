// MaalCa Ecosystem — Crear issues en GitHub
// node scripts/gh-issues.mjs <TOKEN>

const TOKEN = process.argv[2];
const REPO  = "Apichardo85/maalca-web";
const BASE  = `https://api.github.com/repos/${REPO}`;

if (!TOKEN) { console.error("Uso: node scripts/gh-issues.mjs <TOKEN>"); process.exit(1); }

async function gh(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`  ERROR ${method} ${path}: ${res.status} ${err.slice(0,120)}`);
    return null;
  }
  return res.json();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── LABELS ──────────────────────────────────────────────────────────────────
const LABELS = [
  { name: "epic",               color: "0052cc", description: "Agrupacion de tareas" },
  { name: "priority:critical",  color: "b60205", description: "Bloquea el MVP" },
  { name: "priority:high",      color: "e4e669", description: "Alta prioridad" },
  { name: "priority:medium",    color: "0e8a16", description: "Media prioridad" },
  { name: "priority:low",       color: "c5def5", description: "Baja prioridad" },
  { name: "area:auth",          color: "d4c5f9", description: "Autenticacion y sesiones" },
  { name: "area:database",      color: "f9d0c4", description: "Base de datos y schema" },
  { name: "area:dashboard",     color: "fef2c0", description: "Dashboard multi-tenant" },
  { name: "area:cms",           color: "c2e0c6", description: "Umbraco CMS / Delivery API" },
  { name: "area:api",           color: "bfd4f2", description: "maalca-api backend" },
  { name: "area:frontend",      color: "e6e6e6", description: "UI y componentes" },
  { name: "area:seo",           color: "ededed", description: "SEO y analytics" },
  { name: "area:infra",         color: "fbca04", description: "Infra / deploy / devops" },
  { name: "blocked",            color: "ee0701", description: "Bloqueado por otra tarea" },
  { name: "needs-decision",     color: "cc317c", description: "Requiere decision tecnica" },
];

// ── MILESTONES (Epicas) ──────────────────────────────────────────────────────
const MILESTONES = [
  { title: "EPIC-1: Autenticacion Real",         description: "Login real para afiliados. Bloquea todo lo demas." },
  { title: "EPIC-2: Base de Datos Real",         description: "Persistencia con Supabase. Schema completo." },
  { title: "EPIC-3: Dashboard Pegote MVP",       description: "Pegote puede gestionar su barberia desde el dashboard." },
  { title: "EPIC-4: Newsletter y Comunicacion",  description: "Captura de leads funcional en todos los proyectos." },
  { title: "EPIC-5: SEO y Analytics",            description: "Visibilidad en Google y metricas reales." },
  { title: "EPIC-6: Deploy a Produccion",        description: "MVP live en maalca.com con dominio y SSL." },
  { title: "EPIC-7: CiriWhispers Lector EPUB",   description: "Usuarios pueden leer libros online." },
  { title: "EPIC-8: MaalCa Properties Reservas", description: "Clientes pueden agendar visitas a propiedades." },
  { title: "EPIC-9: MaalCaCMS Produccion",       description: "Umbraco con Document Types y BD en la nube." },
  { title: "EPIC-10: maalca-api Backend",        description: "API REST para appointments, billing, inventory, campaigns." },
];

// ── ISSUES ───────────────────────────────────────────────────────────────────
const ISSUES = [

  // EPIC 1 — AUTH (CRITICA)
  {
    title: "[AUTH-01] Elegir e integrar proveedor de autenticacion",
    body: `## Objetivo
Definir e integrar el proveedor de auth para toda la plataforma.

## Opciones
- **Supabase Auth** (recomendado — gratis, PostgreSQL incluido)
- NextAuth.js
- Clerk

## Criterios de aceptacion
- [ ] Decision documentada en ADR
- [ ] Variables de entorno definidas
- [ ] Provider configurado en el proyecto`,
    labels: ["priority:critical", "area:auth", "needs-decision"],
    milestone: "EPIC-1: Autenticacion Real",
  },
  {
    title: "[AUTH-02] Setup Supabase proyecto y variables de entorno",
    body: `## Tareas
- [ ] Crear proyecto en supabase.com
- [ ] Agregar al \`.env.local\`:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
\`\`\`
- [ ] Verificar conexion desde Next.js`,
    labels: ["priority:critical", "area:auth", "area:infra"],
    milestone: "EPIC-1: Autenticacion Real",
  },
  {
    title: "[AUTH-03] Implementar login/logout real en /login",
    body: `## Objetivo
Reemplazar el UI mock con autenticacion real via Supabase.

## Criterios de aceptacion
- [ ] Email + password funcional
- [ ] Redirige al dashboard del afiliado tras login exitoso
- [ ] Manejo de errores visible al usuario
- [ ] Logout limpia la sesion correctamente

**Archivo:** \`src/app/login/page.tsx\``,
    labels: ["priority:critical", "area:auth", "area:frontend"],
    milestone: "EPIC-1: Autenticacion Real",
  },
  {
    title: "[AUTH-04] Middleware para proteger rutas /dashboard/*",
    body: `## Implementacion
- [ ] Crear \`src/middleware.ts\` con Supabase SSR
- [ ] Redirigir a \`/login\` si no hay sesion
- [ ] Verificar que el afiliado tiene acceso al \`affiliateId\` de la ruta

**Referencia:** https://supabase.com/docs/guides/auth/server-side/nextjs`,
    labels: ["priority:critical", "area:auth"],
    milestone: "EPIC-1: Autenticacion Real",
  },
  {
    title: "[AUTH-05] Schema tabla affiliates y roles en Supabase",
    body: `## Schema propuesto
\`\`\`sql
CREATE TABLE affiliates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id),
  affiliate_id text NOT NULL,  -- pegote-barbershop, britocolor, etc.
  role         text DEFAULT 'owner',
  created_at   timestamptz DEFAULT now()
);
\`\`\`

## Criterios
- [ ] Tabla creada con RLS habilitado
- [ ] Usuario solo puede ver su propio afiliado
- [ ] Seed data para Pegote Barbershop`,
    labels: ["priority:critical", "area:auth", "area:database"],
    milestone: "EPIC-1: Autenticacion Real",
  },
  {
    title: "[AUTH-06] Session management con refresh tokens",
    body: `## Tareas
- [ ] Configurar Supabase SSR cookies en Next.js App Router
- [ ] Crear \`src/lib/supabase/server.ts\` y \`client.ts\`
- [ ] Verificar que el token se refresca automaticamente al expirar`,
    labels: ["priority:critical", "area:auth"],
    milestone: "EPIC-1: Autenticacion Real",
  },

  // EPIC 2 — DATABASE (CRITICA)
  {
    title: "[DB-01] Schema completo de la plataforma en Supabase",
    body: `## Tablas a crear
- \`customers\` — CRM multi-tenant
- \`appointments\` — citas y servicios
- \`invoices\` + \`invoice_items\` — facturacion
- \`inventory_items\` + \`stock_movements\` — inventario
- \`campaigns\` — marketing
- \`queue_entries\` — cola de espera en tiempo real

## Criterios
- [ ] Todas las tablas con RLS por tenant
- [ ] Migrations versionadas en \`/init.sql/\`
- [ ] Seed data de prueba para Pegote Barbershop`,
    labels: ["priority:critical", "area:database", "needs-decision"],
    milestone: "EPIC-2: Base de Datos Real",
  },
  {
    title: "[DB-02] API Routes CRUD clientes (/api/customers)",
    body: `## Endpoints
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | \`/api/customers\` | Listar con paginacion y filtros |
| GET | \`/api/customers/[id]\` | Detalle + historial de visitas |
| POST | \`/api/customers\` | Crear |
| PUT | \`/api/customers/[id]\` | Actualizar |
| DELETE | \`/api/customers/[id]\` | Eliminar |

> Siempre filtrar por tenantId. Tipos en \`src/lib/types/common.ts\``,
    labels: ["priority:critical", "area:database", "area:api"],
    milestone: "EPIC-2: Base de Datos Real",
  },
  {
    title: "[DB-03] API Routes citas (/api/appointments)",
    body: `## Endpoints
CRUD completo mas endpoints especiales:
- \`POST /api/appointments/[id]/cancel\`
- \`POST /api/appointments/[id]/complete\`
- \`GET /api/appointments/availability\`
- \`GET /api/appointments/stats\`

> **Nota:** Tipos en \`src/lib/types/appointments.ts\`. Cliente listo en \`src/lib/api/appointmentsApi.ts\` — solo falta el servidor.`,
    labels: ["priority:critical", "area:database", "area:api"],
    milestone: "EPIC-2: Base de Datos Real",
  },
  {
    title: "[DB-04] API Routes facturacion (/api/invoices y /api/payments)",
    body: `## Endpoints
- CRUD facturas con items de linea
- CRUD pagos
- \`POST /api/invoices/[id]/send\` — envia por email
- \`GET /api/billing/stats\`

> Tipos en \`src/lib/types/billing.ts\`. Cliente en \`src/lib/api/billingApi.ts\`.`,
    labels: ["priority:high", "area:database", "area:api"],
    milestone: "EPIC-2: Base de Datos Real",
  },
  {
    title: "[DB-05] API Routes inventario (/api/inventory)",
    body: `## Endpoints
- CRUD items de inventario
- \`POST /api/inventory/[id]/adjust\` — ajuste de stock
- \`GET /api/inventory/alerts\` — alertas de stock bajo
- Historial de movimientos

> Tipos en \`src/lib/types/inventory.ts\`. Cliente en \`src/lib/api/inventoryApi.ts\`.`,
    labels: ["priority:high", "area:database", "area:api"],
    milestone: "EPIC-2: Base de Datos Real",
  },

  // EPIC 3 — DASHBOARD PEGOTE (ALTA)
  {
    title: "[DASH-01] Modulo Clientes — CRUD real con Supabase",
    body: `## Estado actual
UI completa en \`src/app/dashboard/[affiliateId]/customers/page.tsx\` — sin datos reales.

## Tareas
- [ ] Conectar con \`/api/customers\`
- [ ] Lista paginada con busqueda por nombre/email/telefono
- [ ] Formulario crear/editar cliente
- [ ] Historial de visitas por cliente
- [ ] Loading y empty states

**Depende de:** DB-02`,
    labels: ["priority:high", "area:dashboard", "area:frontend", "blocked"],
    milestone: "EPIC-3: Dashboard Pegote MVP",
  },
  {
    title: "[DASH-02] Modulo Citas — calendario funcional",
    body: `## Tareas
- [ ] Conectar con \`/api/appointments\`
- [ ] Vista calendario semana/dia
- [ ] Crear nueva cita desde el dashboard
- [ ] Cambiar estado (confirmar, cancelar, completar)
- [ ] Notificacion al cliente por email

## Decision pendiente
Libreria de calendario: \`react-big-calendar\` vs \`FullCalendar\`

**Depende de:** DB-03`,
    labels: ["priority:high", "area:dashboard", "area:frontend", "blocked", "needs-decision"],
    milestone: "EPIC-3: Dashboard Pegote MVP",
  },
  {
    title: "[DASH-03] Modulo Facturacion — crear y enviar facturas reales",
    body: `## Tareas
- [ ] Conectar con \`/api/invoices\`
- [ ] Crear factura con items de servicio
- [ ] Preview antes de enviar
- [ ] Generar PDF (react-pdf o puppeteer)
- [ ] Enviar por email al cliente
- [ ] Historial con estados (borrador, enviada, pagada)

**Depende de:** DB-04`,
    labels: ["priority:high", "area:dashboard", "area:frontend", "blocked", "needs-decision"],
    milestone: "EPIC-3: Dashboard Pegote MVP",
  },
  {
    title: "[DASH-04] Modulo Inventario — stock con alertas",
    body: `## Tareas
- [ ] Lista de productos con stock actual
- [ ] Crear/editar producto
- [ ] Ajuste de stock (entrada/salida)
- [ ] Alerta visual cuando stock < minimo
- [ ] Historial de movimientos

**Depende de:** DB-05`,
    labels: ["priority:high", "area:dashboard", "area:frontend", "blocked"],
    milestone: "EPIC-3: Dashboard Pegote MVP",
  },
  {
    title: "[DASH-05] Modulo Cola de Espera — tiempo real con Supabase Realtime",
    body: `## Objetivo
Clientes entran a la cola virtual desde su telefono. El barbero ve la cola en vivo.

## Implementacion
- [ ] Tabla \`queue_entries\` en Supabase
- [ ] Suscripcion Supabase Realtime en el dashboard
- [ ] Vista publica para que clientes se unan (sin login)
- [ ] Estimacion de tiempo de espera
- [ ] Notificacion cuando es su turno`,
    labels: ["priority:high", "area:dashboard", "area:frontend", "needs-decision"],
    milestone: "EPIC-3: Dashboard Pegote MVP",
  },
  {
    title: "[DASH-06] Modulo Metricas — KPIs con datos reales",
    body: `## KPIs requeridos
- Ingresos del dia / semana / mes
- Citas completadas vs canceladas
- Clientes nuevos vs recurrentes
- Servicio mas vendido

## Stack
Queries agregadas en Supabase + recharts para graficas`,
    labels: ["priority:medium", "area:dashboard", "area:frontend"],
    milestone: "EPIC-3: Dashboard Pegote MVP",
  },
  {
    title: "[DASH-07] Modulo Reportes — exportar CSV y PDF",
    body: `## Reportes
- Ingresos por periodo
- Lista de clientes activos
- Inventario actual
- Historial de citas

## Formatos
- CSV (descarga directa)
- PDF con logo del afiliado`,
    labels: ["priority:medium", "area:dashboard", "area:frontend"],
    milestone: "EPIC-3: Dashboard Pegote MVP",
  },
  {
    title: "[DASH-08] Configuracion del negocio — editar perfil y servicios",
    body: `## Campos editables
- Nombre del negocio, logo, colores
- Horarios de atencion
- Catalogo de servicios con precios
- Datos de contacto
- Zona horaria y moneda

> Guardar en Supabase, no en \`affiliates-config.ts\` (esa es config estatica del codigo).`,
    labels: ["priority:medium", "area:dashboard", "area:frontend"],
    milestone: "EPIC-3: Dashboard Pegote MVP",
  },

  // EPIC 4 — NEWSLETTER (ALTA)
  {
    title: "[NEWS-01] Configurar Resend como proveedor de email",
    body: `## Tareas
- [ ] Crear cuenta en resend.com (3k emails/mes gratis)
- [ ] Agregar \`RESEND_API_KEY\` al \`.env.local\`
- [ ] Actualizar \`src/app/api/newsletter/subscribe/route.ts\`
- [ ] Test de envio real`,
    labels: ["priority:high", "area:frontend", "needs-decision"],
    milestone: "EPIC-4: Newsletter y Comunicacion",
  },
  {
    title: "[NEWS-02] Conectar todos los formularios de newsletter",
    body: `## Formularios a conectar
- [ ] CiriWhispers newsletter
- [ ] Editorial MaalCa newsletter
- [ ] Ecosistema newsletter
- [ ] MaalCa Properties — notificaciones de propiedades

## Criterios
- Email llega al destinatario
- Usuario ve confirmacion en la UI
- Email guardado en tabla \`subscribers\` en Supabase`,
    labels: ["priority:high", "area:frontend"],
    milestone: "EPIC-4: Newsletter y Comunicacion",
  },

  // EPIC 5 — SEO (ALTA)
  {
    title: "[SEO-01] Configurar Google Analytics 4",
    body: `## Tareas
- [ ] Crear propiedad GA4 en analytics.google.com
- [ ] Agregar \`NEXT_PUBLIC_GA_TRACKING_ID\` al \`.env\`
- [ ] Instalar \`@next/third-parties/google\`
- [ ] Verificar eventos en tiempo real en GA4`,
    labels: ["priority:high", "area:seo", "area:infra"],
    milestone: "EPIC-5: SEO y Analytics",
  },
  {
    title: "[SEO-02] Meta tags y Open Graph en todas las paginas publicas",
    body: `## Paginas objetivo
- \`/\` homepage
- \`/ecosistema\`
- \`/editorial\`
- \`/maalca-properties\`
- \`/pegote-barber\`
- \`/dr-pichardo\`
- \`/hablando-mierda\`

## Incluir por pagina
- title + description
- og:title, og:description, og:image (1200x630)
- twitter:card
- canonical URL`,
    labels: ["priority:high", "area:seo", "area:frontend"],
    milestone: "EPIC-5: SEO y Analytics",
  },
  {
    title: "[SEO-03] Verificar sitemap.xml y Google Search Console",
    body: `## Tareas
- [ ] Confirmar que \`sitemap.ts\` incluye todas las rutas publicas
- [ ] Excluir \`/dashboard/*\` del sitemap
- [ ] Enviar sitemap a Google Search Console
- [ ] Verificar dominio en Search Console`,
    labels: ["priority:medium", "area:seo"],
    milestone: "EPIC-5: SEO y Analytics",
  },

  // EPIC 6 — DEPLOY (MEDIA)
  {
    title: "[DEPLOY-01] Configurar variables de entorno en Vercel",
    body: `## Variables a agregar en Vercel Dashboard
\`\`\`
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_UMBRACO_URL
NEXT_PUBLIC_API_BASE_URL
NEXT_PUBLIC_GA_TRACKING_ID
RESEND_API_KEY
\`\`\`

**Proyecto Vercel ID:** \`prj_jdwev0SFCQ10rZi7YoXREZ5ECJT7\``,
    labels: ["priority:medium", "area:infra"],
    milestone: "EPIC-6: Deploy a Produccion",
  },
  {
    title: "[DEPLOY-02] Configurar dominio maalca.com en Vercel",
    body: `## Tareas
- [ ] Agregar dominio en Vercel Settings > Domains
- [ ] Actualizar DNS del registrar (A record o CNAME)
- [ ] Verificar SSL automatico de Vercel
- [ ] Redirect www -> apex (o viceversa)`,
    labels: ["priority:medium", "area:infra"],
    milestone: "EPIC-6: Deploy a Produccion",
  },
  {
    title: "[DEPLOY-03] Branch protection y preview deployments",
    body: `## Objetivo
Cada PR genera una URL de preview unica. Master protegido requiere PR para mergear.

## Tareas
- [ ] Habilitar branch protection en \`master\`
- [ ] Requerir 1 review antes de merge
- [ ] Verificar que Vercel crea preview por PR automaticamente
- [ ] Documentar flujo: feature branch -> PR -> review -> merge -> deploy`,
    labels: ["priority:medium", "area:infra"],
    milestone: "EPIC-6: Deploy a Produccion",
  },

  // EPIC 7 — EPUB (MEDIA)
  {
    title: "[EPUB-01] Elegir libreria de lector EPUB",
    body: `## Opciones
- \`react-reader\` — simple wrapper de epub.js (ya en package.json)
- \`epub.js\` directo — mas control
- \`@vivliostyle/react\` — mas moderno

## Criterios
- Funciona en Next.js App Router (client component)
- Soporte mobile responsive
- Licencia MIT

**Recomendacion inicial:** \`react-reader\` (ya instalado)`,
    labels: ["priority:medium", "area:frontend", "needs-decision"],
    milestone: "EPIC-7: CiriWhispers Lector EPUB",
  },
  {
    title: "[EPUB-02] Componente EpubReader con controles basicos",
    body: `## Funcionalidades
- [ ] Navegacion prev/next capitulo
- [ ] Cambio de tamano de fuente
- [ ] Toggle tema claro/oscuro (independiente del tema del sitio)
- [ ] Indicador de progreso de lectura
- [ ] Responsive en mobile`,
    labels: ["priority:medium", "area:frontend"],
    milestone: "EPIC-7: CiriWhispers Lector EPUB",
  },
  {
    title: "[EPUB-03] Persistencia de progreso y bookmarks",
    body: `## Implementacion
- Guardar posicion en \`localStorage\` por libro
- Permitir multiples bookmarks
- Restaurar ultima posicion al reabrir el libro`,
    labels: ["priority:low", "area:frontend"],
    milestone: "EPIC-7: CiriWhispers Lector EPUB",
  },

  // EPIC 8 — PROPERTIES (BAJA)
  {
    title: "[PROP-01] Formulario de contacto/reserva para propiedades",
    body: `## Tareas
- [ ] Formulario funcional con validacion
- [ ] Notificacion por email al agente
- [ ] Confirmacion al cliente
- [ ] Integracion con calendario (Calendly o custom)`,
    labels: ["priority:low", "area:frontend"],
    milestone: "EPIC-8: MaalCa Properties Reservas",
  },
  {
    title: "[PROP-02] Panel de gestion de leads en el dashboard",
    body: `## Tareas
- [ ] Lista de solicitudes recibidas
- [ ] Estado del lead (nuevo, contactado, cerrado)
- [ ] Notas del agente por lead`,
    labels: ["priority:low", "area:dashboard"],
    milestone: "EPIC-8: MaalCa Properties Reservas",
  },

  // EPIC 9 — CMS (CRITICA)
  {
    title: "[CMS-01] Crear Document Types en Umbraco Backoffice",
    body: `## Document Types a crear

**Element Types (bloques reutilizables):**
- ServiceBlock
- TeamMemberBlock
- MenuItemBlock
- PropertyBlock

**Document Types:**
- BaseAffiliate (padre, no publicable directamente)
- Barbershop (hereda BaseAffiliate)
- Restaurant (hereda BaseAffiliate)
- RealEstate (hereda BaseAffiliate)

## Guia completa
Ver \`CHECKLIST-IMPLEMENTACION.md\` — checklist paso a paso.

**URL Backoffice:** \`http://localhost:5011/umbraco\``,
    labels: ["priority:critical", "area:cms"],
    milestone: "EPIC-9: MaalCaCMS Produccion",
  },
  {
    title: "[CMS-02] Limpiar DocumentTypeComposer.cs — usings duplicados",
    body: `## Problema
\`DocumentTypeComposer.cs\` tiene ~1490 lineas de \`using\` duplicados. El codigo real empieza en la linea 1498. El archivo esta corrompido pero el proyecto compila igual.

## Solucion
- Eliminar todas las lineas de \`using\` repetidas
- Dejar solo los necesarios al inicio (~10-12 lineas unicas)

**Archivo:** \`C:\\Users\\apich\\MaalCaCMS\\DocumentTypeComposer.cs\``,
    labels: ["priority:high", "area:cms"],
    milestone: "EPIC-9: MaalCaCMS Produccion",
  },
  {
    title: "[CMS-03] Migrar Umbraco de LocalDB a SQL Server en la nube",
    body: `## Problema
Actualmente usa \`Server=(localdb)\\MSSQLLocalDB\` — solo funciona en la maquina local. No es deployable.

## Opciones
- Azure SQL Database (tier basico ~$5/mes)
- Railway PostgreSQL (Umbraco 13+ soporta PG)
- Supabase PostgreSQL

## Tareas
- [ ] Elegir proveedor
- [ ] Crear BD en la nube
- [ ] Actualizar \`ConnectionStrings\` en \`appsettings.json\`
- [ ] Migrar datos existentes

**Esta tarea desbloquea CMS-04.**`,
    labels: ["priority:high", "area:cms", "area:infra", "needs-decision"],
    milestone: "EPIC-9: MaalCaCMS Produccion",
  },
  {
    title: "[CMS-04] Deploy de Umbraco CMS a hosting en la nube",
    body: `## Opciones de hosting
- Azure App Service (nativo .NET, ~$13/mes basico)
- Railway (mas simple, soporta .NET)
- Fly.io

## Tareas
- [ ] Elegir hosting
- [ ] Configurar Dockerfile para produccion
- [ ] Variables de entorno en el servidor
- [ ] Actualizar \`NEXT_PUBLIC_UMBRACO_URL\` en Vercel con la URL publica

**Bloqueado por:** CMS-03`,
    labels: ["priority:high", "area:cms", "area:infra", "blocked"],
    milestone: "EPIC-9: MaalCaCMS Produccion",
  },
  {
    title: "[CMS-05] Crear y publicar contenido inicial de Pegote Barbershop",
    body: `## Contenido a crear en el Backoffice
- [ ] Pagina Pegote Barbershop completa
- [ ] 3 servicios: Corte Clasico, Fade+Diseno, Afeitado Clasico
- [ ] 1 miembro del equipo
- [ ] Horarios e info de contacto
- [ ] **Save and Publish** (no solo Save)

## Validacion
\`\`\`powershell
Invoke-RestMethod -Uri 'http://localhost:5011/umbraco/delivery/api/v2/content/item/pegote'
\`\`\`

**Bloqueado por:** CMS-01`,
    labels: ["priority:high", "area:cms", "blocked"],
    milestone: "EPIC-9: MaalCaCMS Produccion",
  },

  // EPIC 10 — API BACKEND (CRITICA)
  {
    title: "[API-01] Definir arquitectura del backend maalca-api",
    body: `## Contexto
El cliente frontend en \`src/lib/api/\` ya esta construido y espera un backend en \`NEXT_PUBLIC_API_BASE_URL\`. Todos los metodos del cliente estan listos — falta el servidor.

## Opciones
- **Next.js API Routes** en el mismo repo (mas rapido para comenzar)
- **Supabase Edge Functions** (serverless, integrado con la BD)
- **Proyecto .NET separado** (\`/source/maalca-api/\` ya existe como carpeta)

## Recomendacion
Comenzar con Next.js API Routes + Supabase. Extraer a servicio si escala.

> Esta decision desbloquea todos los issues API-02, API-03 y API-04.`,
    labels: ["priority:critical", "area:api", "needs-decision"],
    milestone: "EPIC-10: maalca-api Backend",
  },
  {
    title: "[API-02] Implementar endpoints de appointments en el servidor",
    body: `## Estado actual
Cliente listo en \`src/lib/api/appointmentsApi.ts\`. Solo falta el servidor.

## Endpoints a implementar
- \`GET/POST /api/appointments\`
- \`GET/PUT/DELETE /api/appointments/[id]\`
- \`POST /api/appointments/[id]/cancel\`
- \`POST /api/appointments/[id]/complete\`
- \`GET /api/appointments/availability\`
- \`GET /api/appointments/stats\`

**Bloqueado por:** API-01, DB-01`,
    labels: ["priority:high", "area:api", "blocked"],
    milestone: "EPIC-10: maalca-api Backend",
  },
  {
    title: "[API-03] Implementar endpoints de billing en el servidor",
    body: `## Estado actual
Cliente listo en \`src/lib/api/billingApi.ts\`. Solo falta el servidor.

## Endpoints
- CRUD facturas con items de linea
- CRUD pagos
- \`POST /api/invoices/[id]/send\` — envia email
- \`GET /api/billing/stats\`

## Decision pendiente
Generacion de PDF: \`react-pdf\`, \`puppeteer\`, o \`@react-pdf/renderer\`

**Bloqueado por:** API-01, DB-04`,
    labels: ["priority:high", "area:api", "blocked", "needs-decision"],
    milestone: "EPIC-10: maalca-api Backend",
  },
  {
    title: "[API-04] Implementar endpoints de inventory y campaigns",
    body: `## Estado actual
Clientes listos en \`src/lib/api/inventoryApi.ts\` y \`src/lib/api/campaignsApi.ts\`. Solo falta el servidor.

## Inventory
- CRUD items + ajuste de stock + historial + alertas de stock bajo

## Campaigns
- CRUD campanas + metricas + envio a segmento de clientes

**Bloqueado por:** API-01, DB-01`,
    labels: ["priority:medium", "area:api", "blocked"],
    milestone: "EPIC-10: maalca-api Backend",
  },
];

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nRepo: ${REPO}`);

  // 1. Labels
  console.log(`\n[1/3] Creando ${LABELS.length} labels...`);
  for (const l of LABELS) {
    process.stdout.write(`  ${l.name} ... `);
    const r = await gh("POST", "/labels", l);
    console.log(r ? "OK" : "ya existe o error");
    await sleep(200);
  }

  // 2. Milestones
  console.log(`\n[2/3] Creando ${MILESTONES.length} milestones (epicas)...`);
  const msMap = {};
  for (const ms of MILESTONES) {
    process.stdout.write(`  ${ms.title} ... `);
    const r = await gh("POST", "/milestones", ms);
    if (r?.number) { msMap[ms.title] = r.number; console.log(`#${r.number}`); }
    else console.log("error");
    await sleep(300);
  }

  // 3. Issues
  console.log(`\n[3/3] Creando ${ISSUES.length} issues...`);
  let ok = 0, fail = 0;
  for (const issue of ISSUES) {
    const body = {
      title:     issue.title,
      body:      issue.body,
      labels:    issue.labels,
      milestone: msMap[issue.milestone],
    };
    process.stdout.write(`  ${issue.title.slice(0,65)}... `);
    const r = await gh("POST", "/issues", body);
    if (r?.number) { ok++; console.log(`#${r.number}`); }
    else { fail++; console.log("ERROR"); }
    await sleep(500);
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`COMPLETADO`);
  console.log(`  Issues creados : ${ok} / ${ISSUES.length}`);
  console.log(`  Errores        : ${fail}`);
  console.log(`  Issues   -> https://github.com/${REPO}/issues`);
  console.log(`  Epicas   -> https://github.com/${REPO}/milestones`);
  console.log("=".repeat(50));
}

main().catch(console.error);
