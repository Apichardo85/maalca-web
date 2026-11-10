# Spec — Espacio Dealer (autoventa) en MaalCa

Estado: **Fase 1 en implementación** (decisiones de moneda, millaje y reservados cerradas, ver §7). Referencia auditada: rodriguezautoventa.com (Santo Domingo Oeste).
Fecha: 2026-11-10.

---

## 1. Decisión

Nuevo tipo de negocio `Dealer` con entidad e inventario propios, **no** Retail reusado.

**Por qué no Retail:** un vehículo tiene ~18 campos que el cliente filtra (año, millaje, transmisión,
combustible, carrocería, tracción, origen). En Retail eso caería en `RetailAttributes` (columna JSON) y
los filtros se volverían escaneo en memoria o `JSON_VALUE` sin índice. Un dealer con 300 unidades y
filtros combinados (carrocería + marca + rango de año + rango de precio) necesita columnas indexadas.
Es tabla propia, no un elefante blanco: es una vertical nueva, no infraestructura.

**Alcance:** plantilla genérica de dealers. Seed demo con vehículos de ejemplo propios. No se copia
inventario, fotos ni datos de la referencia.

---

## 2. Auditoría de la referencia — qué le falta

| Lo que tiene | Lo que falta / está roto |
|---|---|
| Destacados, En oferta, Recientes | Paginación de 3 páginas con recarga completa (`?p=2`) |
| Filtro por tipo (`/tipo/{x}/{id}`) y marca (`/marca/{y}/{id}`) | Cada filtro es una URL distinta con navegación completa; no se combinan entre sí |
| Ficha: marca, modelo, versión, año, precio | Sin millaje, transmisión, combustible, tracción, estado, VIN |
| Botón "CONTACTAR POR WHATSAPP" global | El WhatsApp no sabe qué vehículo estabas viendo |
| Corazón de favoritos | Roto: *"Primero debes colocar un anuncio como favoritos!"* |
| — | Sin financiamiento ni calculadora de cuota |
| — | Sin "vendo mi carro" / trade-in |
| — | Sin comparador |
| — | Sin galería por vehículo (una foto por unidad) |

Las 4 mejoras acordadas atacan exactamente eso.

---

## 3. API (`maalca-api`)

### 3.1 Enum

`src/Maalca.Domain/Enums/BusinessType.cs`

```csharp
Dealer = 8   // Autoventas / concesionarios
```

Valor nuevo al final: los 0–7 existentes no se mueven, así ninguna fila cambia de significado.

### 3.2 Entidad `VehicleListing`

`src/Maalca.Domain/Entities/VehicleListing.cs` — **tabla `VehicleListings`**.

> `Vehicle.cs` ya existe y es el camión de reparto de Nueva Era. No se toca. De ahí el nombre
> `VehicleListing` ("anuncio de vehículo"), que además es lo que la cosa es: un listing, no un activo.

```
AffiliateId, Make, Model, Trim, Year, Condition(new|used|certified)
Price, CompareAtPrice            -- oferta = CompareAtPrice > Price (mismo criterio que InventoryItem)
Mileage, MileageUnit(km|mi)
Transmission, FuelType, BodyType, Drivetrain
ExteriorColor, InteriorColor, Doors, Passengers, EngineDisplacement, Cylinders
Vin, StockNumber, ImportOrigin   -- "USA" | "Corea" | "Japón" | "Local"
Status(available|reserved|sold), Featured, IsPubliclyVisible, SortOrder
Images (JSON, Images[0] == portada)   -- mismo patrón que InventoryItem.Images
Description, DescriptionEn, ViewCount
```

**Índices:** `(AffiliateId, IsPubliclyVisible, Status)`, `(AffiliateId, Make, Model)`,
`(AffiliateId, Year)`, `(AffiliateId, Price)`, `(AffiliateId, BodyType)`.

### 3.3 Entidad `VehicleLead`

`src/Maalca.Domain/Entities/VehicleLead.cs` — **tabla `VehicleLeads`**.

> Verificado: `ProspectIntake` **no** sirve. Es de plataforma (sin `AffiliateId`), para negocios que
> todavía no son afiliados. Esto es un lead del cliente final hacia un afiliado.

