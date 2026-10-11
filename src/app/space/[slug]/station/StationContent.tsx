'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { isPaidPlan } from '@/lib/plan-limits';
import { formatScheduledFor, printTicket, type OrderRow } from '@/lib/orderTicket';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface Props {
  slug: string;
  plan: 'free' | 'entrepreneur' | 'enterprise';
  affiliateId: string;
  businessName?: string;
  timezone?: string;
  initialOrders: OrderRow[];
}

/** Cada cuánto repite la alarma mientras haya pedidos sin atender — más seguido que Cocina
 *  (7s): acá un pedido sin tocar significa que nadie lo vio todavía, no solo "sin empezar". */
const ALARM_INTERVAL_MS = 3500;
/** Sondeo de respaldo: por si un evento de SignalR se pierde (red inestable, tab que se
 *  despierta tarde), la estación igual se pone al día sola cada cierto tiempo. */
const POLL_INTERVAL_MS = 20000;
const SOUND_MUTED_KEY = 'station-sound-muted';

interface StationWakeLockSentinel {
  released: boolean;
  release: () => Promise<void>;
}
type NavigatorWithWakeLock = Navigator & {
  wakeLock?: { request: (type: 'screen') => Promise<StationWakeLockSentinel> };
};

/** Sirena de barrido (Web Audio, sin archivo de audio) — onda sawtooth (más áspera que un
 *  timbre) subiendo y bajando de tono, como una alarma de verdad en vez de un "ding". El modo
 *  insistente (alarma repetida, ver ALARM_INTERVAL_MS) hace dos barridos seguidos; el preview
 *  al iniciar turno (startShift) hace solo uno, más corto. */
function chime(ctx: AudioContext, insistent: boolean) {
  const sweeps = insistent ? 2 : 1;
  const sweepMs = 280; // duración de un barrido (subida + bajada)
  let t = ctx.currentTime;
  for (let s = 0; s < sweeps; s++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    const dur = sweepMs / 1000;
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.linearRampToValueAtTime(1150, t + dur / 2);
    osc.frequency.linearRampToValueAtTime(650, t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.7, t + 0.03);
    gain.gain.setValueAtTime(0.7, t + dur - 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.02);
    t += dur + 0.08;
  }
}

function minutesSince(iso: string, now: number): number {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
}

/** Un pedido necesita la estación cuando todavía nadie lo atendió:
 *  - Pending (PayAtPickup/PayAtTable) — esperando que alguien lo acepte.
 *  - Paid sin acknowledgedAt — pagado online (Stripe), pero nadie lo vio todavía.
 *  Un pedido programado para otro día (scheduledFor futuro) no urge: no suena ni entra a la
 *  cola principal, pero igual aparece abajo para que quede a la vista. */
function needsAttention(o: OrderRow): boolean {
  if (o.status === 'Pending') return true;
  if (o.status === 'Paid' && !o.acknowledgedAt) return true;
  return false;
}

function isUrgentNow(o: OrderRow): boolean {
  if (!needsAttention(o)) return false;
  const todayIso = new Date().toLocaleDateString('en-CA');
  if (o.scheduledFor && o.scheduledFor > todayIso) return false;
  return true;
}

const ETA_OPTIONS = [10, 15, 20, 30];

