# Dockerfile optimizado para Next.js con mejores prácticas de seguridad y performance
FROM node:22-alpine AS base

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Crear usuario y grupo no-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# ==========================================
# Stage 1: Dependencias
# ==========================================
FROM base AS deps

# Copiar archivos de dependencias primero (mejor cache)
COPY package.json package-lock.json* ./

# Instalar solo dependencias de producción
RUN \
  if [ -f package-lock.json ]; then npm ci --only=production --ignore-scripts; \
  else echo "Warning: Lockfile not found. Installing from package.json" && npm install --only=production --ignore-scripts; \
  fi

# ==========================================  
# Stage 2: Builder
# ==========================================
FROM base AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar todas las dependencias (dev + prod)
RUN \
  if [ -f package-lock.json ]; then npm ci --ignore-scripts; \
  else npm install --ignore-scripts; \
  fi

# Copiar código fuente
COPY . .

# Variables de entorno para optimización del build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build de la aplicación
RUN npm run build

# ==========================================
# Stage 3: Runner (Producción)
# ==========================================
FROM base AS runner

WORKDIR /app

# Variables de entorno de producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copiar usuario creado en base
USER nextjs

# Copiar archivos necesarios del builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Metadata del container
LABEL maintainer="tu-email@company.com"
LABEL version="1.0"
LABEL description="Next.js Application"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node --version || exit 1

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "server.js"]