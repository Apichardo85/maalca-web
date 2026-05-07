// src/app/space/layout.tsx
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { canAddBusiness, type Plan } from '@/lib/plan-limits';
import { SpaceSwitcherBar } from '@/components/space/SpaceSwitcherBar';

export default async function SpaceLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, slug, name, plan')
    .eq('owner_id', user.id)
    .neq('plan_status', 'downgraded_locked')
    .order('created_at', { ascending: true });

  const all = businesses ?? [];
  if (all.length === 0) redirect('/onboarding');

  // canCreate is true if the user's best plan supports another business
  const highestPlan = all.some((b) => b.plan === 'entrepreneur') ? 'entrepreneur' : 'free';
  const canCreate = canAddBusiness(highestPlan as Plan, all.length);

  return (
    <>
      <SpaceSwitcherBar
        businesses={all.map((b) => ({ ...b, plan: b.plan as Plan }))}
        canCreateMore={canCreate}
      />
      {children}
    </>
  );
}
