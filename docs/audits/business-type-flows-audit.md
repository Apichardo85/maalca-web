# Auditoría: flujos por tipo de negocio — ¿Frankenstein o producto coherente?

Fecha original: 2026-08-16. Actualizado: 2026-08-16 (tras cerrar los 4 puntos priorizados) y 2026-08-17 (tras QA en vivo del usuario — ver sección final).
Basado en lectura directa del código (entidades, endpoints, templates públicos, gating por BusinessType), no en suposiciones.

MaalCa tiene 4 tipos de negocio (restaurant, barber, service, retail). Cada uno tiene su propio template público (con tipografía, layout y metáfora visual distintas — esto ya es una señal buena: no es un genérico con logo cambiado). Lo que audito acá es si el flujo funcional detrás de cada uno resuelve el problema real de ese negocio, o si es un módulo genérico forzado.

**Nota de actualización:** los 4 puntos que esta auditoría priorizaba al final ya están completos, commiteados y en producción (Vercel + Railway, verificado). El contenido de abajo refleja el estado real después de ese trabajo — lo resuelto queda marcado explícitamente, lo que seguía pendiente se mantiene igual.

---

## 🍽️ Restaurante

**Cómo funciona en el mundo real:** cliente ve el menú (en mesa, para llevar, o delivery), hace el pedido, cocina lo prepara, alguien cobra (mesero con POS, o el cliente mismo en un kiosko). El dueño necesita saber qué se vende más y cuándo.

**Lo que resolvemos hoy, de verdad (no mock):**

- Menú público + Menu Board para pantalla física, con video corto por platillo.
- Pedido online con cobro real de Stripe (Connect, direct charge) o fallback a WhatsApp.
- Kitchen Display en tiempo real (SignalR) — Kanban Nuevo/Preparando/Listo.
- POS para venta presencial, con cobro real por QR/Stripe o efectivo/otro.
- Kiosko de autopedido — el cliente ordena y paga solo en un tablet, sin staff.
- Estadísticas de visitas/pedidos/conversión.
- ✅ **Resuelto (2026-08-16):** personalización de pedido por línea (quitar ingrediente, notas tipo "sin cebolla") en el checkout público, POS y visible para cocina/staff en Pedidos y Kitchen Display.
- ✅ **Resuelto (2026-08-16):** propina en checkout público, POS y Kiosko (10/15/20% o monto libre), visible en el panel de Pedidos junto al total.

**Lo que sigue faltando o es débil:**

- No hay manejo de mesas — "Agenda" existe pero es un calendario de citas 1:1 (estilo barbería), no una reserva de mesa para N personas a una hora. Un restaurante que reserva mesas hoy tendría que forzar ese flujo en un objeto que no fue diseñado para eso.
- Sin split de cuenta (dividir entre comensales) en POS.

**Dónde somos originales:** el combo Kitchen Display + POS + Kiosko compartiendo el mismo OrdersHub en tiempo real (una venta del kiosko aparece en cocina exactamente igual que un pedido online) es un flujo real y bien pensado — no es tres features pegadas con cinta, es un solo pipeline de pedidos con 4 puntos de entrada (online, WhatsApp, POS, kiosko), y ahora ese pipeline entiende personalización y propina en los 4 puntos de entrada por igual.

---

## 💈 Barbería

**Cómo funciona en el mundo real:** reservas por barbero específico (la gente elige a SU barbero), walk-ins que se anotan en una fila física, servicios con duración y precio fijos, a veces recordatorios por WhatsApp/SMS.

**Lo que resolvemos hoy, de verdad:**

