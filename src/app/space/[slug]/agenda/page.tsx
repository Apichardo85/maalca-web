import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { AgendaContent, type Appointment, type ServiceOption, type PersonalOption } from './AgendaContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface SpaceResponse {
  business: {
    id: string;
    businessType: string;
    plan: 'free' | 'entrepreneur';
    horario?: { dia: string; abre: string; cierra: string; cerrado: boolean }[] | null;
  };
  role: string;
}

export default async function AgendaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const spaceRes = await fetch(`${API}/api/space/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (spaceRes.status === 404) redirect('/onboarding');
  if (spaceRes.status === 403) redirect('/');
  if (!spaceRes.ok) throw new Error(`Failed to load space: ${spaceRes.status}`);

  const space: SpaceResponse = await spaceRes.json();
  const canManage = space.role !== 'Staff';
  const headers = { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id };

  const [appointmentsRes, servicesRes, personalRes] = await Promise.all([
    fetch(`${API}/api/affiliates/${space.business.id}/appointments`, { headers, cache: 'no-store' }),
    fetch(`${API}/api/affiliates/${space.business.id}/services`, { headers, cache: 'no-store' }),
    fetch(`${API}/api/affiliates/${space.business.id}/team`, { headers, cache: 'no-store' }),
  ]);

  const appointments: Appointment[] = appointmentsRes.ok ? (await appointmentsRes.json()).data ?? [] : [];
  const services: ServiceOption[] = servicesRes.ok ? await servicesRes.json() : [];
  const personal: PersonalOption[] = personalRes.ok ? await personalRes.json() : [];

  return (
    <AgendaContent
      slug={slug}
      canManage={canManage}
      initialAppointments={appointments}
      services={services}
      personal={personal.filter((p) => p.isActive)}
      horario={space.business.horario}
    />
  );
}
