import type { PublicShippingMethod } from '@/lib/commerce';
import { getPlanLimits, type Plan } from '@/lib/plan-limits';

export interface PlanCapabilities {
  onlinePayments: boolean;
  /** El afiliado ya conectó Stripe (lo informa el API). Sin esto no se ofrece pago con tarjeta. */
  stripeReady?: boolean;
  /** Regla de confianza del negocio: un cliente nuevo paga al recoger solo hasta este total
   *  (null/ausente = sin límite). El checkout lo avisa; el API lo hace cumplir. */
  pickupNewCustomerLimit?: number | null;
  /** Envío a domicilio: métodos activos del negocio (vacío/ausente = no ofrece envío). Solo se ofrece con stripeReady. */
  shippingMethods?: PublicShippingMethod[];
  /** Cuentas de clientes (miembros/mayoristas) activas: la tienda muestra "Iniciar sesión". */
  storeAccounts?: boolean;
  /** Impuesto de venta (%) del negocio; con valor el API lo calcula en cada pedido. Null/ausente = sin configurar. */
  salesTaxRate?: number | null;
  /** El envío también paga impuesto (default true). */
  salesTaxOnShipping?: boolean;
  bookingCalendar: boolean;
  realtimeStock: boolean;
  menuModifiers: boolean;
  brandingFull: boolean;
  customDomain: boolean;
  hidePoweredBy: boolean;
  menuBoard: boolean;
  maxImagesPerItem: number;
}

export function getCapabilities(plan: Plan): PlanCapabilities {
  const l = getPlanLimits(plan);
  return {
    onlinePayments: l.onlinePayments,
    bookingCalendar: l.bookingCalendar,
    realtimeStock: l.realtimeStock,
    menuModifiers: l.menuModifiers,
    brandingFull: l.brandingFull,
    customDomain: l.customDomain,
    hidePoweredBy: l.hidePoweredBy,
    menuBoard: l.menuBoard,
    maxImagesPerItem: l.imagesPerItem,
  };
}
