# La Catrina — QA móvil y verificación post-deploy (2026-10-10)

Viewport 440×956, DPR 3 (modo iPhone Pro de DevTools). Cuenta de pruebas: "QA – ignorar", 6075550100.

## Verificado en producción tras el deploy
- Carrito sin Stripe listo: NO aparece "Pay with card" (API devuelve `stripeReady:false`).
- WhatsApp aparece solo si hay número (La Catrina tiene +1 607 442 0037).
- "Order and pay at pickup" siempre disponible.
- Body bloqueado mientras el carrito está abierto; lista y pie con scroll propio (8 platos: 928/973 px y 410/429 px).
- Tras "Order sent" y cerrar el drawer, el carrito queda vacío.
- Settings muestra plan Enterprise `$95/mo` (antes `$38`).
- Stats: "Paid orders 0 / Revenue USD 0.00" con un pedido entregado y no cobrado (correcto).

## Página pública (móvil)
- Sin desbordamiento horizontal. Barra inferior Home/Menu/Order/Info correcta.
- Botones "+ Add" de 32 px y "Show more" de 20 px de alto: por debajo de 44 px recomendados.
- Reserva: hoja inferior, bloquea el scroll del fondo; lista de horas con scroll anidado (176/270 px).
- Horas en 24 h (09:00–17:30), todos los días incluido domingo; placeholder de teléfono `(809) 555-1234`.
- "Powered by MaalCa": decisión de producto → visible en todos los planes (cambio en PublicFooter).

## Panel del dueño (móvil, modo soporte)
- Sin desbordamiento horizontal en Orders, Reservations, Clientes, Stats, Kitchen, Settings.
- Chips de filtro de Reservations por debajo de 32 px de alto.
- Cabecera muestra 🇩🇴 ES para un negocio mexicano.
- Kitchen: el pedido Pending no aparece en "New" hasta aceptarlo; un pedido entregado figura en "Ready".
- Clientes: "QA – ignorar" con 0 visitas (el pedido se entregó antes del arreglo de visitas; no se re-probó).

## Pruebas completadas después (13:00–13:30)
- Pedido completo: Accept → Mark preparing → Collect (Cash) → Mark fulfilled. El aviso "Collect payment before handing over." aparece al preparar sin cobrar.
- Cliente: 1 visita tras entregar (arreglo de visitas OK). Stats: 1 pedido pagado, USD 91.99 (solo lo cobrado).
- Reserva: Seat → Complete OK (aparece "Generate invoice"). Reserva sentada no ofrece Cancel/No-show.
- Correo al cliente (pedido con email): llega "Recibimos tu pedido" desde noreply@maalca.com, en español, con enlace de seguimiento, aunque la página pública estaba en inglés. No se envía correo al aceptar/preparar/entregar (el mismo correo dice que no habrá más).
- Editar plato (Cheese Dip): cambio visible al instante en la página pública; restaurado.
- Imprimir ticket: no se ejecutó (diálogo de impresión); código revisado. Corregido: encabezado usa el nombre del negocio y la hora usa la zona horaria del negocio.

## Hallazgos adicionales
- Catálogo: "English visitors will see the Spanish name and description" aunque el texto base está en inglés; los campos base/EN están invertidos para este negocio.
- Pedidos: falta un paso "Ready/Listo" entre Preparing y Fulfilled; el cliente no recibe aviso de que su pedido está listo (solo el correo inicial).
- Contador de visitas: singular corregido ("1 visita").

## Pendiente
- Cancel y No-show de reservas (requiere otra reserva QA).
- Borrar datos QA (pedidos, reserva, cliente) desde el panel.
- Resend: activar Open/Click tracking, crear webhook y aplicar migración (código listo, ver commits).

## Idioma del negocio (implementado 13:50, pendiente de deploy)
- Campo existente `Affiliate.Language` ("es"|"en") pasa a ser el idioma principal del negocio. Editable en Settings → "Idioma del negocio" (solo acepta es/en).
- Página pública: idioma inicial = idioma del negocio si el visitante no ha elegido uno (localStorage `maalca-language` gana).
- Correos al cliente (pedido recibido/confirmado/listo y reservas solicitada/confirmada/cancelada, más el aviso al negocio) salen en el idioma del negocio.
- Reserva pública: placeholder de teléfono neutro, horas en 12 h cuando el idioma es inglés, fechas sin locale `es-DO`.
- Panel: la bandera junto a "ES" usa `Settings.spanishFlag` del negocio (antes siempre 🇩🇴).
- Catálogo: aviso de "sin traducción" ya no afirma que el texto base está en español.
- Decisión pendiente: el modelo del catálogo asume texto base en español + traducción EN. Para negocios cuyo texto base es inglés (La Catrina) los campos "EN" quedan semánticamente invertidos; arreglarlo bien requiere definir si el texto base sigue el idioma del negocio.
- Después del deploy: poner La Catrina en "English" en Settings y volver a probar un pedido con correo.
