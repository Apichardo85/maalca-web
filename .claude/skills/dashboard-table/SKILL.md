# Skill: Dashboard Table

Genera módulos de dashboard con tabla de datos usando Server Component + Client interactivo.

## Contexto

La mayoría de módulos del dashboard son monolitos `"use client"` con data hardcodeada inline y tablas `<table>` manuales. Este skill los transforma en el patrón correcto: Server Component para validación/data + Client Component para interactividad.

## Estructura generada

```
src/app/dashboard/[affiliateId]/{module}/
├── page.tsx                    # Server Component (validación + data fetch)
└── components/
    └── {Module}Client.tsx      # Client Component (tabla + filtros + paginación)
```

## Reglas obligatorias

### 1. page.tsx — Server Component async

```typescript
// ✅ SIEMPRE este patrón
import { getAffiliateConfig, affiliateHasModule } from "@/config/affiliates-config";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard/shared/DashboardSkeleton";
import { AppointmentsClient } from "./components/AppointmentsClient";

export default async function AppointmentsPage({
  params,
}: {
  params: Promise<{ affiliateId: string }>;
}) {
  const { affiliateId } = await params;
  const config = getAffiliateConfig(affiliateId);

  if (!config || !affiliateHasModule(affiliateId, "appointments")) {
    notFound();
  }

  return (
    <Suspense fallback={<DashboardSkeleton variant="table" />}>
      <AppointmentsClient affiliateId={affiliateId} config={config} />
    </Suspense>
  );
}
```

**NO poner `"use client"` en page.tsx.** La interactividad vive en el Client component.

### 2. {Module}Client.tsx — Client Component con componentes shared

```typescript
"use client";

import { useState, useMemo } from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ResponsiveTable, type TableColumn, type SortConfig } from "@/components/ui/ResponsiveTable";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { FilterBar, type FilterConfig } from "@/components/dashboard/shared/FilterBar";
import { EmptyState } from "@/components/dashboard/shared/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import type { AffiliateConfig } from "@/config/affiliates-config";

// Tipo importado del service layer
import type { Appointment } from "@/lib/dashboard/appointment-service";

interface Props {
  affiliateId: string;
  config: AffiliateConfig;
}

// Mock data temporal — se reemplaza cuando el backend esté listo
const MOCK_DATA: Appointment[] = [/* ... */];

const ITEMS_PER_PAGE = 10;

export function AppointmentsClient({ affiliateId, config }: Props) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>();
  const [currentPage, setCurrentPage] = useState(1);

  // Filter config
  const filterConfigs: FilterConfig[] = [
    {
      name: "status",
      label: "Estado",
      options: [
        { label: "Programada", value: "scheduled" },
        { label: "Completada", value: "completed" },
        { label: "Cancelada", value: "cancelled" },
      ],
    },
  ];

  // Filtered + sorted data
  const processedData = useMemo(() => {
    let result = [...MOCK_DATA];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        item.customerName.toLowerCase().includes(q)
      );
    }

    // Filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        result = result.filter((item) => (item as Record<string, unknown>)[key] === value);
      }
    });

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortConfig.key];
        const bVal = (b as Record<string, unknown>)[sortConfig.key];
        const cmp = String(aVal).localeCompare(String(bVal));
        return sortConfig.direction === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [search, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
  const paginatedData = processedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Table columns
  const columns: TableColumn<Appointment>[] = [
    { key: "customerName", header: "Cliente", sortable: true, render: (item) => item.customerName },
    { key: "service", header: "Servicio", sortable: true, render: (item) => item.service },
    { key: "date", header: "Fecha", sortable: true, render: (item) => item.date },
    { key: "time", header: "Hora", render: (item) => item.time },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (item) => <StatusBadge status={item.status} variant="appointment" />,
    },
  ];

  const handleSort = (key: string) => {
    setSortConfig((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const handleClearFilters = () => {
    setSearch("");
    setFilters({});
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Citas</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gestiona las citas de tus clientes
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          + Nueva Cita
        </button>
      </div>

      {/* Table card */}
      <DashboardCard>
        <FilterBar
          searchPlaceholder="Buscar cliente..."
          filters={filterConfigs}
          onSearch={setSearch}
          onFilter={(name, value) => setFilters((prev) => ({ ...prev, [name]: value }))}
          onClear={handleClearFilters}
          activeFilters={filters}
          searchValue={search}
        />

        {paginatedData.length > 0 ? (
          <>
            <ResponsiveTable
              data={paginatedData}
              columns={columns}
              getRowKey={(item) => item.id}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon="📅"
            title="No se encontraron citas"
            description="Ajusta los filtros o crea una nueva cita."
            action={{ label: "Crear cita", onClick: () => {} }}
          />
        )}
      </DashboardCard>
    </div>
  );
}
```

### 3. Mock data — Fuera del componente

```typescript
// ✅ CORRECTO — mock data como constante fuera del componente
const MOCK_DATA: Appointment[] = [
  { id: "1", customerName: "Juan Pérez", ... },
];

// ❌ INCORRECTO — arrays inline dentro del componente
export default function Page() {
  const appointments = [{ id: "1", ... }]; // ← NO
}
```

Cuando el backend esté listo, se reemplaza `MOCK_DATA` por el fetch en el Server Component.

### 4. Componentes obligatorios

| Componente | Import | Uso |
|---|---|---|
| `ResponsiveTable` | `@/components/ui/ResponsiveTable` | Tabla desktop + mobile cards |
| `StatusBadge` | `@/components/dashboard/shared/StatusBadge` | Badges de estado semánticos |
| `FilterBar` | `@/components/dashboard/shared/FilterBar` | Search + filtros + clear |
| `EmptyState` | `@/components/dashboard/shared/EmptyState` | Cuando no hay resultados |
| `DashboardSkeleton` | `@/components/dashboard/shared/DashboardSkeleton` | Loading en Suspense |
| `Pagination` | `@/components/ui/Pagination` | Navegación entre páginas |
| `DashboardCard` | `@/components/dashboard/DashboardCard` | Wrapper de secciones |

## Checklist antes de completar

- [ ] `page.tsx` es Server Component (NO tiene `"use client"`)
- [ ] Valida `getAffiliateConfig` + `affiliateHasModule`
- [ ] Client component usa `ResponsiveTable` (NO `<table>` manual)
- [ ] Usa `FilterBar` para search/filtros
- [ ] Usa `StatusBadge` para badges (NO inline)
- [ ] Usa `EmptyState` cuando no hay datos
- [ ] Usa `Pagination` cuando hay más de 1 página
- [ ] Mock data está fuera del componente como `const`
- [ ] Tipos importados del service layer (`src/lib/dashboard/*-service.ts`)
- [ ] Sort funciona (clickear header cambia orden)
- [ ] `npm run build` pasa sin errores

## Referencias

- `src/app/dashboard/[affiliateId]/customers/page.tsx` — Ejemplo más limpio actual
- `src/components/ui/ResponsiveTable.tsx` — Tabla con sort
- `src/components/dashboard/shared/FilterBar.tsx` — Filtros estandarizados
- `src/lib/dashboard/appointment-service.ts` — Tipos y service layer
- `src/config/affiliates-config.ts` — Validación multi-tenant
