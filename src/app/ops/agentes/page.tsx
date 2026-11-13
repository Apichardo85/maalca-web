import { getMaalcaApiToken } from '@/lib/api-auth';
import { AgentsPanel } from './AgentsPanel';
import type { AgentAdminState, AgentJob } from './types';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default async function OpsAgentesPage() {
  const token = await getMaalcaApiToken();
  if (!token) return null;
  const headers = { Authorization: `Bearer ${token}` };

  const [stateRes, jobsRes] = await Promise.all([
    fetch(`${API}/api/ops/agents`, { headers, cache: 'no-store' }),
    fetch(`${API}/api/ops/agents/jobs?limit=25`, { headers, cache: 'no-store' }),
  ]);

  if (!stateRes.ok) {
    return (
      <p className="rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">
        No se pudo cargar el orquestador de agentes (HTTP {stateRes.status}). Revisa que el API tenga la migración aplicada.
      </p>
    );
  }

  const state: AgentAdminState = await stateRes.json();
  const jobs: AgentJob[] = jobsRes.ok ? await jobsRes.json() : [];
  return <AgentsPanel initialState={state} initialJobs={jobs} />;
}
