# Skill: API Endpoint

Crea endpoints de API siguiendo el patrón establecido en el proyecto MaalCa.

## Contexto

El proyecto usa un `apiClient` centralizado en `src/lib/api/apiClient.ts` que maneja:
- Multi-tenant con header `X-Tenant-Id`
- Error handling consistente
- Query parameters automáticos
- Tipos TypeScript completos

## Estructura de archivos API

```
src/lib/api/
├── apiClient.ts          # Cliente base (NO MODIFICAR)
├── appointmentsApi.ts    # Endpoints de citas
├── campaignsApi.ts       # Endpoints de campañas
├── inventoryApi.ts       # Endpoints de inventario
├── billingApi.ts         # Endpoints de facturación
└── index.ts              # Exports centralizados
```

## Patrón para crear nuevo API file

### 1. Importar el cliente y tipos
```typescript
import { apiClient } from "./apiClient";
import type {
  EntityType,
  CreateEntityDto,
  UpdateEntityDto,
  PaginatedResponse,
  QueryParams,
} from "../types/entity.types";
```

### 2. Definir funciones con tipos explícitos
```typescript
/**
 * Obtener lista paginada de entidades
 */
export async function getEntities(
  tenantId: string,
  params?: QueryParams
): Promise<PaginatedResponse<EntityType>> {
  apiClient.setTenantId(tenantId);
  return apiClient.get<PaginatedResponse<EntityType>>("/api/entities", {
    params: {
      page: params?.page,
      pageSize: params?.pageSize,
      search: params?.search,
      sortBy: params?.sortBy,
      sortOrder: params?.sortOrder,
    },
  });
}

/**
 * Obtener entidad por ID
 */
export async function getEntityById(
  tenantId: string,
  entityId: string
): Promise<EntityType> {
  apiClient.setTenantId(tenantId);
  return apiClient.get<EntityType>(`/api/entities/${entityId}`);
}

/**
 * Crear nueva entidad
 */
export async function createEntity(
  tenantId: string,
  data: CreateEntityDto
): Promise<EntityType> {
  apiClient.setTenantId(tenantId);
  return apiClient.post<EntityType, CreateEntityDto>("/api/entities", data);
}

/**
 * Actualizar entidad
 */
export async function updateEntity(
  tenantId: string,
  entityId: string,
  data: UpdateEntityDto
): Promise<EntityType> {
  apiClient.setTenantId(tenantId);
  return apiClient.patch<EntityType, UpdateEntityDto>(
    `/api/entities/${entityId}`,
    data
  );
}

/**
 * Eliminar entidad
 */
export async function deleteEntity(
  tenantId: string,
  entityId: string
): Promise<void> {
  apiClient.setTenantId(tenantId);
  return apiClient.delete(`/api/entities/${entityId}`);
}
```

## Reglas obligatorias

### 1. Siempre usar tenantId
```typescript
// ✅ CORRECTO
export async function getItems(tenantId: string): Promise<Item[]> {
  apiClient.setTenantId(tenantId);
  return apiClient.get<Item[]>("/api/items");
}

// ❌ INCORRECTO - Sin tenant
export async function getItems(): Promise<Item[]> {
  return apiClient.get<Item[]>("/api/items");
}
```

### 2. Tipos explícitos en genéricos
```typescript
// ✅ CORRECTO
return apiClient.post<Customer, CreateCustomerDto>("/api/customers", data);

// ❌ INCORRECTO - Sin tipos
return apiClient.post("/api/customers", data);
```

### 3. Documentar cada función
```typescript
/**
 * Obtener clientes con filtros opcionales
 * @param tenantId - ID del afiliado/tenant
 * @param params - Parámetros de búsqueda y paginación
 * @returns Lista paginada de clientes
 */
export async function getCustomers(...)
```

### 4. Exportar en index.ts
```typescript
// src/lib/api/index.ts
export * from "./appointmentsApi";
export * from "./campaignsApi";
export * from "./inventoryApi";
export * from "./billingApi";
export * from "./newEntityApi"; // ← Agregar nuevo export
```

## Tipos base disponibles

```typescript
// src/lib/types/common.ts
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface TenantEntity {
  id: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}
```

## Checklist antes de completar

- [ ] Tipos definidos en `src/lib/types/{entity}.types.ts`
- [ ] Funciones CRUD básicas implementadas
- [ ] Cada función recibe `tenantId` como primer parámetro
- [ ] Documentación JSDoc en cada función
- [ ] Export agregado en `src/lib/api/index.ts`

## Referencias

- `src/lib/api/appointmentsApi.ts` - Ejemplo con endpoints CRUD completos
- `src/lib/api/inventoryApi.ts` - Ejemplo con query params
- `src/lib/types/common.ts` - Tipos base reutilizables
