'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { formatDate, moneyFormatter, readApiError } from '@/lib/receivables';
import { mapsUrl, type DriverSheet, type DriverStop, type ProductLite, type Reconciliation, type StopStatus } from '@/lib/delivery';
import { DeliveryForm } from './DeliveryForm';

interface Props {
  slug: string;
  currency: 'USD' | 'DOP';
  initialSheet: DriverSheet;
  products: ProductLite[];
}

const STATUS_STYLE: Record<StopStatus, string> = {
  pending: 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300',
  visited: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  skipped: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

export function RouteContent({ slug, currency, initialSheet, products }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();
  const fmt = moneyFormatter(currency);

  const [sheet, setSheet] = useState<DriverSheet>(initialSheet);
  const [openStop, setOpenStop] = useState<string | null>(null);
  const [delivering, setDelivering] = useState<string | null>(null);
  const [loadedFull, setLoadedFull] = useState(initialSheet.loadedFull?.toString() ?? '');
  const [busy, setBusy] = useState(false);
  const [recon, setRecon] = useState<Reconciliation | null>(null);

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

  async function refresh() {
    try {
      const res = await fetch(`${base}/driver-sheet`, { cache: 'no-store' });
      if (res.ok) setSheet(await res.json());
    } catch {
      /* se queda con lo que ya tiene */
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
    const res = await call(`stops/${stop.stop.id}/skip`, { status, notes: notes?.trim() || null }, getText('No se pudo actualizar la parada.', "Couldn't update the stop."));
    if (res) {
      setOpenStop(null);
      await refresh();
    }
  }

  async function closeRoute() {
    const pending = sheet.stops.filter((s) => s.stop.status === 'pending').length;
    if (pending > 0 && !window.confirm(getText(`Quedan ${pending} paradas pendientes. Se marcarán como omitidas. ¿Cerrar la ruta?`, `${pending} stops are pending. They will be marked skipped. Close the route?`))) return;
    const res = await call('close', { markPendingAsSkipped: true }, getText('No se pudo cerrar la ruta.', "Couldn't close the route."));
    if (!res) return;
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

      <Link href={`/space/${slug}/ruta`} className="text-sm text-gray-500 dark:text-neutral-400">
        ← {getText('Mis rutas', 'My routes')}
      </Link>
      <h1 className="mt-2 break-words text-xl font-bold">{sheet.name}</h1>
      <p className="text-sm text-gray-500 dark:text-neutral-400">
        {formatDate(sheet.routeDate)} · {statusLabel[sheet.status] ?? sheet.status}
        {sheet.vehiclePlate ? ` · ${sheet.vehiclePlate}` : ''} · {done}/{sheet.stops.length}
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-800">
        <div className="h-full" style={{ width: `${sheet.stops.length ? (done / sheet.stops.length) * 100 : 0}%`, ...brand }} />
      </div>

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
                  {s.amountOwed > 0 && <span className={`text-xs font-semibold ${s.hasOverdue ? 'text-red-600 dark:text-red-400' : ''}`}>{fmt.format(s.amountOwed)}</span>}
                </div>
              </button>

              {open && (
                <div className="mt-3 space-y-3 text-sm">
                  <div className="flex flex-wrap gap-2">
                    {s.stop.customerPhone && (
                      <a href={`tel:${s.stop.customerPhone}`} className={btn}>
                        {getText('Llamar', 'Call')}
                      </a>
                    )}
                    {s.stop.customerAddress && (
                      <a href={mapsUrl(s.stop.customerAddress)} target="_blank" rel="noopener noreferrer" className={btn}>
                        {getText('Cómo llegar', 'Directions')}
                      </a>
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
