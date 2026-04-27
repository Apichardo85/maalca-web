# MaalCa Ecosystem — Master Plan v4

**Fecha:** 2026-03-27
**Referencia:** Architecture v4 Definitive (maalca-architecture-v4.html)
**Objetivo:** Pipeline de agentes n8n funcional → delegar trabajo rutinario → reservar Claude para tareas complejas

---

## Estado Actual

| Componente | Repo | Deploy | Estado |
|------------|------|--------|--------|
| **maalca-web** (Next.js 15) | `maalca-web` | Vercel (prod), Docker (dev) | 38 issues abiertos |
| **maalca-api** (.NET 8/PostgreSQL) | `maalca-api` | Railway (prod), Docker (dev) | 9 issues abiertos |
| **maalca-cms** (Umbraco 17/.NET 10) | `UMBRACO/MiSitioUmbraco` | Docker (dev) | 3 issues abiertos |
| **n8n** | Railway | `maalca-agents.up.railway.app` | Dispatcher + Executor existentes |

**Docker compose:** `C:/Users/apich/source/docker-compose.yml`
**Puertos:** PostgreSQL:5433 | maalca-api:5000 | maalca-cms:5011 | maalca-web:3000

---

## Arquitectura v4 — Overview

```
GitHub Issues (label: agent:queued)
        ↓
n8n: github-issue-dispatcher (webhook → filter → extract → route)
        ↓
Orchestrator Agent (routing → priority → model select → cost gate → memory)
        ↓↓↓↓
┌──────────┬──────────┬──────────┬──────────┐
│ DEV (9)  │EDITORIAL │ MANGA    │ SAAS     │
│ MVP-0    │(10) MVP-2│(11) MVP-3│(13) MVP-1│
└──────────┴──────────┴──────────┴──────────┘
        ↓
agent-executor pipeline:
  memory→cost gate→select model→build prompt→call LLM→
  fallback→validate→retry→QA review→commit+PR→log→learn→update label
        ↓
Feedback Loop: Agent Output→QA Eval→PR Review→Learn Pattern→agent_learnings→PM Report→Next Execution
```

**4 Dominios, ~28 Agentes, 3 Repos de salida**

---

## LLM Strategy — 3 Tiers

| Tier | Modelo | Provider | Costo | Agentes |
|------|--------|----------|-------|---------|
| **PREMIUM** | Claude Sonnet 4 | Anthropic | $3/$15 per M tokens | architect, security, sensitivity, site_builder |
| **STANDARD** | DeepSeek V3, Gemini Flash 2.0 | OpenRouter, Google | $0.27/M / gratis | frontend, backend, cms, qa, editor, translator, payments |
| **FREE** | Llama 3.3 70B, Qwen 2.5 72B, Gemini Flash | Groq, OpenRouter, Google | $0 | sql, pm, devops, seo, publisher, business_setup, catalog_importer, +8 mas |

### Fallback Chains
- **Premium:** Claude Sonnet 4 → Gemini Pro 2.0 → agent:failed
- **Standard:** DeepSeek V3 → Gemini Flash 2.0 → Groq Llama 3.3 → agent:failed
- **Free:** Groq Llama 3.3 → Qwen 2.5 72B → Gemini Flash 2.0 → queue + retry 5min

### Modelos Especializados
- Imagenes: Flux 1.1 Pro (fal.ai), SDXL (Replicate free)
- OCR/Vision: Gemini Flash 2.0 (gratis 1M), PaddleOCR (local $0)
- Embeddings: Nomic Embed v1.5 (OpenRouter FREE)
- Busqueda: Perplexity API, n8n HTTP + RSS

---

## Orchestrator Rules

### 1. Routing: Label → Agent → Model
```
LABEL                → AGENT              → TIER      → PROVIDER
agent:architect      → architect          → PREMIUM   → Anthropic
agent:security       → security           → PREMIUM   → Anthropic
agent:frontend       → frontend           → STANDARD  → OpenRouter (DeepSeek)
agent:backend        → backend            → STANDARD  → OpenRouter (DeepSeek)
agent:cms            → cms                → STANDARD  → OpenRouter (DeepSeek)
agent:qa             → qa                 → STANDARD  → Google (Gemini Flash)
agent:sql            → sql                → FREE      → Groq (Llama 3.3)
agent:devops         → devops             → FREE      → Groq (Llama 3.3)
agent:pm             → pm                 → FREE      → Groq (Llama 3.3)
agent:seo            → seo_optimizer      → FREE      → Groq (Llama 3.3)
```

