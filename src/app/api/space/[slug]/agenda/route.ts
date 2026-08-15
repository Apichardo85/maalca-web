import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';
import { sendAppointmentConfirmationEmail } from '@/lib/services/resend-service';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Agenda del negocio — proxya a /api/affiliates/{id}/appointments.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { slug } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const qs = req.nextUrl.search;
  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/appointments${qs}`, {
    headers: { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliate.id },
    cache: 'no-store',
  });

  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? { data: [], total: 0 }, { status: apiRes.status });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { slug } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const body = await req.json();
  // customerEmail/serviceName/staffName no son campos del backend (Appointment no los tiene) —
  // el front los manda solo para poder armar el correo de confirmación aquí mismo, sin tener
  // que volver a consultar servicio/personal por id.
  const { customerEmail, serviceName, staffName, ...appointmentBody } = body;

  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Affiliate-Id': affiliate.id,
    },
    body: JSON.stringify(appointmentBody),
  });

  const data = await apiRes.json().catch(() => null);

  // Confirmación por correo, best-effort — nunca hace fallar la creación de la cita si el
  // envío falla (sendAppointmentConfirmationEmail atrapa sus propios errores). Con await por la
  // misma razón que el fix de invite email: en serverless, fire-and-forget se corta a medias.
  if (apiRes.ok && customerEmail) {
    await sendAppointmentConfirmationEmail({
      customerEmail,
      customerName: data?.customer?.name ?? null,
      businessName: affiliate.name,
      serviceName: serviceName ?? data?.service?.name ?? 'tu servicio',
      date: appointmentBody.date,
      time: appointmentBody.time,
      staffName: staffName ?? null,
    });
  }

  return NextResponse.json(data ?? {}, { status: apiRes.status });
}
