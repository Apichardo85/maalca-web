import { notFound } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import type { OpsIntake } from '@/lib/intake';
import { IntakeEditor } from './IntakeEditor';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default async function OpsLevantamientoPage({ params }: { params: Promise<{ id: string }> }) {
  const token = await getMaalcaApiToken();
  if (!token) return null;
  const { id } = await params;
  const res = await fetch(`${API}/api/ops/intakes/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`No se pudo cargar el levantamiento (${res.status})`);
  const intake: OpsIntake = await res.json();
  return <IntakeEditor initial={intake} />;
}