```
AffiliateId, VehicleListingId (nullable)
Kind: "financing" | "tradein" | "inquiry" | "testdrive"
Name, Phone, Email, Message
-- financing:  DownPayment, TermMonths, MonthlyEstimate
-- tradein:    TradeMake, TradeModel, TradeYear, TradeMileage, TradeCondition, TradeImages(JSON)
Status: "new" | "contacted" | "won" | "lost", InternalNotes, Source
```

### 3.4 Catálogo de módulos

`src/Maalca.Application/Common/ModuleCatalog.cs`

```csharp
new ModuleDefinition("vehicles", "Vehículos", "Vehicles",
    "Tu inventario de vehículos y los interesados en cada uno.",
    "Your vehicle inventory and the leads on each one.",
    new[] { "dealer" }, null, PlanTier.Starter),
```

- `Starter`, igual que `catalog`: es la casa del dealer, no un extra.
- Los leads van **dentro** del módulo `vehicles` como pestaña. No se crea módulo aparte.
- `expenses` pasa de `["retail"]` a `["retail", "dealer"]` — un dealer necesita gastos y utilidad.
- `kitchen`, `station`, `pos`, `modifiers`, `shipping`, `pricelists`, `inventory`, `reservations`,
  `queue`, `contracts`, `routes`, `quality` ya quedan fuera solos: `dealer` no está en sus
  `BusinessTypes`. **No hay que tocarlos** (verificado en `ModuleCatalog.IsRelevant`).
- `catalog`, `orders`, `board` y `appointments` **excluyen `dealer`** (cambio aditivo en `ExcludeBusinessTypes`):
  `appointments` y `catalog` leen de `Services`/`Products`, tablas que un dealer no usa, así que dejarlos
  prendidos daría módulos vacíos. Las pruebas de manejo van como lead tipo `testdrive` (Fase 2), no sobre `appointments`.
- `invoices` y `proposals` ya aplican (solo excluyen `community`) → papeleo de la venta, gratis.

### 3.5 Configuración del dealer — sin columnas nuevas

Va en `Affiliate.Settings` (JSON libre, mismo patrón ya en uso para `defaultTheme`), bajo la clave `dealer`.
Ningún endpoint existente escribía `Settings`, así que se agrega `GET/PUT /api/affiliates/{id}/dealer-settings`
(mismo patrón que `store-settings`) que **fusiona** la clave `dealer` sin pisar el resto del JSON.

```json
"dealer": {
  "priceDisplay": "base" | "usd" | "dop" | "both",
  "usdToDop": 60.0,
  "mileageUnit": "km" | "mi",
  "showReserved": true
}
```

- **Moneda:** el precio de cada vehículo se guarda en la moneda del negocio (`Affiliate.Currency`, ya existe).
  `priceDisplay` decide qué ve el visitante: `base` (tal cual), `usd`, `dop` o `both` (principal + equivalente).
  Convertir exige `usdToDop`; sin tasa válida la vitrina cae a mostrar solo la moneda base.
- **Millaje:** cada vehículo guarda su `Mileage` y su `MileageUnit`; la vitrina lo normaliza a `mileageUnit` del negocio.
- **Reservados:** `showReserved = true` los muestra con insignia "Reservado"; `false` los oculta. Los vendidos nunca se muestran.
  Lo aplica **el servidor** en el endpoint público: un vehículo oculto no viaja en el JSON.

Todo se edita en el dashboard. (Financiamiento: tasa, plazos, inicial mínimo → Fase 2, misma clave.)

### 3.6 Endpoints

**Público** (cache 60 s, igual que `programs`):
- `GET /api/public/affiliates/{slug}/dealer-vehicles` → `{ settings, vehicles[] }` (máx. 300; ya sin vendidos, y sin reservados si `showReserved=false`)

Los filtros (carrocería, marca, año, precio, orden) se resuelven **en el cliente** sobre esa lista: un dealer típico
tiene <100 unidades y la respuesta viaja cacheada. Filtros y facets en servidor quedan diferidos hasta que un
negocio supere las 300 unidades (principio "ligero y veloz" del CLAUDE.md: no construir infraestructura antes de necesitarla).

