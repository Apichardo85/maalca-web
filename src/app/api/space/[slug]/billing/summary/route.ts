import { NextRequest } from 'next/server';
import { proxyBilling } from '../_proxy';

/** GET → plan, estado, pantallas (incluidas/extra/usadas) y precios vigentes de Stripe. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return proxyBilling(slug, 'GET', '/summary');
}