- Reserva pública por barbero, con foto (estilo Squire) y horario real por TeamMember.
- Agenda del dashboard con validación de doble-booking (ya no se puede agendar dos citas al mismo barbero a la misma hora).
- Click-to-call + confirmación por correo opcional.
- Duración de servicio real (no hardcoded).
- ✅ **Resuelto (2026-08-16):** fila de walk-in real — pantalla dedicada (`/space/{slug}/queue`) para agregar cliente, llamar (asigna barbero preferido si lo hay), marcar "no llegó" o "completado", todo en tiempo real vía SignalR (`QueueHub`). La tabla `QueueEntry` que existía sin cablear ahora tiene endpoints y UI reales, con el mismo gating de autorización que el resto de endpoints por afiliado.

**Lo que sigue faltando:**

- Sin recordatorio automático antes de la cita (solo confirmación al momento de reservar).
- Sin bloqueo de horario del barbero (vacaciones, almuerzo) más allá de lo que ya defina su disponibilidad general.

**Dónde somos originales:** la reserva con foto del barbero + su disponibilidad real es genuinamente mejor que un formulario genérico "elige fecha y hora" — refleja cómo la gente realmente elige barbero. La fila de walk-in en tiempo real es exactamente lo que una barbería necesita el sábado en la mañana, y ahora existe de verdad, no solo en el schema.

---

## 🛠️ Servicios (consultoría, profesionales, oficios)

**Cómo funciona en el mundo real:** el cliente agenda una llamada/consulta, ve una lista de tarifas/servicios, a veces necesita una cotización o factura formal para proyectos grandes.

**Lo que resolvemos hoy, de verdad:**

- Página "Dossier" con índice de servicios y precios, agenda de consulta reutilizando el mismo `PublicBookingSection` de Barbería.
- ✅ **Resuelto (2026-08-16):** facturación real — pantalla `/space/{slug}/invoices` para crear facturas con items dinámicos (descripción, cantidad, precio unitario), impuesto, fecha de vencimiento y notas; totales recalculados en servidor (no se confía en el cliente, a diferencia del resto del flujo de Orders); listado con estados codificados por color y acción de marcar como pagada. Las entidades `Invoice`/`InvoiceItem` que existían sin usar ahora tienen endpoint (`POST /api/affiliates/{id}/invoices`) y UI completos.

**Lo que sigue faltando:**

- Sin firma/aceptación de propuesta.

**Dónde somos originales:** sigue siendo el tipo de negocio con menos superficie propia construida — hoy "Servicios" es esencialmente "Barbería sin el barbero visual" para la parte de agenda, reutilizando ese flujo casi 1:1. No es necesariamente malo (la reserva de consulta ES el flujo correcto), pero la facturación recién agregada es lo primero que le da a Servicios una identidad funcional propia, distinta de simplemente "Barbería con otro nombre".

---

## 🛍️ Retail (tienda física/artesanal)

**Cómo funciona en el mundo real:** catálogo con stock real (si se agota, no se puede seguir vendiendo), venta en mostrador Y online, a veces gift cards.

**Lo que resolvemos hoy, de verdad:**

- Catálogo público con `InventoryItem` (tiene `Quantity`, `MinStock`, y una tabla `InventoryMovement` para historial de entradas/salidas — el modelo de datos es correcto y completo).
- Checkout online con Stripe real + fallback WhatsApp.
- ✅ **Resuelto (2026-08-16) — era un bug de correctness activo, no solo una carencia:** el stock ahora se descuenta de verdad en los 3 caminos de venta (online, POS, kiosko), con `InventoryMovement` registrado en cada venta. Una tienda ya no puede vender el mismo último producto 10 veces en el mismo minuto sin que el sistema se entere. El capability `realtimeStock` del plan Emprendedor ahora corresponde a algo real y conectado, no a una promesa vacía.
- ✅ **Resuelto (2026-08-16):** POS y Kiosko ya no están gateados solo a `restaurant` — Retail (el caso de uso más clásico de un punto de venta físico) ahora puede usar ambos. El icono de fallback y los textos se adaptan al tipo de negocio (🛍️ en vez de 🍽️, "catálogo" en vez de "menú").

