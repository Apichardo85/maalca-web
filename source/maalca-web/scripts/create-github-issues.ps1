# ============================================================
# MaalCa Ecosystem - Crear Issues en GitHub
# Repo: Apichardo85/maalca-web
#
# COMO EJECUTAR:
#   1. Ir a https://github.com/settings/tokens/new
#   2. Crear token con permisos: repo (full)
#   3. Ejecutar:
#      .\scripts\create-github-issues.ps1 -Token "ghp_xxxxx"
# ============================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

$REPO  = "Apichardo85/maalca-web"
$BASE  = "https://api.github.com/repos/$REPO"
$HEADS = @{
    Authorization = "Bearer $Token"
    Accept        = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

function Invoke-GH($method, $path, $body = $null) {
    $params = @{ Uri = "$BASE$path"; Method = $method; Headers = $HEADS; ContentType = "application/json" }
    if ($body) { $params.Body = ($body | ConvertTo-Json -Depth 5) }
    try { Invoke-RestMethod @params }
    catch { Write-Host "  ERROR $path : $($_.Exception.Message)" -ForegroundColor Red; return $null }
}

# ============================================================
# 1. LABELS
# ============================================================
Write-Host "`n[1/3] Creando labels..." -ForegroundColor Cyan

$labels = @(
    @{ name="epic";                color="0052cc"; description="Agrupacion de tareas relacionadas" },
    @{ name="priority:critical";   color="b60205"; description="Bloquea el MVP" },
    @{ name="priority:high";       color="e4e669"; description="Alta prioridad" },
    @{ name="priority:medium";     color="0e8a16"; description="Media prioridad" },
    @{ name="priority:low";        color="c5def5"; description="Baja prioridad" },
    @{ name="area:auth";           color="d4c5f9"; description="Autenticacion y sesiones" },
    @{ name="area:database";       color="f9d0c4"; description="Base de datos y schema" },
    @{ name="area:dashboard";      color="fef2c0"; description="Dashboard multi-tenant" },
    @{ name="area:cms";            color="c2e0c6"; description="Umbraco CMS / Delivery API" },
    @{ name="area:api";            color="bfd4f2"; description="maalca-api backend" },
    @{ name="area:frontend";       color="e6e6e6"; description="UI / componentes" },
    @{ name="area:seo";            color="ededed"; description="SEO y analytics" },
    @{ name="area:infra";          color="fbca04"; description="Infra / deploy / devops" },
    @{ name="blocked";             color="ee0701"; description="Bloqueado por otra tarea" },
    @{ name="needs-decision";      color="cc317c"; description="Requiere decision tecnica" }
)

foreach ($l in $labels) {
    Write-Host "  label: $($l.name)"
    Invoke-GH "POST" "/labels" $l | Out-Null
    Start-Sleep -Milliseconds 200
}

# ============================================================
# 2. MILESTONES (Epicas)
# ============================================================
Write-Host "`n[2/3] Creando milestones (epicas)..." -ForegroundColor Cyan

$milestones = @(
    @{ title="EPIC-1: Autenticacion Real";         description="Login real para afiliados y clientes. Bloquea todo lo demas." },
    @{ title="EPIC-2: Base de Datos Real";         description="Persistencia con Supabase. Schema completo de la plataforma." },
    @{ title="EPIC-3: Dashboard Pegote MVP";       description="Pegote puede gestionar su barberia desde el dashboard." },
    @{ title="EPIC-4: Newsletter y Comunicacion";  description="Captura de leads funcional en todos los proyectos." },
    @{ title="EPIC-5: SEO y Analytics";            description="Visibilidad en Google y metricas reales de trafico." },
    @{ title="EPIC-6: Deploy a Produccion";        description="MVP live en maalca.com con dominio y SSL." },
    @{ title="EPIC-7: CiriWhispers Lector EPUB";   description="Usuarios pueden leer libros online." },
    @{ title="EPIC-8: MaalCa Properties Reservas"; description="Clientes pueden agendar visitas a propiedades." },
    @{ title="EPIC-9: MaalCaCMS Produccion";       description="Umbraco con Document Types creados y BD en la nube." },
    @{ title="EPIC-10: maalca-api Backend";        description="API REST para appointments, billing, inventory, campaigns." }
)

$msMap = @{}
foreach ($ms in $milestones) {
    Write-Host "  milestone: $($ms.title)"
    $result = Invoke-GH "POST" "/milestones" $ms
    if ($result) { $msMap[$ms.title] = $result.number }
    Start-Sleep -Milliseconds 300
}

# ============================================================
# 3. ISSUES
# ============================================================
Write-Host "`n[3/3] Creando issues..." -ForegroundColor Cyan

$issues = @(

    # ---- EPIC 1: AUTH (CRITICA) ----
    @{
        title     = "[AUTH-01] Elegir e integrar proveedor de autenticacion"
        body      = "## Objetivo`nDefinir e integrar el proveedor de auth para toda la plataforma.`n`n## Opciones`n- **Supabase Auth** (recomendado - gratis, PostgreSQL incluido)`n- NextAuth.js`n- Clerk`n`n## Criterios de aceptacion`n- [ ] Decision documentada`n- [ ] Variables de entorno definidas`n- [ ] Provider configurado en el proyecto"
        labels    = @("priority:critical","area:auth","needs-decision")
        milestone = "EPIC-1: Autenticacion Real"
    },
    @{
        title     = "[AUTH-02] Setup Supabase proyecto y variables de entorno"
        body      = "## Tareas`n- [ ] Crear proyecto en supabase.com`n- [ ] Agregar al `.env.local`:`n````nNEXT_PUBLIC_SUPABASE_URL=`nNEXT_PUBLIC_SUPABASE_ANON_KEY=`nSUPABASE_SERVICE_ROLE_KEY=`n```\n- [ ] Verificar conexion desde Next.js"
        labels    = @("priority:critical","area:auth","area:infra")
        milestone = "EPIC-1: Autenticacion Real"
    },
    @{
        title     = "[AUTH-03] Implementar login/logout real en /login"
        body      = "## Objetivo`nReemplazar el UI mock con autenticacion real.`n`n## Criterios de aceptacion`n- [ ] Email + password funcional via Supabase`n- [ ] Redirige al dashboard del afiliado tras login`n- [ ] Manejo de errores visible al usuario`n- [ ] Logout limpia la sesion`n`n## Archivo: `src/app/login/page.tsx`"
        labels    = @("priority:critical","area:auth","area:frontend")
        milestone = "EPIC-1: Autenticacion Real"
    },
    @{
        title     = "[AUTH-04] Middleware para proteger rutas /dashboard/*"
        body      = "## Implementacion`n- [ ] Crear `src/middleware.ts` con Supabase SSR`n- [ ] Redirigir a `/login` si no hay sesion`n- [ ] Verificar que el afiliado tiene acceso al `affiliateId` de la ruta`n`n## Referencia`nhttps://supabase.com/docs/guides/auth/server-side/nextjs"
        labels    = @("priority:critical","area:auth")
        milestone = "EPIC-1: Autenticacion Real"
    },
    @{
        title     = "[AUTH-05] Schema tabla affiliates y roles en Supabase"
        body      = "## Schema propuesto`n```sql`nCREATE TABLE affiliates (`n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),`n  user_id uuid REFERENCES auth.users(id),`n  affiliate_id text NOT NULL,`n  role text DEFAULT 'owner',`n  created_at timestamptz DEFAULT now()`n);`n```\n`n## Criterios`n- [ ] Tabla creada con RLS habilitado`n- [ ] Usuario solo ve su propio afiliado`n- [ ] Seed data para Pegote Barbershop"
        labels    = @("priority:critical","area:auth","area:database")
        milestone = "EPIC-1: Autenticacion Real"
    },
    @{
        title     = "[AUTH-06] Session management con refresh tokens"
        body      = "## Tareas`n- [ ] Configurar Supabase SSR cookies en Next.js App Router`n- [ ] Crear `src/lib/supabase/server.ts` y `client.ts``n- [ ] Verificar que el token se refresca automaticamente al expirar"
        labels    = @("priority:critical","area:auth")
        milestone = "EPIC-1: Autenticacion Real"
    },

    # ---- EPIC 2: DATABASE (CRITICA) ----
    @{
        title     = "[DB-01] Schema completo de la plataforma en Supabase"
        body      = "## Tablas a crear`n- `customers` — CRM multi-tenant`n- `appointments` — citas y servicios`n- `invoices` + `invoice_items` — facturacion`n- `inventory_items` + `stock_movements` — inventario`n- `campaigns` — marketing`n- `queue_entries` — cola de espera en tiempo real`n`n## Criterios`n- [ ] Todas las tablas con RLS por tenant`n- [ ] Migrations en `/init.sql/`\n- [ ] Seed data de prueba para Pegote"
        labels    = @("priority:critical","area:database","needs-decision")
        milestone = "EPIC-2: Base de Datos Real"
    },
    @{
        title     = "[DB-02] API Routes CRUD clientes (/api/customers)"
        body      = "## Endpoints`n| Metodo | Ruta | Descripcion |`n|--------|------|-------------|`n| GET | `/api/customers` | Listar con paginacion y filtros |`n| GET | `/api/customers/[id]` | Detalle + historial |`n| POST | `/api/customers` | Crear |`n| PUT | `/api/customers/[id]` | Actualizar |`n| DELETE | `/api/customers/[id]` | Eliminar |`n`n**Siempre filtrar por tenantId.**"
        labels    = @("priority:critical","area:database","area:api")
        milestone = "EPIC-2: Base de Datos Real"
    },
    @{
        title     = "[DB-03] API Routes citas (/api/appointments)"
        body      = "## Endpoints`nCRUD completo mas:`n- `POST /api/appointments/[id]/cancel`\n- `POST /api/appointments/[id]/complete`\n- `GET /api/appointments/availability`\n- `GET /api/appointments/stats`\n`n**Nota:** Tipos en `src/lib/types/appointments.ts`. Cliente en `src/lib/api/appointmentsApi.ts` — solo falta el servidor."
        labels    = @("priority:critical","area:database","area:api")
        milestone = "EPIC-2: Base de Datos Real"
    },
    @{
        title     = "[DB-04] API Routes facturacion (/api/invoices y /api/payments)"
        body      = "## Endpoints`n- CRUD facturas con items de linea`n- CRUD pagos`n- `POST /api/invoices/[id]/send` — envia por email`n- `GET /api/billing/stats`\n`n**Nota:** Tipos en `src/lib/types/billing.ts`. Cliente en `src/lib/api/billingApi.ts`."
        labels    = @("priority:high","area:database","area:api")
        milestone = "EPIC-2: Base de Datos Real"
    },
    @{
        title     = "[DB-05] API Routes inventario (/api/inventory)"
        body      = "## Endpoints`n- CRUD items de inventario`n- `POST /api/inventory/[id]/adjust` — ajuste de stock`n- `GET /api/inventory/alerts` — alertas de stock bajo`n- Historial de movimientos`n`n**Nota:** Tipos en `src/lib/types/inventory.ts`. Cliente en `src/lib/api/inventoryApi.ts`."
        labels    = @("priority:high","area:database","area:api")
        milestone = "EPIC-2: Base de Datos Real"
    },

    # ---- EPIC 3: DASHBOARD PEGOTE (ALTA) ----
    @{
        title     = "[DASH-01] Modulo Clientes — conectar con Supabase"
        body      = "## Estado actual`nUI completa en `src/app/dashboard/[affiliateId]/customers/page.tsx`. Sin datos reales.`n`n## Tareas`n- [ ] Conectar con `/api/customers`\n- [ ] Lista paginada de clientes`n- [ ] Formulario crear/editar`n- [ ] Historial de visitas por cliente`n- [ ] Busqueda por nombre/email/telefono`n- [ ] Loading y empty states`n`n**Depende de:** DB-02"
        labels    = @("priority:high","area:dashboard","area:frontend","blocked")
        milestone = "EPIC-3: Dashboard Pegote MVP"
    },
    @{
        title     = "[DASH-02] Modulo Citas — calendario funcional"
        body      = "## Tareas`n- [ ] Conectar con `/api/appointments`\n- [ ] Vista calendario semana/dia`n- [ ] Crear nueva cita desde el dashboard`n- [ ] Cambiar estado (confirmar, cancelar, completar)`n- [ ] Notificacion al cliente por email`n`n## Decision pendiente`nLibreria de calendario: `react-big-calendar` vs `FullCalendar``n`n**Depende de:** DB-03"
        labels    = @("priority:high","area:dashboard","area:frontend","blocked","needs-decision")
        milestone = "EPIC-3: Dashboard Pegote MVP"
    },
    @{
        title     = "[DASH-03] Modulo Facturacion — crear y enviar facturas reales"
        body      = "## Tareas`n- [ ] Conectar con `/api/invoices`\n- [ ] Crear factura con items de servicio`n- [ ] Preview antes de enviar`n- [ ] Generar PDF`n- [ ] Enviar por email al cliente`n- [ ] Historial con estados (borrador, enviada, pagada)`n`n**Depende de:** DB-04"
        labels    = @("priority:high","area:dashboard","area:frontend","blocked","needs-decision")
        milestone = "EPIC-3: Dashboard Pegote MVP"
    },
    @{
        title     = "[DASH-04] Modulo Inventario — stock con alertas"
        body      = "## Tareas`n- [ ] Lista de productos con stock actual`n- [ ] Crear/editar producto`n- [ ] Ajuste de stock (entrada/salida)`n- [ ] Alerta visual cuando stock < minimo`n- [ ] Historial de movimientos`n`n**Depende de:** DB-05"
        labels    = @("priority:high","area:dashboard","area:frontend","blocked")
        milestone = "EPIC-3: Dashboard Pegote MVP"
    },
    @{
        title     = "[DASH-05] Modulo Cola de Espera — tiempo real con Supabase Realtime"
        body      = "## Objetivo`nClientes entran a la cola desde su telefono. El barbero ve la cola en vivo.`n`n## Implementacion`n- [ ] Tabla `queue_entries` en Supabase`n- [ ] Suscripcion Supabase Realtime en el dashboard`n- [ ] Vista publica para que clientes se unan (sin login)`n- [ ] Estimacion de tiempo de espera`n- [ ] Notificacion cuando es su turno"
        labels    = @("priority:high","area:dashboard","area:frontend","needs-decision")
        milestone = "EPIC-3: Dashboard Pegote MVP"
    },
    @{
        title     = "[DASH-06] Modulo Metricas — KPIs con datos reales"
        body      = "## KPIs requeridos`n- Ingresos del dia / semana / mes`n- Citas completadas vs canceladas`n- Clientes nuevos vs recurrentes`n- Servicio mas vendido`n`n## Stack`nQueries agregadas en Supabase + recharts para graficas"
        labels    = @("priority:medium","area:dashboard","area:frontend")
        milestone = "EPIC-3: Dashboard Pegote MVP"
    },
    @{
        title     = "[DASH-07] Modulo Reportes — exportar CSV y PDF"
        body      = "## Reportes`n- Ingresos por periodo`n- Lista de clientes activos`n- Inventario actual`n- Historial de citas`n`n## Formatos`n- CSV (descarga directa)`n- PDF con logo del afiliado"
        labels    = @("priority:medium","area:dashboard","area:frontend")
        milestone = "EPIC-3: Dashboard Pegote MVP"
    },
    @{
        title     = "[DASH-08] Configuracion del negocio — editar perfil y servicios"
        body      = "## Campos editables`n- Nombre, logo, colores del negocio`n- Horarios de atencion`n- Catalogo de servicios con precios`n- Datos de contacto`n- Zona horaria y moneda`n`n**Nota:** Guardar en Supabase, no en `affiliates-config.ts` (esa es config estatica del codigo)."
        labels    = @("priority:medium","area:dashboard","area:frontend")
        milestone = "EPIC-3: Dashboard Pegote MVP"
    },

    # ---- EPIC 4: NEWSLETTER (ALTA) ----
    @{
        title     = "[NEWS-01] Configurar Resend como proveedor de email"
        body      = "## Tareas`n- [ ] Crear cuenta en resend.com (3k emails/mes gratis)`n- [ ] Agregar `RESEND_API_KEY` al `.env.local`\n- [ ] Actualizar `src/app/api/newsletter/subscribe/route.ts`\n- [ ] Test de envio real"
        labels    = @("priority:high","area:frontend","needs-decision")
        milestone = "EPIC-4: Newsletter y Comunicacion"
    },
    @{
        title     = "[NEWS-02] Conectar todos los formularios de newsletter"
        body      = "## Formularios a conectar`n- [ ] CiriWhispers newsletter`n- [ ] Editorial MaalCa newsletter`n- [ ] Ecosistema newsletter`n- [ ] MaalCa Properties — notificaciones de propiedades`n`n## Criterios`n- Email llega al destinatario`n- Usuario ve confirmacion en la UI`n- Email guardado en tabla `subscribers` en Supabase"
        labels    = @("priority:high","area:frontend")
        milestone = "EPIC-4: Newsletter y Comunicacion"
    },

    # ---- EPIC 5: SEO (ALTA) ----
    @{
        title     = "[SEO-01] Configurar Google Analytics 4"
        body      = "## Tareas`n- [ ] Crear propiedad GA4`n- [ ] Agregar `NEXT_PUBLIC_GA_TRACKING_ID` al `.env`\n- [ ] Instalar `@next/third-parties/google`\n- [ ] Verificar eventos en tiempo real en GA4"
        labels    = @("priority:high","area:seo","area:infra")
        milestone = "EPIC-5: SEO y Analytics"
    },
    @{
        title     = "[SEO-02] Meta tags y Open Graph en todas las paginas publicas"
        body      = "## Paginas objetivo`n- `/` homepage`n- `/ecosistema`\n- `/editorial`\n- `/maalca-properties`\n- `/pegote-barber`\n- `/dr-pichardo`\n- `/hablando-mierda`\n`n## Incluir por pagina`n- title + description`n- og:title, og:description, og:image (1200x630)`n- twitter:card`n- canonical URL"
        labels    = @("priority:high","area:seo","area:frontend")
        milestone = "EPIC-5: SEO y Analytics"
    },
    @{
        title     = "[SEO-03] Verificar sitemap.xml y Google Search Console"
        body      = "## Tareas`n- [ ] Confirmar que `sitemap.ts` incluye todas las rutas publicas`n- [ ] Excluir `/dashboard/*` del sitemap`n- [ ] Enviar sitemap a Google Search Console`n- [ ] Verificar dominio en Search Console"
        labels    = @("priority:medium","area:seo")
        milestone = "EPIC-5: SEO y Analytics"
    },

    # ---- EPIC 6: DEPLOY (MEDIA) ----
    @{
        title     = "[DEPLOY-01] Configurar variables de entorno en Vercel"
        body      = "## Variables a agregar en Vercel Dashboard`n````nNEXT_PUBLIC_SUPABASE_URL`nNEXT_PUBLIC_SUPABASE_ANON_KEY`nSUPABASE_SERVICE_ROLE_KEY`nNEXT_PUBLIC_UMBRACO_URL`nNEXT_PUBLIC_API_BASE_URL`nNEXT_PUBLIC_GA_TRACKING_ID`nRESEND_API_KEY`n```\n`n## Proyecto Vercel`n- ID: `prj_jdwev0SFCQ10rZi7YoXREZ5ECJT7`"
        labels    = @("priority:medium","area:infra")
        milestone = "EPIC-6: Deploy a Produccion"
    },
    @{
        title     = "[DEPLOY-02] Configurar dominio maalca.com en Vercel"
        body      = "## Tareas`n- [ ] Agregar dominio en Vercel Settings -> Domains`n- [ ] Actualizar DNS del registrar (A record o CNAME)`n- [ ] Verificar SSL automatico de Vercel`n- [ ] Redirect www -> apex (o viceversa)"
        labels    = @("priority:medium","area:infra")
        milestone = "EPIC-6: Deploy a Produccion"
    },
    @{
        title     = "[DEPLOY-03] Branch protection y preview deployments en PRs"
        body      = "## Objetivo`nCada PR genera una URL de preview. Master protegido requiere PR para mergear.`n`n## Tareas`n- [ ] Habilitar branch protection en `master`\n- [ ] Requerir 1 review antes de merge`n- [ ] Verificar que Vercel crea preview por PR automaticamente`n- [ ] Documentar flujo: feature branch -> PR -> review -> merge -> deploy"
        labels    = @("priority:medium","area:infra")
        milestone = "EPIC-6: Deploy a Produccion"
    },

    # ---- EPIC 7: EPUB (MEDIA) ----
    @{
        title     = "[EPUB-01] Elegir libreria de lector EPUB"
        body      = "## Opciones`n- `react-reader` — simple wrapper de epub.js (ya en package.json)`n- `epub.js` directo — mas control`n- `@vivliostyle/react` — moderno`n`n## Criterios`n- Funciona en Next.js App Router (client component)`n- Soporte mobile responsive`n- Licencia MIT`n`n**Recomendacion inicial:** `react-reader` (ya instalado)"
        labels    = @("priority:medium","area:frontend","needs-decision")
        milestone = "EPIC-7: CiriWhispers Lector EPUB"
    },
    @{
        title     = "[EPUB-02] Componente EpubReader con controles basicos"
        body      = "## Funcionalidades`n- [ ] Navegacion prev/next capitulo`n- [ ] Cambio de tamano de fuente`n- [ ] Toggle tema claro/oscuro (independiente del tema del sitio)`n- [ ] Indicador de progreso`n- [ ] Responsive en mobile"
        labels    = @("priority:medium","area:frontend")
        milestone = "EPIC-7: CiriWhispers Lector EPUB"
    },
    @{
        title     = "[EPUB-03] Persistencia de progreso y bookmarks"
        body      = "## Implementacion`n- Guardar posicion en `localStorage` por libro`n- Permitir multiples bookmarks`n- Restaurar ultima posicion al reabrir el libro"
        labels    = @("priority:low","area:frontend")
        milestone = "EPIC-7: CiriWhispers Lector EPUB"
    },

    # ---- EPIC 9: CMS (CRITICA) ----
    @{
        title     = "[CMS-01] Crear Document Types en Umbraco Backoffice"
        body      = "## Document Types a crear`n`n**Element Types (bloques):**`n- ServiceBlock`n- TeamMemberBlock`n- MenuItemBlock`n- PropertyBlock`n`n**Document Types:**`n- BaseAffiliate (padre, no publicable)`n- Barbershop (hereda BaseAffiliate)`n- Restaurant (hereda BaseAffiliate)`n- RealEstate (hereda BaseAffiliate)`n`n## Guia completa`nVer `CHECKLIST-IMPLEMENTACION.md``n`n## URL Backoffice`n`http://localhost:5011/umbraco`"
        labels    = @("priority:critical","area:cms")
        milestone = "EPIC-9: MaalCaCMS Produccion"
    },
    @{
        title     = "[CMS-02] Limpiar DocumentTypeComposer.cs — usings duplicados"
        body      = "## Problema`n`DocumentTypeComposer.cs` tiene ~1490 lineas de `using` duplicados. El codigo real empieza en la linea 1498. El archivo esta corrompido.`n`n## Solucion`n- Eliminar todas las lineas de `using` repetidas`n- Dejar solo los necesarios al inicio del archivo (aprox 10-12 lineas)`n`n## Archivo`n`C:\Users\apich\MaalCaCMS\DocumentTypeComposer.cs`"
        labels    = @("priority:high","area:cms")
        milestone = "EPIC-9: MaalCaCMS Produccion"
    },
    @{
        title     = "[CMS-03] Migrar Umbraco de LocalDB a SQL Server en la nube"
        body      = "## Problema`nActualmente usa `Server=(localdb)\\MSSQLLocalDB` — solo funciona en la maquina local. No deployable.`n`n## Opciones`n- Azure SQL Database (tier basico ~$5/mes)`n- Supabase con PostgreSQL (Umbraco 13+ soporta PG)`n- Railway PostgreSQL`n`n## Tareas`n- [ ] Elegir proveedor`n- [ ] Crear BD en la nube`n- [ ] Actualizar `ConnectionStrings` en `appsettings.json`\n- [ ] Migrar datos existentes`n`n**Necesita decision antes de CMS-04.**"
        labels    = @("priority:high","area:cms","area:infra","needs-decision")
        milestone = "EPIC-9: MaalCaCMS Produccion"
    },
    @{
        title     = "[CMS-04] Deploy de Umbraco CMS a hosting en la nube"
        body      = "## Opciones`n- Azure App Service (nativo .NET, ~$13/mes basico)`n- Railway (mas simple, soporta .NET)`n- Fly.io`n`n## Tareas`n- [ ] Elegir hosting`n- [ ] Configurar Dockerfile para produccion`n- [ ] Variables de entorno en el servidor`n- [ ] Actualizar `NEXT_PUBLIC_UMBRACO_URL` en Vercel con la URL publica`n`n**Bloqueado por:** CMS-03"
        labels    = @("priority:high","area:cms","area:infra","blocked")
        milestone = "EPIC-9: MaalCaCMS Produccion"
    },
    @{
        title     = "[CMS-05] Crear y publicar contenido inicial de Pegote Barbershop"
        body      = "## Contenido a crear en el Backoffice`n- [ ] Pagina Pegote Barbershop completa`n- [ ] 3 servicios: Corte Clasico, Fade+Diseno, Afeitado`n- [ ] 1 miembro del equipo`n- [ ] Horarios e info de contacto`n- [ ] **Save and Publish** (no solo Save)`n`n## Validacion`n```powershell`nInvoke-RestMethod -Uri 'http://localhost:5011/umbraco/delivery/api/v2/content/item/pegote'`n```\n`n**Bloqueado por:** CMS-01"
        labels    = @("priority:high","area:cms","blocked")
        milestone = "EPIC-9: MaalCaCMS Produccion"
    },

    # ---- EPIC 10: API BACKEND (CRITICA) ----
    @{
        title     = "[API-01] Definir arquitectura del backend maalca-api"
        body      = "## Contexto`nEl cliente frontend en `src/lib/api/` ya esta construido y espera un backend en `NEXT_PUBLIC_API_BASE_URL`. Todos los metodos del cliente estan listos — falta el servidor.`n`n## Opciones`n- **Next.js API Routes** en el mismo repo (mas rapido para comenzar)`n- **Supabase Edge Functions** (serverless, integrado con la BD)`n- **Proyecto .NET separado** (`/source/maalca-api/` ya existe como carpeta)`n`n## Recomendacion`nComenzar con Next.js API Routes + Supabase. Extraer a servicio si escala.`n`n**Esta decision desbloquea todos los demas issues de API.**"
        labels    = @("priority:critical","area:api","needs-decision")
        milestone = "EPIC-10: maalca-api Backend"
    },
    @{
        title     = "[API-02] Implementar endpoints de appointments en el servidor"
        body      = "## Cliente ya existe`n`src/lib/api/appointmentsApi.ts` llama a estos endpoints. Solo falta el servidor.`n`n## Endpoints`n- `GET/POST /api/appointments`\n- `GET/PUT/DELETE /api/appointments/[id]`\n- `POST /api/appointments/[id]/cancel`\n- `POST /api/appointments/[id]/complete`\n- `GET /api/appointments/availability`\n- `GET /api/appointments/stats`\n`n**Bloqueado por:** API-01, DB-01"
        labels    = @("priority:high","area:api","blocked")
        milestone = "EPIC-10: maalca-api Backend"
    },
    @{
        title     = "[API-03] Implementar endpoints de billing en el servidor"
        body      = "## Cliente ya existe`n`src/lib/api/billingApi.ts` llama a estos endpoints.`n`n## Endpoints`n- CRUD facturas con items de linea`n- CRUD pagos`n- `POST /api/invoices/[id]/send` (envia email)`n- `GET /api/billing/stats`\n`n## Decision pendiente`nGeneracion de PDF: `react-pdf`, `puppeteer`, o `@react-pdf/renderer``n`n**Bloqueado por:** API-01, DB-04"
        labels    = @("priority:high","area:api","blocked","needs-decision")
        milestone = "EPIC-10: maalca-api Backend"
    },
    @{
        title     = "[API-04] Implementar endpoints de inventory y campaigns"
        body      = "## Clientes ya existen`n- `src/lib/api/inventoryApi.ts`\n- `src/lib/api/campaignsApi.ts`\n`n## Inventory`n- CRUD items + ajuste de stock + historial + alertas`n`n## Campaigns`n- CRUD campanas + metricas + envio a segmento`n`n**Bloqueado por:** API-01, DB-01"
        labels    = @("priority:medium","area:api","blocked")
        milestone = "EPIC-10: maalca-api Backend"
    }
)

$created = 0
$failed  = 0

foreach ($issue in $issues) {
    $ms   = $msMap[$issue.milestone]
    $body = @{
        title     = $issue.title
        body      = $issue.body
        labels    = $issue.labels
        milestone = $ms
    }
    $short = $issue.title.Substring(0, [Math]::Min(65, $issue.title.Length))
    Write-Host "  issue: $short..."
    $result = Invoke-GH "POST" "/issues" $body
    if ($result -and $result.number) {
        $created++
        Write-Host "    -> #$($result.number) OK" -ForegroundColor Green
    } else {
        $failed++
        Write-Host "    -> FALLO" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 500
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "COMPLETADO" -ForegroundColor Green
Write-Host "  Issues creados  : $created de $($issues.Count)"
Write-Host "  Errores         : $failed"
Write-Host "  Ver issues      : https://github.com/$REPO/issues"
Write-Host "  Ver milestones  : https://github.com/$REPO/milestones"
Write-Host "============================================`n"
