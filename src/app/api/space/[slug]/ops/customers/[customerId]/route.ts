import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Borrado real (cascada: citas, fila, propuestas, reservas, facturas) — solo para limpiar datos
// de prueba desde la ficha del cliente en /space/{slug}/clientes, cuando quien mira la página es
// un admin de plataforma en modo soporte (ver ClientesContent "Zona de peligro" / isImpersonation
// en layout.tsx). El gate real (platform_admin + platform_role Owner) vive en el backend — este
// proxy solo resuelve el affiliateId por slug, igual que el resto de rutas de /space.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; customerId: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { slug, customerId } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));

  const apiRes = await fetch(`${API}/api/ops/affiliates/${affiliate.id}/customers/${customerId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ confirm: body?.confirm === true }),
  });

  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}