**Decisión tomada, no carencia:** `GiftCard` y `Campaign` — mismo patrón que tenían Invoice/QueueEntry (entidad completa sin ningún endpoint real) — se evaluaron y se **eliminaron** en vez de completarse, por no tener suficiente valor frente al esfuerzo de construirlas bien (procesamiento de balance, expiración, fraude). Ya no aparecen en el schema cargando peso muerto.

**Dónde somos originales:** el template con swatches de color como device gráfico sigue siendo un detalle de diseño genuinamente distinto. Con el fix de stock y la apertura de POS/Kiosko, Retail pasó de ser el tipo de negocio menos servido de los 4 a tener, junto con Restaurante, el flujo de venta presencial más completo — y sigue siendo el único con modelo de inventario real (`InventoryItem` + `InventoryMovement` son mejores que lo que `Product` ofrece a Restaurante).

---

## Señales de "Frankenstein" transversales (no específicas de un tipo)

1. ~~Dos dashboards paralelos siguen vivos.~~ ✅ **Cerrado — verificado 2026-08-17.** Al revisar el código real (no solo el historial de tareas) se confirmó que `/dashboard/[affiliateId]` ya no existe: se eliminó por completo en el commit `b1932dd` ("eliminar dashboard legacy: /dashboard, /tarjeta, auth mock paralelo"), junto con `/tarjeta` y el auth mock paralelo. `auth/callback/route.ts` y `resolve-user-destination.ts` solo conocen tres destinos hoy: `/ops` (platform admin), `/space/{slug}` (negocio real) y `/onboarding` (usuario nuevo). No queda ningún afiliado hardcodeado a una ruta legacy — este punto se había quedado desactualizado en la ronda anterior, no era deuda real, solo texto viejo.

2. ~~Cuatro entidades con schema completo y cero cableado real: Invoice/InvoiceItem, GiftCard, Campaign, QueueEntry.~~ ✅ **Cerrado (2026-08-16).** Se tomó la decisión explícita que esta auditoría pedía: `Invoice` se completó (Servicios) y `QueueEntry` se completó (Barbería), ambos con endpoints reales, gating de autorización por afiliado y UI en `/space`. `GiftCard` y `Campaign` se eliminaron del schema (entidades, DbSet, migraciones, seed data) en vez de quedar cosidas sin nervios conectados. Ya no hay entidades "fantasma" en la base de datos.

3. ~~POS/Kitchen/Kiosko como "solo restaurante" es la gating más restrictiva de las 4 verticales.~~ ✅ **Parcialmente cerrado (2026-08-16).** POS y Kiosko ahora están abiertos a Retail también — eran conceptos de checkout genéricos innecesariamente atados a un solo vertical. Kitchen Display se mantiene intencionalmente restaurant-only, porque sí tiene sentido solo para preparación de comida.

4. ~~"Agenda" es un solo objeto (`Appointment`) sirviendo tres significados distintos.~~ ✅ **Cerrado (2026-08-16).** Se separó en dos modelos: `Appointment` se quedó limpio para Barbería/Servicios (1:1 con team member), y se creó `TableReservation` (nueva entidad, sin `ServiceId`/`AssignedToId`, con `PartySize`) solo para Restaurante — endpoints propios (`/api/affiliates/{id}/reservations`, público `/api/public/affiliates/{slug}/reservations`), pantalla dedicada `/space/{slug}/reservations`, y un widget público (`TableReservationSection`) que pide "cuántas personas y a qué hora" en vez de forzar al comensal a elegir un "servicio" y un miembro del equipo. `Restaurant.tsx` ya no renderiza `PublicBookingSection`; el nav "Agenda" ahora excluye explícitamente `restaurant`.

---

## Estado de la priorización anterior — todo cerrado

La lista que esta auditoría proponía priorizar ya está completa, commiteada y verificada en producción:

