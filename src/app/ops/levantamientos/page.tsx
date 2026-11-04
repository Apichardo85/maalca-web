import { getMaalcaApiToken } from '@/lib/api-auth';
import type { OpsIntakeSummary } from '@/lib/intake';
import { IntakesSection } from './IntakesSection';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default async function OpsLevantamientosPage() {
  const token = await getMaalcaApiToken();
  if (!token) return null;
  const res = await fetch(`${API}/api/ops/intakes`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const intakes: OpsIntakeSummary[] = res.ok ? await res.json() : [];
  return <IntakesSection initial={intakes} />;
}
