/**
 * Fire-and-forget analytics beacons for the public affiliate page. Never blocks
 * navigation or rendering — prefers sendBeacon, falls back to keepalive fetch,
 * and swallows all failures.
 */
function sendEvent(slug: string, payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const url = `/api/public/affiliates/${slug}/events`;
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    return;
  }
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
}

export function trackPageView(slug: string): void {
  sendEvent(slug, { type: 'page_view' });
}

export function trackCanalClick(slug: string, canalTipo: string, canalId?: string | null): void {
  sendEvent(slug, { type: 'canal_click', canalTipo, canalId: canalId ?? null });
}
