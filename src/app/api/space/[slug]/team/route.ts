import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, getCurrentSpaceUser, resolveAffiliateIdBySlug } from '@/lib/api-auth';
import { sendTeamInviteEmail } from '@/lib/services/resend-service';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Fase 8 — dashboard multiusuario con roles. Mismo patrón proxy que screens/screen-ads.
// Nota: el backend expone esto en /collaborators (no /team) porque ese path ya existe para
// el concepto de staff/empleados del negocio — mantenemos la ruta del frontend como "team"
// (nombre visible al usuario) mientras el proxy apunta al endpoint real.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { slug } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/collaborators`, {
    headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliate.id },
    cache: 'no-store',
  });

  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? [], { status: apiRes.status });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const currentUser = await getCurrentSpaceUser();
  if (!currentUser) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { token } = currentUser;

  const { slug } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const body = await req.json();

  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/collaborators`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Affiliate-Id': affiliate.id,
    },
    body: JSON.stringify(body),
  });

  const data = await apiRes.json().catch(() => null);

  // El invite en sí ya se guardó en el backend — el correo es un aviso best-effort (nunca
  // hace fallar la respuesta al dueño: sendTeamInviteEmail atrapa sus propios errores y
  // devuelve false). Antes esto se disparaba sin await ("fire and forget"), pero en un
  // entorno serverless (Vercel) la función puede congelarse/matarse apenas se arma la
  // respuesta — el fetch a la API de Resend se cortaba a medias y nunca llegaba a
  // aparecer ni siquiera como intento fallido en el dashboard de Resend. Por eso el dueño
  // veía "invitación enviada" pero cero rastro del lado de Resend. Con await, la función
  // espera a que el intento de envío termine antes de responder.
  let emailSent = false;
  if (apiRes.ok && data?.email) {
    emailSent = await sendTeamInviteEmail({
      inviteeEmail: data.email,
      businessName: affiliate.name,
      slug,
      role: data.role ?? body.role,
      inviterEmail: currentUser.email,
    });
  }

  // El invite en el backend ya quedó guardado aunque el correo falle (RESEND_API_KEY faltante,
  // dominio no verificado, etc.) — antes esto quedaba invisible: el dueño veía "invitación
  // enviada" sin importar si Resend realmente la mandó. Ahora se expone `emailSent` para que el
  // frontend pueda avisar y el dueño comparta el link a mano si hace falta.
  return NextResponse.json(apiRes.ok && data ? { ...data, emailSent } : (data ?? {}), { status: apiRes.status });
}
