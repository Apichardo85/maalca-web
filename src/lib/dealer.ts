// src/lib/dealer.ts
//
// Lógica pura de la vitrina Dealer (autoventas): moneda, millaje, filtros y etiquetas. Sin React ni fetch,
// para que la plantilla pública, la ficha del vehículo y el panel usen exactamente las mismas reglas.
// Reglas de producto (plans/spec-espacio-dealer.md): el precio se guarda en la moneda del negocio; el dueño
// decide si se ve en USD, DOP o ambas (con una tasa que él escribe); el millaje se normaliza a la unidad que
// el dueño eligió. La web NUNCA inventa una tasa: sin tasa válida solo se muestra la moneda base.
import type { DealerPublicSettings, PublicVehicle } from '@/lib/templates/registry';
import { formatPrice } from '@/lib/currency';

export type Currency = 'USD' | 'DOP';
export type Lang = 'es' | 'en';

export const DEFAULT_DEALER_SETTINGS: DealerPublicSettings = {
  priceDisplay: 'base',
  usdToDop: null,
  mileageUnit: 'km',
  showReserved: true,
  financingEnabled: false,
  financingRate: null,
  financingTerms: [24, 36, 48, 60, 72],
  minDownPercent: 20,
  tradeInEnabled: false,
  testDriveEnabled: false,
};

// ── Financiamiento ──────────────────────────────────────────────────────────────

/** Cuota mensual de un préstamo amortizado (tasa anual en %). Misma fórmula que VehicleLeadService en el API. */
export function monthlyPayment(principal: number, annualRatePercent: number, months: number): number {
  if (!(months > 0) || !(principal > 0)) return 0;
  if (!(annualRatePercent > 0)) return Math.round((principal / months) * 100) / 100;
  const r = annualRatePercent / 100 / 12;
  return Math.round(((principal * r) / (1 - Math.pow(1 + r, -months))) * 100) / 100;
}

const KM_PER_MILE = 1.609344;

// ── Moneda ──────────────────────────────────────────────────────────────────────

function validRate(settings: DealerPublicSettings): number | null {
  const r = settings.usdToDop;
  return typeof r === 'number' && Number.isFinite(r) && r >= 1 && r <= 1000 ? r : null;
}

export function convertPrice(amount: number, from: Currency, to: Currency, rate: number | null): number | null {
  if (from === to) return amount;
  if (rate == null) return null;
  return from === 'USD' ? amount * rate : amount / rate;
}

/** Monedas en las que se muestra el precio, en orden. Sin tasa válida (o 'base') = solo la base. */
export function displayCurrencies(base: Currency, settings: DealerPublicSettings): Currency[] {
  const rate = validRate(settings);
  if (rate == null) return [base];
  switch (settings.priceDisplay) {
    case 'usd': return ['USD'];
    case 'dop': return ['DOP'];
    case 'both': return ['USD', 'DOP'];
    default: return [base];
  }
}

/** Moneda "principal" (la que se usa para los rangos de precio del filtro). */
export function primaryCurrency(base: Currency, settings: DealerPublicSettings): Currency {
  return displayCurrencies(base, settings)[0];
}

/** Precio formateado en cada moneda a mostrar; redondeado a entero (los autos no se venden con centavos). */
export function formatVehiclePrices(amount: number, base: Currency, settings: DealerPublicSettings): string[] {
  const rate = validRate(settings);
  return displayCurrencies(base, settings).flatMap((c) => {
    const v = convertPrice(amount, base, c, rate);
    return v == null ? [] : [formatPrice(Math.round(v), c).replace(/\.00$/, '')];
  });
}

/** Cuota/valor en la moneda principal, para filtros y calculadoras. */
export function toPrimary(amount: number, base: Currency, settings: DealerPublicSettings): number {
  return convertPrice(amount, base, primaryCurrency(base, settings), validRate(settings)) ?? amount;
}

export function fromPrimary(amount: number, base: Currency, settings: DealerPublicSettings): number {
  return convertPrice(amount, primaryCurrency(base, settings), base, validRate(settings)) ?? amount;
}

// ── Millaje ─────────────────────────────────────────────────────────────────────

export function convertMileage(value: number, from: 'km' | 'mi', to: 'km' | 'mi'): number {
  if (from === to) return value;
  return from === 'km' ? value / KM_PER_MILE : value * KM_PER_MILE;
}

export function formatMileage(v: PublicVehicle, target: 'km' | 'mi', lang: Lang): string | null {
  if (v.mileage == null) return null;
  const n = Math.round(convertMileage(v.mileage, v.mileageUnit, target));
  return `${n.toLocaleString(lang === 'es' ? 'es-DO' : 'en-US')} ${target}`;
}

// ── Etiquetas ───────────────────────────────────────────────────────────────────

