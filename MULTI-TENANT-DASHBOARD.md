# Multi-Tenant Dashboard System

Sistema de dashboards multi-tenant implementado para el ecosistema MaalCa, permitiendo que cada afiliado tenga su propio panel de control personalizado con módulos específicos según su tipo de negocio.

## 📋 Índice

- [Visión General](#visión-general)
- [Arquitectura](#arquitectura)
- [Configuración](#configuración)
- [Uso](#uso)
- [Módulos Disponibles](#módulos-disponibles)
- [Desarrollo](#desarrollo)
- [Testing](#testing)

## 🎯 Visión General

El sistema multi-tenant permite que cada empresa afiliada (Pegote, BritoColor, Dr. Pichardo, Masa Tina, HBM) tenga:

- ✅ Dashboard personalizado con branding propio
- ✅ Módulos condicionales según tipo de negocio
- ✅ Configuración de características (idioma, tema, notificaciones)
- ✅ Métricas y analytics específicas
- ✅ Navegación adaptativa

## 🏗️ Arquitectura

### Estructura de Archivos

```
src/
├── config/
│   └── affiliates-config.ts          # Configuración de cada afiliado
├── contexts/
│   └── AffiliateContext.tsx          # Context provider
├── app/dashboard/[affiliateId]/
│   ├── layout.tsx                    # Layout común del dashboard
│   ├── page.tsx                      # Dashboard principal
│   ├── loading.tsx                   # Loading state
│   ├── metrics/page.tsx              # Módulo de métricas
│   ├── customers/page.tsx            # Módulo CRM
│   ├── campaigns/page.tsx            # Módulo de campañas
│   ├── appointments/page.tsx         # Módulo de citas
│   └── settings/page.tsx             # Configuración
├── components/dashboard/
│   ├── DashboardHeader.tsx           # Header con branding
│   ├── DashboardSidebar.tsx          # Sidebar con navegación
│   ├── DashboardCard.tsx             # Componentes reutilizables
│   └── modules/
│       ├── MetricsModule.tsx         # Módulo de métricas
│       └── QuickActionsModule.tsx    # Acciones rápidas
└── hooks/
    └── useAffiliateNavigation.ts     # Helper de navegación
```

### Flujo de Datos

```
URL: /dashboard/pegote-barbershop
         ↓
  layout.tsx lee affiliateId del param
         ↓
  getAffiliateConfig(affiliateId) → config
         ↓
  <AffiliateProvider config={config}>
         ↓
  Componentes acceden vía useAffiliate()
```

## ⚙️ Configuración

### Añadir un nuevo afiliado

Editar `src/config/affiliates-config.ts`:

```typescript
export const affiliatesConfig: Record<string, AffiliateConfig> = {
  "mi-negocio": {
    id: "mi-negocio",
    branding: {
      primaryColor: "blue-600",
      secondaryColor: "blue-400",
      logo: "/images/affiliates/mi-negocio-logo.png",
      name: "Mi Negocio",
      description: "Descripción del negocio"
    },
    modules: {
      metrics: true,        // Habilitar métricas
      campaigns: true,      // Habilitar campañas
      customers: true,      // Habilitar CRM
      ecommerce: false,     // Deshabilitar tienda
      appointments: true,   // Habilitar citas
      inventory: false,     // Deshabilitar inventario
      invoicing: true,      // Habilitar facturación
      team: false           // Deshabilitar equipo
    },
    features: {
      multiLanguage: true,  // Soporte multi-idioma
      darkMode: true,       // Dark mode toggle
      notifications: true,  // Sistema de notificaciones
      analytics: true       // Analytics avanzado
    },
    settings: {
      currency: "USD",
      timezone: "America/New_York",
      dateFormat: "MM/DD/YYYY"
    }
  }
};
```

### Habilitar dashboard en afiliado existente

Editar `src/data/mock/affiliates.ts`:

```typescript
{
  id: "mi-negocio",
  name: "Mi Negocio",
  // ... otros campos ...
  dashboardEnabled: true,
  dashboardUrl: "/dashboard/mi-negocio"  // Opcional, default: /dashboard/[id]
}
```

## 🚀 Uso

### Acceso a Dashboards

Los dashboards están disponibles en:

- **Pegote Barbershop**: `/dashboard/pegote-barbershop`
- **BritoColor**: `/dashboard/britocolor`
- **Dr. Pichardo**: `/dashboard/dr-pichardo`
- **Masa Tina**: `/dashboard/masa-tina`
- **Hablando Mierda (HBM)**: `/dashboard/hablando-mierda`

### Uso del Hook `useAffiliate()`

```typescript
"use client";

import { useAffiliate } from "@/contexts/AffiliateContext";

export function MiComponente() {
  const {
    config,           // Configuración completa
    affiliateId,      // ID del afiliado
    hasModule,        // Función para check módulos
    hasFeature,       // Función para check features
    primaryColor,     // Color primario del afiliado
    brandName         // Nombre del negocio
  } = useAffiliate();

  // Renderizado condicional según módulos
  if (!hasModule('metrics')) {
    return null;
  }

  return (
    <div>
      <h1>{brandName}</h1>
      {hasFeature('multiLanguage') && <LanguageToggle />}
    </div>
  );
}
```

### Uso del Hook `useAffiliateNavigation()`

```typescript
import { useAffiliateNavigation } from "@/hooks/useAffiliateNavigation";

export function NavComponent() {
  const {
    getModuleUrl,        // Construir URL de módulo
    getDashboardUrl,     // URL del dashboard principal
    availableModules,    // Lista de módulos habilitados
    isActiveRoute        // Check si ruta está activa
  } = useAffiliateNavigation();

  return (
    <nav>
      {availableModules.map((module) => (
        <Link
          key={module.url}
          href={module.url}
          className={isActiveRoute(module.url) ? 'active' : ''}
        >
          {module.icon} {module.name}
        </Link>
      ))}
    </nav>
  );
}
```

## 📦 Módulos Disponibles

### 1. Metrics (📊)
- **Descripción**: Analytics y KPIs del negocio
- **Componentes**: StatCards, gráficos, tablas de rendimiento
- **Casos de uso**: Ventas, conversiones, clientes activos

### 2. Customers (👥)
- **Descripción**: CRM - Gestión de clientes
- **Componentes**: Lista de clientes, filtros, búsqueda
- **Casos de uso**: Base de datos de clientes, segmentación

### 3. Campaigns (📢)
- **Descripción**: Gestión de campañas de marketing
- **Estado**: Placeholder (en desarrollo)
- **Casos de uso**: Email marketing, promociones

### 4. Appointments (📅)
- **Descripción**: Sistema de citas y reservas
- **Estado**: Placeholder (inspirado en Dr. Pichardo portal)
- **Casos de uso**: Barbería, medicina, servicios

### 5. E-commerce (🛍️)
- **Descripción**: Tienda online y productos
- **Estado**: En roadmap
- **Casos de uso**: Pegote (productos), Masa Tina (menús)

### 6. Inventory (📦)
- **Descripción**: Control de inventario
- **Estado**: En roadmap
- **Casos de uso**: BritoColor (materiales), Masa Tina (ingredientes)

### 7. Invoicing (💰)
- **Descripción**: Sistema de facturación
- **Estado**: En roadmap
- **Casos de uso**: Todos los afiliados

### 8. Team (👨‍💼)
- **Descripción**: Gestión de equipo
- **Estado**: En roadmap
- **Casos de uso**: Permisos, roles, colaboradores

## 🛠️ Desarrollo

### Añadir un nuevo módulo

1. **Crear la ruta** en `src/app/dashboard/[affiliateId]/[modulo]/page.tsx`:

```typescript
"use client";

import { useAffiliate } from "@/contexts/AffiliateContext";

export default function MiModuloPage() {
  const { brandName } = useAffiliate();

  return (
    <div>
      <h1>Mi Módulo - {brandName}</h1>
      {/* Contenido del módulo */}
    </div>
  );
}
```

2. **Actualizar `affiliates-config.ts`** añadiendo el módulo a la interface:

```typescript
modules: {
  // ... módulos existentes
  miModulo: boolean;
}
```

3. **Actualizar el sidebar** en `DashboardSidebar.tsx`:

```typescript
const navItems = [
  // ... items existentes
  hasModule('miModulo') && {
    name: "Mi Módulo",
    href: `/dashboard/${config?.id}/mi-modulo`,
    icon: "🎯",
    module: 'miModulo'
  }
].filter(Boolean);
```

### Personalizar branding

Los colores se definen en `affiliates-config.ts` usando clases de Tailwind:

```typescript
branding: {
  primaryColor: "blue-600",    // Usado en botones, links activos
  secondaryColor: "blue-400",  // Usado en hovers, secundarios
  // ...
}
```

Acceso en componentes:

```typescript
const { primaryColor } = useAffiliate();

// Uso en className:
<div className={`bg-${primaryColor}`}>...</div>
```

### Añadir una acción rápida

Editar `src/components/dashboard/modules/QuickActionsModule.tsx`:

```typescript
const quickActions = [
  // ... acciones existentes
  hasModule('miModulo') && {
    name: "Mi Acción",
    description: "Descripción de la acción",
    href: `/dashboard/${config?.id}/mi-modulo/new`,
    icon: "✨",
    color: "purple"
  }
].filter(Boolean);
```

## 🧪 Testing

### Verificar configuración de afiliado

```bash
# Iniciar dev server
npm run dev

# Acceder a dashboard de prueba
http://localhost:3000/dashboard/pegote-barbershop
```

### Checklist de testing

- [ ] Dashboard carga correctamente
- [ ] Header muestra branding correcto (logo, nombre)
- [ ] Sidebar muestra solo módulos habilitados
- [ ] Theme toggle funciona (si darkMode: true)
- [ ] Language toggle funciona (si multiLanguage: true)
- [ ] Navegación entre módulos funciona
- [ ] Loading state se muestra
- [ ] 404 para affiliateId inválido
- [ ] Métricas se renderizan correctamente
- [ ] Módulos placeholder muestran mensaje

## 🗺️ Roadmap

### Fase Actual (✅ Completada)
- [x] Configuración multi-tenant
- [x] Context provider
- [x] Rutas dinámicas
- [x] Layout y navegación
- [x] Módulo de métricas (básico)
- [x] Módulo CRM (básico)
- [x] Integración con datos existentes

### Próximas Fases

**Fase 2: Módulos Funcionales**
- [ ] Sistema de citas completo
- [ ] Campañas de marketing
- [ ] Inventario básico
- [ ] Facturación

**Fase 3: Integraciones**
- [ ] API endpoints reales
- [ ] Base de datos
- [ ] Autenticación por afiliado
- [ ] Webhooks y notificaciones

**Fase 4: Analytics Avanzado**
- [ ] Gráficos con Recharts/Chart.js
- [ ] Reportes exportables (PDF, Excel)
- [ ] Dashboard de métricas en tiempo real
- [ ] Comparativas período a período

**Fase 5: E-commerce**
- [ ] Catálogo de productos
- [ ] Carrito de compras
- [ ] Procesamiento de pagos
- [ ] Gestión de pedidos

## 📚 Recursos

- [Documentación Next.js 15](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [React Context API](https://react.dev/reference/react/useContext)

## 🤝 Contribución

Para contribuir al sistema multi-tenant:

1. Crear rama desde `develop`: `git checkout -b feature/mi-feature develop`
2. Implementar cambios
3. Testing local
4. Commit con mensaje descriptivo
5. Push y crear PR hacia `develop`

## 📝 Notas

- Los módulos están diseñados para ser plug-and-play
- La configuración es centralizada en un solo archivo
- Los componentes son reutilizables entre afiliados
- El sistema respeta el stack tecnológico existente
- No se añadieron dependencias nuevas

---

**Generado**: 2025-12-04
**Rama**: `feature/multi-tenant-dashboard`
**Estado**: ✅ Implementación base completa