### 2. Priority Queue (Redis BullMQ)
- **P1** (hotfix, security) — bugs prod, vulnerabilidades
- **P2** (architect, sensitivity) — decisiones que bloquean otros
- **P3** (frontend, backend, cms) — feature work normal
- **P4** (qa, editor, seo) — review y optimizacion
- **P5** (pm, devops) — reporting, CI/CD (batch nocturno OK)
- Concurrency: max 3 simultaneos | Limiter: 10 jobs/min

### 3. Cost Gate — Presupuesto Diario
```
premium:  $3.00/dia  (~$90/mes max Claude)
standard: $1.00/dia  (~$30/mes max OpenRouter)
free:     ∞
total:    $5.00/dia  (hard cap)

Si excede → downgrade tier automatico → si todo excede → queue para manana
```

### 4. Groq Rate Limit
- Backoff: 2s initial, 60s max, 2 retries luego fallback
- Min interval: 2500ms (nunca mas de 24 RPM)
- Circuit breaker: 3x 429 en 5min → disable Groq 10min → route a Qwen/Gemini

---

## MVP-0: Pipeline Proof (Abr-May 2026) — EN PROGRESO

**Objetivo:** Demostrar pipeline end-to-end funcional con Dev Agents
**Costo:** ~$25/mes

### Agentes activos (5 de 28)
| Agente | Tier | Modelo |
|--------|------|--------|
| frontend | STD | DeepSeek V3 |
| backend | STD | DeepSeek V3 |
| sql | FREE | Llama 3.3 70B |
| qa | STD | Gemini Flash 2.0 |
| pm | FREE | Llama 3.3 70B |

### Infra minima
- n8n en Railway + Redis BullMQ + PostgreSQL (agent_executions) + GitHub webhooks
- Groq + DeepSeek + 5 golden test issues

### Criterios de DONE
- [ ] Issue con label agent:frontend genera PR con codigo que compila
- [ ] Issue con label agent:backend genera endpoint funcional con tests
- [ ] QA Agent revisa y aprueba/rechaza con comentario en PR
- [ ] PM Agent reporta daily standup a Slack con datos reales
- [ ] 5 golden test issues pasan 3 veces consecutivas sin intervencion
- [ ] agent_executions tiene logs de tokens, costo, duracion

