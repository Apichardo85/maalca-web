# ADR-001: Confirmar Vercel para maalca-web (no mover a Railway)

**Estado:** Aceptado
**Fecha:** 2026-03-24
**Decisor:** Ciriaco Pichardo

## Contexto

maalca-web (Next.js 15) está desplegado en Vercel desde el inicio del proyecto. Se evaluó si moverlo a Railway para consolidar infra con n8n/Redis/Postgres.

## Decisión

**Mantener Vercel como hosting de maalca-web.**

## Razones

1. **Preview deploys por PR** — Cada PR genera URL única para revisar código de agentes antes de merge. Railway no ofrece esto nativamente.
2. **Edge Functions + Middleware** — El middleware multi-tenant (`middleware.ts`) usa Edge Runtime de Vercel. En Railway requeriría Node.js server custom.
3. **ISR/SSG nativo** — Next.js en Vercel tiene Incremental Static Regeneration optimizado. En Railway es solo SSR.
4. **SSL automático para dominios custom** — Crítico para tenants premium del SaaS (issue #86). Vercel lo maneja via API (`POST /v10/projects/{id}/domains`).
5. **Zero-config deploys** — Push a `main` = deploy automático. Sin Dockerfile, sin build config manual.
6. **Performance** — CDN global de Vercel con edge caching. Railway sirve desde una sola región.

## Alternativa rechazada: Railway

- Sin preview deploys
- Sin Edge Functions nativas
- SSL para custom domains más complejo
- Requiere Dockerfile y configuración manual de build
- Solo justificable si se necesitara acceso directo a Redis/Postgres desde el frontend (no es el caso — eso va por maalca-api)

## Consecuencias

- Vercel para maalca-web (frontend)
- Railway para n8n + Redis + PostgreSQL + maalca-api (backend/infra)
- La comunicación entre Vercel y Railway es via API/webhooks (ya implementado en n8n-service.ts)
- Dominios custom de tenants se gestionan via Vercel API desde maalca-api
