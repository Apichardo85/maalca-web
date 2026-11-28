'use client';

import { useCallback, useEffect, useState } from 'react';

type PushState = 'unsupported' | 'blocked' | 'off' | 'on';

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/**
 * Web Push para colaboradores de MaalCa (/ops): avisos de solicitudes nuevas, respuestas del negocio y
 * asignaciones. Mismo service worker (/sw.js) y llaves VAPID que los avisos del dueño; la suscripción se
 * guarda contra el colaborador (PlatformAdmin), no contra un negocio.
 */
export function useAdminPush() {
  const [state, setState] = useState<PushState>('off');
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

  const register = useCallback(async (sub: PushSubscription) => {
    const json = sub.toJSON();
    const res = await fetch('/api/ops/support/push-subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth, lang: 'es' }),
    });
    return res.ok;
  }, []);

  useEffect(() => {
    (async () => {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window) || !vapidKey) {
        setState('unsupported');
        return;
      }
      if (Notification.permission === 'denied') { setState('blocked'); return; }
      try {
        const reg = await navigator.serviceWorker.getRegistration('/sw.js');
        const sub = await reg?.pushManager.getSubscription();
        if (sub && Notification.permission === 'granted') {
          // Idempotente: re-registra por si la fila se purgó o el navegador era de otro colaborador.
          setState((await register(sub)) ? 'on' : 'off');
        }
      } catch {
        setState('off');
      }
    })();
  }, [vapidKey, register]);

  const enable = useCallback(async () => {
    if (!vapidKey || !('serviceWorker' in navigator)) return;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') { setState(permission === 'denied' ? 'blocked' : 'off'); return; }
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidKey) }));
    setState((await register(sub)) ? 'on' : 'off');
  }, [vapidKey, register]);

  // Solo quita este navegador de los avisos de soporte; no cancela la suscripción del navegador porque
  // la misma puede estar recibiendo los avisos de un negocio.
  const disable = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/ops/support/push-subscriptions/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
      }
    } finally {
      setState('off');
    }
  }, []);

  return { state, enable, disable };
}
