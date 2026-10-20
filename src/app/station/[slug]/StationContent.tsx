'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { isPaidPlan } from '@/lib/plan-limits';
import { formatScheduledFor, mergeOrderUpdate, printTicket, type OrderRow } from '@/lib/orderTicket';
import { CustomerTrustBadge, canMarkNoShow } from '@/components/space/CustomerTrustBadge';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface Props {
  slug: string;
  plan: 'free' | 'entrepreneur' | 'enterprise';
  affiliateId: string;
  businessName?: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
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

/** Timbre de dos tonos alternados, agudo/grave (Web Audio, sin archivo de audio) — onda
 *  triangular, más suave y menos áspera que el barrido sawtooth anterior (reportado como
 *  "feo"), pero conserva la urgencia por la alternancia de tono, como una alarma clásica.
 *  El modo insistente (alarma repetida, ver ALARM_INTERVAL_MS) repite el patrón dos veces;
 *  el preview al iniciar turno (startShift) hace solo una ronda. */
function chime(ctx: AudioContext, insistent: boolean) {
  const rounds = insistent ? 2 : 1;
  const notes = [880, 660]; // agudo, grave — alternando
  const toneMs = 180;
  const gapMs = 40;
  let t = ctx.currentTime;
  for (let r = 0; r < rounds; r++) {
    for (const freq of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      const dur = toneMs / 1000;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.5, t + 0.02);
      gain.gain.setValueAtTime(0.5, t + dur - 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.02);
      t += dur + gapMs / 1000;
    }
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

/** En proceso = ya aceptado (alguien lo vio) y todavía no entregado. */
function isInProgress(o: OrderRow): boolean {
  if (o.status === 'Preparing' || o.status === 'Ready') return true;
  return o.status === 'Paid' && !!o.acknowledgedAt;
}

type NextStatus = 'Preparing' | 'Ready' | 'Fulfilled';
function nextStatusOf(o: OrderRow): NextStatus {
  return o.status === 'Paid' ? 'Preparing' : o.status === 'Preparing' ? 'Ready' : 'Fulfilled';
}

const ETA_OPTIONS = [10, 15, 20, 30];

/** Estado del reloj de un pedido en proceso: cuánto falta para la hora prometida al cliente
 *  (estimatedReadyAt) o, si ya está listo, cuánto lleva esperando que lo recojan. */
function timing(o: OrderRow, now: number): { tone: 'ok' | 'warn' | 'late' | 'neutral'; es: string; en: string } {
  if (o.status === 'Ready') {
    const m = o.estimatedReadyAt ? minutesSince(o.estimatedReadyAt, now) : minutesSince(o.createdAt, now);
    return { tone: m >= 10 ? 'warn' : 'ok', es: `Listo · esperando ${m} min`, en: `Ready · waiting ${m} min` };
  }
  if (!o.estimatedReadyAt) {
    const m = minutesSince(o.createdAt, now);
    return { tone: 'neutral', es: `Hace ${m} min`, en: `${m} min ago` };
  }
  const left = Math.round((new Date(o.estimatedReadyAt).getTime() - now) / 60000);
  if (left < 0) return { tone: 'late', es: `Atrasado ${-left} min`, en: `${-left} min late` };
  if (left <= 4) return { tone: 'warn', es: `Faltan ${left} min`, en: `${left} min left` };
  return { tone: 'ok', es: `Faltan ${left} min`, en: `${left} min left` };
}

const TONE_CLASSES: Record<'ok' | 'warn' | 'late' | 'neutral', string> = {
  ok: 'bg-green-600/15 text-green-700 dark:text-green-300',
  warn: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  late: 'bg-red-600 text-white',
  neutral: 'bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-white/60',
};

const STATUS_BADGE: Record<string, string> = {
  Paid: 'bg-sky-600 text-white',
  Preparing: 'bg-amber-500 text-white',
  Ready: 'bg-green-600 text-white',
};

export function StationContent({ slug, plan, affiliateId, businessName, logoUrl, timezone, initialOrders }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();

  const [orders, setOrders] = useState(initialOrders);
  const [shiftStarted, setShiftStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [eta, setEtaChoice] = useState(15);
  const [connection, setConnection] = useState<'connecting' | 'online' | 'reconnecting' | 'offline'>('connecting');
  const [detailId, setDetailId] = useState<string | null>(null);
  // "No vino" en dos toques (sin diálogos del navegador en el kiosko): el primero arma, el segundo confirma.
  const [noShowArmed, setNoShowArmed] = useState<string | null>(null);

  useEffect(() => {
    setMuted(typeof window !== 'undefined' && localStorage.getItem(SOUND_MUTED_KEY) === '1');
  }, []);

  // Kiosko: sin menú contextual (mantener presionado en la tablet abría "abrir enlace / copiar")
  // ni gestos de "tirar para recargar". La salida real la bloquea Fully Kiosk (ver
  // docs/station/kiosk.md); esto evita las vías de escape dentro de la propia página.
  useEffect(() => {
    const block = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', block);
    const prev = document.documentElement.style.overscrollBehavior;
    document.documentElement.style.overscrollBehavior = 'none';
    return () => {
      document.removeEventListener('contextmenu', block);
      document.documentElement.style.overscrollBehavior = prev;
    };
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

  // Reloj vivo para "faltan X min" / "atrasado X min".
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(id);
  }, []);

  const applyUpdate = useCallback((raw: unknown) => {
    const updated = raw as OrderRow;
    if (!updated?.id) return;
    setOrders((prev) => {
      const exists = prev.some((o) => o.id === updated.id);
      // mergeOrderUpdate: los eventos de cambio de estado no traen el historial del cliente.
      return exists ? prev.map((o) => (o.id === updated.id ? mergeOrderUpdate(o, updated) : o)) : [updated, ...prev];
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

  // Pedidos aceptados que siguen en cocina — el personal los sigue y los avanza desde ESTA
  // pantalla (FIFO: el más viejo arriba), sin otro dispositivo ni otro módulo.
  const inProgress = useMemo(
    () => orders.filter(isInProgress).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [orders],
  );
  const lateCount = useMemo(() => inProgress.filter((o) => timing(o, now).tone === 'late').length, [inProgress, now]);
  const detailOrder = detailId ? orders.find((o) => o.id === detailId) ?? null : null;
  const [advancingId, setAdvancingId] = useState<string | null>(null);

  const kindLabel = (o: OrderRow) =>
    o.tableNumber
      ? getText(`Mesa ${o.tableNumber}`, `Table ${o.tableNumber}`)
      : o.paymentMethod === 'PayAtPickup'
        ? getText('Para recoger', 'Pickup')
        : getText('Pedido online', 'Online order');
  const statusLabel = (o: OrderRow) =>
    o.status === 'Paid' ? getText('Aceptado', 'Accepted')
    : o.status === 'Preparing' ? getText('Preparando', 'Preparing')
    : o.status === 'Ready' ? getText('Listo', 'Ready')
    : o.status === 'Fulfilled' ? getText('Entregado', 'Fulfilled')
    : o.status === 'Canceled' ? getText('Cancelado', 'Canceled')
    : getText('Por aceptar', 'To accept');
  const nextLabel = (n: NextStatus) =>
    n === 'Preparing' ? getText('Empezar a preparar', 'Start preparing')
    : n === 'Ready' ? getText('Marcar listo', 'Mark ready')
    : getText('Entregado', 'Hand off');
  const needsCollect = (o: OrderRow) =>
    (o.paymentMethod === 'PayAtPickup' || o.paymentMethod === 'PayAtTable') && !o.collectedAt;
  const shortId = (o: OrderRow) => `#${o.id.slice(0, 4).toUpperCase()}`;
  const money = (n: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(n);
  const clock = (iso: string) =>
    new Date(iso).toLocaleTimeString(language === 'es' ? 'es' : 'en-US', {
      hour: 'numeric', minute: '2-digit', ...(timezone ? { timeZone: timezone } : {}),
    });

  async function advanceStatus(order: OrderRow) {
    const status = nextStatusOf(order);
    setAdvancingId(order.id);
    try {
      const res = await fetch(`/api/space/${slug}/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...updated } : o)));
        if (status === 'Fulfilled') setDetailId((id) => (id === order.id ? null : id));
      } else {
        toast.error(getText('No se pudo actualizar. Intenta de nuevo.', "Couldn't update. Try again."));
      }
    } catch {
      toast.error(getText('No se pudo actualizar. Intenta de nuevo.', "Couldn't update. Try again."));
    } finally {
      setAdvancingId(null);
    }
  }

  async function markNoShow(order: OrderRow) {
    if (noShowArmed !== order.id) {
      setNoShowArmed(order.id);
      setTimeout(() => setNoShowArmed((id) => (id === order.id ? null : id)), 5000);
      return;
    }
    setNoShowArmed(null);
    setAdvancingId(order.id);
    try {
      const res = await fetch(`/api/space/${slug}/orders/${order.id}/no-show`, { method: 'PATCH' });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === order.id ? mergeOrderUpdate(o, data) : o)));
        setDetailId(null);
        toast.success(getText('Marcado como "No vino". Su próximo pedido tendrá que pagarse por adelantado.', 'Marked as no-show. Their next order will require paying in advance.'));
      } else {
        toast.error(data?.error?.message ?? getText('No se pudo marcar.', "Couldn't mark it."));
      }
    } catch {
      toast.error(getText('No se pudo marcar.', "Couldn't mark it."));
    } finally {
      setAdvancingId(null);
    }
  }

  function reprint(order: OrderRow) {
    printTicket(order, businessName || slug, language, timezone);
  }

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
        // El backend marca AcknowledgedAt al aceptar (Pending -> Paid), así el pedido pasa directo a
        // "En proceso" y deja de sonar en todos los dispositivos.
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

  const poweredBy = (
    <p className="flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium text-gray-400 dark:text-white/25">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-icon.svg" alt="" width={12} height={12} className="block" />
      {getText('Impulsado por', 'Powered by')}{' '}
      <span className="font-semibold text-gray-500 dark:text-white/40">MaalCa</span>
    </p>
  );

  if (!isPaidPlan(plan)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 text-center text-gray-900 dark:bg-neutral-950 dark:text-white">
        <p className="max-w-md text-gray-500 dark:text-white/70">
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-6 text-center text-gray-900 dark:bg-neutral-950 dark:text-white">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={businessName || ''}
            className="h-20 w-20 rounded-full object-cover ring-2 ring-black/5 dark:ring-white/10"
          />
        ) : (
          <p className="text-7xl">🔔</p>
        )}
        <div>
          {businessName && (
            <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-white/50">
              {businessName}
            </p>
          )}
          <h1 className="text-3xl font-bold">{getText('Estación de pedidos', 'Order station')}</h1>
        </div>
        <p className="max-w-sm text-gray-500 dark:text-white/60">
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
        <div className="mt-2">{poweredBy}</div>
      </div>
    );
  }

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-gray-50 text-gray-900 select-none dark:bg-neutral-950 dark:text-white">
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
          background: radial-gradient(ellipse at center, transparent 55%, rgba(249,115,22,0.4) 100%);
          animation: stationRingPulse ${ALARM_INTERVAL_MS}ms ease-out infinite;
        }
        html[data-theme='dark'] .station-ring-glow {
          background: radial-gradient(ellipse at center, transparent 55%, rgba(249,115,22,0.65) 100%);
        }
      `}</style>
      <Toast toasts={toast.toasts} onRemove={toast.remove} />

      {connection !== 'online' && (
        <div className="relative z-10 bg-red-600 px-4 py-2 text-center text-sm font-semibold text-white">
          {connection === 'reconnecting'
            ? getText('Reconectando…', 'Reconnecting…')
            : connection === 'offline'
              ? getText('Sin conexión — revisa el internet de esta pantalla', "No connection — check this screen's internet")
              : getText('Conectando…', 'Connecting…')}
        </div>
      )}

      <header className="relative z-10 flex items-center justify-between gap-3 px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={businessName || ''}
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10"
            />
          ) : null}
          <div className="min-w-0">
            <p className="truncate text-lg font-bold leading-tight">
              {businessName || getText('Estación de pedidos', 'Order station')}
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-white/40">
              {getText('Estación de pedidos', 'Order station')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${queue.length > 0 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-white/50'}`}>
            {getText(`${queue.length} por aceptar`, `${queue.length} to accept`)}
          </span>
          <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-600 dark:bg-white/10 dark:text-white/70">
            {getText(`${inProgress.length} en proceso`, `${inProgress.length} in progress`)}
          </span>
          {lateCount > 0 && (
            <span className="rounded-full bg-red-600/15 px-3 py-1 text-sm font-semibold text-red-700 dark:text-red-300">
              {getText(`${lateCount} atrasado${lateCount === 1 ? '' : 's'}`, `${lateCount} late`)}
            </span>
          )}
          <button
            type="button"
            onClick={toggleMuted}
            title={muted ? getText('Silenciado', 'Muted') : getText('Sonando', 'Sound on')}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-gray-200 text-lg dark:border-neutral-700"
          >
            {muted ? '🔕' : '🔔'}
          </button>
        </div>
      </header>

      {/* Dos columnas en tablet horizontal: a la izquierda lo urgente (pedido nuevo que suena),
          a la derecha el seguimiento sin prisa (en proceso). En pantallas angostas se apilan. */}
      <div className="relative z-10 grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-4 px-4 pb-2 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:grid-rows-1">
        <section className="flex min-h-0 flex-col overflow-y-auto">
          {!current ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-gray-400 dark:text-white/40">
              <p className="text-6xl">✅</p>
              <p className="text-xl">{getText('Sin pedidos nuevos.', 'No new orders.')}</p>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-5 rounded-3xl border border-gray-200 bg-white p-6 ring-2 ring-red-500/60 dark:border-transparent dark:bg-white/5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block rounded-full bg-red-600 px-4 py-1 text-sm font-bold uppercase tracking-wide text-white">
                    {kindLabel(current)}
                  </span>
                  <span className="text-sm font-semibold text-gray-400 dark:text-white/40">{shortId(current)}</span>
                  <CustomerTrustBadge order={current} getText={getText} size="md" />
                  {current.scheduledFor && (
                    <span className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                      📅 {formatScheduledFor(current.scheduledFor, language)}
                    </span>
                  )}
                </div>
                <span className="flex shrink-0 items-center gap-2 text-sm text-gray-500 dark:text-white/50">
                  {queue.length > 1 && (
                    <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white">
                      {getText(`+${queue.length - 1} en cola`, `+${queue.length - 1} queued`)}
                    </span>
                  )}
                  {minutesSince(current.createdAt, now) < 1
                    ? getText('recién', 'just now')
                    : getText(`hace ${minutesSince(current.createdAt, now)} min`, `${minutesSince(current.createdAt, now)} min ago`)}
                </span>
              </div>

              <div>
                <p className="text-2xl font-bold">
                  {current.customerName || getText('Cliente sin nombre', 'Unnamed customer')}
                </p>
                {current.customerPhone && (
                  <a href={`tel:${current.customerPhone}`} className="mt-1 inline-flex min-h-11 items-center gap-2 rounded-full border border-gray-300 px-4 text-base font-semibold dark:border-white/20">
                    📞 {current.customerPhone}
                  </a>
                )}
                {(current.customerNoShows ?? 0) > 0 && current.paymentMethod === 'PayAtPickup' && (
                  <p className="mt-2 rounded-xl bg-red-600/10 px-3 py-2 text-sm font-semibold text-red-700 dark:text-red-300">
                    {getText('Este cliente ya dejó pedidos sin recoger. Llámalo antes de prepararlo.', "This customer has left orders unclaimed before. Call them before preparing it.")}
                  </p>
                )}
              </div>

              <ul className="flex flex-col gap-1.5 border-t border-gray-200 pt-4 text-lg dark:border-white/10">
                {current.items.map((item, i) => (
                  <li key={`${item.itemId}-${i}`}>
                    <span className="font-bold">{item.qty}x</span> {item.name}
                    {item.notes && <div className="pl-5 text-sm italic text-amber-700 dark:text-amber-300">↳ {item.notes}</div>}
                  </li>
                ))}
              </ul>

              {current.notes && (
                <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">{current.notes}</p>
              )}

              <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-white/10">
                <span className="text-sm text-gray-500 dark:text-white/50">{getText('Listo en', 'Ready in')}</span>
                <div className="flex gap-2">
                  {ETA_OPTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setEtaChoice(m)}
                      className={`min-h-12 flex-1 rounded-full border text-base font-semibold ${
                        eta === m ? 'border-brand-primary bg-brand-primary text-white' : 'border-gray-300 text-gray-500 dark:border-white/20 dark:text-white/70'
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
                  className="min-h-20 rounded-2xl bg-green-600 text-2xl font-bold text-white disabled:opacity-50"
                >
                  {busy ? getText('Aceptando…', 'Accepting…') : `✓ ${getText('Aceptar e imprimir', 'Accept & print')}`}
                </button>
              </div>

            </div>
          )}
        </section>

        <section className="flex min-h-0 flex-col rounded-3xl bg-gray-100 dark:bg-white/[0.03]">
          <p className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-white/40">
            {getText('En proceso', 'In progress')} · {inProgress.length}
          </p>
          {inProgress.length === 0 ? (
            <p className="flex flex-1 items-center justify-center px-6 pb-6 text-center text-gray-400 dark:text-white/30">
              {getText('Nada en cocina ahora mismo.', 'Nothing in the kitchen right now.')}
            </p>
          ) : (
            <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3">
              {inProgress.map((o) => {
                const tm = timing(o, now);
                const next = nextStatusOf(o);
                const itemCount = o.items.reduce((s, i) => s + i.qty, 0);
                const summary = o.items.map((i) => `${i.qty}x ${i.name}`).join(' · ');
                return (
                  <li
                    key={o.id}
                    className={`shrink-0 overflow-hidden rounded-2xl border bg-white dark:bg-white/5 ${tm.tone === 'late' ? 'border-red-500 ring-1 ring-red-500/50' : 'border-gray-200 dark:border-white/10'}`}
                  >
                    <button type="button" onClick={() => setDetailId(o.id)} className="flex w-full flex-col gap-1.5 p-4 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-lg font-bold">
                          {o.tableNumber ? kindLabel(o) : (o.customerName || kindLabel(o))}
                          <span className="ml-2 text-sm font-semibold text-gray-400 dark:text-white/40">{shortId(o)}</span>
                        </span>
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${STATUS_BADGE[o.status] ?? 'bg-gray-300'}`}>
                          {statusLabel(o)}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm text-gray-600 dark:text-white/60">
                        <span className="font-semibold">{getText(`${itemCount} art.`, `${itemCount} items`)}</span> · {summary}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE_CLASSES[tm.tone]}`}>
                          ⏱ {getText(tm.es, tm.en)}
                        </span>
                        {needsCollect(o) && (
                          <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                            💵 {getText('Falta cobrar', 'Not paid yet')}
                          </span>
                        )}
                        <CustomerTrustBadge order={o} getText={getText} />
                        {o.notes && <span className="text-xs text-amber-700 dark:text-amber-300">📝 {getText('Nota', 'Note')}</span>}
                        <span className="ml-auto text-xs font-semibold text-brand-primary">{getText('Ver detalle ›', 'Details ›')}</span>
                      </div>
                    </button>
                    <div className="px-3 pb-3">
                      <button
                        type="button"
                        disabled={advancingId === o.id}
                        onClick={() => advanceStatus(o)}
                        className="min-h-12 w-full rounded-xl bg-brand-primary px-3 text-base font-semibold text-white disabled:opacity-50"
                      >
                        {advancingId === o.id ? getText('Actualizando…', 'Updating…') : nextLabel(next)}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="relative z-10">{poweredBy}</div>

      {/* Detalle del pedido: todo lo que el personal necesita sin salir de la estación —
          artículos con notas, cliente, horarios, cobro — más reimprimir y avanzar estado. */}
      {detailOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setDetailId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white text-gray-900 shadow-2xl dark:bg-neutral-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-gray-200 p-5 dark:border-white/10">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-gray-900 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-white dark:bg-white dark:text-gray-900">
                    {kindLabel(detailOrder)}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${STATUS_BADGE[detailOrder.status] ?? 'bg-gray-300 text-gray-700'}`}>
                    {statusLabel(detailOrder)}
                  </span>
                  <span className="text-sm font-semibold text-gray-400 dark:text-white/40">{shortId(detailOrder)}</span>
                  <CustomerTrustBadge order={detailOrder} getText={getText} />
                </div>
                <p className="mt-2 truncate text-2xl font-bold">
                  {detailOrder.customerName || getText('Cliente sin nombre', 'Unnamed customer')}
                </p>
                {detailOrder.customerPhone && (
                  <a href={`tel:${detailOrder.customerPhone}`} className="mt-1 inline-flex min-h-10 items-center gap-2 rounded-full border border-gray-300 px-3 text-sm font-semibold dark:border-white/20">
                    📞 {detailOrder.customerPhone}
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={() => setDetailId(null)}
                aria-label={getText('Cerrar', 'Close')}
                className="flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl dark:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-gray-100 p-3 dark:bg-white/5">
                  <p className="text-xs text-gray-500 dark:text-white/40">{getText('Recibido', 'Received')}</p>
                  <p className="font-semibold">{clock(detailOrder.createdAt)} · {getText(`hace ${minutesSince(detailOrder.createdAt, now)} min`, `${minutesSince(detailOrder.createdAt, now)} min ago`)}</p>
                </div>
                <div className="rounded-xl bg-gray-100 p-3 dark:bg-white/5">
                  <p className="text-xs text-gray-500 dark:text-white/40">{getText('Prometido para', 'Promised for')}</p>
                  <p className="font-semibold">
                    {detailOrder.estimatedReadyAt ? clock(detailOrder.estimatedReadyAt) : '—'}
                    {isInProgress(detailOrder) && (
                      <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${TONE_CLASSES[timing(detailOrder, now).tone]}`}>
                        {getText(timing(detailOrder, now).es, timing(detailOrder, now).en)}
                      </span>
                    )}
                  </p>
                </div>
                {detailOrder.scheduledFor && (
                  <div className="col-span-2 rounded-xl bg-amber-500/15 p-3 text-amber-800 dark:text-amber-200">
                    📅 {getText('Programado para', 'Scheduled for')} {formatScheduledFor(detailOrder.scheduledFor, language)}
                  </div>
                )}
              </div>

              <ul className="flex flex-col divide-y divide-gray-200 dark:divide-white/10">
                {detailOrder.items.map((item, i) => (
                  <li key={`${item.itemId}-${i}`} className="flex items-start justify-between gap-3 py-2.5">
                    <div className="min-w-0 text-lg">
                      <span className="font-bold">{item.qty}x</span> {item.name}
                      {item.notes && <div className="text-sm font-semibold text-amber-700 dark:text-amber-300">↳ {item.notes}</div>}
                    </div>
                    <span className="shrink-0 text-sm text-gray-500 dark:text-white/50">{money(item.price * item.qty, detailOrder.currency)}</span>
                  </li>
                ))}
              </ul>

              {detailOrder.notes && (
                <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-amber-800 dark:text-amber-200">📝 {detailOrder.notes}</p>
              )}

              <div className="flex flex-col gap-1 rounded-xl bg-gray-100 p-3 text-sm dark:bg-white/5">
                <div className="flex justify-between"><span>{getText('Subtotal', 'Subtotal')}</span><span>{money(detailOrder.subtotal, detailOrder.currency)}</span></div>
                {detailOrder.tax > 0 && <div className="flex justify-between"><span>{getText('Impuesto', 'Tax')}</span><span>{money(detailOrder.tax, detailOrder.currency)}</span></div>}
                {!!detailOrder.tip && detailOrder.tip > 0 && <div className="flex justify-between"><span>{getText('Propina', 'Tip')}</span><span>{money(detailOrder.tip, detailOrder.currency)}</span></div>}
                <div className="flex justify-between text-base font-bold"><span>Total</span><span>{money(detailOrder.total, detailOrder.currency)}</span></div>
                <div className="mt-1 border-t border-gray-200 pt-2 dark:border-white/10">
                  {detailOrder.paymentMethod === 'PayAtPickup' || detailOrder.paymentMethod === 'PayAtTable' ? (
                    detailOrder.collectedAt ? (
                      <span className="font-semibold text-green-700 dark:text-green-300">
                        ✓ {getText('Cobrado', 'Collected')}{detailOrder.collectedMethod ? ` · ${detailOrder.collectedMethod}` : ''}
                        {detailOrder.collectedReference ? ` · ${detailOrder.collectedReference}` : ''}
                      </span>
                    ) : (
                      <span className="font-semibold text-amber-700 dark:text-amber-300">
                        💵 {detailOrder.paymentMethod === 'PayAtTable'
                          ? getText('Falta cobrar — paga en la mesa', 'Not paid yet — pays at the table')
                          : getText('Falta cobrar — paga al recoger', 'Not paid yet — pays at pickup')}
                      </span>
                    )
                  ) : (
                    <span className="font-semibold text-green-700 dark:text-green-300">✓ {getText('Pagado en línea', 'Paid online')}</span>
                  )}
                </div>
              </div>
            </div>

            {canMarkNoShow(detailOrder) && (
              <div className="border-t border-gray-200 px-4 pt-3 dark:border-white/10">
                <button
                  type="button"
                  disabled={advancingId === detailOrder.id}
                  onClick={() => markNoShow(detailOrder)}
                  className={`min-h-12 w-full rounded-2xl text-base font-semibold disabled:opacity-50 ${
                    noShowArmed === detailOrder.id
                      ? 'bg-red-600 text-white'
                      : 'border-2 border-red-300 text-red-600 dark:border-red-500/40 dark:text-red-300'
                  }`}
                >
                  {noShowArmed === detailOrder.id
                    ? getText('Toca otra vez para confirmar "No vino"', 'Tap again to confirm no-show')
                    : getText('🚫 No vino a recogerlo', '🚫 Never picked up')}
                </button>
              </div>
            )}

            <div className="flex gap-3 border-t border-gray-200 p-4 dark:border-white/10">
              <button
                type="button"
                onClick={() => reprint(detailOrder)}
                className="min-h-14 flex-1 rounded-2xl border-2 border-gray-300 text-lg font-semibold dark:border-white/20"
              >
                🖨 {getText('Reimprimir', 'Reprint')}
              </button>
              {isInProgress(detailOrder) && (
                <button
                  type="button"
                  disabled={advancingId === detailOrder.id}
                  onClick={() => advanceStatus(detailOrder)}
                  className="min-h-14 flex-[1.4] rounded-2xl bg-brand-primary text-lg font-bold text-white disabled:opacity-50"
                >
                  {advancingId === detailOrder.id ? getText('Actualizando…', 'Updating…') : nextLabel(nextStatusOf(detailOrder))}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
