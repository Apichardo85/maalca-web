'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export interface TrackingItem {
  itemId: string;
  name: string;
  price: number;
  qty: number;
  notes?: string | null;
}

export interface OrderTracking {
  businessName: string;
  slug: string;
  logoUrl: string | null;
  brandColor: string | null;
  address: string | null;
  whatsApp: string | null;
  status: 'Pending' | 'Paid' | 'Preparing' | 'Ready' | 'Fulfilled' | 'Canceled';
  payAtVenue: boolean;
  collected: boolean;
  tableNumber: string | null;
  scheduledFor: string | null;
  createdAt: string;
  updatedAt: string;
  estimatedReadyAt: string | null;
  items: TrackingItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  currency: string;
  expired: boolean;
  canPayOnline?: boolean;
  /** Idioma principal del negocio (Affiliate.Language). */
  language?: 'es' | 'en';
}

const POLL_MS = 15_000;

// Pasos que ve el cliente. "Paid" internamente significa aceptado (o pagado online): para el cliente es "Aceptado".
const STEPS = [
  { key: 'received', es: 'Recibido', en: 'Received', icon: '📨' },
  { key: 'accepted', es: 'Aceptado', en: 'Accepted', icon: '✅' },
  { key: 'preparing', es: 'Preparando', en: 'Preparing', icon: '👨‍🍳' },
  { key: 'ready', es: 'Listo', en: 'Ready', icon: '🛍️' },
] as const;

function stepIndex(status: OrderTracking['status']): number {
  switch (status) {
    case 'Pending': return 0;
    case 'Paid': return 1;
    case 'Preparing': return 2;
    case 'Ready': return 3;
    case 'Fulfilled': return 3;
    default: return 0;
  }
}

