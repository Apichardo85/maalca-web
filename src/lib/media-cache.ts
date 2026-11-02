/* Caché de media para las TVs (/board).
 *
 * Problema: una TV rota las mismas fotos y videos todo el día. Los <video> se recrean en cada
 * vuelta y el WebView de Fully Kiosk no guarda bien los videos en su caché HTTP, así que cada
 * pasada volvía a bajar el archivo completo desde Supabase Storage (egress facturable).
 *
 * Solución: cada archivo se baja UNA vez a Cache Storage (persiste entre recargas y reinicios).
 *  - Videos: se reproducen desde un blob: local → 0 bytes de red en las vueltas siguientes.
 *  - Fotos: el service worker (public/sw.js) las sirve desde este mismo caché cuando existen.
 * Al cambiar el catálogo se borra lo que ya no se usa para no acumular. */

export const MEDIA_CACHE = 'maalca-media-v1';

export interface MediaItem { url: string; video: boolean }

const blobUrls = new Map<string, string>();
let chain: Promise<void> = Promise.resolve();

const supported = () => typeof window !== 'undefined' && 'caches' in window;

/** URL a usar en <video>: el blob local si ya está guardado; si no, la original. */
export function cachedMediaSrc(url: string): string {
  return blobUrls.get(url) ?? url;
}

async function warmOne({ url, video }: MediaItem): Promise<void> {
  const cache = await caches.open(MEDIA_CACHE);
  let res = await cache.match(url);
  if (!res) {
    const net = await fetch(url, { mode: 'cors' });
    if (!net.ok) return;
    await cache.put(url, net.clone());
    res = (await cache.match(url)) ?? undefined;
  }
  if (video && res && !blobUrls.has(url)) {
    const blob = await res.blob();
    blobUrls.set(url, URL.createObjectURL(blob));
  }
}

/** Baja (una a una, sin competir con la reproducción) lo que aún no esté guardado. */
export function warmMedia(items: MediaItem[]): void {
  if (!supported() || items.length === 0) return;
  const seen = new Set<string>();
  for (const it of items) {
    if (!it.url || seen.has(it.url)) continue;
    seen.add(it.url);
    chain = chain
      .then(() => warmOne(it))
      .catch(() => { /* sin red, cuota llena o sin CORS: se reproduce directo desde la red */ });
  }
}

/** Borra del caché lo que ya no usa ningún slide (comercial reemplazado, plato quitado). */
export function pruneMedia(keep: Set<string>): void {
  if (!supported() || keep.size === 0) return;
  chain = chain
    .then(async () => {
      const cache = await caches.open(MEDIA_CACHE);
      for (const req of await cache.keys()) {
        if (!keep.has(req.url)) await cache.delete(req);
      }
      for (const [url, blob] of Array.from(blobUrls)) {
        if (!keep.has(url)) { URL.revokeObjectURL(blob); blobUrls.delete(url); }
      }
    })
    .catch(() => undefined);
}