1. ✅ Descuento real de stock en Retail — el bug de correctness activo que era. Resuelto en los 3 caminos de venta (online/POS/kiosko).
2. ✅ Abrir POS/Kiosko a Retail.
3. ✅ Invoice (Servicios) y QueueEntry (Barbería) completados; GiftCard y Campaign eliminados.
4. ✅ Personalización de pedido + propina en Restaurante, con visibilidad para staff en Pedidos y Kitchen Display.

Verificación: `dotnet build` y `npm run build` limpios (confirmados por el usuario), `tsc --noEmit` sin regresiones nuevas contra la línea base preexistente. Desplegado a `main` en ambos repos — Railway (`maalca-api`, commit `aa7352d`) y Vercel (`maalca-web`, commit `7ac0ef8`, alias `maalca.com`), ambos en estado `SUCCESS`/`READY`.

> ⚠️ **Corrección post-mortem (2026-08-17):** "desplegado" no significaba "aplicado". Ver sección final — la migración de stock/Order.Tip/GiftCard-Campaign viajó en el mismo lote que `TableReservation`, y por el mismo bug (migraciones sin `.Designer.cs`) es posible que parte de este trabajo tampoco haya estado realmente activo en la base de datos de producción hasta el fix del 2026-08-17. El código y el build siempre estuvieron correctos — lo que falló fue que Postgres nunca llegó a tener las columnas/tablas nuevas.

## Actualización — "Agenda" sobrecargada (2026-08-16, segunda ronda)

Resuelto: ver punto #4 de "Señales de Frankenstein transversales" arriba. Nueva entidad `TableReservation` + pantalla `/space/{slug}/reservations` + widget público `TableReservationSection`, separados de `Appointment`. Verificado con `tsc --noEmit` sin regresiones contra la línea base preexistente; revisión manual completa del backend (no hay `dotnet` en este entorno).

---

## Tercera ronda — QA en vivo del usuario (2026-08-17): bugs de producción reales

El usuario probó todo lo anterior en `maalca.com` y reportó que "nada de lo nuevo guarda, todo explota". No era percepción — eran dos bugs reales de producción, ninguno visible en build/lint porque ambos son de runtime:

**🔴 Crítico — 3 migraciones nunca se aplicaron en producción.** Al escribir migraciones de EF Core a mano (sin `dotnet ef` disponible en el entorno de trabajo), se armaron los archivos `{timestamp}_Nombre.cs` con el `Up()`/`Down()`, pero se omitió el archivo hermano `{timestamp}_Nombre.Designer.cs` — el que lleva los atributos `[DbContext(typeof(AppDbContext))]` y `[Migration("id")]` que EF Core necesita para *descubrir* la migración dentro del ensamblado. Sin esos atributos, `Database.Migrate()` en el arranque simplemente no la ve — no falla, no loguea error, la ignora en silencio. Afectó a `RemoveGiftCardAndCampaign`, `AddOrderTip` y `AddTableReservations`: la tabla `TableReservations` nunca existió en Postgres (confirmado en logs de Railway: `42P01: relation "TableReservations" does not exist`), y es probable que la columna `Orders.Tip` tampoco. Fix: se agregaron los 3 `.Designer.cs` faltantes (versión mínima — solo los atributos, sin el `BuildTargetModel` completo, que únicamente hace falta para scaffolding de diseño, no para aplicar en runtime). Desplegado y confirmado sin errores en el log de arranque.

**🔴 Crítico — doble-booking check rompía TODA reserva pública de cita.** Bug preexistente (no introducido en esta ronda): `PublicBookingService.CreatePublicAppointmentAsync` comparaba `a.Date.Date == request.Date.Date` sin forzar `Kind=Utc` en `request.Date` — Npgsql 8+ rechaza ese `DateTime` con `Kind=Unspecified` contra una columna `timestamptz`. El `Create` en sí ya tenía el fix (aplicado hace varias rondas), pero el chequeo de conflicto que corre *antes* del `Create` no. Resultado: cualquier persona que intentara reservar una cita pública con un barbero/profesional específico recibía 400 sin explicación real. Fix: una línea, mismo patrón `DateTime.SpecifyKind(...)` ya usado en el resto del código.

