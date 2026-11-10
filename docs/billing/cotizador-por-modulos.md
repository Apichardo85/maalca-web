# Plan: precios por módulo y por nivel de país (todo en USD)

Objetivo: un solo motor de precios en el API que alimenta:
1. el cotizador de /ops (negocio existente o prospecto),
2. la página pública /servicios,
3. el botón "Mejorar" del dashboard del espacio y el checkout de Stripe.
Todo se configura desde /ops/precios. Nada de precios escritos a mano.

**Moneda: siempre USD.** RD (y Latinoamérica) paga en dólares, pero más barato (Nivel 2).
La moneda con la que cada negocio vende a SUS clientes (DOP en Nueva Era) no cambia: es otra cosa.

Reglas: CLAUDE.md de cada repo (tokens semánticos, sin refactor fuera de alcance). API y web en
commits separados. Orden SQL → API → web. develop antes de main. El usuario corre `dotnet build`
y `dotnet ef migrations add`. SQL que cambia datos se muestra y se confirma antes de correr.

---

## 0. Qué hace el mercado y qué tomamos
- Toast: plan base de $0 a $69 por local y módulos a la carta (gift cards, catering, handheld,
  nómina por empleado). Corporativo "Build Your Own" negociado por volumen.
- 7shifts: precio por local en 3 niveles con tope de empleados; nómina = fee por local + $6
  por empleado.
- Precio por país: niveles de países por poder de compra (Atlassian, JetBrains). En
  Latinoamérica muchos compradores prefieren el precio en USD.

Decisiones:
1. **Módulo suelto más caro que el paquete.** Suelto = parte de la bolsa × 1.3. Growth y
   Professional quedan como el paquete con descuento.
2. **Cobrar por unidad real:** local adicional, vehículo, usuario, bloque de clientes.
3. **Niveles de país** con un factor, no un precio distinto por país.
4. **Siempre en USD.** El nivel baja el precio; no hay conversión de moneda.

---

## 1. Modelo de precio

### 1.1 Precio de cada módulo (USD/mes, Nivel 1)
- Starter (catalog, page, metrics): $0.
- Bolsa Growth = precio Growth ($38). Bolsa Professional = Professional − Growth ($57).
- `parte = bolsa × peso / suma de pesos del tier`; `suelto = parte × 1.3` (SoloMarkup).
- El tier sale de ModuleCatalog + ModulePlanRule (/ops/modulos). Cambia el tier y el precio se
  recalcula solo. Módulos de ModulosCortesia: se muestran con su valor real y un renglón de descuento igual "Cortesía: …" (neto 0; no cuentan para el paquete ni para la implementación). En el cotizador el renglón dice "primeros N meses" según la vigencia.

Pesos por defecto (editables):

| Growth | peso | Professional | peso |
|---|---|---|---|
| orders, pos | 1.5 c/u | contracts, routes | 2 c/u |
| inventory, shipping, board, reservations, appointments, kitchen | 1 c/u | invoices, pricelists, expenses, quality, proposals, workforce | 1 c/u |
| station, queue, staff, modifiers | 0.5 c/u | | |
| suma 11 → $3.4545 por peso | | suma 10 → $5.70 por peso | |

### 1.2 Mensualidad de un negocio (USD, Nivel 1)
1. `sueltos = Σ suelto de sus módulos activos (sin cortesía)`.
2. `paquete = Growth si todos sus módulos pagos son Growth; Professional si hay alguno Professional`.
3. `base = min(sueltos, paquete)`. Si gana el paquete, mostrar "Ahorras X con el plan". Piso: si hay módulos de pago y `sueltos < Growth ($38)`, línea "Ajuste a mínimo del plan Growth" y la base sube a Growth (pocos módulos sueltos nunca cuestan menos que el plan más barato).
4. Sumar unidades (PlatformAddOns, editables en /ops/precios):

| key | defecto | cantidad |
|---|---|---|
| (ajuste) ExtraLocationFactor | 50% de la base | locales adicionales al primero; vive en PricingSettings, no es un extra |
| unit-vehicle | $10 | vehículos activos (routes) |
| unit-user | $5 | usuarios del equipo sobre 3 |
| unit-clients-100 | $10 | bloques de 100 clientes con contrato sobre 100 |
| corp-support | $150 | 1 si el negocio es corporativo |

5. Si es corporativo y el total < CorporateMinUsd ($350): línea "Ajuste a mínimo corporativo".

### 1.3 Implementación (pago único, USD, Nivel 1)
`150 + Σ(peso Growth × 40) + Σ(peso Professional × 120) + importación (data-import-100: $25 por
cada 100 clientes)`. Locales adicionales: +50% del setup de módulos.

