import Link from 'next/link';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { BrandPanel } from './BrandPanel';
import type { AgentAffiliatePlan, BrandProfile } from './types';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default async function OpsMarcaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getMaalcaApiToken();
  if (!token) return null;
  const headers = { Authorization: `Bearer ${token}` };

  const [brandRes, planRes] = await Promise.all([
    fetch(`${API}/api/ops/agents/affiliates/${id}/brand`, { headers, cache: 'no-store' }),
    fetch(`${API}/api/ops/agents/affiliates/${id}/plan`, { headers, cache: 'no-store' }),
  ]);

  if (!brandRes.ok || !planRes.ok) {
    return (
      <div>
        <Link href={`/ops/negocios/${id}`} className="text-xs font-medium text-gray-400">← Negocio</Link>
        <p className="mt-3 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">
          No se pudo cargar la marca de este negocio (HTTP {brandRes.ok ? planRes.status : brandRes.status}).
        </p>
      </div>
    );
  }

  const brand: BrandProfile = await brandRes.json();
  const plan: AgentAffiliatePlan = await planRes.json();
  return <BrandPanel affiliateId={id} initialBrand={brand} initialPlan={plan} />;
}