### Tareas manuales BLOQUEANTES (tu en Railway)
- [ ] `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` en Railway → redeploy
- [ ] API keys: `GROQ_API_KEY`, `OPENROUTER_API_KEY` en Railway
- [ ] Verificar `docker compose up --build` local
- [ ] Test e2e: crear issue con `agent:queued` → verificar PR (#73)

---

## MVP-1: SaaS Micro — Primer Negocio Real (Jun-Jul 2026)

**Objetivo:** Barberia/dispensario con presencia digital generada por agentes
**Costo:** ~$50-75/mes | **Depende de MVP-0**

### Agentes (+6 = 11 total)
site_builder (PREMIUM), brand_extractor (STD), menu_builder (STD), catalog_importer (FREE), business_setup (FREE), customer_support_rag (FREE)

### Lo que el cliente recibe
- Pagina web generada live
- Menu/catalogo digital
- WhatsApp bot FAQ (RAG)
- Branding extraido de fotos

### Criterios de DONE
- [ ] Cliente real (Pegote/Dispensario) tiene pagina live
- [ ] Catalogo importado desde Excel/fotos
- [ ] WhatsApp bot responde con RAG
- [ ] Onboarding < 48h
- [ ] Cliente actualiza catalogo sin intervencion tecnica

---

## MVP-2: Editorial Pipeline (Jun-Jul 2026, paralelo a MVP-1)

**Objetivo:** Contenido auto-editado y publicado en Umbraco CMS
**Costo:** ~$40-60/mes

### Agentes (+5 = 16 total)
editor (STD), seo_optimizer (FREE), topic_suggester (FREE), publisher (FREE), promotion (FREE)

### Criterios de DONE
- [ ] Issue → edit → SEO → publish sin intervencion
- [ ] topic_suggester genera 5 temas/semana reales
- [ ] 10 articulos publicados por pipeline
- [ ] Tiempo issue → publicacion < 4 horas

---

## MVP-3: Manga Pipeline (Ago-Oct 2026)

**Objetivo:** Upload → OCR → Translate → Publish para manga/manhwa
**Costo:** ~$80-120/mes | **Depende de MVP-1 + MVP-2**

### Agentes (+5 = 21 total)
upload_validator (FREE), text_extractor/OCR (STD), translator (STD), chapter_builder (FREE), metadata_generator (FREE)

### Criterios de DONE
- [ ] 1 capitulo procesado end-to-end
- [ ] OCR accuracy > 90%
- [ ] Traduccion con < 15% correcciones humanas
- [ ] Procesamiento < 30 min por capitulo 20 pags

---

## Testing Strategy

### Golden Test Issues (5)
| Test | Input | Expected |
|------|-------|----------|
| GT-1 | "Crear componente Button primary/secondary/ghost" | PR con Button.tsx que compila |
| GT-2 | "Crear GET /api/health con status y timestamp" | PR con endpoint + test |
| GT-3 | "Crear tabla agent_executions con campos..." | PR con migration EF Core valida |
| GT-4 | Codigo con SQL injection, hardcoded secrets | QA rechaza identificando cada problema |
| GT-5 | "Crear endpoint + componente + test" | 3 PRs coordinados, QA revisa todos |

### Smoke Test Triggers
- Cambio en executor → GT-1 + GT-2
- Nuevo modelo → los 5 GTs
- Nuevo agente → GT dominio + GT-5
- Cron domingo 10PM → todos

### Metricas de Pipeline Health
- PR Acceptance Rate: target > 60%
- Agent Failure Rate: target < 15%
- Avg Execution Time: < 5min FREE, < 2min STD/PREMIUM
- Cost per Issue: < $0.15 STD, $0 FREE
- Retry Rate: target < 25%

---

## Division: Claude Code vs Agentes n8n

### Claude Code (reservar para)
- Arquitectura que cruza repos (web + api + cms)
- Escribir/refinar system prompts de agentes
- Debugging complejo del pipeline n8n
- Refactoring grande (Framer Motion x17 archivos, Auth flow)
- Code review de PRs complejos generados por agentes
- Tareas que necesitan contexto de todo el codebase

### Agentes n8n (delegar)
- Componentes individuales, paginas, UI fixes → `agent:frontend`
- Endpoints CRUD, services → `agent:backend`
- Tablas, indices, migrations → `agent:sql`
- Review automatico de PRs → `agent:qa`
- Daily standup, metricas → `agent:pm`
- CI/CD, Docker → `agent:devops`
- Meta tags, JSON-LD, sitemaps → `agent:seo`
- Edicion, SEO, publicacion → `agent:editor`/`agent:publisher`

---

## Fases Web (maalca-web especificas)

### Fase W1: Editorial End-to-End (Issues #65, #66)
- Requiere Docker corriendo (Umbraco CMS)
- Verificar Delivery API, conectar env vars, probar editorial con datos CMS

### Fase W2: Eliminar Framer Motion (17 archivos)
- Migrar `motion.div` → CSS/Tailwind animations
- `npm uninstall framer-motion`
- Limpiar next.config.ts

### Fase W3: Auth + Dashboard (Issues #4-#17)
- Login → maalca-api `POST /api/auth/login` (no Supabase)
- Middleware JWT → proteger `/dashboard/*`
- CRUD: customers, appointments, inventory, invoices → maalca-api

### Fase W4: SEO + Deploy (#23-#27, #30)
- GA4, Search Console, meta tags, dominio Vercel, next/image

---

## Issues a cerrar

| Issue | Razon |
|-------|-------|
| #2, #3 | Decision: maalca-api, no Supabase |
| #8 | Schema ya en maalca-api PostgreSQL |
| #13 | Dashboard changes committed |
| #20 | Resend setup done |
| #22 | Editorial newsletter done |
| #95 | StatusBadge test issue |

---

## Backlog P2/P3

| Issue | Descripcion | Prioridad |
|-------|------------|-----------|
| #74 | PM Agent daily standup Slack | P1 |
| #77 | Model selector por tier | P1 |
| #78 | Webhook PR merge → agent_learnings | P2 |
| #79 | Metabase observabilidad | P2 |
| #80 | Onboarding flow con agentes | P3 |
| #81 | menu_builder digital | P3 |
| #82-84 | Editorial/manga agents | P3 |
| #61-62 | Properties (formulario, leads) | P3 |
| #86 | Custom domain por tenant | P3 |

---

## Verificacion Global

1. `docker compose up --build` → 4 servicios healthy
2. `localhost:5011/umbraco` → backoffice accesible
3. `localhost:5000/swagger` → endpoints responden
4. `localhost:3000` → sitio completo
5. `npm run build` → 0 errores
6. n8n pipeline: issue → agent → PR (MVP-0 done)
7. PM daily standup en Slack con datos reales
