import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { SettingsContent } from './SettingsContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/** Was a blind redirect to /design — this is the page every upgrade CTA in the app
 *  (TrialExpiredNotice, PlanLimitNotice, CatalogView's limit banner) has been
 *  linking to all along, so it needs to actually be the plan/billing screen. */
export default async function SettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const res = await fetch(`${API}/api/space/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (res.status === 404) redirect('/onboarding');
  if (res.status === 403) redirect('/');
  if (!res.ok) throw new Error(`Failed to load space: ${res.status}`);

  const { business } = await res.json();

  return (
    <SettingsContent
      slug={slug}
      plan={business.plan}
      planStatus={business.planStatus ?? 'Active'}
      trialDaysRemaining={business.trialDaysRemaining ?? null}
    />
  );
}
