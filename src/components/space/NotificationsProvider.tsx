'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

export interface OwnerNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  titleEn: string;
  bodyEn: string | null;
  url: string | null;
  entityId: string | null;
  createdAt: string;
  read: boolean;
}

/** Módulo de /space ↔ tipo de aviso. Abrir el módulo marca sus avisos como leídos. */
export const NOTIFICATION_MODULE_ROUTES: Record<string, string> = {
  orders: 'order',
  reservations: 'reservation',
  agenda: 'appointment',
  invoices: 'invoice_paid',
  proposals: 'proposal_accepted',
  inscripciones: 'signup',
};

type PushState = 'unsupported' | 'blocked' | 'off' | 'on';

interface Ctx {
  unread: number;
  unreadByType: Record<string, number>;
  items: OwnerNotification[];
  /** Badge de un item del menú por su href (/space/{slug}/orders → pedidos sin leer). */
  badgeForHref: (href: string) => number;
  markRead: (opts?: { ids?: string[]; type?: string }) => Promise<void>;
  /** Fuerza una consulta ahora mismo (ej. al abrir la campana). */
  refresh: () => Promise<void>;
  push: PushState;
  enablePush: () => Promise<void>;
  disablePush: () => Promise<void>;
}

const NotificationsContext = createContext<Ctx | null>(null);

export function useNotifications(): Ctx {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    // Fuera del provider (ej. previews): sin avisos, nunca rompe la página.
    return {
      unread: 0, unreadByType: {}, items: [], badgeForHref: () => 0,
      markRead: async () => {}, refresh: async () => {}, push: 'unsupported', enablePush: async () => {}, disablePush: async () => {},
    };
  }
  return ctx;
}

const POLL_MS = 30_000;

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/** Pitido corto (Web Audio, sin archivo) cuando entra un pedido con la pestaña abierta. Puede quedar
 *  bloqueado hasta que el usuario toque la página — se ignora en silencio. */
function beep() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    osc.onended = () => ctx.close().catch(() => {});
  } catch {
    /* sin audio: no pasa nada */
  }
}

export function NotificationsProvider({ slug, children }: { slug: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const { language } = useSimpleLanguage();
  const [items, setItems] = useState<OwnerNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [unreadByType, setUnreadByType] = useState<Record<string, number>>({});
  const [push, setPush] = useState<PushState>('unsupported');
  const prevOrderUnread = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/space/${slug}/notifications?take=20`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const byType: Record<string, number> = data.unreadByType ?? {};
      setItems(data.items ?? []);
      setUnread(data.unread ?? 0);
      setUnreadByType(byType);
      // Pitido solo cuando SUBEN los pedidos sin leer (no en la primera carga).
      const orders = byType.order ?? 0;
      if (prevOrderUnread.current !== null && orders > prevOrderUnread.current) beep();
      prevOrderUnread.current = orders;
    } catch {
      /* red caída: se reintenta en el siguiente ciclo */
    }
  }, [slug]);

  useEffect(() => {
    refresh();
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, POLL_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVisible); };
  }, [refresh]);

  const markRead = useCallback(async (opts?: { ids?: string[]; type?: string }) => {
    try {
      const res = await fetch(`/api/space/${slug}/notifications/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts ?? {}),
      });
      if (res.ok) await refresh();
    } catch { /* se refleja en el siguiente ciclo */ }
  }, [slug, refresh]);

  // Entrar a un módulo marca sus avisos como leídos (con un respiro para que se vea el badge al llegar).
  useEffect(() => {
    const seg = pathname.replace(`/space/${slug}/`, '').split('/')[0];
    const type = NOTIFICATION_MODULE_ROUTES[seg];
    if (!type || !(unreadByType[type] > 0)) return;
    const t = setTimeout(() => { markRead({ type }); }, 1200);
    return () => clearTimeout(t);
  }, [pathname, slug, unreadByType, markRead]);

  // ── Web Push ──
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

  const syncPushState = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window) || !vapidKey) {
      setPush('unsupported');
      return;
    }
    if (Notification.permission === 'denied') { setPush('blocked'); return; }
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      const sub = await reg?.pushManager.getSubscription();
      if (sub && Notification.permission === 'granted') {
        setPush('on');
        // Re-registra por si el negocio/idioma cambió o la fila se purgó: es idempotente.
        const json = sub.toJSON();
        fetch(`/api/space/${slug}/push-subscriptions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth, lang: language }),
        }).catch(() => {});
      } else {
        setPush('off');
      }
    } catch {
      setPush('off');
    }
  }, [slug, language, vapidKey]);

  useEffect(() => { syncPushState(); }, [syncPushState]);

  const enablePush = useCallback(async () => {
    if (!vapidKey || !('serviceWorker' in navigator)) return;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') { setPush(permission === 'denied' ? 'blocked' : 'off'); return; }
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidKey) }));
    const json = sub.toJSON();
    const res = await fetch(`/api/space/${slug}/push-subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth, lang: language }),
    });
    setPush(res.ok ? 'on' : 'off');
  }, [slug, language, vapidKey]);

  const disablePush = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch(`/api/space/${slug}/push-subscriptions`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
        await sub.unsubscribe();
      }
    } finally {
      setPush('off');
    }
  }, [slug]);

  const badgeForHref = useCallback((href: string) => {
    const seg = href.replace(`/space/${slug}/`, '').split('/')[0];
    const type = NOTIFICATION_MODULE_ROUTES[seg];
    return type ? unreadByType[type] ?? 0 : 0;
  }, [slug, unreadByType]);

  const value = useMemo<Ctx>(
    () => ({ unread, unreadByType, items, badgeForHref, markRead, refresh, push, enablePush, disablePush }),
    [unread, unreadByType, items, badgeForHref, markRead, refresh, push, enablePush, disablePush],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
