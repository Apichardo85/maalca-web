# Skill: Performance

Optimizaciones de rendimiento para Next.js 15 aplicadas al proyecto MaalCa.

## Contexto

El proyecto usa:
- **Next.js 15** con App Router
- **Turbopack** para desarrollo y build
- **React 19** con Server Components
- **Tailwind CSS 4**

## Reglas de performance priorizadas por impacto

### 1. Eliminar Network Waterfalls (CRÍTICO)

El problema #1 de performance. NUNCA hacer fetches secuenciales.

```typescript
// ❌ WATERFALL - Cada fetch espera al anterior
async function Page() {
  const user = await getUser();           // 200ms
  const orders = await getOrders(user.id); // 150ms
  const products = await getProducts();    // 100ms
  // Total: 450ms
}

// ✅ PARALELO - Fetches independientes en paralelo
async function Page() {
  const [user, products] = await Promise.all([
    getUser(),
    getProducts(),
  ]);
  const orders = await getOrders(user.id); // Solo este depende de user
  // Total: 200ms + 150ms = 350ms
}
```

### 2. Minimizar datos en la frontera Server/Client

```typescript
// ❌ MALO - Envía objeto completo al cliente
"use client";
export function UserCard({ user }: { user: FullUserObject }) {
  return <div>{user.name}</div>;
}

// ✅ BUENO - Solo envía lo necesario
"use client";
export function UserCard({ name, avatarUrl }: { name: string; avatarUrl: string }) {
  return <div>{name}</div>;
}

// En el Server Component:
<UserCard name={user.name} avatarUrl={user.avatarUrl} />
```

### 3. Server Components por defecto

```typescript
// ✅ Server Component - Fetch en servidor, sin JS al cliente
export default async function ProductsPage() {
  const products = await getProducts(); // Fetch en servidor
  return (
    <div>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

// Solo usar "use client" cuando hay:
// - useState, useEffect, hooks
// - Event handlers (onClick, onChange)
// - Browser APIs (localStorage, window)
```

### 4. Optimizar imports de paquetes

```typescript
// ❌ MALO - Importa todo el paquete
import { format } from "date-fns";

// ✅ BUENO - Import específico
import format from "date-fns/format";

// ❌ MALO - Importa todos los íconos
import * as Icons from "lucide-react";

// ✅ BUENO - Solo el ícono necesario
import { Search, Menu } from "lucide-react";
```

### 5. Lazy loading de componentes pesados

```typescript
import dynamic from "next/dynamic";

// Componentes con librerías pesadas
const Chart = dynamic(() => import("@/components/Chart"), {
  loading: () => <div className="h-64 bg-gray-800 animate-pulse" />,
  ssr: false, // Si usa APIs del browser
});

const Map = dynamic(() => import("@/components/PropertyMap"), {
  loading: () => <div className="h-96 bg-gray-800 animate-pulse" />,
  ssr: false,
});

// EPUB Reader (pesado)
const DigitalReader = dynamic(() => import("@/components/ui/DigitalReader"), {
  loading: () => <div className="h-screen bg-gray-900 animate-pulse" />,
  ssr: false,
});
```

### 6. Optimización de imágenes

```typescript
import Image from "next/image";

// ✅ Siempre usar next/image
<Image
  src="/images/product.jpg"
  alt="Product"
  width={400}
  height={300}
  priority={isAboveFold}  // true para imágenes visibles inmediatamente
  loading={isAboveFold ? undefined : "lazy"}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// Para imágenes dinámicas, usar sizes
<Image
  src={product.image}
  alt={product.name}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>
```

### 7. Suspense para streaming

```typescript
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div>
      {/* Contenido crítico - render inmediato */}
      <DashboardHeader />

      {/* Contenido secundario - streaming */}
      <Suspense fallback={<MetricsSkeleton />}>
        <AsyncMetrics />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <AsyncRecentOrders />
      </Suspense>
    </div>
  );
}

// Componente async que se carga independiente
async function AsyncMetrics() {
  const metrics = await getMetrics();
  return <MetricsGrid data={metrics} />;
}
```

### 8. Memoización de componentes client

```typescript
"use client";
import { memo, useMemo, useCallback } from "react";

// Memoizar componentes que reciben props complejas
export const ProductCard = memo(function ProductCard({ product }: Props) {
  return <div>{product.name}</div>;
});

// Memoizar cálculos costosos
function ProductList({ products, filters }) {
  const filteredProducts = useMemo(() =>
    products.filter(p => applyFilters(p, filters)),
    [products, filters]
  );

  const handleSort = useCallback((key: string) => {
    // sorting logic
  }, []);

  return <List items={filteredProducts} onSort={handleSort} />;
}
```

## Configuración actual del proyecto

### next.config.ts
```typescript
// Ya configurado:
- ESLint/TypeScript ignorados en build
- Image optimization con WebP/AVIF
- SWC minification
- Gzip compression
- Tree-shaking de Framer Motion
- CSS optimization
```

### Comandos de análisis
```bash
# Analizar bundle
npm run build
# Ver output en .next/analyze/

# Verificar performance
npx lighthouse http://localhost:3000 --view
```

## Checklist de performance

- [ ] No hay waterfalls de red (Promise.all para fetches paralelos)
- [ ] Server Components por defecto
- [ ] "use client" solo donde es necesario
- [ ] Imports específicos (no `import *`)
- [ ] Imágenes con next/image y sizes apropiados
- [ ] Componentes pesados con dynamic import
- [ ] Suspense para contenido no crítico
- [ ] Props mínimas en frontera server/client

## Métricas objetivo

| Métrica | Objetivo | Cómo medir |
|---------|----------|------------|
| LCP | < 2.5s | Lighthouse |
| FID | < 100ms | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| TTI | < 3.5s | Lighthouse |
| Bundle JS | < 200kb | Build output |

## Referencias en el proyecto

- `src/lib/performance.ts` - Utilidades de performance
- `next.config.ts` - Optimizaciones de build
- `src/app/dashboard/[affiliateId]/page.tsx` - Ejemplo de Server Component con fetches
