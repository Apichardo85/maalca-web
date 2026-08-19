import { notFound } from 'next/navigation';
import { PublicAppointmentContent, type PublicAppointment } from './PublicAppointmentContent';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

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
