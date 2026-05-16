// src/lib/analytics.ts
export type AnalyticsEvent =
  | 'click_start_free'
  | 'login_google_success'
  | 'onboarding_completed'
  | 'first_product_created'
  | 'link_copied'
  | 'upgrade_clicked'
  | 'upgrade_completed';

interface TrackProps {
  business_id?: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: AnalyticsEvent, properties: TrackProps = {}): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', event, properties);
  }

  if (typeof window !== 'undefined') {
    try {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, properties }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // swallow
    }
  }
}

export async function trackServer(
  supabase: { from: (t: string) => { insert: (data: unknown) => Promise<{ error: unknown }> } },
  event: AnalyticsEvent,
  payload: { user_id?: string; business_id?: string; properties?: TrackProps }
): Promise<void> {
  try {
    await supabase.from('analytics_events').insert({
      event_name: event,
      user_id: payload.user_id ?? null,
      business_id: payload.business_id ?? null,
      properties: payload.properties ?? {},
    });
  } catch {
    // swallow
  }
}
