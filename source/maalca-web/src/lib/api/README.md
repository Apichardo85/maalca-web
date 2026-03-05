# API Client Layer

Esta carpeta contiene la infraestructura para comunicación con el backend `maalca-api`.

## 📁 Estructura

```
src/lib/
  ├── api/
  │   ├── apiClient.ts        # Cliente HTTP genérico (fetch wrapper)
  │   ├── appointmentsApi.ts  # API de citas
  │   ├── campaignsApi.ts     # API de campañas de marketing
  │   ├── inventoryApi.ts     # API de inventario
  │   ├── billingApi.ts       # API de facturación y pagos
  │   └── index.ts            # Exports centralizados
  └── types/
      ├── common.ts           # Tipos base (TenantScoped, BaseEntity, etc.)
      ├── appointments.ts     # Tipos de citas
      ├── campaigns.ts        # Tipos de campañas
      ├── inventory.ts        # Tipos de inventario
      ├── billing.ts          # Tipos de facturación
      └── index.ts            # Exports centralizados
```

## 🚀 Uso Básico

### 1. Configuración

Copia `.env.local.example` a `.env.local` y configura la URL del backend:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### 2. Importar APIs

```typescript
// Opción 1: Import desde index centralizado (recomendado)
import { appointmentsApi, campaignsApi, inventoryApi, billingApi } from "@/lib/api";

// Opción 2: Import directo
import { appointmentsApi } from "@/lib/api/appointmentsApi";
```

### 3. Importar Tipos

```typescript
// Opción 1: Desde index centralizado (recomendado)
import type { Appointment, CreateAppointmentDto, Campaign } from "@/lib/api";

// Opción 2: Desde archivos individuales
import type { Appointment } from "@/lib/types/appointments";
```

## 📝 Ejemplos de Uso

### Appointments (Citas)

```typescript
import { appointmentsApi } from "@/lib/api";
import type { CreateAppointmentDto, Appointment } from "@/lib/api";

// Obtener todas las citas
const response = await appointmentsApi.getAppointments({
  tenantId: "tenant-123",
  status: "scheduled",
  page: 1,
  pageSize: 20,
});

// Crear una nueva cita
const newAppointment: CreateAppointmentDto = {
  tenantId: "tenant-123",
  customerName: "Juan Pérez",
  customerPhone: "+52 555 1234",
  serviceType: "Corte de cabello",
  date: "2025-12-15T10:00:00Z",
};
const appointment = await appointmentsApi.createAppointment(newAppointment);

// Marcar como completada
await appointmentsApi.completeAppointment(appointment.id, 350);
```

### Campaigns (Campañas)

```typescript
import { campaignsApi } from "@/lib/api";

// Obtener campañas activas
const campaigns = await campaignsApi.getCampaigns({
  tenantId: "tenant-123",
  status: "running",
});

// Crear campaña
const newCampaign = await campaignsApi.createCampaign({
  tenantId: "tenant-123",
  name: "Promoción de Verano",
  channel: "email",
  objective: "conversion",
  startDate: "2025-12-20T00:00:00Z",
});

// Lanzar campaña
await campaignsApi.launchCampaign(newCampaign.id);

// Obtener métricas
const metrics = await campaignsApi.getMetrics(newCampaign.id);
```

### Inventory (Inventario)

```typescript
import { inventoryApi } from "@/lib/api";

// Obtener items con stock bajo
const items = await inventoryApi.getItems({
  tenantId: "tenant-123",
  lowStock: true,
});

// Crear item
const newItem = await inventoryApi.createItem({
  tenantId: "tenant-123",
  sku: "PROD-001",
  name: "Shampoo Premium",
  quantityOnHand: 50,
  unitPrice: 250,
  reorderLevel: 10,
});

// Ajustar stock
await inventoryApi.addStock(newItem.id, 20, "PO-12345", "Reabastecimiento");

// Obtener alertas
const alerts = await inventoryApi.getLowStockAlerts("tenant-123");
```

### Billing (Facturación)

```typescript
import { billingApi } from "@/lib/api";

// Crear factura
const invoice = await billingApi.createInvoice({
  tenantId: "tenant-123",
  customerName: "Ana García",
  customerEmail: "ana@example.com",
  lineItems: [
    {
      description: "Corte de cabello",
      quantity: 1,
      unitPrice: 350,
      amount: 350,
      total: 350,
    },
    {
      description: "Tinte",
      quantity: 1,
      unitPrice: 800,
      amount: 800,
      total: 800,
    },
  ],
  dueDate: "2025-12-20T00:00:00Z",
});

// Enviar factura por email
await billingApi.sendInvoice(invoice.id);

// Registrar pago
await billingApi.createPayment({
  tenantId: "tenant-123",
  invoiceId: invoice.id,
  amount: 1150,
  method: "card",
  paidAt: new Date().toISOString(),
});

// Obtener estadísticas
const stats = await billingApi.getStats("tenant-123");
```