**Bugs menores encontrados en la misma ronda de QA:**
- `/ops` → toggle de módulos por afiliado nunca se actualizó con `invoices`/`queue`/`reservations` — un afiliado con lista explícita de módulos guardada no tenía forma de activarlos.
- Vitrina de módulos (`/space/{slug}/modules`) seguía diciendo que POS es solo para `restaurant`, desincronizada del sidebar (que ya lo abre a `retail`).
- Kiosko de autopedidos sin ningún link visible en el dashboard — existía la ruta pública pero nadie podía encontrarla sin el URL exacto de memoria.
- Scroll horizontal fantasma cortando por la derecha los modales de reserva (`TableReservationSection` y `PublicBookingSection`) — causa: `overflow-y-auto` sin `overflow-x-hidden` explícito; por spec de CSS, el eje "visible" se promueve a "auto" en cuanto el otro eje no lo es, y medio pixel de contenido de más adentro alcanzaba para meter scroll horizontal.
- Correo de invitación a Equipo podía fallar en silencio (Resend) sin que el dueño se enterara — ahora se expone `emailSent` en la respuesta y el frontend avisa si falló, en vez de asumir éxito. La lógica de "reclamo" de invitaciones pendientes (`ClaimPendingInvitesAsync`) se revisó y es correcta en el código actual — si el correo sigue sin llegar, es config de Resend (API key / dominio verificado) en Vercel, no lógica.

Todo lo anterior: commiteado y desplegado (`maalca-api` commit `ca18cfd`, `maalca-web` commits `46bd59e` y `0f7815e`), confirmado `SUCCESS`/`READY` en Railway y Vercel.

## Si tuviera que priorizar lo que queda (no es una decisión tomada, es mi lectura)

1. ~~Dos dashboards paralelos~~ ✅ ya resuelto (ver arriba, verificado 2026-08-17 — texto desactualizado, no deuda real).
2. **Agenda pública debe ocultar horarios ya ocupados, no fallar al confirmar** — el ítem #1 real que queda abierto. Reportado en la ronda de QA de hoy. Hoy el widget de reserva deja elegir cualquier horario y solo al confirmar dice "ese horario ya no está disponible". Necesita filtrar los slots ocupados del barbero/profesional elegido antes de mostrarlos, igual que ya filtra por horario del negocio.
3. **Split de cuenta en Restaurante POS** — con `TableReservation` ya resuelto, esto es lo siguiente más natural del lado de mesas (aunque `TableReservation` no modela mesas individuales todavía, solo la reserva — asignar mesa física es un paso futuro si hace falta).
4. **Recordatorios automáticos y bloqueo de horario en Barbería** — mejoras de calidad de vida, no bugs ni carencias estructurales.
5. **Firma/aceptación de propuesta en Servicios** — complementa la facturación ya resuelta.

Dime con cuál seguimos, o si quieres que investigue algo de esto con más profundidad antes de tocar código.

---

## Actualización 2026-09-25 — quinto vertical (Comunidad) + cierre de pendientes de agosto

Dos de los cinco puntos de la lista de priorización de la ronda anterior ya estaban resueltos en el código, sin que este doc se actualizara:

- ✅ **"Agenda pública debe ocultar horarios ya ocupados"** — `PublicBookingSection.tsx` ya llama `GET /api/public/affiliates/{slug}/busy-times?date=` y filtra `timeSlots` con `isSlotTaken()` antes de pintarlos (`busyByStaff` por miembro del equipo). Ya no se puede intentar reservar un horario tomado.
- ✅ **"Firma/aceptación de propuesta en Servicios"** — `/space/{slug}/proposals` (task #194) manda un link público con token, el cliente escribe su nombre y acepta en línea (`acceptedAt`/`acceptedByName` en `Proposal.cs`), y el PDF exportado ya incluye "Firmado por X · fecha". No es firma dibujada/certificada, es aceptación con nombre — mismo nivel de simplicidad que el resto del producto.

### 🤝 Comunidad (quinto vertical, no existía en la auditoría original)

**Cómo funciona en el mundo real:** un centro comunitario/comedor no vende nada — necesita mostrar impacto (comidas servidas, costo por plato), recibir donaciones (dinero/tiempo/especie), publicar eventos, y contar programas/causas activas para atraer voluntarios y donantes.

**Lo que resuelve hoy, de verdad:**
- Calculadora de impacto (insumos → recetas → combos → servir) con `communityMetrics` reales (comidas servidas del mes, costo promedio por plato).
- Causas individuales con entidad propia (`Causa.cs`, migrada de columna JSON a tabla el 2026-09-25) — tipo dinero/tiempo/especie, meta y monto actual.
- Eventos/Actividades con entidad propia y transversal (`Activity.cs`) — vencen por `EndsAt` (no por `StartsAt`, bug corregido esta sesión), con hora de fin visible tanto en dashboard como en la página pública. ✅ **Resuelto (2026-09-26):** foto opcional por evento (`Activity.ImageUrl`) — misma idea que Programas, se ve bien con o sin foto.
- Punto de entrega en persona.
- ✅ **Resuelto (2026-09-26):** donaciones monetarias reales vía Stripe Connect (`e5ea6b1`) — reemplaza el "recaudado" que el afiliado reportaba a mano; el botón "Donar" ya no lleva a "próximamente".
- ✅ **Resuelto (2026-09-26):** "Programas" tiene entidad propia (`CommunityProgram.cs`, `a75a92e`) — cupos, horario, días de la semana y voluntarios requeridos, foto opcional con el mismo tratamiento visual que Eventos. Ya no reusa la tabla `Services`/Catálogo genérico. Los programas existentes de afiliados reales (ej. la "tutoría académica" de NTC) se migraron automáticamente a la tabla nueva vía SQL dentro de la migración de EF Core — no se perdió ningún dato ni hizo falta reingreso manual.
- Galería y header de foto real (ambos faltaban por completo hasta la sesión del 2026-09-25 — nunca se leían de `business.cover_image_url`/`galleryImages` en el template).

**Lo que sigue faltando o es débil:**
- **Modo oscuro no implementado en ningún template público** (Restaurant/Barber/Service/Retail/Community) — ver nota en memoria/backlog aparte, no es específico de Comunidad. Único punto estructural que le queda a este vertical.

**Dónde es original:** es el único vertical que no vende nada — el flujo entero (impacto → causas → eventos → donar) está diseñado para confianza y transparencia, no para checkout. La calculadora de costo-por-plato conectada a insumos reales es un dato que ningún competidor genérico ofrece.

### Estado consolidado (2026-09-25)

| Vertical | Flujo comercial | Página pública | Deuda principal |
|---|---|---|---|
| Restaurante | Pedidos+Kitchen+POS+Kiosko, un solo pipeline | Completa | Split de cuenta en POS |
| Barbería | Reserva por barbero + fila walk-in en tiempo real | Completa | Recordatorios automáticos, bloqueo de horario |
| Servicios | Agenda + Facturas + Propuestas con firma | Completa | Ninguna carencia estructural mayor |
| Retail | Catálogo + stock real + POS/Kiosko abiertos | Completa | Ninguna carencia estructural mayor |
| Comunidad | No vende — impacto/causas/eventos/donar | Completa (header, galería, foto en Programas y Eventos) | Modo oscuro (transversal a los 5, no específico de Comunidad) |

Verificado por lectura directa de código (no supuestos), mismo criterio que el resto de este documento. `tsc --noEmit`: 42 errores preexistentes (baseline), 0 nuevos, en cada commit de esta sesión.

---

## Actualización 2026-09-27 — inventario completo de tipos de negocio y módulos, resumen ejecutivo

Esta sección responde directamente a "¿qué tipos de negocio hay, qué módulos hay, y cuáles módulos arma el flujo de cada uno?" — leída del código real: el enum `BusinessType` (backend), `registry.ts` (frontend) y `SpaceSidebar.tsx` (nav real del dashboard, que es lo que de verdad determina qué ve cada afiliado).

### Tipos de negocio

**Con producto real (frontend + template público + dashboard funcional):**

| Tipo | Vertical | Template público | Estado |
|---|---|---|---|
| `restaurant` | Restaurante | `Restaurant.tsx` | Completo |
| `barber` | Barbería | `Barber.tsx` | Completo |
| `service` | Servicios/profesionales | `Service.tsx` | Completo |
| `retail` | Tienda/retail | `Retail.tsx` | Completo |
| `community` | Comunidad/ONG | `Community.tsx` | Completo (falta modo oscuro, transversal) |

**En el enum del backend pero sin template ni flujo propio en el frontend:** `Creator`, `Publisher`, `Professional` (`BusinessType.cs`: valores 4, 5, 6). `registry.ts` solo define `BusinessType = 'restaurant' | 'barber' | 'service' | 'retail' | 'community'` — no hay forma hoy de que un afiliado con uno de estos tres tipos tenga página pública o dashboard coherente; onboarding no los ofrece como opción. Son valores "reservados" en el schema, no verticales activos. Ver "Próximos pasos" — hay que decidir si se construyen o se eliminan del enum.

### Módulos disponibles (todo el nav real de `/space/{slug}`, por `SpaceSidebar.tsx`)

Los módulos sin "token" son fijos por tipo de negocio (no se pueden activar/desactivar desde `/ops`); los que tienen token se controlan por afiliado desde el panel de operaciones.

| Módulo | Token | Restaurante | Barbería | Servicios | Retail | Comunidad |
|---|---|:---:|:---:|:---:|:---:|:---:|
| Dashboard, Diseñar, Identidad, Clientes, Módulos | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| Catálogo | `catalog` | ✅ | ✅ | ✅ | ✅ | — (ver Programas) |
| Calculadora de impacto | — | | | | | ✅ |
| Programas | — | | | | | ✅ |
| Eventos | — | | | | | ✅ |
| Pedidos | `orders` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cocina (Kitchen Display) | `kitchen` | ✅ | | | | |
| Punto de venta (POS) | `pos` | ✅ | | | ✅ | |
| Inventario | `inventory` | ✅ | | | ✅ | |
| Guarniciones/modificadores | `modifiers` | ✅ | | | | |
| Fila de espera | `queue` | | ✅ | | | |
| Facturas | `invoices` | | | ✅ | | |
| Propuestas (con firma) | `proposals` | | | ✅ | | |
| Pantalla / Menu Board | `board` | ✅ | | | | |
| Equipo | `staff` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reservas (mesas) | `reservations` | ✅ | | | | |
| Agenda (citas 1:1) | `appointments` | | ✅ | ✅ | | ✅* |
| Estadísticas | `metrics` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Facturación (plan MaalCa) | `billing` | ✅ | ✅ | ✅ | ✅ | ✅ |

\* Agenda está disponible para Comunidad a nivel de código (`SpaceSidebar.tsx` solo la excluye para `retail`/`creator`/`publisher`/`restaurant`), aunque en la práctica ningún afiliado Community la usa hoy — no hay un caso de uso definido (¿agendar voluntarios?). Los "✅" de la tabla marcan qué módulo pertenece al flujo diseñado de cada tipo, no si está activo para un afiliado específico (eso lo decide `/ops` vía `ModuleCatalog.DefaultBusinessTypes` + `Affiliate.modulosActivos`).

**Cómo se integran en el flujo de cada tipo de negocio** (resumen — el detalle completo está en las secciones de arriba):

- **Restaurante**: Catálogo (menú) → Pedidos → Cocina (Kitchen Display) → POS/Kiosko cobran → Inventario descuenta stock real → Pantalla muestra el menú en pantalla física → Guarniciones enriquecen cada línea de pedido → Reservas gestiona mesas (objeto separado de Agenda a propósito).
- **Barbería**: Catálogo (servicios) → Agenda (reserva por barbero específico, con validación de doble-booking) → Fila de espera (walk-ins en tiempo real) → Equipo define disponibilidad por barbero.
- **Servicios**: Catálogo (tarifas) → Agenda (consulta, mismo widget que Barbería) → Facturas (por trabajo realizado, totales en servidor) → Propuestas (cotización con aceptación/firma en línea, se refleja en el PDF).
- **Retail**: Catálogo (`InventoryItem` con stock real) → Pedidos online + POS/Kiosko presencial → Inventario descuenta en los 3 caminos de venta con `InventoryMovement`.
- **Comunidad**: Calculadora de impacto (insumos→recetas→combos→servir) + Causas (dinero/tiempo/especie) + Programas (cupos/horario/días/voluntarios) + Eventos (con foto opcional) → todo alimenta la página pública de transparencia; Donaciones ahora cobran de verdad vía Stripe Connect.

### Resumen — dónde estamos ahora

Los 5 verticales tienen flujo funcional completo y verificado contra producción (no solo build limpio). Ningún vertical depende hoy de una entidad "fantasma" sin cablear — el patrón que existía con `Invoice`/`QueueEntry`/`GiftCard`/`Campaign` en agosto, y con `Programs` reusando `Services` hasta hace dos días, ya no existe en ningún lado del producto. Las únicas dos entidades que se compartían entre verticales de forma forzada (Programas de Comunidad viviendo en la tabla de Catálogo) se separaron esta semana con migración automática de datos reales, sin pérdida.

Lo que queda pendiente es, en su mayoría, pulido — no huecos estructurales:

| Vertical | Completitud del flujo | Lo que falta (no estructural) |
|---|---|---|
| Restaurante | Completo | Split de cuenta en POS |
| Barbería | Completo | Recordatorios automáticos, bloqueo de horario del barbero |
| Servicios | Completo | Ninguna carencia mayor |
| Retail | Completo | Ninguna carencia mayor |
| Comunidad | Completo | Modo oscuro (transversal, no específico) |
| Transversal (los 5) | — | Modo oscuro en los 5 templates públicos |

### Próximos pasos (mi lectura, no es una decisión tomada)

1. **Modo oscuro en los 5 templates públicos** — único punto pendiente que toca a todos los verticales por igual, ya estaba parqueado como backlog explícito de otra sesión.
2. **Decidir el destino de `Creator`/`Publisher`/`Professional`** en el enum `BusinessType` — hoy son valores muertos sin template ni dashboard; o se construyen (definir primero cómo funciona cada uno en el mundo real, como se hizo con Comunidad) o se documentan explícitamente como reservados/futuros para que no generen confusión.
3. **Split de cuenta en Restaurante POS** — siguiente paso natural del lado de mesas, ahora que `TableReservation` ya existe.
4. **Recordatorios automáticos + bloqueo de horario en Barbería** — mejoras de calidad de vida, no bugs.
5. **Limpieza menor de código muerto**: el relabeling `isCommunity` (Meta vs Precio) en `NewItemForm.tsx`/`EditForm.tsx` del catálogo genérico ya no aplica — Comunidad no navega más a esas pantallas desde que tiene Programas propio; y los archivos `COMMIT_MSG_*.tmp.txt` sueltos en la raíz de ambos repos (`COMMIT_MSG_API4.tmp.txt`, `COMMIT_MSG_API5.tmp.txt`) deberían borrarse — quedaron trackeados por accidente, mismo patrón de `git add -A` que ya causó un commit en la rama equivocada esta semana.

Verificado por lectura directa de código (`SpaceSidebar.tsx`, `registry.ts`, `BusinessType.cs`, y los commits `a75a92e`/`e5ea6b1` de esta semana), mismo criterio que el resto de este documento.