### 1.4 Nivel de país
- `PriceTier`: Tier 1 factor 1.00 (EE. UU., Canadá, Europa Occ.), Tier 2 factor 0.55
  (RD y Latinoamérica), Tier 3 factor 0.40 (reservado). Cada nivel tiene `RoundTo` (defecto $5).
- `CountryTier`: país ISO2 → nivel. Defecto: DO → 2; país sin fila → 1.
- Al final del cálculo: `precio = redondear(USD Nivel 1 × factor, RoundTo)`. Se aplica a
  planes, módulos, unidades, mínimo corporativo, setup y extras (los extras pueden marcarse
  "sin descuento por país", por ejemplo el kit de pantalla que es hardware).
- Para un negocio, el país es `User.Country`. Para un visitante de /servicios, su IP; pero el
  precio que se cobra siempre sale del país del negocio (evita que alguien de EE. UU. pague
  Nivel 2 con una VPN).

### 1.5 Ejemplo Nueva Era (validar con datos reales)
Módulos pagos: Growth (orders, pos, inventory, shipping, board, staff = 6.5 de peso) y los 8
Professional.
- Sueltos: (22.45 + 57.00) × 1.3 = $103.29. Paquete Professional = $95 → base $95.
- + 4 vehículos $40 + 4 bloques de clientes $40 + soporte $150 = $325 → mínimo corporativo $350.
- Nivel 2 (× 0.55, redondeo $5): **US$195/mes**.
- Implementación: 150 + 260 + 1,200 + 125 = $1,735 × 0.55 = **US$955**.

---

## 2. SQL / API (maalca-api)

1. Entidades nuevas (`src/Maalca.Domain/Entities/`):
   - `ModulePricing { Token PK, Weight, UpdatedAt, UpdatedBy }` (token sin fila = peso 1).
   - `PriceTier { Tier PK int, Name, Factor, RoundTo, UpdatedAt, UpdatedBy }`.
   - `CountryTier { Country PK (ISO2), Tier, UpdatedAt, UpdatedBy }`.
   - `PricingSettings` (fila única Id 1): GrowthUsd 38, ProfessionalUsd 95, SoloMarkup 1.3,
     CorporateMinUsd 350, SetupBaseUsd 150, SetupGrowthPerWeightUsd 40, SetupProPerWeightUsd 120,
     IncludedUsers 3, IncludedClients 100, ExtraLocationFactor 0.5.
   - `PlatformAddOn.ApplyTierDiscount bool` (default true; false para hardware).
   - `User.IsCorporate bool` y `User.Locations int` (default 1).
   Migración: `dotnet ef migrations add AddModulePricing`.
2. `seed-module-pricing.sql` idempotente: pesos, tiers, `DO → 2`, settings, los add-ons de 1.2,
   `ApplyTierDiscount = false` para `screen-kit`, `IsCorporate = true` para
   `f-brica-de-agua-y-hielo-nueva-era`. Verificar que su `Country` sea `DO`.
3. `QuoteService` (Application) con una función pura `Price(input) → QuoteResult` usada por:
   - `ComputeForAffiliateAsync(id)`: lee módulos, cortesías, conteos reales (vehículos,
     usuarios, clientes con contrato, locales) y el país del negocio.
   - `ComputeForSelectionAsync(request)`: prospecto (tokens, país, cantidades, corporativo).
   - `GetPublicPriceBookAsync(country)`: planes, módulos sueltos y add-ons ya con el nivel.
   Resultado: líneas `{ group, token, label, qty, unitUsd, totalUsd, isCourtesy }` para
   mensual e implementación, ahorro del paquete, ajuste a mínimo, nivel aplicado, precio
   Nivel 1 de referencia y totales.
4. Endpoints (`Program.cs`): Owner y Support leen; solo Owner escribe.
   - `GET /api/ops/affiliates/{id}/quote`, `POST /api/ops/quote`
   - `GET|PUT /api/ops/pricing/{modules|tiers|countries|settings}`
   - `PATCH /api/ops/affiliates/{id}/corporate` `{ isCorporate, locations }`
   - `GET /api/public/pricing?country=DO` (con cache como platform-addons)
   - `GET /api/space/{slug}/billing/upgrade-price` (precio de Mejorar con el nivel del espacio)
5. **Stripe:** el checkout (`billing/checkout-session`) elige el lookup_key según el nivel del
   país del negocio: Nivel 1 `maalca_growth_monthly` …; Nivel 2 `maalca_growth_monthly_t2`,
   `maalca_growth_yearly_t2`, `maalca_professional_monthly_t2`, `maalca_professional_yearly_t2` y `maalca_setup_fee_t2` (5 prices en total)
   (en USD con el factor aplicado). Si el price `_t2` no existe en Stripe, usar el de Nivel 1 y
   registrar un warning (falla abierto). Crear esos 4 precios en Stripe es paso del usuario
   (o con el conector de Stripe, con su confirmación).
