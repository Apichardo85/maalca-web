// src/app/space/layout.tsx
import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { canAddBusiness, type Plan } from '@/lib/plan-limits';
import { SpaceSwitcherBar } from '@/components/space/SpaceSwitcherBar';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface Affiliate {
  id: string;
  slug: string;
  name: string;
  plan: Plan;
}

export default async function SpaceLayout({ children }: { children: React.ReactNode }) {
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const res = await fetch(`${API}/api/me/affiliates`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (res.status === 401) redirect('/login');
  if (!res.ok) redirect('/onboarding');

  const affiliates: Affiliate[] = await res.json().catch(() => []);
  if (affiliates.length === 0) redirect('/onboarding');

  const highestPlan = affiliates.some((a) => a.plan === 'entrepreneur') ? 'entrepreneur' : 'free';
  const canCreate = canAddBusiness(highestPlan, affiliates.length);

  return (
    <>
      <SpaceSwitcherBar businesses={affiliates} canCreateMore={canCreate} />
      {children}
    </>
  );
}
