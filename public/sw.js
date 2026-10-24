/* Service worker de MaalCa:
 *  - Web Push (avisos al dueño).
 *  - Modo sin conexión SOLO para el board de las TVs (/{slug}/board y /{slug}/board/{pantalla}):
 *    la página se pide primero a la red y, si falla o tarda, se sirve la última guardada; los
 *    scripts de Next (/_next/static, con hash en el nombre) van de caché primero.
 *    Todo lo demás pasa directo a la red, sin tocar. */
const BOARD_CACHE = 'maalca-board-v1';
const BOARD_RE = /^\/[^/]+\/board(\/[^/]+)?\/?$/;
const NETWORK_TIMEOUT_MS = 6000;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('maalca-board-') && k !== BOARD_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  ),
);

async function networkFirst(request) {
  const cache = await caches.open(BOARD_CACHE);
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), NETWORK_TIMEOUT_MS);
    const res = await fetch(request, { signal: ctrl.signal });
    clearTimeout(timer);
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const hit = await cache.match(request);
    if (hit) return hit;
    throw new Error('offline');
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(BOARD_CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res && res.ok) cache.put(request, res.clone());
  return res;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate' && BOARD_RE.test(url.pathname)) {
    event.respondWith(networkFirst(req));
  } else if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(req));
  }
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'MaalCa', body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'MaalCa';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || '',
      icon: '/apple-icon.png',
      badge: '/apple-icon.png',
      tag: data.tag || undefined,
      renotify: Boolean(data.tag),
      data: { url: data.url || '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if ('focus' in w) {
          w.navigate(url).catch(() => {});
          return w.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
