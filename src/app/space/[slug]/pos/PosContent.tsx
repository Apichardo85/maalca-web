'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { useOrdersRealtime } from '@/hooks/useOrdersRealtime';
import { Toast } from '@/components/ui/Toast';

export interface PosItem {
  id: string;
  name: string;
  price: number;
  category?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  status?: string | null;
  isDemo?: boolean;
}

interface CartLine {
  itemId: string;
  name: string;
  price: number;
  qty: number;
}

interface Props {
  slug: string;
  affiliateId: string;
  currency: 'USD' | 'DOP';
  items: PosItem[];
  businessType: string;
}

// "Tarjeta" ya no es solo una etiqueta — genera un cobro real de Stripe (Checkout Session
// contra la cuenta Connect del negocio) que el cliente paga con su propio teléfono via QR/link.
// Efectivo/Otro se quedan igual que antes: el cobro ya pasó por fuera, esto solo lo registra.
const PAYMENT_METHODS: { value: string; es: string; en: string; icon: string }[] = [
  { value: 'Cash', es: 'Efectivo', en: 'Cash', icon: '💵' },
  { value: 'Card', es: 'Tarjeta (QR)', en: 'Card (QR)', icon: '💳' },
  { value: 'Other', es: 'Otro', en: 'Other', icon: '🧾' },
];

const ALL_TAB = '__all__';

interface CheckoutModalState {
  orderId: string;
  url: string;
}