**Dashboard** (`IVehicleListingService`, patrón `CommunityProgramService`):
- `GET|POST /api/affiliates/{id}/dealer-vehicles`, `PUT|DELETE .../dealer-vehicles/{vid}` (`/vehicles` ya lo usa la flota de reparto) (escritura bloqueada para rol Staff)
- `GET|PUT /api/affiliates/{id}/dealer-settings`

---

## 4. Web (`maalca-web`)

### 4.1 Registry

`src/lib/templates/registry.ts` — `BusinessType` suma `'dealer'`. Como `TEMPLATES`,
`BUSINESS_TYPE_LABELS`, `_EN`, `_ICONS` y `CATALOG_NAV_LABELS` son `Record<BusinessType, …>`,
**TypeScript obliga a completar las 5 entradas**: ese es el chequeo de que no quedó nada a medias.

```ts
dealer: dynamic(() => import('@/components/public/templates/Dealer').then(m => m.DealerTemplate)),
// labels: 'Autoventa' / 'Dealership'   icon: '🚗'
// CATALOG_NAV_LABELS.dealer: { es: 'Vehículos', en: 'Vehicles' }
```

`SpaceSidebar.tsx`: para `dealer`, el item de catálogo apunta a `/space/{slug}/vehicles` (mismo
mecanismo con el que Community se desvía a `/programs`), y `appointments` se muestra como
"Pruebas de manejo".

### 4.2 Vitrina pública

`src/components/public/templates/Dealer.tsx` + `templates/dealer/*`:

- `DealerHero` — portada, nombre, teléfono/WhatsApp, horario, buscador grande
- `VehicleFilterBar` — carrocería · marca/modelo · rango de año · rango de precio · transmisión ·
  combustible · orden. **Estado en la URL** (`?marca=suzuki&ano=2024-2027&precio=20000-40000`):
  una sola vista, sin recargas, y el filtro se puede compartir por WhatsApp — que es justo lo que
  la referencia no logra con sus rutas `/marca/{y}/{id}`.
- `VehicleGrid` + `VehicleCard` — foto, año/marca/modelo/versión, precio, badge de oferta, millaje,
  transmisión, combustible, botón comparar y favorito
- `CompareTray` — barra inferior con hasta 3 vehículos; `CompareDialog` los pone lado a lado
- `FinancingCalculator` — inicial (% o monto), plazo, tasa de `Settings.dealer.financing`; cuota en
  vivo y botón "Quiero este financiamiento" → lead con el vehículo y los números adentro
- `TradeInForm` — marca/modelo/año/millaje/estado + fotos → lead `tradein`
- Favoritos en `localStorage` con `try/catch` (funcionan de verdad, sin el bug de la referencia)

Ruta de ficha: `src/app/[slug]/v/[id]/page.tsx` — espejo del `[slug]/p/[itemId]` que ya existe.
Galería, ficha técnica completa, financiamiento, similares, y WhatsApp **pre-llenado**:
*"Hola, me interesa el Suzuki Jimny GLX 2027 (US$31,900) que vi en su página"*.

### 4.3 Dashboard

`src/app/space/[slug]/vehicles/` — espejo de `catalog/`:

| Archivo | Qué hace |
|---|---|
| `page.tsx` + `VehiclesContent.tsx` | tabla con `ResponsiveTable`, filtros, orden, badges de estado |
| `new/VehicleForm.tsx` | alta; secciones Identificación / Especificaciones / Precio / Fotos / Publicación |
| `[id]/edit/` | edición, misma forma |
| `leads/LeadsContent.tsx` | pestaña de interesados: tipo, vehículo, contacto, estado, notas |

Usa los skills del repo (`/dashboard-table`, `/dashboard-form`), `useFormValidation`, toasts,
tokens semánticos. Carga masiva de fotos reusando `BulkPhotoUpload.tsx`, que ya existe.

**De punta a punta:** inventario, fotos, tasa y plazos de financiamiento, trade-in on/off,
comparador, unidad de millaje, visibilidad por vehículo, colores y textos — todo desde el
dashboard. Cero parámetros de URL, cero comandos que haya que recordar.

