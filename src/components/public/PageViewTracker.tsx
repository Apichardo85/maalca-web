'use client';

import { useEffect } from 'react';
import { trackPageView } from '@/lib/public-events';

/** Mounted once per public affiliate page load — fires a non-blocking page_view beacon. */
export function PageViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    trackPageView(slug);
  }, [slug]);

  return null;
}
