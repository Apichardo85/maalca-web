# Skill: Dashboard Redesign

Audita y corrige módulos del dashboard para cumplir el estándar visual 2026 de MaalCa.

## Contexto

El dashboard tiene 20 módulos bajo `/dashboard/[affiliateId]/`. Muchos usan patrones obsoletos: inline `style={{}}`, badges definidos localmente, tablas manuales, y cero feedback al usuario. Este skill es un **ruleset** — no genera código nuevo, sino que audita un módulo existente y prescribe fixes concretos.

## Reglas obligatorias

### 1. Cards — Glassmorphism sutil en dark mode
```typescript
// ✅ CORRECTO
<div className="bg-white dark:bg-gray-900/80 dark:backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-800">

// ❌ INCORRECTO
<div className="bg-white dark:bg-gray-900 rounded-lg border">
```
- Siempre `rounded-xl` (nunca `rounded-lg` para cards principales)
- Dark mode: `dark:bg-gray-900/80 dark:backdrop-blur-sm` para efecto de profundidad

### 2. StatCard values — Animación de entrada
```typescript
// ✅ CORRECTO
<p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums animate-count-up">
  {value}
</p>

// ❌ INCORRECTO
<p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
```
- `tabular-nums` para alineación consistente de números
- `animate-count-up` para entrada suave

### 3. Status dots activos — Respiración
```typescript
// ✅ CORRECTO — estados "vivos" (waiting, in_progress, active)
<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" />

// ❌ INCORRECTO — dot estático para algo activo
<span className="w-2 h-2 rounded-full bg-green-500" />
```
- Solo para estados activos/en-proceso. Estados completados/cancelados son estáticos.

### 4. Staggered card entrance
```typescript
// ✅ CORRECTO
{items.map((item, index) => (
  <div
    key={item.id}
    className="animate-fade-in-up"
    style={{ animationDelay: `${index * 80}ms` }}
  >
    {/* card content */}
  </div>
))}

// ❌ INCORRECTO — todas entran al mismo tiempo
{items.map((item) => (
  <div key={item.id}>{/* card content */}</div>
))}
```

### 5. Table row hover — Accent border
```typescript
// ✅ CORRECTO
<tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-2 border-l-transparent hover:border-l-blue-500 transition-all">

// ❌ INCORRECTO — hover plano sin indicador
<tr className="hover:bg-gray-50">
```

### 6. Empty states — Usar EmptyState component
```typescript
// ✅ CORRECTO
import { EmptyState } from "@/components/dashboard/shared/EmptyState";

<EmptyState
  icon="📅"
  title="No hay citas programadas"
  description="Cuando tus clientes agenden citas, aparecerán aquí."
  action={{ label: "Crear primera cita", onClick: () => setShowModal(true) }}
/>

// ❌ INCORRECTO — texto inline
<p className="text-gray-500">No se encontraron resultados</p>
```

### 7. Skeleton loading — Usar DashboardSkeleton
```typescript
// ✅ CORRECTO
import { DashboardSkeleton } from "@/components/dashboard/shared/DashboardSkeleton";

<Suspense fallback={<DashboardSkeleton variant="table" />}>

// ❌ INCORRECTO — spinner genérico
<div className="animate-spin">⏳</div>
```

### 8. PROHIBIDO
- ❌ Inline `style={{}}` para colores o layout (usar Tailwind classes)
- ❌ `console.log` como handler de submit (usar service layer + toast)
- ❌ `bg-${color}-100` interpolación dinámica (usar mapa estático de colores)
- ❌ Definir status badges inline (usar `StatusBadge` de shared)
- ❌ Construir `<table>` manual (usar `ResponsiveTable`)
- ❌ Filtros duplicados (usar `FilterBar`)

## Cómo usar este skill

```
/dashboard-redesign audit appointments
```

Produce una lista de violaciones y fixes específicos por línea.

## Checklist de auditoría

- [ ] Cards usan `rounded-xl` + glassmorphism dark
- [ ] StatCard values tienen `tabular-nums animate-count-up`
- [ ] Status dots activos usan `animate-pulse-soft`
- [ ] Grid cards tienen staggered entrance
- [ ] Table rows tienen accent border hover
- [ ] Empty states usan `EmptyState` component
- [ ] Loading usa `DashboardSkeleton`
- [ ] Cero inline `style={{}}`
- [ ] Cero `console.log` handlers
- [ ] Usa `StatusBadge` de shared, no badges inline
- [ ] Usa `ResponsiveTable`, no `<table>` manual
- [ ] Usa `FilterBar` para search/filter

## Referencias

- `src/components/dashboard/shared/EmptyState.tsx`
- `src/components/dashboard/shared/DashboardSkeleton.tsx`
- `src/components/dashboard/shared/FilterBar.tsx`
- `src/components/dashboard/shared/StatusBadge.tsx`
- `src/components/ui/ResponsiveTable.tsx`
- `src/app/globals.css` — keyframes: shimmer, pulseSoft, countUp
