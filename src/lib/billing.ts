'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  PRICE_ENTREPRENEUR, PRICE_PROFESSIONAL, PRICE_ENTREPRENEUR_YEARLY, PRICE_PROFESSIONAL_YEARLY,
  SETUP_FEE, EXTRA_SCREEN_MONTHLY, EXTRA_SCREEN_YEARLY,
} from '@/config/pricing';

/** Plan interno (API) ↔ nombre público. Starter = Free (30 días gratis). */
export type ApiPlan = 'Free' | 'Entrepreneur' | 'Enterprise';
export type BillingInterval = 'month' | 'year';
export type PaidPlan = 'Entrepreneur' | 'Enterprise';

export interface BillingPrice { lookupKey: string; amount: number; interval: string | null }

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
  maalca_extra_screen_monthly: EXTRA_SCREEN_MONTHLY,
  maalca_extra_screen_yearly: EXTRA_SCREEN_YEARLY,
};

export function planKey(plan: PaidPlan, interval: BillingInterval) {
  const base = plan === 'Enterprise' ? 'maalca_professional' : 'maalca_growth';
  return `${base}_${interval === 'year' ? 'yearly' : 'monthly'}`;
}
export const extraScreenKey = (interval: BillingInterval) =>
  interval === 'year' ? 'maalca_extra_screen_yearly' : 'maalca_extra_screen_monthly';

/** Precio por lookup_key: el de Stripe si vino en el resumen, si no el respaldo de config/pricing. */
export function priceOf(summary: BillingSummary | null, key: string): number {
  return summary?.prices.find((p) => p.lookupKey === key)?.amount ?? FALLBACK[key] ?? 0;
}

export const includedScreensFor = (plan: PaidPlan | ApiPlan) => (plan === 'Enterprise' ? 2 : 1);

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

/** Cambia la cantidad de pantallas extra; devuelve el resumen actualizado. */
export async function updateExtraScreens(slug: string, extraScreens: number, fallbackError: string): Promise<BillingSummary> {
  const res = await fetch(`/api/space/${slug}/billing/extra-screens`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ extraScreens }),
  });
  if (!res.ok) throw await readApiError(res, fallbackError);
  return res.json();
}
