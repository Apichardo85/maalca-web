import { NextRequest } from 'next/server';
import { proxyBilling } from '../_proxy';

/** POST { successUrl, cancelUrl, plan, interval, extraScreens } → Stripe Checkout de la
 *  suscripción (Growth/Professional, mensual/anual, setup la primera vez, pantallas extra). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  return proxyBilling(slug, 'POST', '/checkout-session', body);
}
