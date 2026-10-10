# QA cliente – La Catrina (https://maalca.com/la-catrina-elmira)
Fecha: 2026-10-10 · Chrome escritorio 1568x606 · Datos de prueba: nombre "QA – ignorar", tel (607) 555-0100
Estado del código: probado en producción ANTES del deploy de los arreglos del carrito (el sitio aún mostraba el comportamiento anterior).

## Flujo 1 – Pedido (pagar al recoger)
1. Abrir la página → 01-portada-oscuro.jpg
2. "+ Add" en Cheese Dip → toast "Added to cart", barra "View order $7.00" → 02
3. "View order" → carrito → 03 (modo oscuro) y 08 (modo claro): la lista queda en ~60px, el pie ocupa casi todo
4. Nombre + teléfono → "Order and pay at pickup" → 09 "Order sent!" + "Track my order"
5. Enlace /t/… → 10 seguimiento: Recibido/Aceptado/Preparando/Listo, "Pagas en el local al recoger"

## Flujo 2 – Reserva de mesa
1. "Reserve a table" → 04 (sin día preseleccionado, botón "Pick a day and time")
2. Domingo 11 → aparecen horas 09:00–16:30+ → 11
3. 12:00, nombre, teléfono → 12 → "Confirm reservation" → 13 "Reservation sent! pending confirmation"

## Hallazgos
| # | Sev. | Hallazgo |
|---|------|----------|
| 1 | Alta | Carrito: lista de platos aplastada (~60px), pie gigante; en pantallas bajas no se alcanza (03, 08). Corregido en código, pendiente deploy |
| 2 | Alta | Se ofrece "Pay with card" sin Stripe conectado y WhatsApp siempre visible. Corregido en código, pendiente deploy |
| 3 | Media | Tras enviar el pedido el carrito no se vacía: sigue mostrando platos, propina y "Pay with card" activo → riesgo de doble pedido (09) |
| 4 | Media | Modo claro: el botón cambia icono y fondo del body pero la plantilla sigue oscura (05–08); además el aria-label parece invertido |
| 5 | Media | Idioma: toggle "MX ES" pero toda la página en inglés; el seguimiento sí sale en español (10) |
| 6 | Media | Menú sin fotos; platos sin descripción (Jalapeño Poppers); encabezado "Gallery" |
| 7 | Baja | Reserva: ejemplo de teléfono con código 809 (RD); sin día preseleccionado; lista de horas con scroll anidado dentro del modal (11) |
| 8 | Baja | Horas en 24 h (09:00–16:30) para público de EE. UU. |
| 9 | Info | Pedido y reserva "QA – ignorar" quedaron en el panel del dueño: borrar/cancelar |

## Para la página pública de MaalCa (capturas más útiles)
09, 10, 13 (flujo completo), 01 (portada). Repetir 03/08 tras el deploy del arreglo.