## 🔐 Multi-Tenant

El sistema está preparado para multi-tenant. Cada request puede incluir el `tenantId`:

### Opción 1: Por request (actual)

```typescript
await appointmentsApi.getAppointments({ tenantId: "tenant-123" });
```

### Opción 2: Cliente con contexto (futuro)

```typescript
import { createTenantApiClient } from "@/lib/api";

// Crear cliente con tenant
const client = createTenantApiClient("tenant-123");

// Todos los requests incluyen automáticamente el tenantId
await client.get("/appointments");
```

## 🛠️ API Client Features

### Manejo de Errores

```typescript
import { ApiClientError } from "@/lib/api";

try {
  const appointment = await appointmentsApi.getAppointment("invalid-id");
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error("Status:", error.statusCode);
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Details:", error.details);
  }
}
```

### Headers Personalizados

```typescript
// El cliente automáticamente agrega:
// - Content-Type: application/json
// - X-Tenant-Id: (si está configurado)

// Puedes agregar headers custom si es necesario en el futuro
```

### Query Parameters

Los parámetros de query se pasan automáticamente:

```typescript
// Se convierte en: /api/appointments?tenantId=tenant-123&status=scheduled&page=1
await appointmentsApi.getAppointments({
  tenantId: "tenant-123",
  status: "scheduled",
  page: 1,
});
```

## 📊 Tipos Disponibles

### Tipos Base (Common)

- `TenantScoped` - Entidad con tenantId
- `BaseEntity` - id, createdAt, updatedAt
- `TenantEntity` - Combina ambos
- `PaginatedResponse<T>` - Respuesta paginada
- `Money` - Valor monetario con moneda
- `ContactInfo` - Información de contacto

### Appointments

- `Appointment` - Entidad de cita
- `AppointmentStatus` - "scheduled" | "completed" | "cancelled" | "no_show"
- `CreateAppointmentDto` - Para crear citas
- `UpdateAppointmentDto` - Para actualizar citas

### Campaigns

- `Campaign` - Entidad de campaña
- `CampaignChannel` - "email" | "sms" | "whatsapp" | "social"
- `CampaignStatus` - "draft" | "scheduled" | "running" | "completed"
- `CampaignMetrics` - Métricas de rendimiento

### Inventory

- `InventoryItem` - Item de inventario
- `StockMovement` - Movimiento de stock
- `InventoryStatus` - "active" | "inactive" | "out_of_stock"
- `LowStockAlert` - Alerta de stock bajo

### Billing

- `Invoice` - Factura
- `Payment` - Pago
- `InvoiceStatus` - "draft" | "pending" | "paid" | "overdue"
- `PaymentMethod` - "cash" | "card" | "bank_transfer"

## 🚧 Estado Actual

**✅ Completado:**
- ✅ Tipos TypeScript definidos para todos los módulos
- ✅ API client genérico con fetch
- ✅ Clientes específicos por módulo (appointments, campaigns, inventory, billing)
- ✅ Soporte multi-tenant
- ✅ Manejo de errores
- ✅ Paginación
- ✅ Exports centralizados

**⏳ Pendiente:**
- ⏳ Backend API real (actualmente apunta a localhost:5000)
- ⏳ Autenticación y tokens
- ⏳ Integración en componentes UI
- ⏳ Manejo de cache (React Query / SWR)
- ⏳ Testing

## 🔄 Próximos Pasos

1. **Backend Development**: Implementar endpoints reales en `maalca-api`
2. **Authentication**: Agregar JWT/tokens al apiClient
3. **UI Integration**: Conectar componentes del dashboard con estas APIs
4. **State Management**: Considerar React Query o SWR para cache y sincronización
5. **Error Handling**: UI para mostrar errores al usuario
6. **Loading States**: Implementar estados de carga en componentes

## 📖 Documentación

Ver también:
- `MULTI-TENANT-DASHBOARD.md` - Documentación del dashboard
- `.env.local.example` - Variables de entorno necesarias

---

**Última actualización**: 2025-12-10
**Estado**: ✅ Infraestructura lista, esperando backend real
