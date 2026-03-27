# MaalCa Ecosystem — Master Plan para Kilocode/Agentes

**Fecha:** 2026-03-27
**Objetivo:** Plan ejecutable completo para todo el ecosistema MaalCa — priorizado por impacto

---

## Estado Actual (verificado 2026-03-27)

| Componente | Repo | Dockerfile | docker-compose | Estado |
|------------|------|-----------|-----------------|--------|
| **maalca-cms** (Umbraco 17.2.1/.NET 10) | `UMBRACO/MiSitioUmbraco` | multi-stage .NET 10 | Unificado en source/docker-compose.yml | SQLite dev, SQL Server prod |
| **maalca-api** (.NET 8/PostgreSQL) | `maalca-api` | multi-stage .NET 8 | Unificado en source/docker-compose.yml | Railway (prod), Docker (dev) |
| **maalca-web** (Next.js 15) | `maalca-web` | multi-stage node:22-alpine | Unificado en source/docker-compose.yml | Vercel (prod), Docker (dev) |
| **n8n** | Railway only | N/A | N/A | `maalca-agents.up.railway.app` |

**Issues abiertos:** 46 maalca-web, 9 maalca-api, 3 maalca-cms (58 total)

**Docker compose:** `C:/Users/apich/source/docker-compose.yml` — postgres + maalca-api + maalca-cms + maalca-web

---

## FASE 0: Docker Local — COMPLETADO

- [x] docker-compose.yml unificado con los 4 servicios + red compartida + healthchecks
- [x] next.config.ts: `output: 'standalone'` agregado para Docker build
- [ ] `docker compose up --build` — pendiente de ejecutar y verificar

**Puertos:**
| Servicio | Puerto local | Puerto interno |
|----------|-------------|----------------|
| PostgreSQL | 5433 | 5432 |
| maalca-api | 5000 | 8080 |
| maalca-cms | 5011 (http), 5012 (https) | 8080, 8443 |
| maalca-web | 3000 | 3000 |

**Levantar todo:**
```bash
cd C:/Users/apich/source
docker compose up --build
```

---

## FASE 1: Editorial End-to-End (Issues #65, #66, maalca-cms #1)

> editorial/page.tsx ya NO usa Framer Motion. 6 articulos con contenido completo. umbraco-client.ts tiene fallback.

### Task 1.1: Crear contenido en Umbraco backoffice
- Acceder a `localhost:5011/umbraco` (requiere Docker corriendo)
- Crear nodo raiz "Editorial" (tipo: content)
- Publicar 6 articulos como nodos `article` con los datos de `src/data/editorialContent.ts`
- Los Document Types se crean automaticamente via `DocumentTypeComposer.cs` al arrancar

### Task 1.2: Verificar Delivery API
```bash
curl http://localhost:5011/umbraco/delivery/api/v2/content?filter=contentType:article
```

### Task 1.3: Configurar env vars en maalca-web para CMS
**Archivo:** `maalca-web/.env.local`
```
UMBRACO_API_URL=http://localhost:5011
NEXT_PUBLIC_UMBRACO_MEDIA_URL=http://localhost:5011
```

### Task 1.4: Verificar editorial con datos reales
- `npm run dev` en maalca-web
- Navegar a `localhost:3000/editorial`
- Confirmar que muestra datos del CMS (no mock)

---

## FASE 2: Eliminar Framer Motion del proyecto (Regla tecnica)

> 17 archivos usan framer-motion. editorial/page.tsx ya esta limpio.

### Task 2.1: Migrar cada pagina a CSS/Tailwind animations
**Archivos a modificar (17):**
1. `src/app/affiliates/page.tsx`
2. `src/app/britocolor/page.tsx`
3. `src/app/casos-estudio/page.tsx`
4. `src/app/cirisonic/page.tsx`
5. `src/app/ciriwhispers/page.tsx`
6. `src/app/contacto/page.tsx`
7. `src/app/dashboard/page.tsx`
8. `src/app/dr-pichardo/page.tsx`
9. `src/app/ecosistema/page.tsx`
10. `src/app/hablando-mierda/page.tsx`
11. `src/app/maalca-properties/page.tsx`
12. `src/app/maalca-properties/page-backup.tsx` (borrar si no se usa)
13. `src/app/maalca-properties/page-optimized.tsx` (borrar si no se usa)
14. `src/app/masa-tina/page.tsx`
15. `src/app/pegote-barber/page.tsx`
16. `src/app/servicios/page.tsx`
17. `src/app/verde-prive/page.tsx`

**Patron de reemplazo:**
- `motion.div` -> `<div className="animate-fade-in-up">`
- `motion.h1` -> `<h1 className="animate-fade-in-up">`
- `variants`, `initial`, `animate`, `whileInView` -> eliminar
- `AnimatePresence` -> condicional CSS con `transition-opacity`
- Verificar que `animate-fade-in-up` existe en tailwind.config o globals.css

### Task 2.2: Eliminar dependencia
```bash
cd maalca-web && npm uninstall framer-motion
```