export function PosContent({ slug, affiliateId, currency, items, businessType }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();
  const itemFallbackIcon = businessType === 'retail' ? '🛍️' : '🍽️';

  const [cart, setCart] = useState<CartLine[]>([]);
  const [category, setCategory] = useState(ALL_TAB);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [charging, setCharging] = useState(false);
  // Propina — solo Restaurante (ver businessType prop). null = sin propina, number = % del
  // preset elegido, 'custom' = usa customTip.
  const [tipMode, setTipMode] = useState<number | 'custom' | null>(null);
  const [customTip, setCustomTip] = useState('');
  // Solo informativo para el personal (nombre/foto/descripción) — no agrega al carrito.
  const [infoItem, setInfoItem] = useState<PosItem | null>(null);
  // Cobro real con Stripe (QR) — mientras esto no sea null, el pedido está Pending esperando
  // que el cliente pague desde su teléfono. Se cierra solo cuando llega el evento de SignalR.
  const [checkoutModal, setCheckoutModal] = useState<CheckoutModalState | null>(null);

  // OrdersHub — mismo canal que usa Kitchen Display. Cuando el pedido Pending de este QR pasa
  // a Paid (confirmado por el webhook de Stripe Connect, no por esta pestaña), cerramos el
  // modal y limpiamos el carrito automáticamente — el mostrador no tiene que estar pendiente
  // de refrescar nada.
  const handleOrderUpdated = useCallback((raw: unknown) => {
    const order = raw as { id?: string; status?: string } | null;
    if (!order?.id) return;
    setCheckoutModal((prev) => {
      if (!prev || prev.orderId !== order.id) return prev;
      if (order.status !== 'Paid') return prev;
      toast.success(getText('Pago recibido.', 'Payment received.'));
      setCart([]);
      setPaymentMethod(null);
      setTipMode(null);
      setCustomTip('');
      return null;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useOrdersRealtime(affiliateId, handleOrderUpdated);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.category && set.add(i.category));
    return Array.from(set);
  }, [items]);

  const visibleItems = category === ALL_TAB ? items : items.filter((i) => i.category === category);

  // Defensa extra por si currency llega vacío/inválido desde algún otro caller — Intl.NumberFormat
  // revienta con "Invalid currency code" en vez de degradar con gracia.
  const safeCurrency = currency === 'DOP' ? 'DOP' : 'USD';
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: safeCurrency }).format(n);

  function addToCart(item: PosItem) {
    setCart((prev) => {
      const existing = prev.find((l) => l.itemId === item.id);
      if (existing) {
        return prev.map((l) => (l.itemId === item.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { itemId: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  }

  function changeQty(itemId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0),
    );
  }

  const subtotal = cart.reduce((sum, l) => sum + l.price * l.qty, 0);
  const isRestaurant = businessType === 'restaurant';
  const tip = !isRestaurant
    ? 0
    : tipMode === 'custom'
      ? Math.max(0, Number(customTip) || 0)
      : tipMode
        ? subtotal * tipMode
        : 0;
  const total = subtotal + tip;

  async function chargeSale() {
    if (cart.length === 0 || !paymentMethod) return;
    if (paymentMethod === 'Card') return chargeWithStripe();

    setCharging(true);
    try {
      const res = await fetch(`/api/space/${slug}/pos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((l) => ({ itemId: l.itemId, name: l.name, price: l.price, qty: l.qty })),
          subtotal,
          tax: 0,
          tip,
          total,
          customerName: null,
          notes: null,
          currency,
          paymentMethod,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error?.message ?? getText('No pudimos registrar la venta.', "We couldn't register the sale."));
      }
      toast.success(getText('Venta registrada.', 'Sale registered.'));
      setCart([]);
      setPaymentMethod(null);
      setTipMode(null);
      setCustomTip('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      toast.error(msg);
    } finally {
      setCharging(false);
    }
  }

  // "Tarjeta (QR)" — crea el pedido Pending + una Checkout Session real de Stripe (misma cuenta
  // Connect del storefront público) y muestra el QR. El carrito NO se limpia acá: solo se
  // limpia cuando llega la confirmación real por SignalR (handleOrderUpdated), para que el
  // mostrador no pierda la cuenta si el cliente todavía no ha pagado.
  async function chargeWithStripe() {
    setCharging(true);
    try {
      const origin = window.location.origin;
      const res = await fetch(`/api/space/${slug}/pos/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((l) => ({ itemId: l.itemId, name: l.name, price: l.price, qty: l.qty })),
          subtotal,
          tax: 0,
          tip,
          total,
          customerName: null,
          notes: null,
          currency,
          successUrl: `${origin}/pay/success`,
          cancelUrl: `${origin}/pay/cancel`,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          data?.error?.message ??
            getText('No pudimos generar el cobro con Stripe.', "We couldn't start the Stripe charge."),
        );
      }
      setCheckoutModal({ orderId: data.orderId, url: data.checkoutUrl });
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      toast.error(msg);
    } finally {
      setCharging(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white lg:flex-row">
      {/* Grid de productos — táctil, botones grandes.
          min-w-0 es necesario: sin esto, un hijo flex-1 no se encoge por debajo de su ancho
          natural de contenido y el layout entero se corre a la derecha con scroll horizontal
          en laptops (el sidebar fijo de 240px reduce el ancho real disponible, pero los
          breakpoints de Tailwind (lg:) miden el viewport completo, no el espacio restante). */}
      <div className="min-w-0 flex-1 px-4 py-6 lg:px-6">
        <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
          {getText('Tu espacio', 'Your space')}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{getText('Punto de venta', 'Point of sale')}</h1>

        {items.length === 0 ? (
          <p className="mt-6 text-sm text-gray-400 dark:text-neutral-500">
            {getText(
              'Todavía no tienes items activos en tu catálogo — agrega uno primero para poder vender.',
              "You don't have any active catalog items yet — add one first to sell.",
            )}
          </p>
        ) : (
          <>
            {categories.length > 0 && (
              <div className="-mx-1 mt-4 flex gap-1.5 overflow-x-auto px-1 pb-1">
                <button
                  type="button"
                  onClick={() => setCategory(ALL_TAB)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    category === ALL_TAB
                      ? 'border-[#C8102E] bg-[#C8102E] text-white'
                      : 'border-gray-300 text-gray-700 dark:border-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {getText('Todo', 'All')}
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      category === c
                        ? 'border-[#C8102E] bg-[#C8102E] text-white'
                        : 'border-gray-300 text-gray-700 dark:border-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {visibleItems.map((item) => (
                <div key={item.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => addToCart(item)}
                    className="flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-left shadow-sm transition-transform active:scale-95 hover:border-[#C8102E]"
                  >
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="h-24 w-full object-cover" />
                    ) : (
                      <div className="flex h-24 w-full items-center justify-center bg-gray-100 dark:bg-neutral-800 text-2xl">
                        {itemFallbackIcon}
                      </div>
                    )}
                    <div className="flex min-h-[72px] flex-col items-start justify-between p-3">
                      <span className="text-sm font-semibold leading-snug">{item.name}</span>
                      <span className="mt-2 text-base font-bold text-[#C8102E]">{fmt(item.price)}</span>
                    </div>
                  </button>
                  {item.description && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInfoItem(item);
                      }}
                      aria-label={getText('Ver detalles', 'View details')}
                      title={getText('Ver detalles', 'View details')}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-xs font-bold text-white backdrop-blur-sm hover:bg-black/70"
                    >
                      i
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Carrito + cobro — apilado abajo en mobile; en desktop, panel lateral PEGADO al
          viewport (lg:sticky + lg:h-screen + lg:self-start). Sin self-start, el flex row
          por defecto estira este panel a la altura del contenido MÁS ALTO de la fila (el grid
          de productos, que puede ser más alto que la pantalla si hay muchos items) — eso
          empujaba el botón de cobrar muy por debajo del fold, obligando a bajar toda la
          página para pagar. Con self-start + h-screen, el panel se queda del alto exacto del
          viewport pase lo que pase con el grid, y el botón de cobrar siempre queda a la vista. */}
      <div className="flex w-full flex-col border-t border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 lg:sticky lg:top-0 lg:h-screen lg:w-96 lg:self-start lg:border-l lg:border-t-0">
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-sm font-semibold">{getText('Cuenta actual', 'Current order')}</h2>
          {cart.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400 dark:text-neutral-500">
              {getText('Toca un producto para agregarlo.', 'Tap a product to add it.')}
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {cart.map((line) => (
                <div key={line.itemId} className="flex items-center justify-between gap-2 rounded-xl border border-gray-200/70 dark:border-neutral-800 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{line.name}</p>
                    <p className="text-xs text-gray-400 dark:text-neutral-500">{fmt(line.price)} c/u</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changeQty(line.itemId, -1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 text-sm font-bold hover:border-[#C8102E] hover:text-[#C8102E]"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-semibold">{line.qty}</span>
                    <button
                      type="button"
                      onClick={() => changeQty(line.itemId, 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 text-sm font-bold hover:border-[#C8102E] hover:text-[#C8102E]"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-gray-200 dark:border-neutral-800 p-4">
          {isRestaurant && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400">
                {getText('Propina', 'Tip')}
              </p>
              <div className="mt-1.5 flex gap-1.5">
                {[0.1, 0.15, 0.2].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setTipMode((prev) => (prev === pct ? null : pct))}
                    className={`flex-1 rounded-full border px-2 py-1.5 text-xs font-semibold ${
                      tipMode === pct
                        ? 'border-[#C8102E] bg-[#C8102E] text-white'
                        : 'border-gray-300 text-gray-600 dark:border-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {Math.round(pct * 100)}%
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setTipMode((prev) => (prev === 'custom' ? null : 'custom'))}
                  className={`flex-1 rounded-full border px-2 py-1.5 text-xs font-semibold ${
                    tipMode === 'custom'
                      ? 'border-[#C8102E] bg-[#C8102E] text-white'
                      : 'border-gray-300 text-gray-600 dark:border-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {getText('Otro', 'Other')}
                </button>
              </div>
              {tipMode === 'custom' && (
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  placeholder={getText('Monto de propina', 'Tip amount')}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-xs"
                />
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-lg font-bold">
            <span>{getText('Total', 'Total')}</span>
            <span>{fmt(total)}</span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.value}
                type="button"
                onClick={() => setPaymentMethod(pm.value)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors ${
                  paymentMethod === pm.value
                    ? 'border-[#C8102E] bg-[#C8102E]/10 text-[#C8102E]'
                    : 'border-gray-300 text-gray-600 dark:border-neutral-700 dark:text-neutral-300'
                }`}
              >
                <span className="text-lg">{pm.icon}</span>
                {pm[language]}
              </button>
            ))}
          </div>

          <button
            onClick={chargeSale}
            disabled={cart.length === 0 || !paymentMethod || charging}
            className="mt-3 w-full rounded-full bg-[#C8102E] px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            {charging
              ? getText('Registrando…', 'Registering…')
              : !paymentMethod
                ? getText('Elige método de pago', 'Pick a payment method')
                : getText('Cobrar', 'Charge')}
          </button>
        </div>
      </div>
      {/* Detalles de un item — solo informativo (nombre/foto/descripción/precio), para que el
          personal pueda contestarle al cliente sin salir del POS. No agrega al carrito. */}
      {infoItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setInfoItem(null)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {infoItem.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={infoItem.imageUrl} alt={infoItem.name} className="h-40 w-full object-cover" />
            ) : (
              <div className="flex h-40 w-full items-center justify-center bg-gray-100 dark:bg-neutral-800 text-4xl">
                {itemFallbackIcon}
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold">{infoItem.name}</h3>
                <span className="shrink-0 text-base font-bold text-[#C8102E]">{fmt(infoItem.price)}</span>
              </div>
              {infoItem.description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-neutral-300">{infoItem.description}</p>
              )}
              <button
                type="button"
                onClick={() => setInfoItem(null)}
                className="mt-4 w-full rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium"
              >
                {getText('Cerrar', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Cobro con Stripe (QR) — el cliente paga desde su propio teléfono. Se cierra solo
          cuando handleOrderUpdated recibe la confirmación real por SignalR; "Cancelar" solo
          cierra el modal en esta pantalla, no cancela el pedido Pending en Stripe (el cliente
          igual podría completar el pago si ya tiene el link abierto). */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xs rounded-2xl bg-white dark:bg-neutral-900 p-6 text-center shadow-xl">
            <h3 className="text-base font-bold">{getText('Escanea para pagar', 'Scan to pay')}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
              {getText('El cliente paga desde su teléfono.', 'The customer pays from their phone.')}
            </p>
            <div className="mx-auto mt-4 flex h-56 w-56 items-center justify-center overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(checkoutModal.url)}`}
                alt={getText('Código QR de pago', 'Payment QR code')}
                className="h-full w-full"
              />
            </div>
            <p className="mt-4 text-2xl font-bold text-[#C8102E]">{fmt(total)}</p>
            <a
              href={checkoutModal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-xs font-medium text-gray-500 underline dark:text-neutral-400"
            >
              {getText('O comparte este link', 'Or share this link')}
            </a>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-gray-400 dark:text-neutral-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#C8102E]" />
              {getText('Esperando el pago…', 'Waiting for payment…')}
            </div>
            <button
              type="button"
              onClick={() => setCheckoutModal(null)}
              className="mt-4 w-full rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium"
            >
              {getText('Cerrar', 'Close')}
            </button>
          </div>
        </div>
      )}
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
    </div>
  );
}
