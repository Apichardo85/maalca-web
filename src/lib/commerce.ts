// Tienda (Retail): atributos de producto, reglas de cantidad, envíos y despacho.
// Espejo de maalca-api: RetailAttributes.cs, PriceListPricing.cs (ShippingPricing) y CommerceDtos.cs.
// El backend es la fuente de verdad (recalcula precios, reglas y envío al crear el pedido); esto solo
// sirve para mostrar lo mismo antes de enviar.

export type HazmatClass = 'limited_quantity';
export type ChokingWarning = 'small_parts' | 'small_ball' | 'marble' | 'balloon';

export interface RetailAttributes {
  brand?: string | null;
  weightOz?: number | null;
  lengthIn?: number | null;
  widthIn?: number | null;
  heightIn?: number | null;
  hazmat?: HazmatClass | null;
  chokingWarning?: ChokingWarning | null;
  variantGroup?: string | null;
  variantLabel?: string | null;
  minOrderQty?: number | null;
  orderQtyMultiple?: number | null;
  maxPerOrder?: number | null;
  /** Precio por cantidad (escalones ordenados por minQty). Espejo de RetailAttributes.TierPrice en el API. */
  volumeTiers?: VolumeTier[] | null;
}

export interface VolumeTier {
  minQty: number;
  price: number;
}

/** Precio por unidad del escalón alcanzado con `qty` unidades (null = no llega a ningún escalón). */
export function tierPriceFor(tiers: VolumeTier[] | null | undefined, qty: number): number | null {
  let price: number | null = null;
  for (const t of [...(tiers ?? [])].sort((a, b) => a.minQty - b.minQty)) if (qty >= t.minQty) price = t.price;
  return price;
}

/** Precio por unidad a cobrar: el menor entre el de la línea (público o de su lista) y el del escalón alcanzado. */
export function unitPriceFor(price: number, tiers: VolumeTier[] | null | undefined, qty: number): number {
  const tp = tierPriceFor(tiers, qty);
  return tp != null && tp < price ? tp : price;
}

/** Siguiente escalón por alcanzar desde `qty` (para "agrega N más y paga $X c/u"). */
export function nextTier(tiers: VolumeTier[] | null | undefined, qty: number): VolumeTier | null {
  return [...(tiers ?? [])].sort((a, b) => a.minQty - b.minQty).find((t) => t.minQty > qty) ?? null;
}

/** Texto de las advertencias CPSIA que deben verse en la venta online de juguetes. */
export const CHOKING_WARNINGS: Record<ChokingWarning, { es: string; en: string }> = {
  small_parts: {
    es: 'ADVERTENCIA: PELIGRO DE ASFIXIA — Contiene piezas pequeñas. No apto para niños menores de 3 años.',
    en: 'WARNING: CHOKING HAZARD — Small parts. Not for children under 3 yrs.',
  },
  small_ball: {
    es: 'ADVERTENCIA: PELIGRO DE ASFIXIA — Este juguete es una pelota pequeña. No apto para niños menores de 3 años.',
    en: 'WARNING: CHOKING HAZARD — This toy is a small ball. Not for children under 3 yrs.',
  },
  marble: {
    es: 'ADVERTENCIA: PELIGRO DE ASFIXIA — Este juguete es una canica. No apto para niños menores de 3 años.',
    en: 'WARNING: CHOKING HAZARD — This toy is a marble. Not for children under 3 yrs.',
  },
  balloon: {
    es: 'ADVERTENCIA: PELIGRO DE ASFIXIA — Niños menores de 8 años pueden asfixiarse con globos desinflados o rotos. Se requiere supervisión de un adulto.',
    en: 'WARNING: CHOKING HAZARD — Children under 8 yrs. can choke or suffocate on uninflated or broken balloons. Adult supervision required.',
  },
};

/** Texto corto de las reglas de cantidad ("Mín. 6 · en múltiplos de 6 · máx. 24"). Vacío si no hay reglas. */
export function qtyRulesLabel(r: RetailAttributes | null | undefined, getText: (es: string, en: string) => string): string {
  if (!r) return '';
  const parts: string[] = [];
  if (r.minOrderQty) parts.push(getText(`Mín. ${r.minOrderQty}`, `Min. ${r.minOrderQty}`));
  if (r.orderQtyMultiple && r.orderQtyMultiple > 1) parts.push(getText(`en múltiplos de ${r.orderQtyMultiple}`, `in multiples of ${r.orderQtyMultiple}`));
  if (r.maxPerOrder) parts.push(getText(`máx. ${r.maxPerOrder} por pedido`, `max. ${r.maxPerOrder} per order`));
  return parts.join(' · ');
}

/** Mismo criterio que RetailAttributes.ValidateQuantity: null = cantidad válida, si no el motivo. */
export function qtyRuleError(
  name: string, qty: number, r: RetailAttributes | null | undefined, getText: (es: string, en: string) => string,
): string | null {
  if (!r) return null;
  if (r.minOrderQty && qty < r.minOrderQty)
    return getText(`"${name}": el pedido mínimo es de ${r.minOrderQty} unidades.`, `"${name}": minimum order is ${r.minOrderQty} units.`);
  if (r.orderQtyMultiple && r.orderQtyMultiple > 1 && qty % r.orderQtyMultiple !== 0)
    return getText(`"${name}": se vende en múltiplos de ${r.orderQtyMultiple}.`, `"${name}": sold in multiples of ${r.orderQtyMultiple}.`);
  if (r.maxPerOrder && qty > r.maxPerOrder)
    return getText(`"${name}": máximo ${r.maxPerOrder} por pedido.`, `"${name}": max. ${r.maxPerOrder} per order.`);
  return null;
}

