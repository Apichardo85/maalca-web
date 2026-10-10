# QA dueño – La Catrina (https://maalca.com/space/la-catrina-elmira) · 2026-10-10
Acceso: Modo soporte desde /ops/negocios/1f8fcffe-1c15-44b6-ad84-6483e8855ba8 (expira 1:23 p. m.)
Rutas reales: /catalog (Menu), /clientes, /equipo, /board (Screen), /identidad, /settings (Billing), /stats, /modules, /kitchen, /orders, /reservations, /design.

## Flujo validado
Pedido QA: Pending → Accept (listo ~15') → Mark preparing → Mark fulfilled. Seguimiento del cliente (/t/…) se actualizó solo ("¡Tu pedido está listo!").
Reserva QA: Requested → Confirm → Confirmed (botones Seat / No-show / Cancel).
Kitchen: el pedido terminado aparece en la columna Ready.

## Hallazgos
| # | Sev. | Pantalla | Hallazgo |
|---|------|----------|----------|
| 1 | Alta | Stats | Cuenta ingresos sin cobrar: Paid orders 1, Conversion 1.2 %, Revenue USD 7.00 con el pedido "To collect" |
| 2 | Alta | Orders | Se puede pasar a Fulfilled sin cobrar ("Collect $7.00" queda pendiente) |
| 3 | Alta | Clientes | Total visits 0 y Last visit "—" aunque hay 1 pedido cumplido y 1 reserva confirmada. En el detalle sí figura Orders 1 / Spent $7.00 (gasto contado aun sin cobrar) |
| 4 | Media | Billing | Plan Enterprise $38/mo; el acuerdo era $95. Revisar |
| 5 | Media | Billing/Modules | Stripe sin conectar ("Finish setup on Stripe"); Modules promete "real Stripe checkout" y no explica que pickup funciona sin Stripe |
| 6 | Media | Panel | Bandera 🇩🇴 "DO ES" (debe ser MX) y UI en inglés con ES activo |
| 7 | Media | Orders | Filtro "Paid" cuenta pedidos aceptados no pagados |
| 8 | Media | Orders | No hay paso "Ready" (listo) para avisar al cliente antes de entregar |
| 9 | Media | Catálogo | 145 platos "No photo" |
| 10 | Media | Team | Cuenta del dueño (lacatrinamexicanrestaurant11@gmail.com) aparece con invitación pendiente |
| 11 | Baja | Nombres | Menu / Catalog / "145 real items"; Screen / "Screen (Menu Board)" |
| 12 | Baja | Clientes | Teléfono sin formato (6075550100); etiqueta "WhatsApp" aunque el negocio no usa WhatsApp |
| 13 | Baja | Orders | Primer clic por coordenadas no actuó y una pestaña se congeló una vez (no reproducido; Kitchen cargó bien después) |

## No verificado
Vista móvil del panel (el redimensionado del navegador no cambió el viewport), editar un plato, impresión de ticket, Collect, Seat/No-show/Cancel, correos al cliente (QA sin email).

## Limpieza pendiente (datos QA)
Pedido y reserva "QA – ignorar": Orders → "Delete permanently"; Reservations → Cancel; Clientes → detalle → "Permanently delete customer…".
