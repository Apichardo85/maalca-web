'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { moneyFormatter, readApiError } from '@/lib/receivables';
import {
  extractQrCode,
  type AnaquelScan,
  type ContainerTypeLite,
  type DriverStop,
  type ProductLite,
} from '@/lib/delivery';
import { postOrQueue } from '@/lib/offline-queue';
import { QrScanner } from './QrScanner';

interface Props {
  slug: string;
  routeId: string;
  stop: DriverStop;
  containerTypes: ContainerTypeLite[];
  products: ProductLite[];
  currency: 'USD' | 'DOP';
  onDone: () => void;
  onCancel: () => void;
  notify: { success: (m: string) => void; error: (m: string) => void };
}

interface Line {
  delivered: number;
  returned: number;
  damaged: number;
}

interface ItemRow {
  productId: string;
  qty: number;
}

// Pensado para el camión: sol, calor y manos sucias. Botones grandes, números grandes y atajos con las cantidades de siempre.
const QUICK = [1, 2, 3, 5, 10];

function Stepper({ label, value, onChange, presets }: { label?: string; value: number; onChange: (n: number) => void; presets?: number[] }) {
  return (
    <div className="flex flex-col items-end">
      {label && <span className="mb-1 self-start text-sm font-semibold text-gray-700 dark:text-neutral-200">{label}</span>}
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="h-14 w-14 rounded-xl border-2 border-gray-400 text-3xl font-bold active:bg-gray-200 dark:border-neutral-600 dark:active:bg-neutral-700" aria-label="−">
          −
        </button>
        <input
          type="number"
          inputMode="numeric"
          min="0"
          value={value}
          onChange={(e) => onChange(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
          className="h-14 w-16 rounded-xl border-2 border-gray-400 bg-transparent text-center text-2xl font-bold dark:border-neutral-600"
        />
        <button type="button" onClick={() => onChange(value + 1)} className="h-14 w-14 rounded-xl border-2 border-gray-400 text-3xl font-bold active:bg-gray-200 dark:border-neutral-600 dark:active:bg-neutral-700" aria-label="+">
          +
        </button>
      </div>
      {presets && (
        <div className="mt-2 flex gap-2">
          {presets.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              aria-pressed={value === n}
              className={`h-12 min-w-12 rounded-full border-2 px-3 text-lg font-bold ${value === n ? 'border-transparent text-white' : 'border-gray-400 dark:border-neutral-600'}`}
              style={value === n ? { backgroundColor: 'var(--brand-primary, #045AFE)' } : undefined}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DeliveryForm({ slug, routeId, stop, containerTypes, products, currency, onDone, onCancel, notify }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const fmt = moneyFormatter(currency);

  // La misma llave se reutiliza si el envío se reintenta (mala señal, doble toque): el API no duplica la entrega.
  const idempotencyKey = useRef<string>(crypto.randomUUID());

  const [lines, setLines] = useState<Record<string, Line>>({});
  const [items, setItems] = useState<ItemRow[]>([]);
  const [anaquelId, setAnaquelId] = useState<string>(stop.anaqueles.length === 1 ? stop.anaqueles[0].id : '');
  const [scanning, setScanning] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'transfer'>('cash');
  const [receivedBy, setReceivedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  // Los productos que más se entregan salen primero (se aprende en este teléfono; no hay que configurar nada).
  const usageKey = `maalca-route-product-use:${slug}`;
  const [usage, setUsage] = useState<Record<string, number>>({});
  useEffect(() => {
    try { setUsage(JSON.parse(localStorage.getItem(usageKey) ?? '{}')); } catch { /* sin historial */ }
  }, [usageKey]);

  const priceOf = (p: ProductLite) => stop.agreedPrices?.find((a) => a.itemId === p.id)?.price ?? p.price;
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const total = items.reduce((sum, row) => {
    const p = productById.get(row.productId);
    return sum + (p ? Math.round(priceOf(p) * row.qty * 100) / 100 : 0);
  }, 0);

  const lineOf = (typeId: string): Line => lines[typeId] ?? { delivered: 0, returned: 0, damaged: 0 };
  const setLine = (typeId: string, patch: Partial<Line>) => setLines((prev) => ({ ...prev, [typeId]: { ...lineOf(typeId), ...patch } }));
  const heldOf = (typeId: string) => stop.containers.find((c) => c.containerTypeId === typeId)?.outstanding ?? 0;

  const qtyOf = (productId: string) => items.find((r) => r.productId === productId)?.qty ?? 0;
  const setQty = (productId: string, n: number) =>
    setItems((prev) => {
      if (n <= 0) return prev.filter((r) => r.productId !== productId);
      return prev.some((r) => r.productId === productId) ? prev.map((r) => (r.productId === productId ? { ...r, qty: n } : r)) : [...prev, { productId, qty: n }];
    });
  const sortedProducts = useMemo(() => [...products].sort((a, b) => (usage[b.id] ?? 0) - (usage[a.id] ?? 0)), [products, usage]);
  const totalQty = items.reduce((sum, r) => sum + r.qty, 0);
  const singleType = containerTypes.length === 1 ? containerTypes[0] : null;

  async function onScanned(raw: string) {
    setScanning(false);
    try {
      const res = await fetch(`/api/space/${slug}/anaqueles/by-qr/${encodeURIComponent(extractQrCode(raw))}`, { cache: 'no-store' });
      if (res.status === 404) {
        notify.error(getText('Ese código no es de un anaquel de este negocio.', "That code isn't a rack of this business."));
        return;
      }
      if (!res.ok) throw new Error();
      const scan: AnaquelScan = await res.json();
      if (scan.anaquel.customerId !== stop.stop.customerId) {
        notify.error(
          getText(
            `Ese anaquel es de ${scan.anaquel.customerName ?? 'otro cliente'}, no de ${stop.stop.customerName}.`,
            `That rack belongs to ${scan.anaquel.customerName ?? 'another customer'}, not ${stop.stop.customerName}.`,
          ),
        );
        return;
      }
      setAnaquelId(scan.anaquel.id);
      notify.success(getText('Anaquel confirmado.', 'Rack confirmed.'));
    } catch {
      notify.error(getText('No se pudo leer el anaquel. Intenta de nuevo.', "Couldn't read the rack. Try again."));
    }
  }

  async function submit() {
    const containers = containerTypes
      .map((t) => ({ containerTypeId: t.id, ...lineOf(t.id) }))
      .filter((l) => l.delivered + l.returned + l.damaged > 0);
    const pay = Number(payAmount);
    const paymentAmount = Number.isFinite(pay) && pay > 0 ? pay : null;
    if (items.length === 0 && containers.length === 0 && paymentAmount === null) {
      notify.error(getText('Registra al menos un producto, un envase o un cobro.', 'Record at least a product, a container or a payment.'));
      return;
    }
    setSaving(true);
    try {
      // Sin señal: se guarda en el teléfono y se envía sola al volver (con la misma llave, no se duplica).
      try {
        const next = { ...usage };
        items.forEach((r) => { next[r.productId] = (next[r.productId] ?? 0) + r.qty; });
        localStorage.setItem(usageKey, JSON.stringify(next));
      } catch { /* sin historial */ }
      const outcome = await postOrQueue(routeId, {
        kind: 'delivery',
        stopId: stop.stop.id,
        url: `/api/space/${slug}/routes/${routeId}/stops/${stop.stop.id}/delivery`,
        label: stop.stop.customerName,
        body: {
          items: items.flatMap((row) => {
            const p = productById.get(row.productId);
            return p ? [{ itemId: p.id, description: p.name, quantity: row.qty, unitPrice: priceOf(p) }] : [];
          }),
          containers,
          anaquelId: anaquelId || null,
          paymentAmount,
          paymentMethod: method,
          receivedBy: receivedBy.trim() || null,
          notes: notes.trim() || null,
          idempotencyKey: idempotencyKey.current,
        },
      });
      if (outcome.queued) {
        notify.success(getText('Sin señal: la entrega quedó guardada en el teléfono y se enviará sola.', 'No signal: the delivery is saved on the phone and will send itself.'));
        onDone();
        return;
      }
      const res = outcome.res;
      if (!res.ok) {
        notify.error(await readApiError(res, getText('No se pudo registrar la entrega. Intenta de nuevo.', "Couldn't record the delivery. Try again.")));
        return;
      }
      const result: { duplicate: boolean; delivery: { invoiceNumber: string | null } } = await res.json();
      const invoice = result.delivery?.invoiceNumber;
      notify.success(
        result.duplicate
          ? getText('Esa entrega ya estaba registrada.', 'That delivery was already recorded.')
          : invoice
            ? getText(`Entrega registrada. Factura ${invoice}.`, `Delivery recorded. Invoice ${invoice}.`)
            : getText('Entrega registrada.', 'Delivery recorded.'),
      );
      onDone();
    } catch {
      notify.error(getText('Sin conexión. Intenta de nuevo; no se duplicará.', "No connection. Try again; it won't be duplicated."));
    } finally {
      setSaving(false);
    }
  }

  const input = 'w-full rounded-xl border-2 border-gray-400 dark:border-neutral-600 bg-transparent px-3 py-3 text-lg';
  const bigBtn = 'rounded-xl border-2 border-gray-400 dark:border-neutral-600 px-4 py-3.5 text-base font-bold active:bg-gray-200 dark:active:bg-neutral-700';
  const brandBg = { backgroundColor: 'var(--brand-primary, #045AFE)' };

  return (
    <div className="mt-3 space-y-6 rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
      {scanning && <QrScanner onResult={onScanned} onClose={() => setScanning(false)} />}

      {products.length > 0 && (
        <section>
          <h4 className="text-base font-bold">{getText('Productos', 'Products')}</h4>
          <div className="mt-2 space-y-3">
            {sortedProducts.map((p) => {
              const qty = qtyOf(p.id);
              if (qty === 0) {
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setQty(p.id, 1)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border-2 border-gray-400 px-4 py-4 text-left active:bg-gray-200 dark:border-neutral-600 dark:active:bg-neutral-700"
                  >
                    <span className="min-w-0">
                      <span className="block break-words text-lg font-bold">{p.name}</span>
                      <span className="block text-base text-gray-600 dark:text-neutral-300">{fmt.format(priceOf(p))}</span>
                    </span>
                    <span className="shrink-0 rounded-full px-4 py-2 text-lg font-bold text-white" style={brandBg}>+ {getText('Agregar', 'Add')}</span>
                  </button>
                );
              }
              return (
                <div key={p.id} className="rounded-xl border-2 p-3" style={{ borderColor: 'var(--brand-primary, #045AFE)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="break-words text-lg font-bold">{p.name}</p>
                    <p className="shrink-0 text-base font-semibold">{fmt.format(priceOf(p))}</p>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <Stepper value={qty} onChange={(n) => setQty(p.id, n)} presets={QUICK} />
                  </div>
                </div>
              );
            })}
          </div>
          {total > 0 && <p className="mt-3 text-right text-xl font-extrabold">{getText('Total', 'Total')}: {fmt.format(total)}</p>}
        </section>
      )}

      {containerTypes.length > 0 && (
        <section>
          <h4 className="text-base font-bold">{getText('Envases', 'Containers')}</h4>
          {containerTypes.map((t) => {
            const l = lineOf(t.id);
            return (
              <div key={t.id} className="mt-2 space-y-3 rounded-xl bg-gray-50 p-3 dark:bg-neutral-900">
                <p className="text-base font-bold">
                  {t.name}
                  <span className="ml-2 text-sm font-normal text-gray-600 dark:text-neutral-300">
                    {getText('Tiene', 'Holds')}: {heldOf(t.id)}
                  </span>
                </p>
                {/* Lo normal en reparto es cambiar: entrego llenos y recojo vacíos. Un toque y queda parejo con lo vendido. */}
                {singleType?.id === t.id && totalQty > 0 && (l.delivered !== totalQty || l.returned !== totalQty) && (
                  <button type="button" onClick={() => setLine(t.id, { delivered: totalQty, returned: totalQty })} className={`${bigBtn} w-full`}>
                    {getText(`Cambio parejo: entrego ${totalQty} y recojo ${totalQty} vacíos`, `Even swap: deliver ${totalQty}, collect ${totalQty} empties`)}
                  </button>
                )}
                <Stepper label={getText('Entrego (llenos)', 'Delivered (full)')} value={l.delivered} onChange={(n) => setLine(t.id, { delivered: n })} presets={QUICK} />
                <Stepper label={getText('Recojo vacíos', 'Empties back')} value={l.returned} onChange={(n) => setLine(t.id, { returned: n })} presets={QUICK} />
                <Stepper label={getText('Dañados', 'Damaged')} value={l.damaged} onChange={(n) => setLine(t.id, { damaged: n })} />
              </div>
            );
          })}
          {singleType && totalQty > 0 && lineOf(singleType.id).delivered > 0 && lineOf(singleType.id).delivered !== totalQty && (
            <p className="mt-2 rounded-lg bg-amber-50 p-2 text-sm font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              {getText(`Vendes ${totalQty} y entregas ${lineOf(singleType.id).delivered} envases. ¿Está bien?`, `You sell ${totalQty} but deliver ${lineOf(singleType.id).delivered} containers. Is that right?`)}
            </p>
          )}

          {(stop.anaqueles.length > 0) && (
            <div className="mt-3 flex items-center gap-2">
              <select value={anaquelId} onChange={(e) => setAnaquelId(e.target.value)} className={`${input} flex-1`}>
                <option value="">{getText('Anaquel (opcional)', 'Rack (optional)')}</option>
                {stop.anaqueles.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label ?? a.qrCode}{a.location ? ` · ${a.location}` : ''}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => setScanning(true)} className={`${bigBtn} shrink-0`}>
                {getText('Escanear QR', 'Scan QR')}
              </button>
            </div>
          )}
        </section>
      )}

      <section>
        <h4 className="text-base font-bold">{getText('Cobro', 'Payment')}</h4>
        <div className="mt-2 grid grid-cols-1 gap-2">
          {total > 0 && (
            <button type="button" onClick={() => setPayAmount(String(total))} className="rounded-xl px-4 py-4 text-lg font-bold text-white" style={brandBg}>
              {getText('Cobrar esta entrega', 'Charge this delivery')} · {fmt.format(total)}
            </button>
          )}
          {stop.amountOwed > 0 && (
            <button type="button" onClick={() => setPayAmount(String(stop.amountOwed))} className={bigBtn}>
              {getText('Cobrar todo lo que debe', 'Collect full balance')} ({fmt.format(stop.amountOwed)})
            </button>
          )}
        </div>
        <input type="number" inputMode="decimal" min="0" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder={getText('Monto cobrado', 'Amount collected')} className={`${input} mt-2 text-2xl font-bold`} />
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(['cash', 'transfer'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              aria-pressed={method === m}
              className={`rounded-xl border-2 px-4 py-3.5 text-lg font-bold ${method === m ? 'border-transparent text-white' : 'border-gray-400 dark:border-neutral-600'}`}
              style={method === m ? brandBg : undefined}
            >
              {m === 'cash' ? getText('Efectivo', 'Cash') : getText('Transferencia', 'Transfer')}
            </button>
          ))}
        </div>
      </section>

      <details className="rounded-xl border border-gray-200 p-3 dark:border-neutral-800">
        <summary className="cursor-pointer text-base font-semibold">{getText('Quién recibió / nota (opcional)', 'Received by / note (optional)')}</summary>
        <div className="mt-2 space-y-2">
          <input value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} placeholder={getText('Quién recibió', 'Received by')} className={input} />
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={getText('Nota', 'Note')} className={input} />
        </div>
      </details>

      {/* Los botones se quedan pegados abajo: con la lista larga o el teléfono al sol no hay que buscarlos. */}
      <div className="sticky bottom-0 -mx-3 -mb-3 flex gap-2 rounded-b-xl border-t border-gray-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
        <button type="button" onClick={onCancel} disabled={saving} className={`${bigBtn} flex-1`}>
          {getText('Cancelar', 'Cancel')}
        </button>
        <button type="button" onClick={submit} disabled={saving} className="flex-[2] rounded-xl px-4 py-4 text-lg font-extrabold text-white disabled:opacity-50" style={brandBg}>
          {saving ? getText('Guardando…', 'Saving…') : getText('Registrar entrega', 'Record delivery')}
        </button>
      </div>
    </div>
  );
}
