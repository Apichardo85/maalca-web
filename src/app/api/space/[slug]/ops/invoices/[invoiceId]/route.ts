import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Borrado real de una factura, sin importar su estado (a diferencia del DELETE de negocio en
// /api/affiliates/{id}/invoices/{id}, que ahora solo deja borrar Pending/Overdue) — mismo
// criterio que .../ops/customers, ver ese archivo.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; invoiceId: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { slug, invoiceId } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));

  const apiRes = await fetch(`${API}/api/ops/affiliates/${affiliate.id}/invoices/${invoiceId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ confirm: body?.confirm === true }),
  });

  if (apiRes.status === 204) return new NextResponse(null, { status: 204 });
  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}
