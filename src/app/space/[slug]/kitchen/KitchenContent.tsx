'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useOrdersRealtime } from '@/hooks/useOrdersRealtime';
import type { OrderRow } from '../orders/OrdersContent';

interface Props {
  slug: string;
  plan: 'free' | 'entrepreneur';
  affiliateId: string;
  initialOrders: OrderRow[];
}

// Pensada para dejarse abierta en una tablet/monitor de cocina o mostrador — texto grande,
// botones grandes, sin nada administrativo (eso vive en Pedidos). Solo importa lo que hay que
// cocinar/preparar ahora y lo que ya está listo para entregar.
//
// Colores y urgencia por tiempo siguen el patrón estándar de KDS reales (Toast, Square,
// Otter): cada columna tiene un color de estado fijo, y además cualquier ticket en Nuevo/
// Preparando que lleve demasiado tiempo esperando escala visualmente (ámbar → rojo pulsante),
// independiente de en qué columna esté — así nada se "pierde" en la pantalla.
const COLUMNS: {
  status: OrderRow['status'];
  es: string;
  en: string;
  accent: string; // barra lateral + acentos del ticket
  badge: string; // pill del contador en el header de columna
}[] = [
  { status: 'Paid', es: 'Nuevo', en: 'New', accent: 'border-l-red-500', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  { status: 'Preparing', es: 'Preparando', en: 'Preparing', accent: 'border-l-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { status: 'Fulfilled', es: 'Listo', en: 'Ready', accent: 'border-l-emerald-500', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
];

// Umbrales de urgencia por tiempo de espera (minutos) — solo aplica a Nuevo/Preparando.
const WARNING_MINUTES = 5;
const URGENT_MINUTES = 10;

const SOUND_MUTED_KEY = 'kitchen-sound-muted';

/** Timbre de dos tonos generado con Web Audio API — sin depender de un archivo de audio
 *  (ni de conexión) para algo que tiene que sonar de inmediato en un dispositivo que se
 *  deja abierto todo el día. */
function chime(ctx: AudioContext) {
  const notes: [number, number][] = [[880, 0], [1046.5, 0.12]];
  for (const [freq, delay] of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    const t = ctx.currentTime + delay;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    osc.start(t);
    osc.stop(t + 0.4);
  }
}

function minutesSince(iso: string, now: number): number {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
}

export function KitchenContent({ slug, plan, affiliateId, initialOrders }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [orders, setOrders] = useState(initialOrders);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Sonido: el navegador bloquea el audio hasta que la persona interactúa una vez con la
  // página (política estándar de autoplay) — de ahí el botón "Activar sonido". Una vez
  // desbloqueado, el mismo AudioContext queda listo para sonar en cada pedido nuevo sin
  // pedir permiso de nuevo, mientras la pestaña siga abierta.
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [soundUnlocked, setSoundUnlocked] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(typeof window !== 'undefined' && localStorage.getItem(SOUND_MUTED_KEY) === '1');
  }, []);

  const unlockSound = useCallback(() => {
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioCtxRef.current ?? new Ctor();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();
      chime(ctx);
      setSoundUnlocked(true);
    } catch {
      // Sin Web Audio disponible — el resto de la pantalla sigue funcionando igual,
      // simplemente no habrá timbre.
    }
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem(SOUND_MUTED_KEY, next ? '1' : '0');
      return next;
    });
  }, []);

  // Reloj vivo para que el tiempo transcurrido de cada ticket (y su color de urgencia)
  // avance solo, sin depender de que llegue un evento nuevo por SignalR.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  useOrdersRealtime(affiliateId, (raw) => {
    const updated = raw as OrderRow;
    if (!updated?.id) return;
    setOrders((prev) => {
      const exists = prev.some((o) => o.id === updated.id);
      if (!exists && updated.status === 'Paid' && soundUnlocked && !muted) {
        const ctx = audioCtxRef.current;
        if (ctx) chime(ctx);
      }
      return exists ? prev.map((o) => (o.id === updated.id ? updated : o)) : [updated, ...prev];
    });
  });

  async function advance(orderId: string, status: string) {
    setBusyId(orderId);
    try {
      const res = await fetch(`/api/space/${slug}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)));
      }
    } finally {
      setBusyId(null);
    }
  }

  const byColumn = useMemo(() => {
    const map: Record<string, OrderRow[]> = { Paid: [], Preparing: [], Fulfilled: [] };
    for (const order of orders) {
      if (order.status in map) map[order.status].push(order);
    }
    // Nuevo/Preparando: FIFO — el más viejo primero, así se atiende en orden de llegada.
    map.Paid.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    map.Preparing.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    // Listo: el más reciente primero, para ubicar rápido el que se acaba de terminar.
    map.Fulfilled.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    map.Fulfilled = map.Fulfilled.slice(0, 12);
    return map;
  }, [orders]);

  if (plan === 'free') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
        <div className="px-6 py-12">
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            {getText(
              'El panel de Cocina es parte del plan Emprendedor.',
              'The Kitchen display is part of the Entrepreneur plan.',
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <div className="px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">{getText('Cocina', 'Kitchen')}</h1>

          <div className="flex items-center gap-2">
            {!soundUnlocked && (
              <button
                type="button"
                onClick={unlockSound}
                className="flex min-h-11 items-center gap-1.5 rounded-full bg-[#C8102E] px-4 text-sm font-semibold text-white"
              >
                🔔 {getText('Activar sonido', 'Enable sound')}
              </button>
            )}
            {soundUnlocked && (
              <button
                type="button"
                onClick={toggleMuted}
                title={muted ? getText('Sonido silenciado — click para activar', 'Sound muted — click to enable') : getText('Sonido activado — click para silenciar', 'Sound on — click to mute')}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-gray-200 dark:border-neutral-700 text-lg"
              >
                {muted ? '🔕' : '🔔'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.status} className="rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">{getText(col.es, col.en)}</h2>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${col.badge}`}>
                  {byColumn[col.status].length}
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-3">
                {byColumn[col.status].length === 0 && (
                  <p className="py-6 text-center text-sm text-gray-400 dark:text-neutral-600">
                    {getText('Nada acá.', 'Nothing here.')}
                  </p>
                )}

                {byColumn[col.status].map((order) => {
                  const waitMinutes = minutesSince(order.createdAt, now);
                  // La urgencia por tiempo solo aplica a Nuevo/Preparando — un ticket Listo
                  // ya no está "esperando" nada, así que no debe competir visualmente.
                  const isUrgent = col.status !== 'Fulfilled' && waitMinutes >= URGENT_MINUTES;
                  const isWarning = col.status !== 'Fulfilled' && waitMinutes >= WARNING_MINUTES;
                  return (
                    <div
                      key={order.id}
                      className={`rounded-xl border border-l-4 p-4 ${col.accent} ${
                        isUrgent
                          ? 'border-red-400 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 animate-pulse'
                          : col.status === 'Fulfilled'
                            ? 'border-gray-200/70 dark:border-neutral-800 opacity-70'
                            : 'border-gray-300 dark:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-base font-bold">
                          {order.customerName || getText('Cliente sin nombre', 'Unnamed customer')}
                        </p>
                        <div className="flex shrink-0 flex-col items-end gap-0.5">
                          <span className="text-xs text-gray-400 dark:text-neutral-500">
                            {new Date(order.createdAt).toLocaleTimeString(language === 'es' ? 'es-DO' : 'en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {col.status !== 'Fulfilled' && (
                            <span
                              className={`text-xs font-semibold ${
                                isUrgent
                                  ? 'text-red-600 dark:text-red-400'
                                  : isWarning
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-gray-400 dark:text-neutral-500'
                              }`}
                            >
                              {waitMinutes < 1
                                ? getText('recién', 'just now')
                                : getText(`hace ${waitMinutes} min`, `${waitMinutes} min ago`)}
                            </span>
                          )}
                        </div>
                      </div>

                      <ul className="mt-2 space-y-0.5">
                        {order.items.map((item) => (
                          <li key={item.itemId} className="text-sm text-gray-700 dark:text-neutral-300">
                            <span className="font-semibold">{item.qty}x</span> {item.name}
                            {item.notes && (
                              <div className="pl-4 text-xs italic text-amber-600 dark:text-amber-400">↳ {item.notes}</div>
                            )}
                          </li>
                        ))}
                      </ul>

                      {order.notes && (
                        <p className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-2 py-1 text-xs text-amber-700 dark:text-amber-400">
                          {order.notes}
                        </p>
                      )}

                      {col.status === 'Paid' && (
                        <button
                          onClick={() => advance(order.id, 'Preparing')}
                          disabled={busyId === order.id}
                          className="mt-3 w-full rounded-full bg-[#C8102E] py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          {getText('Empezar', 'Start')}
                        </button>
                      )}
                      {col.status === 'Preparing' && (
                        <button
                          onClick={() => advance(order.id, 'Fulfilled')}
                          disabled={busyId === order.id}
                          className="mt-3 w-full rounded-full bg-[#C8102E] py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          {getText('Listo', 'Ready')}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
