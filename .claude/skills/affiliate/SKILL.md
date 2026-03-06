# Skill: Affiliate

Configura nuevos afiliados en el sistema multi-tenant de MaalCa.

## Contexto

El sistema multi-tenant permite que cada afiliado (negocio) tenga su propio dashboard con:
- Branding personalizado (colores, logo, nombre)
- Módulos habilitados según sus necesidades
- Features específicas
- Configuración regional (moneda, timezone, formato de fecha)

## Archivo principal

```
src/config/affiliates-config.ts
```

## Estructura de configuración

```typescript
export interface AffiliateConfig {
  id: string;                    // URL slug: /dashboard/{id}
  branding: {
    primaryColor: string;        // Tailwind color: "blue-600", "orange-600"
    secondaryColor: string;      // Color secundario
    logo: string;                // Path: /images/affiliates/{name}-logo.png
    name: string;                // Nombre para mostrar
    description: string;         // Descripción del negocio
  };
  modules: {
    metrics: boolean;            // Dashboard de métricas
    campaigns: boolean;          // Marketing campaigns
    customers: boolean;          // CRM
    ecommerce: boolean;          // Tienda/productos
    appointments: boolean;       // Sistema de citas
    inventory: boolean;          // Control de inventario
    invoicing: boolean;          // Facturación
    team: boolean;               // Gestión de equipo
    queue: boolean;              // Fila virtual
    salon: boolean;              // Vista de salón (barbería)
    giftcards: boolean;          // Gift cards
    reports: boolean;            // Reportes
  };
  features: {
    multiLanguage: boolean;      // ES/EN toggle
    darkMode: boolean;           // Toggle de tema
    notifications: boolean;      // Sistema de notificaciones
    analytics: boolean;          // Analytics avanzado
  };
  settings: {
    currency: string;            // "USD", "DOP", "EUR"
    timezone: string;            // "America/New_York"
    dateFormat: string;          // "MM/DD/YYYY", "DD/MM/YYYY"
  };
}
```

## Pasos para agregar afiliado

### 1. Agregar configuración en affiliates-config.ts

```typescript
export const affiliatesConfig: Record<string, AffiliateConfig> = {
  // ... afiliados existentes ...

  "nuevo-afiliado": {
    id: "nuevo-afiliado",
    branding: {
      primaryColor: "teal-600",
      secondaryColor: "teal-400",
      logo: "/images/affiliates/nuevo-afiliado-logo.png",
      name: "Nuevo Afiliado",
      description: "Descripción del negocio"
    },
    modules: {
      metrics: true,
      campaigns: true,
      customers: true,
      ecommerce: false,        // ← Habilitar según necesidad
      appointments: false,
      inventory: false,
      invoicing: true,
      team: true,
      queue: false,
      salon: false,
      giftcards: false,
      reports: true
    },
    features: {
      multiLanguage: false,
      darkMode: true,
      notifications: true,
      analytics: true
    },
    settings: {
      currency: "USD",
      timezone: "America/New_York",
      dateFormat: "MM/DD/YYYY"
    }
  }
};
```

### 2. Agregar logo del afiliado

```
public/images/affiliates/{affiliate-id}-logo.png
```

Especificaciones del logo:
- Formato: PNG con transparencia
- Tamaño recomendado: 200x200px o proporcional
- Fondo: Transparente (se usará sobre fondo oscuro)

### 3. Verificar acceso al dashboard

```
http://localhost:3000/dashboard/{affiliate-id}
```

## Colores disponibles (Tailwind)

```typescript
// Primarios recomendados
"red-600"      // MaalCa brand
"blue-600"     // Pegote, Dr. Pichardo
"orange-600"   // BritoColor
"green-600"    // Masa Tina
"purple-600"   // HBM
"teal-600"     // Disponible
"pink-600"     // Disponible
"indigo-600"   // Disponible

// Secundarios (400 del mismo color)
"red-400", "blue-400", "orange-400", etc.
```

## Afiliados actuales

| ID | Nombre | Color | Tipo de negocio |
|----|--------|-------|-----------------|
| `pegote-barbershop` | Pegote Barbershop | blue-600 | Barbería |
| `britocolor` | BritoColor | orange-600 | Imprenta/Diseño |
| `masa-tina` | Masa Tina | green-600 | Catering |
| `dr-pichardo` | Dr. Pichardo | blue-600 | Medicina |
| `hablando-mierda` | HBM Podcast | purple-600 | Media/Podcast |

## Módulos por tipo de negocio

### Barbería/Salón
```typescript
modules: {
  appointments: true,  // Citas
  queue: true,         // Fila virtual
  salon: true,         // Vista de sillas
  inventory: true,     // Productos
  giftcards: true,     // Gift cards
}
```

### Restaurante/Catering
```typescript
modules: {
  appointments: true,  // Reservaciones
  inventory: true,     // Ingredientes
  ecommerce: true,     // Menú online
  giftcards: true,
}
```

### Servicios Profesionales
```typescript
modules: {
  appointments: true,
  customers: true,     // CRM
  invoicing: true,
  reports: true,
}
```

### E-commerce/Retail
```typescript
modules: {
  ecommerce: true,
  inventory: true,
  campaigns: true,
  customers: true,
}
```

## Checklist antes de completar

- [ ] Configuración agregada en `affiliates-config.ts`
- [ ] ID único (slug válido para URL)
- [ ] Logo agregado en `public/images/affiliates/`
- [ ] Módulos habilitados según tipo de negocio
- [ ] Moneda y timezone correctos
- [ ] Verificar acceso en `/dashboard/{id}`

## Helper functions disponibles

```typescript
import {
  getAffiliateConfig,
  affiliateHasModule,
  getAffiliatesWithDashboard,
  getAffiliatePrimaryColor,
} from "@/config/affiliates-config";

// Obtener config completa
const config = getAffiliateConfig("pegote-barbershop");

// Verificar módulo
const hasAppointments = affiliateHasModule("pegote-barbershop", "appointments");

// Listar todos
const allAffiliates = getAffiliatesWithDashboard();

// Obtener color
const color = getAffiliatePrimaryColor("pegote-barbershop"); // "blue-600"
```
