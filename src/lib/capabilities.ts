import { getPlanLimits, type Plan } from '@/lib/plan-limits';

export interface PlanCapabilities {
  onlinePayments: boolean;
  /** El afiliado ya conectó Stripe (lo informa el API). Sin esto no se ofrece pago con tarjeta. */
  stripeReady?: boolean;
  /** Regla de confianza del negocio: un cliente nuevo paga al recoger solo hasta este total
   *  (null/ausente = sin límite). El checkout lo avisa; el API lo hace cumplir. */
  pickupNewCustomerLimit?: number | null;
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