function safeColor(c: string | null): string {
  return c && /^#[0-9a-fA-F]{6}$/.test(c) ? c : '#045AFE';
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function TrackingContent({ token, initial, apiBase }: { token: string; initial: OrderTracking; apiBase: string }) {
  const [t, setT] = useState(initial);
  const [pushState, setPushState] = useState<'unsupported' | 'idle' | 'on' | 'denied' | 'busy'>('idle');
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState('');
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  const [now, setNow] = useState(() => Date.now());
  const color = safeColor(t.brandColor);
  const lang = t.language === 'en' ? 'en' : 'es';
  const tx = (es: string, en: string) => (lang === 'en' ? en : es);
  const money = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency: t.currency || 'USD' }), [t.currency]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/public/track/${encodeURIComponent(token)}`, { cache: 'no-store' });
      if (res.ok) setT(await res.json());
    } catch {
      /* sin red: se reintenta en el siguiente ciclo */
    }
  }, [apiBase, token]);

  const finished = t.status === 'Fulfilled' || t.status === 'Canceled';

  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, POLL_MS);
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [finished, refresh]);

  // Estado inicial del push: ¿ya está suscrito este dispositivo? ¿el navegador lo soporta?
  useEffect(() => {
    if (typeof window === 'undefined' || !vapidKey || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setPushState('unsupported');
      return;
    }
    if (Notification.permission === 'denied') { setPushState('denied'); return; }
    navigator.serviceWorker.getRegistration('/sw.js').then(async (reg) => {
      const sub = await reg?.pushManager.getSubscription();
      if (sub && localStorage.getItem(`maalca_push_${token}`)) setPushState('on');
    }).catch(() => {});
  }, [token, vapidKey]);

  // Al volver de Stripe (?session_id=...) se confirma el pago sin esperar al webhook.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const sessionId = sp.get('session_id');
    if (!sessionId) return;
    fetch(`${apiBase}/api/public/track/${encodeURIComponent(token)}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setT(d); })
      .catch(() => {})
      .finally(() => window.history.replaceState(null, '', `/t/${token}`));
  }, [apiBase, token]);

  async function enablePush() {
    setPushState('busy');
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { setPushState(perm === 'denied' ? 'denied' : 'idle'); return; }
      const reg = (await navigator.serviceWorker.getRegistration('/sw.js')) ?? (await navigator.serviceWorker.register('/sw.js'));
      await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription())
        ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidKey) }));
      const json = sub.toJSON();
      const res = await fetch(`${apiBase}/api/public/track/${encodeURIComponent(token)}/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth, lang }),
      });
      if (!res.ok) throw new Error('subscribe failed');
      localStorage.setItem(`maalca_push_${token}`, '1');
      setPushState('on');
    } catch {
      setPushState('idle');
    }
  }

  async function payOnline() {
    setPayBusy(true);
    setPayError('');
    try {
      const origin = window.location.origin;
      const res = await fetch(`${apiBase}/api/public/track/${encodeURIComponent(token)}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          successUrl: `${origin}/t/${token}?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/t/${token}`,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.checkoutUrl) {
        setPayError(data?.error?.message || tx('No pudimos abrir el pago. Inténtalo de nuevo o paga en el local.', "We couldn't open the payment page. Try again or pay at the venue."));
        setPayBusy(false);
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setPayError(tx('No pudimos abrir el pago. Inténtalo de nuevo o paga en el local.', "We couldn't open the payment page. Try again or pay at the venue."));
      setPayBusy(false);
    }
  }

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const canceled = t.status === 'Canceled';
  const idx = stepIndex(t.status);
  // "Listo" (Ready) y "Entregado" (Fulfilled) muestran el último paso completo para el cliente.
  const isReady = t.status === 'Ready' || t.status === 'Fulfilled';
  const eta = t.estimatedReadyAt ? new Date(t.estimatedReadyAt) : null;
  const minsLeft = eta ? Math.round((eta.getTime() - now) / 60000) : null;
  const etaClock = eta?.toLocaleTimeString(lang === 'en' ? 'en-US' : 'es', { hour: 'numeric', minute: '2-digit' });

  const headline = canceled
    ? tx('Pedido cancelado', 'Order canceled')
    : isReady
      ? tx('¡Tu pedido está listo!', 'Your order is ready!')
      : t.status === 'Pending'
        ? tx('Esperando que el restaurante lo acepte', 'Waiting for the restaurant to accept it')
        : t.status === 'Paid'
          ? tx('Pedido aceptado', 'Order accepted')
          : tx('Preparando tu pedido', 'Preparing your order');

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-4 flex items-center gap-3">
          {t.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={t.logoUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
          )}
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-neutral-400">{tx('Tu pedido en', 'Your order at')}</p>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t.businessName}</h1>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{headline}</h2>

          {!canceled && !t.expired && !isReady && eta && (
            <p className="mt-1 text-sm text-gray-600 dark:text-neutral-300">
              {minsLeft !== null && minsLeft > 0
                ? <>{tx('Listo en aprox.', 'Ready in about')} <strong>{minsLeft} min</strong> · {etaClock}</>
                : <>{tx('Debería estar listo en cualquier momento', 'It should be ready any moment now')} · {etaClock}</>}
            </p>
          )}
          {isReady && t.payAtVenue && !t.collected && (
            <p className="mt-1 text-sm text-gray-600 dark:text-neutral-300">{tx('Pagas al recogerlo:', 'You pay when you pick it up:')} <strong>{money.format(t.total)}</strong></p>
          )}
          {t.scheduledFor && !finished && (
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">📅 {tx('Pedido programado para', 'Scheduled for')} {new Date(`${t.scheduledFor}T00:00:00`).toLocaleDateString(lang === 'en' ? 'en-US' : 'es', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          )}

          {!canceled && !t.expired && (
            <ol className="mt-5 space-y-0">
              {STEPS.map((s, i) => {
                const done = i < idx || (i === idx && isReady);
                const current = i === idx && !isReady;
                return (
                  <li key={s.key} className="relative flex gap-3 pb-5 last:pb-0">
                    {i < STEPS.length - 1 && (
                      <span
                        className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-0.5"
                        style={{ backgroundColor: i < idx ? color : '#e5e7eb' }}
                      />
                    )}
                    <span
                      className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${current ? 'animate-pulse' : ''}`}
                      style={done || current ? { backgroundColor: color, color: '#fff' } : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}
                    >
                      {done ? '✓' : s.icon}
                    </span>
                    <div className="pt-1">
                      <p className={`text-sm font-semibold ${done || current ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-neutral-500'}`}>{lang === 'en' ? s.en : s.es}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {t.expired ? (
            <p className="mt-4 text-sm text-gray-500 dark:text-neutral-400">{tx('Este pedido ya finalizó y el detalle dejó de estar disponible.', 'This order is complete and the details are no longer available.')}</p>
          ) : (
            <div className="mt-5 border-t border-gray-100 pt-4 dark:border-neutral-800">
              <ul className="space-y-1.5">
                {t.items.map((i, k) => (
                  <li key={`${i.itemId}-${k}`} className="text-sm text-gray-700 dark:text-neutral-300">
                    <div className="flex justify-between gap-2">
                      <span>{i.qty}× {i.name}</span>
                      <span>{money.format(i.price * i.qty)}</span>
                    </div>
                    {i.notes && <div className="text-xs italic text-amber-600 dark:text-amber-400">↳ {i.notes}</div>}
                  </li>
                ))}
              </ul>
              {t.tip > 0 && (
                <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-neutral-400"><span>{tx('Propina', 'Tip')}</span><span>{money.format(t.tip)}</span></div>
              )}
              <div className="mt-2 flex justify-between text-sm font-bold text-gray-900 dark:text-white"><span>Total</span><span>{money.format(t.total)}</span></div>
              {t.payAtVenue && !t.collected && !canceled && (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                  💵 {lang === 'en' ? `You pay at the venue when you ${t.tableNumber ? 'finish' : 'pick up'}.` : `Pagas en el local al ${t.tableNumber ? 'terminar' : 'recoger'}.`}
                </p>
              )}
              {t.canPayOnline && !t.collected && !canceled && t.status !== 'Fulfilled' && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={payOnline}
                    disabled={payBusy}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-white disabled:opacity-60"
                    style={{ backgroundColor: color }}
                  >
                    💳 {payBusy ? tx('Abriendo pago…', 'Opening payment…') : `${tx('Pagar ahora con tarjeta', 'Pay now by card')} · ${money.format(t.total)}`}
                  </button>
                  {payError && <p className="mt-2 text-center text-xs text-red-600">{payError}</p>}
                </div>
              )}
              {t.payAtVenue && t.collected && (
                <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700 dark:bg-green-900/20 dark:text-green-400">✅ {tx('Pago recibido. ¡Gracias!', 'Payment received. Thank you!')}</p>
              )}
            </div>
          )}

          {!finished && !t.expired && pushState !== 'unsupported' && (
            <div className="mt-4 border-t border-gray-100 pt-4 dark:border-neutral-800">
              {pushState === 'on' ? (
                <p className="text-xs text-green-700 dark:text-green-400">🔔 {tx('Te avisaremos aquí cuando cambie lo importante (aceptado, listo).', "We'll notify you here when something important changes (accepted, ready).")}</p>
              ) : pushState === 'denied' ? (
                <p className="text-xs text-gray-500 dark:text-neutral-400">{tx('Las notificaciones están bloqueadas en este navegador. Mantén esta página abierta o vuelve a entrar con tu enlace.', 'Notifications are blocked in this browser. Keep this page open or come back using your link.')}</p>
              ) : (
                <button
                  type="button"
                  onClick={enablePush}
                  disabled={pushState === 'busy'}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-gray-300 px-4 text-sm font-medium hover:border-gray-400 disabled:opacity-60 dark:border-neutral-700 dark:text-white"
                >
                  🔔 {tx('Avísame cuando esté listo', 'Notify me when it is ready')}
                </button>
              )}
            </div>
          )}

          {(t.address || t.whatsApp) && (
            <div className="mt-4 space-y-1 border-t border-gray-100 pt-4 text-xs text-gray-500 dark:border-neutral-800 dark:text-neutral-400">
              {t.address && <p>📍 {t.address}</p>}
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-gray-400 dark:text-neutral-500">
          {tx('Esta página se actualiza sola', 'This page updates automatically')} · {tx('Pedido', 'Order')} #{token.slice(0, 6).toUpperCase()}
        </p>
      </div>
    </div>
  );
}