type Dict = Record<string, { es: string; en: string }>;

export const BODY_LABELS: Dict = {
  suv: { es: 'SUV', en: 'SUV' },
  jeep: { es: 'Jeepeta', en: 'Jeep' },
  sedan: { es: 'Sedán', en: 'Sedan' },
  hatchback: { es: 'Hatchback', en: 'Hatchback' },
  crossover: { es: 'Crossover', en: 'Crossover' },
  pickup: { es: 'Camioneta', en: 'Pickup' },
  van: { es: 'Van', en: 'Van' },
  coupe: { es: 'Cupé', en: 'Coupe' },
  bus: { es: 'Bus / minibús', en: 'Bus / minibus' },
  other: { es: 'Otro', en: 'Other' },
};
export const FUEL_LABELS: Dict = {
  gasoline: { es: 'Gasolina', en: 'Gasoline' },
  diesel: { es: 'Diésel', en: 'Diesel' },
  hybrid: { es: 'Híbrido', en: 'Hybrid' },
  electric: { es: 'Eléctrico', en: 'Electric' },
  other: { es: 'Otro', en: 'Other' },
};
export const TRANSMISSION_LABELS: Dict = {
  automatic: { es: 'Automática', en: 'Automatic' },
  manual: { es: 'Manual', en: 'Manual' },
};
export const DRIVETRAIN_LABELS: Dict = {
  fwd: { es: 'Delantera (FWD)', en: 'Front-wheel (FWD)' },
  rwd: { es: 'Trasera (RWD)', en: 'Rear-wheel (RWD)' },
  awd: { es: 'Integral (AWD)', en: 'All-wheel (AWD)' },
  '4x4': { es: '4x4', en: '4x4' },
};
export const CONDITION_LABELS: Dict = {
  new: { es: 'Nuevo', en: 'New' },
  used: { es: 'Usado', en: 'Used' },
  certified: { es: 'Certificado', en: 'Certified' },
};
export const ORIGIN_LABELS: Dict = {
  usa: { es: 'Estados Unidos', en: 'United States' },
  korea: { es: 'Corea', en: 'Korea' },
  japan: { es: 'Japón', en: 'Japan' },
  local: { es: 'Local', en: 'Local' },
  other: { es: 'Otro', en: 'Other' },
};
export const STATUS_LABELS: Dict = {
  available: { es: 'Disponible', en: 'Available' },
  reserved: { es: 'Reservado', en: 'Reserved' },
  sold: { es: 'Vendido', en: 'Sold' },
};

export function label(dict: Dict, key: string | null | undefined, lang: Lang): string | null {
  if (!key) return null;
  return dict[key]?.[lang] ?? key;
}

export function vehicleTitle(v: Pick<PublicVehicle, 'year' | 'make' | 'model' | 'trim'>): string {
  return [v.year, v.make, v.model, v.trim].filter(Boolean).join(' ');
}

export function vehicleDescription(v: PublicVehicle, lang: Lang): string | null {
  return (lang === 'en' ? v.descriptionEn || v.description : v.description) ?? null;
}

// ── WhatsApp ────────────────────────────────────────────────────────────────────

