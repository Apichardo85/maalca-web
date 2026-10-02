import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicAppointmentContent, type PublicAppointment } from './PublicAppointmentContent';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

async function loadAppointment(token: string): Promise<PublicAppointment | null> {
  try {
    const res = await fetch(`${API_BASE}/api/public/appointments/${token}`, { cache: 'no-store' });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

// Vista previa al compartir el link (WhatsApp, iMessage...): antes salia el titulo generico de
// MaalCa. Link privado por token: no se indexa.
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const a = await loadAppointment(token);
  const robots = { index: false, follow: false };
  if (!a) return { title: 'Tu cita', robots };
  // La fecha viene a medianoche UTC: se formatea en UTC para no correr un dia en America.
  const day = new Date(a.date).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  const title = `Tu cita en ${a.businessName}`;
  const description = `${a.serviceName} · ${day} · ${a.time}`;
  return { title, description, robots, openGraph: { title, description, siteName: 'MaalCa' } };
}

// Tarea #246 — "gestiona tu cita" sin login, mismo patrón que /propuesta/[token] (task #194):
// el link llega por correo (confirmación o recordatorio, tarea #247) con un token público, el
// cliente confirma/reagenda/cancela sin necesitar cuenta. Ver PublicBookingService en maalca-api.
export default async function PublicAppointmentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const res = await fetch(`${API_BASE}/api/public/appointments/${token}`, { cache: 'no-store' });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`Failed to load appointment: ${res.status}`);

  const appointment: PublicAppointment = await res.json();

  return <PublicAppointmentContent token={token} initial={appointment} />;
}
