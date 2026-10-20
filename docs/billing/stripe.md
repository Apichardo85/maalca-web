# Facturación MaalCa (Stripe)

Dos flujos de Stripe, separados:

| Flujo | Quién paga a quién | Endpoint webhook | Secret en Railway |
|---|---|---|---|
| **Billing** (suscripción) | el negocio → MaalCa | `/api/webhooks/stripe` | `STRIPE_WEBHOOK_SECRET` |
| **Connect** (direct charges) | el cliente → el negocio | `/api/webhooks/stripe-connect` (eventos de cuentas conectadas) | `STRIPE_CONNECT_WEBHOOK_SECRET` |

Al arrancar, el API escribe en los logs de Railway `Stripe: modo TEST` o `Stripe: modo LIVE`, según el
prefijo de `STRIPE_SECRET_KEY` (nunca el valor).

## Planes y precios

Nombres públicos (iguales a /servicios): **Inicial/Starter** (gratis 30 días, interno `Free`),
**Emprendedor/Growth** (interno `Entrepreneur`), **Profesional/Professional** (interno `Enterprise`).

El código resuelve cada precio por **lookup_key**, no por id. Test y live usan el mismo código, y
cambiar de modo no toca variables de precio.

| lookup_key | Monto | Tipo |
|---|---|---|
| `maalca_growth_monthly` | $38 | mensual |
| `maalca_growth_yearly` | $380 | anual |
| `maalca_professional_monthly` | $95 | mensual |
| `maalca_professional_yearly` | $950 | anual |
| `maalca_setup_fee` | $150 | único (solo la primera suscripción) |
| `maalca_extra_screen_monthly` | $15 | mensual, quantity = pantallas extra |
| `maalca_extra_screen_yearly` | $150 | anual, quantity = pantallas extra |

Una suscripción no puede mezclar intervalos, por eso la pantalla extra tiene precio mensual y anual.

**Pantallas incluidas:** Inicial 1 · Emprendedor 1 · Profesional 2, más `Affiliate.ExtraScreens`.
Se aplica al crear una pantalla y al crear o agrandar un muro (402 `SCREEN_LIMIT_REACHED`). El
dashboard ofrece agregar las extra que faltan ahí mismo, con prorrateo cobrado al momento, o lleva
a *Configuración → Elige tu plan* con esas extra ya puestas. Se cuentan las pantallas configuradas
(filas `Screen`); el link principal `/{slug}/board` no cuenta.

## Webhooks (API version `2026-07-29.dahlia`, la de Stripe.net 52.2.0)

**Billing:** `checkout.session.completed`, `customer.subscription.created`,
`customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`,
`invoice.paid`.

- La suscripción manda: plan, intervalo y pantallas extra se sincronizan desde sus items. Un cambio
  hecho en el Billing Portal o en el Dashboard de Stripe también llega a MaalCa.
- `invoice.payment_failed` → `PastDue`. Aparece el aviso amarillo en todo el dashboard con
  "Actualizar tarjeta". `invoice.paid` → vuelve a `Active`.
- Idempotencia: `StripeProcessedEvents` (id del evento). Un reintento de Stripe no se procesa dos
  veces.

**Connect:** `checkout.session.completed` y `account.updated`, con "eventos en cuentas
conectadas". Confirma pedidos, facturas y donaciones aunque el cliente cierre el navegador antes de
volver.

> Si se actualiza Stripe.net, la API version del SDK cambia. Hay que crear los webhooks con la
> nueva versión o `ConstructEvent` rechaza los eventos.

## Probar el ciclo (modo test)

1. Configuración → Elige tu plan → Emprendedor mensual + 1 pantalla extra → pagar con
   `4242 4242 4242 4242`, fecha futura, CVC cualquiera. Se espera: plan Emprendedor, pantallas 0/2,
   setup cobrado una vez.
2. Pantallas extra → subir a 2 → Confirmar. Se espera: límite 3 y factura prorrateada en Stripe.
3. Pago fallido: en el Billing Portal cambiar la tarjeta a `4000 0000 0000 0341` y en Stripe →
   la suscripción → *Advance test clock* / reintentar la factura. Se espera: aviso amarillo; al
   volver a la 4242 y pagar desaparece.
4. Cancelar desde el Billing Portal (inmediato). Se espera: vuelve a Inicial y extras = 0.
5. Pedido Connect con tarjeta y cerrar la pestaña en el Checkout ya pagado: el pedido queda
   pagado igual (webhook Connect).

## Fase B — pasar a live (~10 min)

Requisito: la verificación de identidad de la cuenta de Stripe completa (activar pagos).

1. **Productos y precios en live.** En el Dashboard (modo live) → Workbench → Shell, correr con
   los mismos lookup_keys:
   ```
   stripe prices create --live -d "product_data[name]=MaalCa Growth" --currency=usd --unit-amount=3800 -d "recurring[interval]=month" -d lookup_key=maalca_growth_monthly
   ```
   Repetir para los 7 lookup_keys de la tabla. Para el anual del mismo plan y para las dos
   pantallas extra, usar `--product=<prod_id>` del primero en vez de `product_data`.
2. **Webhooks en live** con `api_version=2026-07-29.dahlia` y los mismos eventos de arriba (el de
   Connect con `connect=true`). Copiar los dos `whsec_` que devuelve.
3. **Railway → maalca-api → Variables:** `STRIPE_SECRET_KEY` = `sk_live_…`,
   `STRIPE_WEBHOOK_SECRET` y `STRIPE_CONNECT_WEBHOOK_SECRET` = los `whsec_` live. Borrar
   `STRIPE_PRICE_ENTREPRENEUR`, que ya no se usa.
4. **Billing Portal:** no requiere pasos. Si la cuenta live no tiene configuración default, el API
   crea una propia (metadata `maalca=1`) al abrir el portal por primera vez. Para que el
   cliente también pueda cambiar de plan desde el portal, se configura en Settings → Billing →
   Customer portal (opcional).
5. Redeploy y revisar los logs: `Stripe: modo LIVE`.
6. Prueba real con una tarjeta propia en Emprendedor mensual y reembolsarla desde el Dashboard.
7. Los negocios que hicieron onboarding de Connect en test tienen `acct_` de test. En live deben
   reconectar desde Configuración → "Conectar cuenta para recibir pagos". Para limpiar el id
   viejo: `UPDATE "Affiliates" SET "StripeConnectAccountId" = NULL, "StripeConnectChargesEnabled" = false, "StripeConnectPayoutsEnabled" = false, "StripeConnectDetailsSubmitted" = false;`
   Lo mismo con `StripeCustomerId` y `StripeSubscriptionId`, que son de test.
