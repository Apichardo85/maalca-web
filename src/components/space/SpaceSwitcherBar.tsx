'use client';

import { usePathname } from 'next/navigation';
import { BusinessSwitcher } from './BusinessSwitcher';
import type { Plan } from '@/lib/plan-limits';

interface Business {
  id: string;
  slug: string;
  name: string;
  plan: Plan;
}

interface Props {
  businesses: Business[];
  canCreateMore: boolean;
}

export function SpaceSwitcherBar({ businesses, canCreateMore }: Props) {
  const pathname = usePathname();
  // /space/[slug]/... — extract slug from position 2
  const slug = pathname.split('/')[2];
  const current = businesses.find((b) => b.slug === slug);
  const others = businesses.filter((b) => b.slug !== slug);

  if (!current) return null;
  if (others.length === 0 && !canCreateMore) return null;

  return (
    // Mobile has its own switcher inside SpaceMobileNav's drawer — this fixed
    // floating pill only ever competed with it for the same top-left corner,
    // since the two components are mounted from different layouts and never
    // coordinated. Desktop is unaffected (SpaceMobileNav is md:hidden there).
    <div className="fixed left-4 top-4 z-40 hidden md:block">
      <BusinessSwitcher
        current={current}
        others={others}
        canCreateMore={canCreateMore}
      />
    </div>
  );
}
