// src/lib/stripe.ts
import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY ?? '';

export const stripe = new Stripe(key || 'sk_placeholder_for_build');

export const STRIPE_CONFIG = {
  priceEntrepreneur: process.env.STRIPE_PRICE_ENTREPRENEUR!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
} as const;

if (!STRIPE_CONFIG.priceEntrepreneur) {
  console.warn('[stripe] STRIPE_PRICE_ENTREPRENEUR not set — checkout will fail');
}