/** Link a WhatsApp con el mensaje ya escrito sobre ESTE vehículo. null si el negocio no tiene número. */
export function vehicleWhatsAppLink(whatsapp: string | null | undefined, text: string): string | null {
  const digits = (whatsapp ?? '').replace(/[^\d]/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

// ── Filtros ─────────────────────────────────────────────────────────────────────

export interface VehicleFilters {
  q: string;
  make: string;
  body: string;
  fuel: string;
  transmission: string;
  condition: string;
  yearMin: string;
  priceMin: string;
  priceMax: string;
  sort: 'featured' | 'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc';
}

export const EMPTY_FILTERS: VehicleFilters = {
  q: '', make: '', body: '', fuel: '', transmission: '', condition: '',
  yearMin: '', priceMin: '', priceMax: '', sort: 'featured',
};

const SORTS = new Set<VehicleFilters['sort']>(['featured', 'price_asc', 'price_desc', 'year_desc', 'mileage_asc']);

export function filtersFromParams(params: URLSearchParams): VehicleFilters {
  const sort = params.get('sort') as VehicleFilters['sort'] | null;
  return {
    q: params.get('q') ?? '',
    make: params.get('make') ?? '',
    body: params.get('body') ?? '',
    fuel: params.get('fuel') ?? '',
    transmission: params.get('trans') ?? '',
    condition: params.get('cond') ?? '',
    yearMin: params.get('year') ?? '',
    priceMin: params.get('pmin') ?? '',
    priceMax: params.get('pmax') ?? '',
    sort: sort && SORTS.has(sort) ? sort : 'featured',
  };
}

export function filtersToParams(f: VehicleFilters): URLSearchParams {
  const p = new URLSearchParams();
  const set = (k: string, v: string) => { if (v) p.set(k, v); };
  set('q', f.q.trim()); set('make', f.make); set('body', f.body); set('fuel', f.fuel);
  set('trans', f.transmission); set('cond', f.condition); set('year', f.yearMin);
  set('pmin', f.priceMin); set('pmax', f.priceMax);
  if (f.sort !== 'featured') p.set('sort', f.sort);
  return p;
}

export function activeFilterCount(f: VehicleFilters): number {
  return [f.q.trim(), f.make, f.body, f.fuel, f.transmission, f.condition, f.yearMin, f.priceMin, f.priceMax].filter(Boolean).length;
}

export type FacetKey = 'make' | 'body' | 'fuel' | 'transmission' | 'condition';

const FACET_PICK: Record<FacetKey, (v: PublicVehicle) => string | null | undefined> = {
  make: (v) => v.make,
  body: (v) => v.bodyType,
  fuel: (v) => v.fuelType,
  transmission: (v) => v.transmission,
  condition: (v) => v.condition,
};

/** Conteo por opción de cada filtro desplegable, con los demás filtros ya aplicados (facets clásicos):
 *  "Toyota (3)" dice cuántos Toyota quedan SI eliges Toyota con el resto de tu búsqueda. El filtro propio
 *  se ignora a sí mismo para que se pueda cambiar de opción sin perder las demás. */
export function facetCounts(
  vehicles: PublicVehicle[],
  f: VehicleFilters,
  base: Currency,
  settings: DealerPublicSettings,
): Record<FacetKey, Record<string, number>> {
  const out = {} as Record<FacetKey, Record<string, number>>;
  (Object.keys(FACET_PICK) as FacetKey[]).forEach((key) => {
    const counts: Record<string, number> = {};
    for (const v of applyFilters(vehicles, { ...f, [key]: '' }, base, settings)) {
      const val = FACET_PICK[key](v);
      if (val) counts[val] = (counts[val] ?? 0) + 1;
    }
    out[key] = counts;
  });
  return out;
}

function num(s: string): number | null {
  const n = Number(s.replace(/[^\d.]/g, ''));
  return s.trim() && Number.isFinite(n) ? n : null;
}

/** Filtra y ordena en el cliente (la lista pública llega con un máximo de 300). Los precios del filtro se
 *  escriben en la moneda principal; se comparan contra el precio del vehículo convertido a esa misma moneda. */
export function applyFilters(
  vehicles: PublicVehicle[],
  f: VehicleFilters,
  base: Currency,
  settings: DealerPublicSettings,
): PublicVehicle[] {
  const q = f.q.trim().toLowerCase();
  const pmin = num(f.priceMin);
  const pmax = num(f.priceMax);
  const yearMin = num(f.yearMin);

  const out = vehicles.filter((v) => {
    if (q) {
      const hay = `${vehicleTitle(v)} ${v.stockNumber ?? ''} ${v.exteriorColor ?? ''}`.toLowerCase();
      if (!q.split(/\s+/).every((t) => hay.includes(t))) return false;
    }
    if (f.make && v.make !== f.make) return false;
    if (f.body && v.bodyType !== f.body) return false;
    if (f.fuel && v.fuelType !== f.fuel) return false;
    if (f.transmission && v.transmission !== f.transmission) return false;
    if (f.condition && v.condition !== f.condition) return false;
    if (yearMin != null && v.year < yearMin) return false;
    if (pmin != null || pmax != null) {
      const p = toPrimary(v.price, base, settings);
      if (pmin != null && p < pmin) return false;
      if (pmax != null && p > pmax) return false;
    }
    return true;
  });

  const price = (v: PublicVehicle) => v.price;
  const km = (v: PublicVehicle) => (v.mileage == null ? Number.POSITIVE_INFINITY : convertMileage(v.mileage, v.mileageUnit, 'km'));
  switch (f.sort) {
    case 'price_asc': return [...out].sort((a, b) => price(a) - price(b));
    case 'price_desc': return [...out].sort((a, b) => price(b) - price(a));
    case 'year_desc': return [...out].sort((a, b) => b.year - a.year);
    case 'mileage_asc': return [...out].sort((a, b) => km(a) - km(b));
    default: return out; // 'featured': el servidor ya devuelve destacados primero
  }
}

/** Valores únicos presentes en el inventario, para que los filtros solo ofrezcan lo que existe. */
export function uniqueValues(vehicles: PublicVehicle[], pick: (v: PublicVehicle) => string | null | undefined): string[] {
  return [...new Set(vehicles.map(pick).filter((x): x is string => !!x))].sort((a, b) => a.localeCompare(b));
}
