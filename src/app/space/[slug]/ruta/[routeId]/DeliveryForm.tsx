'use client';

import { useMemo, useRef, useState } from 'react';
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

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[11px] text-gray-500 dark:text-neutral-400">{label}</span>
      <div className="mt-1 flex items-center gap-1">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="h-10 w-10 rounded-lg border border-gray-300 dark:border-neutral-700 text-lg font-semibold" aria-label="−">
          −
        </button>
        <input
          type="number"
          inputMode="numeric"
          min="0"
          value={value}
          onChange={(e) => onChange(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
          className="h-10 w-14 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent text-center text-base"
        />
        <button type="button" onClick={() => onChange(value + 1)} className="h-10 w-10 rounded-lg border border-gray-300 dark:border-neutral-700 text-lg font-semibold" aria-label="+">
          +
        </button>
      </div>
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
  const [pickProduct, setPickProduct] = useState('');
  const [anaquelId, setAnaquelId] = useState<string>(stop.anaqueles.length === 1 ? stop.anaqueles[0].id : '');
  const [scanning, setScanning] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'transfer'>('cash');
  const [receivedBy, setReceivedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const priceOf = (p: ProductLite) => stop.agreedPrices?.find((a) => a.itemId === p.id)?.price ?? p.price;
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const total = items.reduce((sum, row) => {
    const p = productById.get(row.productId);
    return sum + (p ? Math.round(priceOf(p) * row.qty * 100) / 100 : 0);
  }, 0);

  const lineOf = (typeId: string): Line => lines[typeId] ?? { delivered: 0, returned: 0, damaged: 0 };
  const setLine = (typeId: string, patch: Partial<Line>) => setLines((prev) => ({ ...prev, [typeId]: { ...lineOf(typeId), ...patch } }));
  const heldOf = (typeId: string) => stop.containers.find((c) => c.containerTypeId === typeId)?.outstanding ?? 0;

  function addProduct() {
    if (!pickProduct) return;
    setItems((prev) => (prev.some((r) => r.productId === pickProduct) ? prev : [...prev, { productId: pickProduct, qty: 1 }]));
    setPickProduct('');
  }

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

  const input = 'w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2.5 text-base';

  return (
    <div className="mt-3 space-y-5 rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
      {scanning && <QrScanner onResult={onScanned} onClose={() => setScanning(false)} />}

      {containerTypes.length > 0 && (
        <section>
          <h4 className="text-sm font-semibold">{getText('Envases', 'Containers')}</h4>
          {containerTypes.map((t) => {
            const l = lineOf(t.id);
            return (
              <div key={t.id} className="mt-2 rounded-lg bg-gray-50 dark:bg-neutral-900 p-2">
                <p className="text-sm font-medium">
                  {t.name}
                  <span className="ml-2 text-xs font-normal text-gray-500 dark:text-neutral-400">
                    {getText('Tiene', 'Holds')}: {heldOf(t.id)}
                  </span>
                </p>
                <div className="mt-1 flex justify-between">
                  <Stepper label={getText('Entrego', 'Delivered')} value={l.delivered} onChange={(n) => setLine(t.id, { delivered: n })} />
                  <Stepper label={getText('Recojo vacíos', 'Empties back')} value={l.returned} onChange={(n) => setLine(t.id, { returned: n })} />
                  <Stepper label={getText('Dañados', 'Damaged')} value={l.damaged} onChange={(n) => setLine(t.id, { damaged: n })} />
                </div>
              </div>
            );
          })}

          <div className="mt-3 flex items-center gap-2">
            <select value={anaquelId} onChange={(e) => setAnaquelId(e.target.value)} className={`${input} flex-1`}>
              <option value="">{getText('Anaquel (opcional)', 'Rack (optional)')}</option>
              {stop.anaqueles.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label ?? a.qrCode}{a.location ? ` · ${a.location}` : ''}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => setScanning(true)} className="shrink-0 rounded-lg border border-gray-300 dark:border-neutral-700 px-3 py-2.5 text-sm font-semibold">
              {getText('Escanear QR', 'Scan QR')}
            </button>
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section>
          <h4 className="text-sm font-semibold">{getText('Productos', 'Products')}</h4>
          {items.map((row) => {
            const p = productById.get(row.productId);
            if (!p) return null;
            return (
              <div key={row.productId} className="mt-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">{fmt.format(priceOf(p))}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Stepper label="" value={row.qty} onChange={(n) => setItems((prev) => (n === 0 ? prev.filter((r) => r.productId !== row.productId) : prev.map((r) => (r.productId === row.productId ? { ...r, qty: n } : r))))} />
                </div>
              </div>
            );
          })}
          <div className="mt-2 flex gap-2">
            <select value={pickProduct} onChange={(e) => setPickProduct(e.target.value)} className={`${input} flex-1`}>
              <option value="">{getText('Agregar producto…', 'Add product…')}</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {fmt.format(priceOf(p))}
                </option>
              ))}
            </select>
            <button type="button" onClick={addProduct} disabled={!pickProduct} className="shrink-0 rounded-lg border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm font-semibold disabled:opacity-50">
              {getText('Agregar', 'Add')}
            </button>
          </div>
          {total > 0 && <p className="mt-2 text-right text-sm font-semibold">{getText('Total', 'Total')}: {fmt.format(total)}</p>}
        </section>
      )}

      <section>
        <h4 className="text-sm font-semibold">{getText('Cobro', 'Payment')}</h4>
        <div className="mt-2 flex gap-2">
          <input type="number" inputMode="decimal" min="0" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="0.00" className={`${input} flex-1`} />
          <select value={method} onChange={(e) => setMethod(e.target.value as 'cash' | 'transfer')} className={`${input} w-40`}>
            <option value="cash">{getText('Efectivo', 'Cash')}</option>
            <option value="transfer">{getText('Transferencia', 'Transfer')}</option>
          </select>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {total > 0 && (
            <button type="button" onClick={() => setPayAmount(String(total))} className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold">
              {getText('Cobrar esta entrega', 'Charge this delivery')}
            </button>
          )}
          {stop.amountOwed > 0 && (
            <button type="button" onClick={() => setPayAmount(String(stop.amountOwed))} className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold">
              {getText('Cobrar todo lo que debe', 'Collect full balance')} ({fmt.format(stop.amountOwed)})
            </button>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <input value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} placeholder={getText('Quién recibió (opcional)', 'Received by (optional)')} className={input} />
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={getText('Nota (opcional)', 'Note (optional)')} className={input} />
      </section>

      <div className="flex gap-2">
        <button type="button" onClick={onCancel} disabled={saving} className="flex-1 rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-3 text-base font-semibold">
          {getText('Cancelar', 'Cancel')}
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="flex-1 rounded-full px-4 py-3 text-base font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: 'var(--brand-primary, #045AFE)' }}
        >
          {saving ? getText('Guardando…', 'Saving…') : getText('Registrar entrega', 'Record delivery')}
        </button>
      </div>
    </div>
  );
}
