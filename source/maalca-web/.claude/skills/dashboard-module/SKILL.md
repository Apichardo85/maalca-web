# Skill: Dashboard Module

Crea nuevos módulos para el sistema de dashboard multi-tenant de MaalCa.

## Contexto

El dashboard usa rutas dinámicas `/dashboard/[affiliateId]/` donde cada módulo es una carpeta con su `page.tsx`. Los módulos se habilitan/deshabilitan por afiliado en `affiliates-config.ts`.

## Estructura de un módulo

```
src/app/dashboard/[affiliateId]/{module-name}/
├── page.tsx           # Página principal del módulo
└── [subpage]/         # Subpáginas opcionales
    └── page.tsx
```

## Reglas obligatorias

### 1. Usar Server Component por defecto
```typescript
// ✅ CORRECTO - Server Component
export default async function ModulePage({
  params,
}: {
  params: Promise<{ affiliateId: string }>;
}) {
  const { affiliateId } = await params;
  // ...
}

// ❌ INCORRECTO - Client Component innecesario
"use client";
export default function ModulePage() { ... }
```

### 2. Validar afiliado y módulo habilitado
```typescript
import { getAffiliateConfig, affiliateHasModule } from "@/config/affiliates-config";
import { notFound } from "next/navigation";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ affiliateId: string }>;
}) {
  const { affiliateId } = await params;
  const config = getAffiliateConfig(affiliateId);

  if (!config || !affiliateHasModule(affiliateId, "MODULE_NAME")) {
    notFound();
  }

  // Continuar con el render...
}
```

### 3. Estructura de layout consistente
```typescript
return (
  <div className="space-y-6">
    {/* Header del módulo */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Título del Módulo</h1>
        <p className="text-gray-400">Descripción breve</p>
      </div>
      <div className="flex gap-2">
        {/* Acciones principales */}
      </div>
    </div>

    {/* Contenido principal */}
    <div className="grid gap-6">
      {/* Cards, tablas, etc. */}
    </div>
  </div>
);
```

### 4. Usar colores dinámicos del afiliado
```typescript
const primaryColor = config.branding.primaryColor; // "blue-600", "orange-600", etc.

// Para clases dinámicas, usar template literals con clases completas
const buttonClass = `bg-${primaryColor} hover:bg-${primaryColor.replace('600', '700')}`;

// O mejor, mapear a clases concretas:
const colorClasses: Record<string, string> = {
  "blue-600": "bg-blue-600 hover:bg-blue-700",
  "orange-600": "bg-orange-600 hover:bg-orange-700",
  "green-600": "bg-green-600 hover:bg-green-700",
  "purple-600": "bg-purple-600 hover:bg-purple-700",
  "red-600": "bg-red-600 hover:bg-red-700",
};
```

### 5. Componentes dashboard reutilizables
```typescript
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ResponsiveTable } from "@/components/ui/ResponsiveTable";
import { TableActionButton } from "@/components/ui/TableActionButton";
```

## Checklist antes de completar

- [ ] Módulo agregado a `AffiliateConfig['modules']` en `affiliates-config.ts`
- [ ] Validación de `affiliateHasModule()` en page.tsx
- [ ] Link agregado en `DashboardSidebar.tsx`
- [ ] Tipos creados en `src/lib/types/{module}.ts`
- [ ] API client creado en `src/lib/api/{module}Api.ts` (si aplica)

## Ejemplo de módulo completo

Ver referencia en:
- `src/app/dashboard/[affiliateId]/customers/page.tsx`
- `src/app/dashboard/[affiliateId]/inventory/page.tsx`
