import { getMaalcaApiToken } from '@/lib/api-auth';
import type { OpsAffiliate } from '../types';
import { NegociosTable } from './NegociosTable';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default async function OpsNegociosPage() {
  const token = await getMaalcaApiToken();
  if (!token) return null;

  const res = await fetch(`${API}/api/ops/affiliates`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const affiliates: OpsAffiliate[] = res.ok ? await res.json() : [];

  return <NegociosTable initialAffiliates={affiliates} />;
}
