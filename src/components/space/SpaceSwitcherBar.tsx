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
    <div className="fixed left-4 top-4 z-40">
      <BusinessSwitcher
        current={current}
        others={others}
        canCreateMore={canCreateMore}
      />
    </div>
  );
}