### Task 2.3: Limpiar next.config.ts
- Eliminar `optimizePackageImports: ['framer-motion']` de next.config.ts

### Task 2.4: Verificar
```bash
npm run build  # 0 errores, 0 imports de framer-motion
```

---

## FASE 3: Auth + Dashboard MVP (Issues #2-#19 maalca-web)

> Auth y dashboard ya usan maalca-api como backend. Supabase references son legacy.

### Task 3.1: Limpiar referencias a Supabase
- Cerrar issues #2, #3 como "won't fix" (decision tomada: maalca-api, no Supabase)
- Actualizar #6, #7 para usar maalca-api

### Task 3.2: Auth real (#4, #5)
**Archivos:**
- `maalca-web/src/app/login/page.tsx` -> conectar a `POST /api/auth/login` de maalca-api
- `maalca-web/src/middleware.ts` -> proteger `/dashboard/*` verificando JWT
- `maalca-web/src/lib/auth.ts` -> helper para token management (cookie-based)

### Task 3.3: Dashboard CRUD real (#8-#12, #14-#17)
Endpoints ya existen en maalca-api. Conectar frontend:
- `src/app/dashboard/customers/` -> `GET/POST/PUT/DELETE /api/customers`
- `src/app/dashboard/appointments/` -> `/api/appointments`
- `src/app/dashboard/inventory/` -> `/api/inventory`
- `src/app/dashboard/invoices/` -> `/api/invoices`
- `src/lib/dashboard/` -> service files ya existen, actualizar base URL a maalca-api

### Task 3.4: Dashboard config y reportes (#19, #48, #49)
- Modulo reportes: export CSV/PDF desde datos de maalca-api
- Configuracion negocio: editar perfil conectado a `/api/affiliates`

---

## FASE 4: n8n Pipeline Fix (Issues maalca-api #2, maalca-web #73, #75)

### Task 4.1: Fix env var access en n8n (BLOQUEANTE — accion manual)
- Railway dashboard -> servicio n8n -> Variables -> `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`
- Redeploy

### Task 4.2: Configurar API keys (maalca-api #2)
- Railway dashboard -> servicio maalca-api -> `GROQ_API_KEY`, `OPENROUTER_API_KEY`

### Task 4.3: Test e2e pipeline (maalca-web #73)
- Crear issue con label `agent:queued`
- Verificar github-issue-dispatcher -> agent-executor -> PR

### Task 4.4: Retry logic (maalca-web #75)
- n8n agent-executor: agregar retry (max 3) despues del AI Agent node

---

## FASE 5: SEO + Deploy pendientes (Issues #23-#27, #30)

### Task 5.1: Google Analytics (#23)
- `GA_MEASUREMENT_ID` en Vercel env vars
- `<Script>` de GA4 en `layout.tsx`

### Task 5.2: Search Console (#24)
- Verificar dominio + subir sitemap.xml

### Task 5.3: Meta tags (#25)
- Verificar `metadata` export en cada pagina

### Task 5.4: Dominio Vercel (#26, #27)
- Configurar DNS de maalca.com -> Vercel

### Task 5.5: Optimizar imagenes (#30)
- `<img>` -> `<Image>` de next/image

---

## FASE 6: P2/P3 (Backlog futuro)

| Issue | Descripcion | Repo | Prioridad |
|-------|------------|------|-----------|
| #74 | PM Agent daily standup via Slack | web | P1 |
| #77 | Model selector por agente/tier | web | P1 |
| #78 | Webhook PR merge -> agent_learnings | web | P2 |
| #79 | Metabase observabilidad | web | P2 |
| #3 | agent_memory corto plazo | api | P2 |
| #4 | pgvector + agent_learnings | api | P2 |
| #5 | QA Agent en executor | api | P2 |
| #80 | Onboarding flow con agentes | web | P3 |
| #81 | menu_builder digital | web | P3 |
| #82-84 | Editorial/manga agents | web | P3 |
| #8-11 | SaaS features (categories, payments, etc) | api | P3 |
| #61-62 | Properties (formulario, leads) | web | P3 |
| #86 | Custom domain por tenant | web | P3 |
| #1-3 | CMS Document Types + ADR | cms | P3 |

---

## Issues a cerrar (ya resueltos)

| Issue | Razon |
|-------|-------|
| #13 (maalca-web) | Dashboard changes committed |
| #20 (maalca-web) | Resend setup done |
| #22 (maalca-web) | Editorial newsletter done |
| #95 (maalca-web) | StatusBadge — test issue |
| #2, #3 (maalca-web) | Auth decision made (maalca-api, not Supabase) |
| #8 (maalca-web) | Schema done in maalca-api PostgreSQL |

---

## Verificacion Global

1. `docker compose up --build` -> 4 servicios healthy
2. `localhost:5011/umbraco` -> backoffice accesible
3. `localhost:5000/swagger` -> todos los endpoints responden
4. `localhost:3000` -> sitio completo
5. `npm run build` en maalca-web -> 0 errores
6. Auth flow: login -> JWT -> dashboard protegido
7. n8n pipeline: issue -> agent -> PR
