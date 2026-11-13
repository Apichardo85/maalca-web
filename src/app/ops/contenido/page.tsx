import { getMaalcaApiToken } from '@/lib/api-auth';
import type { OpsAffiliate } from '../types';
import { ContenidoBoard } from './ContenidoBoard';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default async function OpsContenidoPage() {
  const token = await getMaalcaApiToken();
  if (!token) return null;

  const res = await fetch(`${API}/api/ops/affiliates`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  const affiliates: OpsAffiliate[] = res.ok ? await res.json() : [];
  const options = affiliates
    .filter((a) => a.isActive)
    .map((a) => ({ id: a.id, name: a.name }))
    .sort((x, y) => x.name.localeCompare(y.name));

  return <ContenidoBoard affiliates={options} />;
}
