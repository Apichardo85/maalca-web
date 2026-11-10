import { NextRequest } from 'next/server';
import { proxyBilling } from '../_proxy';

/** GET → precio de Growth/Professional con el nivel del país del negocio (botón "Mejorar"). */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return proxyBilling(slug, 'GET', '/upgrade-price');
}
