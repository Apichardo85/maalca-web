import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { OpsShell } from './OpsShell';
import type { OpsRole } from './OpsRoleContext';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Fase 60/82 — panel de operaciones. Layout compartido por /ops, /ops/negocios,
// /ops/negocios/[id] y /ops/equipo: resuelve el rol una sola vez y monta el nav + el
// asistente flotante (que así persiste su historial al navegar entre sub-rutas).
export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const statusRes = await fetch(`${API}/api/me/admin-status`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const status = statusRes.ok ? await statusRes.json() : { isPlatformAdmin: false, role: null };

  // No es "not found" — para todos los demás usuarios /ops simplemente no existe.
  if (!status.isPlatformAdmin) redirect('/');

  return <OpsShell role={(status.role ?? null) as OpsRole}>{children}</OpsShell>;
}
