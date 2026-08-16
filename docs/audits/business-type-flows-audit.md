# Auditoría: flujos por tipo de negocio — ¿Frankenstein o producto coherente?

Fecha original: 2026-08-16. Actualizado: 2026-08-16 (mismo día, tras cerrar los 4 puntos priorizados y desplegar a producción).
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

1. **Dos dashboards paralelos siguen vivos.** `/dashboard/[affiliateId]` (legacy, datos mock, predata al sistema real) y `/space/[slug]` (real, conectado a la base de datos) coexisten. Ya se corrigió que el admin de plataforma no caiga ahí por accidente, pero varios afiliados hardcodeados (`the-little-dominican`, `dr-pichardo`, etc.) todavía se loguean directo al dashboard legacy — nadie ha confirmado si eso es intencional o deuda pendiente de migrar. **Sin cambios en esta ronda — sigue abierto.**

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

## Si tuviera que priorizar lo que queda (no es una decisión tomada, es mi lectura)

1. **Dos dashboards paralelos** — ahora es la deuda estructural más grande que sigue en pie. Vale la pena confirmar de una vez si los afiliados hardcodeados en el legacy son intencionales o deuda, antes de que se sumen más.
2. **Split de cuenta en Restaurante POS** — con `TableReservation` ya resuelto, esto es lo siguiente más natural del lado de mesas (aunque `TableReservation` no modela mesas individuales todavía, solo la reserva — asignar mesa física es un paso futuro si hace falta).
3. **Recordatorios automáticos y bloqueo de horario en Barbería** — mejoras de calidad de vida, no bugs ni carencias estructurales.
4. **Firma/aceptación de propuesta en Servicios** — complementa la facturación ya resuelta.

## Actualización — "Agenda" sobrecargada (2026-08-16, segunda ronda)

Resuelto: ver punto #4 de "Señales de Frankenstein transversales" arriba. Nueva entidad `TableReservation` + pantalla `/space/{slug}/reservations` + widget público `TableReservationSection`, separados de `Appointment`. Verificado con `tsc --noEmit` sin regresiones contra la línea base preexistente; revisión manual completa del backend (no hay `dotnet` en este entorno). Pendiente: correr `dotnet build`/`npm run build` localmente antes de pasar a producción, igual que la ronda anterior.

Dime con cuál seguimos, o si quieres que investigue algo de esto con más profundidad antes de tocar código.
