'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { formatDate, moneyFormatter, readApiError } from '@/lib/receivables';
import { mapsUrl, type DriverSheet, type DriverStop, type ProductLite, type Reconciliation, type StopStatus } from '@/lib/delivery';
import type { BrandInfo } from '@/lib/pdf/document';
import {
  applyQueueToSheet,
  flushQueue,
  onQueueChange,
  postOrQueue,
  readQueue,
  readSheetSnapshot,
  removeAction,
  saveSheetSnapshot,
  type QueuedAction,
} from '@/lib/offline-queue';
import { DeliveryForm } from './DeliveryForm';

interface Props {
  slug: string;
  currency: 'USD' | 'DOP';
  brand: BrandInfo;
  initialSheet: DriverSheet;
  products: ProductLite[];
}

const STATUS_STYLE: Record<StopStatus, string> = {
  pending: 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300',
  visited: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  skipped: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

export function RouteContent({ slug, currency, brand: brandInfo, initialSheet, products }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();
  const fmt = moneyFormatter(currency);

  const [rawSheet, setSheet] = useState<DriverSheet>(initialSheet);
  // Acciones guardadas sin señal: se reflejan en la hoja (parada visitada/omitida) hasta que se envían.
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const sheet = useMemo(() => applyQueueToSheet(rawSheet, queue), [rawSheet, queue]);
  const pendingSend = queue.filter((a) => !a.error);
  const needsReview = queue.filter((a) => a.error);
  const [openStop, setOpenStop] = useState<string | null>(null);
  const [delivering, setDelivering] = useState<string | null>(null);
  const [loadedFull, setLoadedFull] = useState(initialSheet.loadedFull?.toString() ?? '');
  const [busy, setBusy] = useState(false);
  const [recon, setRecon] = useState<Reconciliation | null>(null);
  // Modo camión: estado de la ubicación del teléfono (se comparte con la oficina mientras la ruta está en curso).
  const [gps, setGps] = useState<'off' | 'ok' | 'denied' | 'unsupported'>('off');
  const lastPos = useRef<{ lat: number; lng: number } | null>(null);
  const lastSent = useRef(0);

  const base = `/api/space/${slug}/routes/${sheet.routeId}`;
  const editable = sheet.status === 'in_progress';
  const statusLabel: Record<string, string> = {
    planned: getText('Planificada', 'Planned'),
    loading: getText('Cargando', 'Loading'),
    in_progress: getText('En ruta', 'In progress'),
    completed: getText('Completada', 'Completed'),
    cancelled: getText('Cancelada', 'Cancelled'),
  };
  const stopLabel: Record<StopStatus, string> = {
    pending: getText('Pendiente', 'Pending'),
    visited: getText('Visitado', 'Visited'),
    skipped: getText('Omitido', 'Skipped'),
    failed: getText('Fallido', 'Failed'),
  };

  // Hoja de reparto en papel (plan B si falla el teléfono): marca del negocio y casillas para anotar a mano.
  function printSheet() {
    const w = window.open('', '_blank');
    if (!w) {
      toast.error(getText('El navegador bloqueó la ventana de impresión.', 'The browser blocked the print window.'));
      return;
    }
    const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);
    const color = /^#[0-9a-f]{6}$/i.test(brandInfo.primaryColor ?? '') ? (brandInfo.primaryColor as string) : '#045AFE';
    const rows = [...sheet.stops]
      .sort((a, b) => a.stop.sortOrder - b.stop.sortOrder)
      .map((s, i) => {
        const env = s.containers.filter((c) => c.outstanding > 0).map((c) => `${c.outstanding} ${c.containerTypeName}`).join(', ');
        // Lo que ya se registró en el sistema sale escrito; lo pendiente queda en blanco para anotarlo a mano.
        const r = s.result;
        const num = (n: number) => String(Number(n.toFixed(2)));
        const methodLabel: Record<string, string> = { cash: getText('Efectivo', 'Cash'), transfer: getText('Transferencia', 'Transfer'), mixed: getText('Mixto', 'Mixed') };
        const deliveredParts = r ? r.items.map((it) => `${num(it.quantity)} ${it.description}`) : [];
        if (r && deliveredParts.length === 0 && r.containersDelivered > 0) deliveredParts.push(`${r.containersDelivered} ${getText('llenos', 'full')}`);
        if (!r && (s.stop.status === 'skipped' || s.stop.status === 'failed')) deliveredParts.push(stopLabel[s.stop.status]);
        const collectedParts = r ? [r.containersReturned > 0 ? `${r.containersReturned} ${getText('vacíos', 'empty')}` : '', r.containersDamaged > 0 ? `${r.containersDamaged} ${getText('dañados', 'damaged')}` : ''].filter(Boolean) : [];
        const paid = r && r.paymentAmount > 0 ? `${esc(fmt.format(r.paymentAmount))}${r.paymentMethod ? `<br><small>${esc(methodLabel[r.paymentMethod] ?? r.paymentMethod)}</small>` : ''}` : '';
        return `<tr><td>${i + 1}</td><td><b>${esc(s.stop.customerName)}</b><br><small>${esc([s.stop.customerAddress, s.stop.customerPhone].filter(Boolean).join(' · '))}</small></td><td>${esc(env || '—')}</td><td class="r">${s.amountOwed > 0 ? esc(fmt.format(s.amountOwed)) : '—'}</td><td>${esc(deliveredParts.join(', '))}</td><td>${esc(collectedParts.join(', '))}</td><td>${paid}</td></tr>`;
      })
      .join('');
    const logo = brandInfo.logoUrl ? `<img src="${esc(brandInfo.logoUrl)}" style="height:44px;max-width:160px;object-fit:contain"/>` : '';
    w.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>${esc(sheet.name)}</title><style>body{font-family:sans-serif;margin:16px;color:#111}header{display:flex;align-items:center;gap:12px;border-bottom:3px solid ${color};padding-bottom:8px}h1{font-size:18px;margin:0;color:${color}}p{margin:2px 0;font-size:12px;color:#444}table{width:100%;border-collapse:collapse;margin-top:12px;font-size:12px}th{background:${color};color:#fff;text-align:left;padding:6px}td{border:1px solid #bbb;padding:6px;height:34px;vertical-align:top}.r{text-align:right}small{color:#555}</style></head><body><header>${logo}<div><h1>${esc(brandInfo.name)}</h1><p>${esc(sheet.name)} · ${esc(formatDate(sheet.routeDate))}${sheet.vehiclePlate ? ` · ${esc(sheet.vehiclePlate)}` : ''}${sheet.loadedFull != null ? ` · ${getText('Cargado', 'Loaded')}: ${sheet.loadedFull}` : ''}</p></div></header><table><thead><tr><th>#</th><th>${getText('Cliente', 'Customer')}</th><th>${getText('Envases en cliente', 'Containers at customer')}</th><th>${getText('Saldo', 'Balance')}</th><th>${getText('Entregó', 'Delivered')}</th><th>${getText('Recogió', 'Collected')}</th><th>${getText('Cobró', 'Paid')}</th></tr></thead><tbody>${rows}</tbody></table><script>window.onload=function(){window.print()}</script></body></html>`,
    );
    w.document.close();
  }

  async function refresh() {
    try {
      const res = await fetch(`${base}/driver-sheet`, { cache: 'no-store' });
      if (res.ok) {
        const fresh: DriverSheet = await res.json();
        saveSheetSnapshot(fresh.routeId, fresh);
        setSheet(fresh);
      }
    } catch {
      /* se queda con lo que ya tiene */
    }
  }

  async function syncNow() {
    if (!readQueue(sheet.routeId).some((a) => !a.error)) return;
    setSyncing(true);
    const r = await flushQueue(sheet.routeId);
    setSyncing(false);
    if (r.sent > 0) {
      toast.success(getText(`${r.sent} enviada(s).`, `${r.sent} sent.`));
      await refresh();
    }
    if (r.failed > 0) toast.error(getText(`${r.failed} no se pudo(ieron) registrar: revisa el aviso de arriba.`, `${r.failed} couldn't be recorded: check the notice above.`));
  }
  const syncRef = useRef(syncNow);
  syncRef.current = syncNow;

  // Al abrir: copia local más reciente (si la página vino de la caché sin señal), cola pendiente y reenvío automático.
  useEffect(() => {
    const id = initialSheet.routeId;
    const snap = readSheetSnapshot(id);
    if (snap && snap.savedAt > (Date.parse(initialSheet.generatedAt) || 0)) setSheet(snap.sheet);
    else saveSheetSnapshot(id, initialSheet);
    setQueue(readQueue(id));
    setOnline(navigator.onLine);
    const off = onQueueChange(id, () => setQueue(readQueue(id)));
    const goOnline = () => {
      setOnline(true);
      void syncRef.current();
    };
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    const timer = setInterval(() => void syncRef.current(), 20000);
    void syncRef.current();
    return () => {
      off();
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deja lista la ruta para abrirla sin señal: registra el service worker y guarda la página y sus scripts en caché.
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !navigator.onLine) return;
    navigator.serviceWorker
      .register('/sw.js')
      .then(async () => {
        await navigator.serviceWorker.ready;
        await fetch(window.location.pathname, { headers: { 'x-offline-prime': '1' }, credentials: 'same-origin' });
        for (const e of performance.getEntriesByType('resource')) if (e.name.includes('/_next/static/')) fetch(e.name).catch(() => {});
      })
      .catch(() => {});
  }, []);

  // Comparte la ubicación cada ~15 s mientras la ruta está en curso. Es mejor esfuerzo: sin señal simplemente no se envía.
  useEffect(() => {
    if (sheet.status !== 'in_progress') return;
    if (!('geolocation' in navigator)) {
      setGps('unsupported');
      return;
    }
    const routeBase = `/api/space/${slug}/routes/${sheet.routeId}`;
    const watchId = navigator.geolocation.watchPosition(
      (p) => {
        lastPos.current = { lat: p.coords.latitude, lng: p.coords.longitude };
        setGps('ok');
        const now = Date.now();
        if (now - lastSent.current < 15000 || !navigator.onLine) return;
        lastSent.current = now;
        fetch(`${routeBase}/position`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: p.coords.latitude,
            lng: p.coords.longitude,
            accuracyMeters: p.coords.accuracy,
            speedKmh: p.coords.speed != null ? p.coords.speed * 3.6 : null,
          }),
        }).catch(() => {});
      },
      (err) => setGps(err.code === err.PERMISSION_DENIED ? 'denied' : 'off'),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [sheet.status, sheet.routeId, slug]);

  // Mantiene la pantalla encendida durante la ruta: con el teléfono bloqueado el navegador deja de enviar la ubicación.
  useEffect(() => {
    if (sheet.status !== 'in_progress' || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    const request = () => {
      navigator.wakeLock.request('screen').then((l) => { lock = l; }).catch(() => {});
    };
    request();
    const onVisible = () => { if (document.visibilityState === 'visible') request(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      lock?.release().catch(() => {});
    };
  }, [sheet.status]);

  // "Llegué" y "Salí": no bloquean la entrega. Llegué guarda también dónde estaba el teléfono.
  async function mark(stop: DriverStop, kind: 'arrive' | 'depart') {
    setBusy(true);
    try {
      const body = kind === 'arrive' && lastPos.current ? { lat: lastPos.current.lat, lng: lastPos.current.lng } : {};
      const res = await fetch(`${base}/stops/${stop.stop.id}/${kind}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) {
        toast.error(await readApiError(res, getText('No se pudo registrar.', "Couldn't record it.")));
        return;
      }
      await refresh();
    } catch {
      toast.error(getText('Sin conexión. Intenta de nuevo.', 'No connection. Try again.'));
    } finally {
      setBusy(false);
    }
  }

  async function call(path: string, body: unknown, errorMsg: string): Promise<Response | null> {
    setBusy(true);
    try {
      const res = await fetch(`${base}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) {
        toast.error(await readApiError(res, errorMsg));
        return null;
      }
      return res;
    } catch {
      toast.error(getText('Sin conexión. Intenta de nuevo.', 'No connection. Try again.'));
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function startRoute() {
    const n = loadedFull.trim() === '' ? null : Math.max(0, Math.floor(Number(loadedFull) || 0));
    const res = await call('start', { loadedFull: n }, getText('No se pudo iniciar la ruta.', "Couldn't start the route."));
    if (res) {
      toast.success(getText('Ruta iniciada.', 'Route started.'));
      await refresh();
    }
  }

  async function skip(stop: DriverStop, status: 'skipped' | 'failed') {
    const notes = window.prompt(getText('Motivo (opcional)', 'Reason (optional)')) ?? null;
    setBusy(true);
    try {
      const outcome = await postOrQueue(sheet.routeId, {
        kind: 'skip',
        stopId: stop.stop.id,
        url: `${base}/stops/${stop.stop.id}/skip`,
        body: { status, notes: notes?.trim() || null },
        label: stop.stop.customerName,
        skipStatus: status,
      });
      if (outcome.queued) {
        toast.success(getText('Sin señal: guardado en el teléfono, se enviará solo.', 'No signal: saved on the phone, it will send itself.'));
        setOpenStop(null);
        return;
      }
      if (!outcome.res.ok) {
        toast.error(await readApiError(outcome.res, getText('No se pudo actualizar la parada.', "Couldn't update the stop.")));
        return;
      }
      setOpenStop(null);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function closeRoute() {
    if (queue.length > 0) {
      toast.error(getText(`Hay ${queue.length} acción(es) sin enviar o por revisar. Envíalas antes de cerrar la ruta.`, `${queue.length} action(s) not sent or needing review. Send them before closing the route.`));
      return;
    }
    const pending = sheet.stops.filter((s) => s.stop.status === 'pending').length;
    if (pending > 0 && !window.confirm(getText(`Quedan ${pending} paradas pendientes. Se marcarán como omitidas. ¿Cerrar la ruta?`, `${pending} stops are pending. They will be marked skipped. Close the route?`))) return;
    const res = await call('close', { markPendingAsSkipped: true }, getText('No se pudo cerrar la ruta.', "Couldn't close the route."));
    if (!res) return;
    // El estado cambia al instante; el cuadre y la hoja se traen después (la API tarda un par de segundos).
    setSheet((prev) => ({ ...prev, status: 'completed' }));
    try {
      const r = await fetch(`${base}/reconciliation`, { cache: 'no-store' });
      if (r.ok) setRecon(await r.json());
    } catch {
      /* el cuadre se puede ver luego */
    }
    toast.success(getText('Ruta cerrada.', 'Route closed.'));
    await refresh();
  }

  const done = sheet.stops.filter((s) => s.stop.status !== 'pending').length;
  const btn = 'rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm font-semibold disabled:opacity-50';
  const primary = 'rounded-full px-4 py-3 text-base font-semibold text-white disabled:opacity-50';
  const brand = { backgroundColor: 'var(--brand-primary, #045AFE)' };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-5">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />

      {(!online || queue.length > 0) && (
        <div role="status" className="mb-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="font-semibold">
            {!online ? getText('Sin conexión', 'Offline') : pendingSend.length > 0 ? getText('Entregas por enviar', 'Deliveries to send') : getText('Hay registros que revisar', 'Records to review')}
            {pendingSend.length > 0 && ` · ${pendingSend.length} ${getText('por enviar', 'to send')}`}
          </p>
          {!online && <p className="mt-0.5">{getText('Sigue registrando: se guarda en el teléfono y se envía sola cuando vuelva la señal.', 'Keep recording: it is saved on the phone and sent when the signal returns.')}</p>}
          {online && pendingSend.length > 0 && (
            <button type="button" onClick={() => void syncNow()} disabled={syncing} className="mt-2 rounded-full border border-amber-400 px-3 py-1.5 text-xs font-semibold disabled:opacity-50">
              {syncing ? getText('Enviando…', 'Sending…') : getText('Enviar ahora', 'Send now')}
            </button>
          )}
          {needsReview.map((a) => (
            <div key={a.id} className="mt-2 rounded-lg bg-white/70 p-2 dark:bg-black/30">
              <p className="font-semibold">{a.label}</p>
              <p className="text-xs">{a.error}</p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(getText('¿Descartar esta acción? No se registrará en el sistema.', 'Discard this action? It will not be recorded.'))) removeAction(sheet.routeId, a.id);
                }}
                className="mt-1 text-xs font-semibold underline"
              >
                {getText('Descartar', 'Discard')}
              </button>
            </div>
          ))}
        </div>
      )}

      <Link href={`/space/${slug}/ruta`} className="text-sm text-gray-500 dark:text-neutral-400">
        ← {getText('Mis rutas', 'My routes')}
      </Link>
      <div className="mt-2 flex items-start justify-between gap-2">
        <h1 className="break-words text-xl font-bold">{sheet.name}</h1>
        <button type="button" onClick={printSheet} className="shrink-0 rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold">
          {getText('Imprimir hoja', 'Print sheet')}
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-neutral-400">
        {formatDate(sheet.routeDate)} · {statusLabel[sheet.status] ?? sheet.status}
        {sheet.vehiclePlate ? ` · ${sheet.vehiclePlate}` : ''} · {done}/{sheet.stops.length}
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-800">
        <div className="h-full" style={{ width: `${sheet.stops.length ? (done / sheet.stops.length) * 100 : 0}%`, ...brand }} />
      </div>

      {editable && gps !== 'off' && (
        <p className={`mt-2 text-xs ${gps === 'ok' ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-300'}`}>
          {gps === 'ok' && getText('Ubicación compartida con la oficina. Mantén la pantalla encendida.', 'Location shared with the office. Keep the screen on.')}
          {gps === 'denied' && getText('Activa el permiso de ubicación del navegador para compartirla con la oficina.', 'Allow browser location access to share it with the office.')}
          {gps === 'unsupported' && getText('Este teléfono no permite compartir la ubicación.', 'This phone cannot share its location.')}
        </p>
      )}

      {(sheet.status === 'planned' || sheet.status === 'loading') && (
        <div className="mt-4 rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
          <label className="text-sm font-semibold">{getText('Botellones llenos cargados en el camión', 'Full bottles loaded on the truck')}</label>
          <input type="number" inputMode="numeric" min="0" value={loadedFull} onChange={(e) => setLoadedFull(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2.5 text-base" />
          <button type="button" onClick={startRoute} disabled={busy} className={`${primary} mt-3 w-full`} style={brand}>
            {getText('Iniciar ruta', 'Start route')}
          </button>
        </div>
      )}

      <ul className="mt-4 space-y-3">
        {sheet.stops.map((s) => {
          const open = openStop === s.stop.id;
          const isDelivering = delivering === s.stop.id;
          return (
            <li key={s.stop.id} className="rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
              <button type="button" onClick={() => setOpenStop(open ? null : s.stop.id)} className="flex w-full items-start justify-between gap-2 text-left">
                <div className="min-w-0">
                  <p className="break-words text-base font-semibold">
                    {s.stop.sortOrder}. {s.stop.customerName}
                  </p>
                  {s.stop.customerAddress && <p className="break-words text-sm text-gray-500 dark:text-neutral-400">{s.stop.customerAddress}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[s.stop.status]}`}>{stopLabel[s.stop.status]}</span>
                  {pendingSend.some((a) => a.stopId === s.stop.id) && <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">{getText('Por enviar', 'To send')}</span>}
                  {s.amountOwed > 0 && <span className={`text-xs font-semibold ${s.hasOverdue ? 'text-red-600 dark:text-red-400' : ''}`}>{fmt.format(s.amountOwed)}</span>}
                </div>
              </button>

              {/* Dirección y Navegar siempre a la vista: el chofer no debería abrir la parada para saber a dónde ir. */}
              {s.stop.status === 'pending' &&
                (s.stop.customerAddress || (s.stop.customerLat != null && s.stop.customerLng != null) ? (
                  <a
                    href={mapsUrl(s.stop.customerAddress ?? '', s.stop.customerLat, s.stop.customerLng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border-2 px-4 py-2.5 text-sm font-semibold"
                    style={{ borderColor: 'var(--brand-primary, #045AFE)', color: 'var(--brand-primary, #045AFE)' }}
                  >
                    <span aria-hidden="true">📍</span>
                    {getText('Navegar hasta aquí', 'Navigate here')}
                  </a>
                ) : (
                  <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                    {getText('Este cliente no tiene dirección ni ubicación registrada. Pídele a la oficina que la agregue en su ficha de Clientes.', 'This customer has no address or location on file. Ask the office to add it in their Customers record.')}
                  </p>
                ))}

              {open && (
                <div className="mt-3 space-y-3 text-sm">
                  <div className="flex flex-wrap gap-2">
                    {s.stop.customerPhone && (
                      <a href={`tel:${s.stop.customerPhone}`} className={btn}>
                        {getText('Llamar', 'Call')}
                      </a>
                    )}
                    {editable && s.stop.status === 'pending' && !s.stop.arrivedAt && (
                      <button type="button" onClick={() => mark(s, 'arrive')} disabled={busy} className={btn}>
                        {getText('Llegué', "I'm here")}
                      </button>
                    )}
                    {editable && s.stop.arrivedAt && !s.stop.departedAt && (
                      <button type="button" onClick={() => mark(s, 'depart')} disabled={busy} className={btn}>
                        {getText('Salí', 'I left')}
                      </button>
                    )}
                  </div>

                  {s.containers.length > 0 && (
                    <p>
                      <span className="font-semibold">{getText('Envases del cliente', 'Customer containers')}: </span>
                      {s.containers.map((c) => `${c.containerTypeName} ${c.outstanding}`).join(' · ')}
                    </p>
                  )}
                  {(s.racksLoaned > 0 || s.bottlesLoaned > 0) && (
                    <p className="text-gray-500 dark:text-neutral-400">
                      {getText('Cupo prestado', 'Loan quota')}: {s.racksLoaned} {getText('anaqueles', 'racks')} · {s.bottlesLoaned} {getText('botellones', 'bottles')}
                    </p>
                  )}
                  {s.amountOwed > 0 && (
                    <div>
                      <p className="font-semibold">
                        {getText('Debe', 'Owes')}: {fmt.format(s.amountOwed)}
                      </p>
                      <ul className="mt-1 space-y-0.5 text-gray-500 dark:text-neutral-400">
                        {s.openInvoices.map((inv) => (
                          <li key={inv.invoiceId} className={inv.isOverdue ? 'text-red-600 dark:text-red-400' : ''}>
                            {inv.invoiceNumber} · {fmt.format(inv.open)}
                            {inv.isOverdue ? ` · ${getText('vencida', 'overdue')}` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {s.creditOnAccount > 0 && (
                    <p className="text-green-700 dark:text-green-400">
                      {getText('Saldo a favor', 'Credit on account')}: {fmt.format(s.creditOnAccount)}
                    </p>
                  )}
                  {s.stop.arrivedAt && (
                    <p className="text-gray-500 dark:text-neutral-400">
                      {getText('Llegó', 'Arrived')} {new Date(s.stop.arrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {s.stop.departedAt && ` · ${getText('Salió', 'Left')} ${new Date(s.stop.departedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  )}
                  {s.stop.notes && <p className="italic text-gray-500 dark:text-neutral-400">{s.stop.notes}</p>}

                  {editable && s.stop.status === 'pending' && !isDelivering && (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setDelivering(s.stop.id)} className={`${primary} flex-1`} style={brand}>
                        {getText('Registrar entrega', 'Record delivery')}
                      </button>
                      <button type="button" onClick={() => skip(s, 'skipped')} disabled={busy} className={btn}>
                        {getText('Omitir', 'Skip')}
                      </button>
                      <button type="button" onClick={() => skip(s, 'failed')} disabled={busy} className={btn}>
                        {getText('No estaba', 'Not home')}
                      </button>
                    </div>
                  )}

                  {isDelivering && (
                    <DeliveryForm
                      slug={slug}
                      routeId={sheet.routeId}
                      stop={s}
                      containerTypes={sheet.containerTypes.filter((t) => t.isActive)}
                      products={products}
                      currency={currency}
                      notify={{ success: toast.success, error: toast.error }}
                      onCancel={() => setDelivering(null)}
                      onDone={async () => {
                        setDelivering(null);
                        setOpenStop(null);
                        await refresh();
                      }}
                    />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {editable && (
        <button type="button" onClick={closeRoute} disabled={busy} className={`${primary} mt-6 w-full`} style={brand}>
          {getText('Cerrar ruta', 'Close route')}
        </button>
      )}

      {recon && (
        <section className="mt-6 rounded-xl border border-gray-200 dark:border-neutral-800 p-4 text-sm">
          <h2 className="text-base font-bold">{getText('Cuadre de la ruta', 'Route reconciliation')}</h2>
          <dl className="mt-3 grid grid-cols-2 gap-y-1.5">
            {recon.loadedFull !== null && (<><dt>{getText('Cargados', 'Loaded')}</dt><dd className="text-right">{recon.loadedFull}</dd></>)}
            <dt>{getText('Entregados', 'Delivered')}</dt><dd className="text-right">{recon.deliveredFull}</dd>
            <dt>{getText('Vacíos recogidos', 'Empties back')}</dt><dd className="text-right">{recon.returnedEmpty}</dd>
            <dt>{getText('Dañados', 'Damaged')}</dt><dd className="text-right">{recon.damaged}</dd>
            {recon.fullRemaining !== null && (<><dt className="font-semibold">{getText('Llenos que vuelven a planta', 'Full returning to plant')}</dt><dd className="text-right font-semibold">{recon.fullRemaining}</dd></>)}
            <dt>{getText('Ventas', 'Sales')}</dt><dd className="text-right">{fmt.format(recon.salesTotal)}</dd>
            <dt>{getText('Cobrado en efectivo', 'Cash collected')}</dt><dd className="text-right">{fmt.format(recon.collectedCash)}</dd>
            <dt>{getText('Cobrado por transferencia', 'Transfers collected')}</dt><dd className="text-right">{fmt.format(recon.collectedTransfer)}</dd>
          </dl>
        </section>
      )}
    </div>
  );
}