export function StationContent({ slug, plan, affiliateId, businessName, timezone, initialOrders }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();

  const [orders, setOrders] = useState(initialOrders);
  const [shiftStarted, setShiftStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [eta, setEtaChoice] = useState(15);
  const [connection, setConnection] = useState<'connecting' | 'online' | 'reconnecting' | 'offline'>('connecting');

  useEffect(() => {
    setMuted(typeof window !== 'undefined' && localStorage.getItem(SOUND_MUTED_KEY) === '1');
  }, []);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const startShift = useCallback(() => {
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioCtxRef.current ?? new Ctor();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();
      chime(ctx, false);
    } catch {
      // Sin Web Audio — la estación sigue funcionando, solo sin timbre.
    }
    setShiftStarted(true);
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem(SOUND_MUTED_KEY, next ? '1' : '0');
      return next;
    });
  }, []);

  // Wake Lock — la pantalla de la estación no debe apagarse nunca sola (mismo patrón que MenuBoard).
  useEffect(() => {
    let lock: StationWakeLockSentinel | null = null;
    let cancelled = false;
    async function request() {
      try {
        const nav = navigator as NavigatorWithWakeLock;
        if (!nav.wakeLock) return;
        const l = await nav.wakeLock.request('screen');
        if (cancelled) { await l.release().catch(() => {}); return; }
        lock = l;
      } catch {
        // No soportado o negado — sigue igual, sin esta protección.
      }
    }
    request();
    function onVisible() { if (document.visibilityState === 'visible') request(); }
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      lock?.release().catch(() => {});
    };
  }, []);

  // Reloj vivo para "hace X min".
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  const applyUpdate = useCallback((raw: unknown) => {
    const updated = raw as OrderRow;
    if (!updated?.id) return;
    setOrders((prev) => {
      const exists = prev.some((o) => o.id === updated.id);
      return exists ? prev.map((o) => (o.id === updated.id ? updated : o)) : [updated, ...prev];
    });
  }, []);

  // Tiempo real (OrdersHub) — misma conexión que Cocina, pero acá rastreamos el estado
  // (reconectando/caída) para avisar en pantalla: en una tablet que se deja sola todo el día,
  // una desconexión silenciosa es peor que una ruidosa.
  useEffect(() => {
    if (!affiliateId) return;
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`${API}/hubs/orders`)
      .withAutomaticReconnect()
      .build();
    conn.on('OrderUpdated', applyUpdate);
    conn.onreconnecting(() => setConnection('reconnecting'));
    conn.onreconnected(() => {
      setConnection('online');
      conn.invoke('JoinAffiliateGroup', affiliateId).catch(() => {});
    });
    conn.onclose(() => setConnection('offline'));

    let cancelled = false;
    conn.start()
      .then(() => {
        if (cancelled) return;
        setConnection('online');
        conn.invoke('JoinAffiliateGroup', affiliateId).catch(() => {});
      })
      .catch(() => setConnection('offline'));

    return () => {
      cancelled = true;
      conn.stop().catch(() => {});
    };
  }, [affiliateId, applyUpdate]);

  // Sondeo de respaldo — re-sincroniza la lista completa por si se perdió algún evento.
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/space/${slug}/orders`, { cache: 'no-store' });
        if (!res.ok) return;
        const fresh: OrderRow[] = await res.json();
        setOrders(fresh);
      } catch {
        // Falla transitoria — se reintenta en el próximo ciclo.
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [slug]);

  const queue = useMemo(
    () => orders.filter(needsAttention).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [orders],
  );
  const urgentCount = useMemo(() => queue.filter(isUrgentNow).length, [queue]);
  const current = queue[0];
  // Para el destello de pantalla (ver estilo más abajo) — misma condición que activa el sonido.
  const isRinging = shiftStarted && !muted && urgentCount > 0;

  // Alarma — suena mientras haya algo urgente sin atender, para de sonar en TODOS los
  // dispositivos abiertos en cuanto alguien acepta/reconoce (el estado viaja por SignalR).
  useEffect(() => {
    if (!shiftStarted || muted || urgentCount === 0) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const ring = () => chime(ctx, true);
    ring();
    const id = setInterval(ring, ALARM_INTERVAL_MS);
    return () => clearInterval(id);
  }, [shiftStarted, muted, urgentCount]);

  async function accept(order: OrderRow) {
    setBusy(true);
    try {
      let updated: OrderRow | null = null;
      if (order.status === 'Pending') {
        const res = await fetch(`/api/space/${slug}/orders/${order.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Paid', estimatedMinutes: eta }),
        });
        if (res.ok) updated = await res.json();
      } else {
        const ackRes = await fetch(`/api/space/${slug}/orders/${order.id}/acknowledge`, { method: 'PATCH' });
        if (ackRes.ok) updated = await ackRes.json();
        const etaRes = await fetch(`/api/space/${slug}/orders/${order.id}/eta`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ minutes: eta }),
        });
        if (etaRes.ok) updated = await etaRes.json();
      }
      if (!updated) {
        toast.error(getText('No se pudo aceptar. Intenta de nuevo.', "Couldn't accept. Try again."));
        return;
      }
      setOrders((prev) => prev.map((o) => (o.id === updated!.id ? updated! : o)));
      printTicket({ ...order, ...updated }, businessName || slug, language, timezone);
    } catch {
      toast.error(getText('No se pudo aceptar. Intenta de nuevo.', "Couldn't accept. Try again."));
    } finally {
      setBusy(false);
    }
  }

  if (!isPaidPlan(plan)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-center text-white">
        <p className="max-w-md text-white/70">
          {getText(
            'La Estación de pedidos es parte del plan Emprendedor.',
            'The Order Station is part of the Entrepreneur plan.',
          )}
        </p>
      </div>
    );
  }

  // Compuerta de turno — exige un toque antes de desbloquear el audio (política de autoplay
  // del navegador) y deja clarísimo que esta pantalla va a sonar fuerte desde este momento.
  if (!shiftStarted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-neutral-950 px-6 text-center text-white">
        <p className="text-7xl">🔔</p>
        <h1 className="text-3xl font-bold">{getText('Estación de pedidos', 'Order station')}</h1>
        <p className="max-w-sm text-white/60">
          {getText(
            'Esta pantalla va a sonar cuando llegue un pedido nuevo, hasta que alguien lo acepte.',
            'This screen will ring when a new order comes in, until someone accepts it.',
          )}
        </p>
        <button
          type="button"
          onClick={startShift}
          className="min-h-16 rounded-full bg-brand-primary px-10 text-xl font-bold text-white"
        >
          {getText('Iniciar turno', 'Start shift')}
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-neutral-950 text-white">
      {/* Destello de atención: brilla alrededor del borde de la pantalla al ritmo de la alarma,
          para que se note con el rabillo del ojo sin tener que mirar la tablet directamente.
          Vignette, no flash de pantalla completa — evita deslumbrar o sentirse una alarma de
          incendio. Sincronizado con ALARM_INTERVAL_MS, mismo gatillo que el sonido (isRinging). */}
      {isRinging && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 station-ring-glow"
        />
      )}
      <style>{`
        @keyframes stationRingPulse {
          0% { opacity: 0; }
          8% { opacity: 1; }
          16% { opacity: 0.2; }
          24% { opacity: 1; }
          40% { opacity: 0; }
          100% { opacity: 0; }
        }
        .station-ring-glow {
          background: radial-gradient(ellipse at center, transparent 55%, rgba(249,115,22,0.65) 100%);
          animation: stationRingPulse ${ALARM_INTERVAL_MS}ms ease-out infinite;
        }
      `}</style>
      <Toast toasts={toast.toasts} onRemove={toast.remove} />

      {connection !== 'online' && (
        <div className="bg-red-600 px-4 py-2 text-center text-sm font-semibold">
          {connection === 'reconnecting'
            ? getText('Reconectando…', 'Reconnecting…')
            : connection === 'offline'
              ? getText('Sin conexión — revisa el internet de esta pantalla', "No connection — check this screen's internet")
              : getText('Conectando…', 'Connecting…')}
        </div>
      )}

      <header className="relative z-10 flex items-center justify-between gap-3 px-6 py-4">
        <h1 className="text-xl font-bold">{getText('Estación de pedidos', 'Order station')}</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/50">
            {queue.length === 0
              ? getText('Sin pedidos pendientes', 'No pending orders')
              : getText(`${queue.length} por atender`, `${queue.length} waiting`)}
          </span>
          <button
            type="button"
            onClick={toggleMuted}
            title={muted ? getText('Silenciado', 'Muted') : getText('Sonando', 'Sound on')}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 text-lg"
          >
            {muted ? '🔕' : '🔔'}
          </button>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 pb-10">
        {!current ? (
          <div className="flex flex-col items-center gap-3 text-white/40">
            <p className="text-6xl">✅</p>
            <p className="text-xl">{getText('Todo atendido.', 'All caught up.')}</p>
          </div>
        ) : (
          <div className="flex w-full max-w-2xl flex-col gap-6 rounded-3xl bg-white/5 p-8 ring-2 ring-red-500/60">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-block rounded-full bg-red-600 px-4 py-1 text-sm font-bold uppercase tracking-wide">
                  {current.tableNumber
                    ? getText(`Mesa ${current.tableNumber}`, `Table ${current.tableNumber}`)
                    : current.paymentMethod === 'PayAtPickup'
                      ? getText('Para recoger', 'Pickup')
                      : getText('Pedido online', 'Online order')}
                </span>
                {current.scheduledFor && (
                  <span className="ml-2 inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
                    📅 {formatScheduledFor(current.scheduledFor, language)}
                  </span>
                )}
              </div>
              <span className="text-sm text-white/50">
                {minutesSince(current.createdAt, now) < 1
                  ? getText('recién', 'just now')
                  : getText(`hace ${minutesSince(current.createdAt, now)} min`, `${minutesSince(current.createdAt, now)} min ago`)}
              </span>
            </div>

            <p className="text-2xl font-bold">
              {current.customerName || getText('Cliente sin nombre', 'Unnamed customer')}
            </p>
            {current.customerPhone && <p className="text-white/60">{current.customerPhone}</p>}

            <ul className="flex flex-col gap-1.5 border-t border-white/10 pt-4 text-lg">
              {current.items.map((item) => (
                <li key={item.itemId}>
                  <span className="font-bold">{item.qty}x</span> {item.name}
                  {item.notes && <div className="pl-5 text-sm italic text-amber-300">↳ {item.notes}</div>}
                </li>
              ))}
            </ul>

            {current.notes && (
              <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-300">{current.notes}</p>
            )}

            <div className="flex flex-col gap-3 border-t border-white/10 pt-5">
              <span className="text-sm text-white/50">{getText('Listo en', 'Ready in')}</span>
              <div className="flex gap-2">
                {ETA_OPTIONS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setEtaChoice(m)}
                    className={`min-h-11 flex-1 rounded-full border text-sm font-semibold ${
                      eta === m ? 'border-brand-primary bg-brand-primary text-white' : 'border-white/20 text-white/70'
                    }`}
                  >
                    {m} min
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => accept(current)}
                className="min-h-20 rounded-2xl bg-green-600 text-2xl font-bold disabled:opacity-50"
              >
                {busy ? getText('Aceptando…', 'Accepting…') : `✓ ${getText('Aceptar pedido', 'Accept order')}`}
              </button>
            </div>
          </div>
        )}

        {queue.length > 1 && (
          <div className="pointer-events-none fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-lg font-bold">
            +{queue.length - 1}
          </div>
        )}
      </main>
    </div>
  );
}
