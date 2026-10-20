import { NextRequest } from 'next/server';
import { proxyBilling } from '../_proxy';

/** PUT { extraScreens } → cambia la cantidad de pantallas extra de la suscripción. */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  return proxyBilling(slug, 'PUT', '/extra-screens', body);
}
