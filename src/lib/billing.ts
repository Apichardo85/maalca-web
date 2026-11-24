'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  PRICE_ENTREPRENEUR, PRICE_PROFESSIONAL, PRICE_ENTREPRENEUR_YEARLY, PRICE_PROFESSIONAL_YEARLY,
  SETUP_FEE, SCREEN_FIRST_MONTHLY, SCREEN_SECOND_MONTHLY, SCREEN_MORE_MONTHLY,
  SCREEN_FIRST_YEARLY, SCREEN_SECOND_YEARLY, SCREEN_MORE_YEARLY,
} from '@/config/pricing';

/** Plan interno (API) ↔ nombre público. Starter = Free (30 días gratis). */
export type ApiPlan = 'Free' | 'Entrepreneur' | 'Enterprise';
export type BillingInterval = 'month' | 'year';
export type PaidPlan = 'Entrepreneur' | 'Enterprise';

/** Tramo de un precio escalonado de Stripe: upTo = hasta qué cantidad aplica (null = sin tope). */
export interface BillingPriceTier { upTo: number | null; amount: number }
export interface BillingPrice { lookupKey: string; amount: number; interval: string | null; tiers?: BillingPriceTier[] | null }

export interface BillingSummary {
  plan: ApiPlan;
  planName: 'Starter' | 'Growth' | 'Professional';
  planStatus: 'Active' | 'PastDue' | 'Canceled' | 'DowngradedLocked';
  interval: BillingInterval | null;
  hasSubscription: boolean;
  includedScreens: number;
  extraScreens: number;
  screenAllowance: number;
  screensUsed: number;
  setupFeeDue: boolean;
  prices: BillingPrice[];
}

/** Nombre público del plan, igual que en /servicios y en los dos idiomas:
 *  Starter · Growth · Professional. Acepta 'free' | 'entrepreneur' | 'enterprise' o el enum del API.
 *  `language` se mantiene en la firma por compatibilidad con los llamadores. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function publicPlanName(plan: string | null | undefined, language: string = 'es'): string {
  const p = String(plan ?? '').toLowerCase();
  if (p === 'enterprise') return 'Professional';
  if (p === 'entrepreneur') return 'Growth';
  return 'Starter';
}

const FALLBACK: Record<string, number> = {
  maalca_growth_monthly: PRICE_ENTREPRENEUR,
  maalca_growth_yearly: PRICE_ENTREPRENEUR_YEARLY,
  maalca_professional_monthly: PRICE_PROFESSIONAL,
  maalca_professional_yearly: PRICE_PROFESSIONAL_YEARLY,
  maalca_setup_fee: SETUP_FEE,
  maalca_screen_monthly: SCREEN_FIRST_MONTHLY,
  maalca_screen_yearly: SCREEN_FIRST_YEARLY,
};

export function planKey(plan: PaidPlan, interval: BillingInterval) {
  const base = plan === 'Enterprise' ? 'maalca_professional' : 'maalca_growth';
  return `${base}_${interval === 'year' ? 'yearly' : 'monthly'}`;
}
/** Pantallas de TV: un solo precio escalonado por pantalla (ningún plan las incluye). */
export const screenKey = (interval: BillingInterval) =>
  interval === 'year' ? 'maalca_screen_yearly' : 'maalca_screen_monthly';

/** Precio por lookup_key: el de Stripe si vino en el resumen, si no el respaldo de config/pricing. */
export function priceOf(summary: BillingSummary | null, key: string): number {
  return summary?.prices.find((p) => p.lookupKey === key)?.amount ?? FALLBACK[key] ?? 0;
}

/** Tramos de respaldo si Stripe todavía no los devuelve (aprobado 2026-11-24): 1.ª $39 · 2.ª $15 ·
 *  desde la 3.ª $10 al mes; anual $390 · $150 · $100. */
function fallbackScreenTiers(key: string): BillingPriceTier[] {
  const yearly = key === 'maalca_screen_yearly';
  return [
    { upTo: 1, amount: yearly ? SCREEN_FIRST_YEARLY : SCREEN_FIRST_MONTHLY },
    { upTo: 2, amount: yearly ? SCREEN_SECOND_YEARLY : SCREEN_SECOND_MONTHLY },
    { upTo: null, amount: yearly ? SCREEN_MORE_YEARLY : SCREEN_MORE_MONTHLY },
  ];
}

