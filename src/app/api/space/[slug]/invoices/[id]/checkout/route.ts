import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Pago real de factura (Stripe Connect) — mismo patrón que pos/checkout: proxya a
// POST /api/affiliates/{id}/invoices/{id}/checkout, que crea una Checkout Session (direct
// charge contra la cuenta Connect del negocio) y devuelve la URL para copiar/mandar por
// WhatsApp o email (el backend ya dispara el email automático si el cliente tiene correo). La
// factura pasa a Paid vía el webhook de Stripe Connect, no por esta llamada.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { slug, id } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const origin = req.nextUrl.origin;
  const body = {
    successUrl: `${origin}/pay/success`,
    cancelUrl: `${origin}/pay/cancel`,
  };

  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/invoices/${id}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Affiliate-Id': affiliate.id,
    },
    body: JSON.stringify(body),
  });

  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}