/** Cuántas unidades suma cada toque de "+": el múltiplo de caja si existe (y el mínimo en el primer toque). */
export function qtyStep(r: RetailAttributes | null | undefined): number {
  return r?.orderQtyMultiple && r.orderQtyMultiple > 1 ? r.orderQtyMultiple : 1;
}

// ── Envíos ────────────────────────────────────────────────────────────────────

export interface PublicShippingMethod {
  id: string;
  name: string;
  nameEn?: string | null;
  price: number;
  freeOverAmount?: number | null;
  minDays?: number | null;
  maxDays?: number | null;
  allowsHazmat: boolean;
  /** "1:6.50; 3:9.99; 10:18" = hasta N lb : precio. Sin valor: costo fijo (price). */
  weightRates?: string | null;
  /** "NJ,NY,PA": estados a los que llega. Sin valor: todo el país. */
  states?: string | null;
}

export interface ShippingMethodRow extends PublicShippingMethod {
  isActive: boolean;
  sortOrder: number;
}

export interface ShippingAddress {
  name?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  zip: string;
}

/** "1:6.50; 3:9.99; 10:18" → [{upToLb, price}] ordenado. Mismo parseo que ShippingPricing.ParseWeightRates en el API. */
export function parseWeightRates(raw?: string | null): { upToLb: number; price: number }[] {
  if (!raw) return [];
  return raw
    .split(/[;\n]/)
    .map((part) => part.split(':'))
    .filter((kv) => kv.length === 2)
    .map(([a, b]) => ({ upToLb: Number(a.trim()), price: Number(b.trim().replace(/^\$/, '')) }))
    .filter((t) => t.upToLb > 0 && t.price >= 0 && Number.isFinite(t.upToLb) && Number.isFinite(t.price))
    .sort((x, y) => x.upToLb - y.upToLb);
}

/** Peso del carrito en onzas (productos sin peso suman 0). */
export function cartWeightOz(cart: { qty: number; item: { rules?: { weightOz?: number | null } | null } }[]): number {
  return cart.reduce((sum, e) => sum + (e.item.rules?.weightOz ?? 0) * e.qty, 0);
}

/** ¿El método llega a ese estado? Sin estados configurados llega a todos. */
export function shippingServesState(m: Pick<PublicShippingMethod, 'states'>, state: string): boolean {
  if (!m.states) return true;
  const s = state.trim().toUpperCase();
  return !!s && m.states.split(',').map((x) => x.trim().toUpperCase()).includes(s);
}

/** Mismo cálculo que ShippingPricing.Cost en el API (gratis desde monto → tarifa por peso → costo fijo). */
export function shippingCost(
  m: Pick<PublicShippingMethod, 'price' | 'freeOverAmount' | 'weightRates'>,
  subtotal: number,
  weightOz = 0,
): number {
  if (m.freeOverAmount && m.freeOverAmount > 0 && subtotal >= m.freeOverAmount) return 0;
  const tiers = parseWeightRates(m.weightRates);
  if (tiers.length > 0 && weightOz > 0) {
    const lb = weightOz / 16;
    const tier = tiers.find((t) => lb <= t.upToLb) ?? tiers[tiers.length - 1];
    return Math.round(tier.price * 100) / 100;
  }
  return Math.max(0, Math.round(m.price * 100) / 100);
}

export function deliveryDaysLabel(m: Pick<PublicShippingMethod, 'minDays' | 'maxDays'>, getText: (es: string, en: string) => string): string {
  const { minDays: a, maxDays: b } = m;
  if (a != null && b != null) return a === b ? getText(`${a} días hábiles`, `${a} business days`) : getText(`${a}–${b} días hábiles`, `${a}–${b} business days`);
  if (b != null) return getText(`hasta ${b} días hábiles`, `up to ${b} business days`);
  if (a != null) return getText(`desde ${a} días hábiles`, `from ${a} business days`);
  return '';
}

export const CARRIERS = [
  { value: 'usps', label: 'USPS' },
  { value: 'ups', label: 'UPS' },
  { value: 'fedex', label: 'FedEx' },
  { value: 'dhl', label: 'DHL' },
  { value: 'other', label: 'Otra / Other' },
] as const;

export function carrierLabel(value: string | null | undefined): string {
  return CARRIERS.find((c) => c.value === value)?.label ?? (value ?? '');
}

export const US_ZIP = /^\d{5}(-\d{4})?$/;

// ── Cantidades en el carrito con reglas (mínimo / múltiplo / máximo) ─────────

/** Unidades que suma un toque de "+": la primera vez llega al mínimo (redondeado al múltiplo); después, un múltiplo. */
export function addStep(currentQty: number, r: RetailAttributes | null | undefined): number {
  const step = qtyStep(r);
  if (currentQty > 0) return step;
  const min = Math.max(1, r?.minOrderQty ?? 1);
  return Math.ceil(Math.max(min, step) / step) * step;
}

/** Unidades que resta un toque de "−": si quedaría por debajo del mínimo, quita la línea entera. */
export function removeStep(currentQty: number, r: RetailAttributes | null | undefined): number {
  const step = qtyStep(r);
  const min = Math.max(1, r?.minOrderQty ?? 1);
  return currentQty - step < min ? currentQty : step;
}

/** ¿El próximo "+" pasaría el máximo por pedido o el stock disponible (null = sin control)? */
export function addWouldExceed(currentQty: number, r: RetailAttributes | null | undefined, stockLeft: number | null): boolean {
  const next = currentQty + addStep(currentQty, r);
  if (r?.maxPerOrder && next > r.maxPerOrder) return true;
  return stockLeft != null && next > stockLeft;
}