/** Tramos del precio por pantalla (Stripe si vinieron, si no el respaldo). */
export function screenTiers(summary: BillingSummary | null, key: string): BillingPriceTier[] {
  const tiers = summary?.prices.find((p) => p.lookupKey === key)?.tiers;
  return tiers && tiers.length > 0 ? tiers : fallbackScreenTiers(key);
}

/** "$39 la 1.ª · $15 la 2.ª · $10 desde la 3.ª" a partir de los tramos (es / en). */
export function screenPriceText(tiers: BillingPriceTier[], per: string, lang: 'es' | 'en'): string {
  const m = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}${per}`;
  let from = 1;
  return tiers.map((t) => {
    const to = t.upTo;
    const label = lang === 'es'
      ? (to === from ? `la ${from}.ª` : to === null ? `desde la ${from}.ª` : `de la ${from}.ª a la ${to}.ª`)
      : (to === from ? `#${from}` : to === null ? `from #${from}` : `#${from}–#${to}`);
    from = (to ?? from) + 1;
    return `${m(t.amount)} ${label}`;
  }).join(' · ');
}

/** Costo de `qty` pantallas con precio graduado (cada tramo cobra sus unidades). */
export function screensCost(summary: BillingSummary | null, key: string, qty: number): number {
  let total = 0;
  let prevUpTo = 0;
  for (const tier of screenTiers(summary, key)) {
    if (qty <= prevUpTo) break;
    const cap = tier.upTo ?? Infinity;
    const units = Math.min(qty, cap) - prevUpTo;
    total += units * tier.amount;
    prevUpTo = cap;
  }
  return total;
}

/** Ningún plan incluye pantallas: se cobran aparte (2026-11-24). Se deja la firma para los llamadores. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const includedScreensFor = (plan: PaidPlan | ApiPlan) => 0;

/** Error del API con su code ({ error: { code, message, ...extra } }). */
export class ApiError extends Error {
  constructor(message: string, public code: string | null, public status: number, public data: Record<string, unknown> | null) {
    super(message);
  }
}

export async function readApiError(res: Response, fallback: string): Promise<ApiError> {
  const data = await res.json().catch(() => null);
  const err = data?.error;
  const message = typeof err === 'string' ? err : err?.message ?? fallback;
  return new ApiError(message, typeof err === 'object' ? err?.code ?? null : null, res.status, typeof err === 'object' ? err : null);
}

export function useBillingSummary(slug: string) {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const res = await fetch(`/api/space/${slug}/billing/summary`, { cache: 'no-store' });
      if (res.ok) setSummary(await res.json());
    } catch {
      // sin resumen la UI usa los precios de respaldo
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { void reload(); }, [reload]);
  return { summary, setSummary, loading, reload };
}

/** Contrata pantallas sin plan (suscripción solo de pantallas, el negocio sigue en Starter):
 *  devuelve el enlace de Stripe Checkout. */
export async function checkoutScreens(slug: string, screens: number, interval: BillingInterval, successPath: string, cancelPath: string, fallbackError: string): Promise<string> {
  const origin = window.location.origin;
  const res = await fetch(`/api/space/${slug}/billing/checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ successUrl: `${origin}${successPath}`, cancelUrl: `${origin}${cancelPath}`, plan: 'none', interval, extraScreens: screens }),
  });
  if (!res.ok) throw await readApiError(res, fallbackError);
  const data = await res.json();
  if (!data?.url) throw new Error(fallbackError);
  return data.url as string;
}

/** Cambia la cantidad de pantallas pagadas; devuelve el resumen actualizado. */
export async function updateExtraScreens(slug: string, extraScreens: number, fallbackError: string): Promise<BillingSummary> {
  const res = await fetch(`/api/space/${slug}/billing/extra-screens`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ extraScreens }),
  });
  if (!res.ok) throw await readApiError(res, fallbackError);
  return res.json();
}
