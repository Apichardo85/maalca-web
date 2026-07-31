import { redirect } from 'next/navigation';
import { getCurrentSpaceUser } from '@/lib/api-auth';
import { canAddBusiness, type Plan } from '@/lib/plan-limits';
import type { BusinessType } from '@/lib/templates/registry';
import { SpaceSidebar } from '@/components/space/SpaceSidebar';
import { SpaceMobileNav } from '@/components/space/SpaceMobileNav';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface Affiliate {
  id: string;
  slug: string;
  name: string;
  plan: Plan;
}

export default async function SpaceSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const currentUser = await getCurrentSpaceUser();
  if (!currentUser) redirect('/login');
  const { token } = currentUser;

  const res = await fetch(`${API}/api/space/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (res.status === 404) redirect('/onboarding');
  if (res.status === 403) redirect('/');
  if (!res.ok) throw new Error(`Failed to load space: ${res.status}`);

  const { business, role } = await res.json();
  const businessType = (business.businessType as string).toLowerCase() as BusinessType;

  // Needed so SpaceMobileNav's drawer can show the real business switcher on
  // mobile (SpaceSwitcherBar, mounted one layout up, is desktop-only now —
  // it used to float fixed over this same drawer with no coordination).
  const affiliatesRes = await fetch(`${API}/api/me/affiliates`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const affiliates: Affiliate[] = affiliatesRes.ok ? await affiliatesRes.json().catch(() => []) : [];
  const highestPlan = affiliates.some((a) => a.plan === 'entrepreneur') ? 'entrepreneur' : 'free';
  const canCreateMore = canAddBusiness(highestPlan, affiliates.length);

  return (
    <div className="flex min-h-screen bg-background">
      <SpaceSidebar
        slug={slug}
        businessName={business.name}
        businessType={businessType}
        plan={business.plan}
        primaryColor={business.primaryColor}
        userFullName={currentUser.fullName}
        userAvatarUrl={currentUser.avatarUrl}
        userEmail={currentUser.email}
        userRole={role}
      />
      <div className="flex-1 min-w-0 md:pl-60">
        <SpaceMobileNav
          slug={slug}
          businessName={business.name}
          businessType={businessType}
          plan={business.plan}
          primaryColor={business.primaryColor}
          userFullName={currentUser.fullName}
          userAvatarUrl={currentUser.avatarUrl}
          userEmail={currentUser.email}
          userRole={role}
          businesses={affiliates}
          canCreateMore={canCreateMore}
        />
        {children}
      </div>
    </div>
  );
}