6. `dotnet build`, commit API, push develop.

## 3. Web: /ops (maalca-web)

1. Proxies en `src/app/api/ops/...` igual que platform-addons.
2. `/ops/precios`: secciones nuevas arriba de los extras:
   - Precio por módulo (tier, peso editable, parte, suelto, setup), con la suma de cada bolsa.
   - Niveles (factor, redondeo) y países por nivel; ajustes generales; casilla "sin descuento
     por país" en cada extra.
3. `/ops/cotizador`:
   - Selector "Negocio existente" o "Prospecto".
   - Negocio: `/quote` llena la pestaña Cliente (líneas por grupo, ahorro del paquete,
     unidades, soporte, ajuste a mínimo). Muestra "Precio Nivel 2 (RD)" y el de lista tachado.
   - Prospecto: checkboxes de módulos por tipo de negocio, país, cantidades, corporativo.
   - Se quedan: descuento fundador/familia (ahora en %), hitos, pagado, referido, socio,
     Interno, Copiar propuesta, Renglones factura. Todo en USD.
   - localStorage por negocio `maalca-cotizador-v2:{id|prospecto}`; migrar v1 como Prospecto.
4. `/ops/negocios/{id}`: interruptor Corporativo, número de locales, país y botón **Cotizar**.

## 4. Web: página pública /servicios

### 4.1 Lo que encontré al revisarla (`src/app/servicios/page.tsx`)
- El plan Growth tiene `price: 38` escrito a mano. Professional usa `PRICE_PROFESSIONAL`.
- Constantes muertas en `src/config/pricing.ts`, importadas pero sin uso: `PRICE_PREMIUM 195`,
  `ADDON_SOCIAL_POSTS 75` (la página muestra $249), `ADDON_AI_AGENT 150` (producto que no
  existe), `ADDON_SUPPORT_247`, `ADDON_CUSTOM_INTEGRATION`.
- Un visitante de RD ve precios de EE. UU.
- "Desde $350 / mes" del corporativo es texto fijo.
- Los precios viven en tres lugares (pricing.ts, Stripe, el API para extras) y pueden divergir.
- No se ven los módulos ni su precio: el visitante no sabe qué trae cada plan en dinero.
- `SpaceDashboard` muestra "Mejorar — $38/mes" fijo, sin el nivel del espacio.

### 4.2 Cambios
1. **Una sola fuente:** la página lee `GET /api/public/pricing?country=` y usa `pricing.ts`
   solo como respaldo si el API no responde. Quitar las constantes muertas.
2. **País del visitante:** `servicios/layout.tsx` (server) lee el header `x-vercel-ip-country`
   (sin dependencias) y lo pasa a la página. Selector visible "Estados Unidos / República
   Dominicana" que guarda la elección en localStorage (con try/catch). Nota pequeña: "El precio
   final depende del país de tu negocio".
3. **Tarjetas de planes:** precio del nivel en USD; si es Nivel 2, el de lista tachado al lado
   y la etiqueta "Precio para RD". Setup igual.
4. **Sección nueva "Arma tu plan":** módulos agrupados por tier con su precio suelto;
   checkboxes que suman en vivo y recomiendan el paquete cuando sale más barato ("Con
   Professional ahorras $X"). Botón "Empezar" lleva al plan recomendado.
5. **Corporativo:** "Desde" calculado con CorporateMinUsd y el nivel; lista de lo que se cobra
   por unidad (local, vehículo, usuario, clientes); botón "Cotizar" al formulario de
   levantamiento.
6. **Tabla comparativa y extras** con los mismos precios del nivel.
7. **Dashboard del espacio:** el botón Mejorar usa `/billing/upgrade-price`.

## 5. Verificación (develop → main)
- En /ops/precios la bolsa Growth suma $38 y la Professional $57.
- Nueva Era da US$195/mes y US$955 de implementación (o lo que digan sus datos reales).
- Gift of God Fragances (EE. UU., no corporativo): base = min(sueltos, paquete), sin factor.
- Cambiar un peso, un tier, un factor o un país en /ops y ver /servicios y el cotizador
  recalcular sin desplegar (máx. el tiempo de cache).
- /servicios desde RD: precios Nivel 2 con el de lista tachado; desde EE. UU.: lista.
- Checkout de un espacio DO usa los precios `_t2`; uno de EE. UU., los normales; si falta
  `_t2`, cobra Nivel 1 y deja warning.
- Support ve y no edita. `npx tsc --noEmit` limpio.
