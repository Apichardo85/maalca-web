import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, getCurrentSpaceUser } from '@/lib/api-auth';
import { sendPlatformTeamInviteEmail } from '@/lib/services/resend-service';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Equipo interno de plataforma (distinto del equipo por-afiliado) — ver /api/ops/team en la API.
export async function GET() {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const apiRes = await fetch(`${API}/api/ops/team`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? [], { status: apiRes.status });
}

export async function POST(req: NextRequest) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();

  const apiRes = await fetch(`${API}/api/ops/team`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  const data = await apiRes.json().catch(() => null);

  // Antes esto nunca mandaba correo — a diferencia de /api/space/[slug]/team (equipo por
  // afiliado), que sí llama a Resend desde hace tiempo. El invite en el backend ya queda
  // guardado aunque el correo falle; con await (no fire-and-forget) para que no se corte a
  // medias en el entorno serverless de Vercel — mismo motivo documentado en
  // /api/space/[slug]/team/route.ts.
  let emailSent = false;
  if (apiRes.ok && data?.email) {
    const currentUser = await getCurrentSpaceUser();
    emailSent = await sendPlatformTeamInviteEmail({
      inviteeEmail: data.email,
      role: data.role ?? body.role,
      inviterEmail: currentUser?.email ?? null,
    });
  }

  return NextResponse.json(apiRes.ok && data ? { ...data, emailSent } : (data ?? {}), { status: apiRes.status });
}