---

## 5. SQL y migración

1. Migración EF: `AddDealerVehicleListings` (tablas + índices de 3.2/3.3).
2. Script revisable `staging-dealer-vehiculos.sql` con el `CREATE TABLE` + índices generados, para
   leerlo antes de correrlo en staging. Nada de `UPDATE` masivo: solo creación.
3. `seed-dealer-demo.sql` — 6 vehículos demo (`IsDemo`), para la plantilla.

Ningún afiliado existente cambia: `Dealer = 8` es valor nuevo y las tablas son nuevas.

---

## 6. Orden de entrega

```
SQL → API → web,  en develop para QA, luego main
```

Commits separados por repo (`maalca-api` y `maalca-web` aparte).

**Fase 1 — vertical mínimo usable**
Enum · entidad `VehicleListing` · módulo `vehicles` · CRUD dashboard · `dealer-settings` (moneda, millaje, reservados) ·
vitrina con filtros · ficha con galería · WhatsApp pre-llenado.

**Fase 2 — conversión (construida)**
`VehicleLead` · calculadora de financiamiento (config en `dealer`) · trade-in · prueba de manejo · pestaña de interesados.

- Config nueva en `Settings.dealer`: `financingEnabled`, `financingRate` (% anual), `financingTerms`, `minDownPercent`, `tradeInEnabled`, `testDriveEnabled`. Todo apagado por defecto; sin tasa el financiamiento queda apagado.
- API público: `POST /api/public/affiliates/{slug}/dealer-leads` (`kind`: `financing | tradein | testdrive | inquiry`). Valida contra la config del dueño, calcula la cuota en el servidor, deduplica (10 min) y topa 40 leads/hora por negocio (429).
- API dashboard: `GET /api/affiliates/{id}/dealer-leads[?status=]`, `GET .../dealer-leads/count-new`, `PUT|DELETE .../dealer-leads/{leadId}` (Staff solo lee).
- Web: calculadora y formularios en la ficha del vehículo, modal "Vende o cambia tu carro" en la vitrina, `/space/{slug}/vehicles/leads` para el dueño.
- Pendiente consciente: fotos del trade-in (el API ya acepta `tradeImages`, pero no hay subida pública; la web ofrece mandarlas por WhatsApp).

**Fase 3 — comparación (construida, solo web)**
Comparador de 3 · favoritos · facets con conteos.

- Favoritos: `localStorage` por vitrina (`maalca:dealer:fav:{slug}`), corazón en tarjeta y ficha, chip "♥ Favoritos (n)" que filtra. Por dispositivo, sin cuenta.
- Comparador: botón "Comparar" en cada tarjeta (máx. 3), barra flotante y hoja lado a lado; marca con ✓ el mejor precio, año y millaje (millaje normalizado a la unidad del dueño).
- Facets: cada filtro muestra cuántos resultados deja ("Toyota (3)"), calculado con los demás filtros aplicados; las opciones en 0 se deshabilitan.
- Sin cambios de API ni de configuración: todo corre sobre la lista pública ya cacheada.

---

## 7. Decisiones cerradas (2026-11-10)

1. **Moneda:** USD, DOP o ambas, **la decide el dueño en configuración** (`priceDisplay` + `usdToDop`).
2. **Millaje:** unidad configurable por el dueño (`mileageUnit`); cada vehículo conserva la suya y se normaliza.
3. **Reservados:** el dueño decide si se muestran o no (`showReserved`); aplicado en servidor.

## 8. Despliegue (orden SQL → API → web, `develop` para QA antes de `main`)

La migración EF no se puede generar sin `dotnet`; se genera en tu máquina:

```powershell
cd C:\Users\apich\source\maalca-api
dotnet ef migrations add AddDealerVehicleListings -p src/Maalca.Infrastructure -s src/Maalca.Api
dotnet ef migrations script <ULTIMA_MIGRACION> AddDealerVehicleListings -i -o staging-dealer-vehiculos.sql -p src/Maalca.Infrastructure -s src/Maalca.Api
```

El script solo **crea** una tabla e índices; no toca datos existentes. Revisarlo antes de correrlo en staging.
