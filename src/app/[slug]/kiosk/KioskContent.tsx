'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export interface KioskItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  imageUrl?: string | null;
}

interface CartLine {
  itemId: string;
  name: string;
  price: number;
  qty: number;
}

interface Props {
  slug: string;
  businessName: string;
  logoUrl: string | null;
  currency: 'USD' | 'DOP';
  items: KioskItem[];
  onlinePayments: boolean;
  businessType: string;
}

const ALL_TAB = '__all__';
// Cuánto se queda la pantalla de "gracias" antes de volver sola al catálogo — tiene que dar
// tiempo a leer, pero no tanto que el siguiente cliente se quede esperando frente a un tablet
// que parece colgado.
const THANKS_RESET_MS = 8000;

export function KioskContent({ slug, businessName, logoUrl, currency, items, onlinePayments, businessType }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemFallbackIcon = businessType === 'retail' ? '🛍️' : '🍽️';

  const [cart, setCart] = useState<CartLine[]>([]);
  const [category, setCategory] = useState(ALL_TAB);
  const [checkoutState, setCheckoutState] = useState<'idle' | 'loading' | 'unavailable'>('idle');
  const [tipMode, setTipMode] = useState<number | 'custom' | null>(null);
  const [customTip, setCustomTip] = useState('');
  // La navegación a Stripe y de vuelta es un full page load — cualquier estado de React
  // (incluido el carrito) se pierde. El resultado del pago se lee del query param que Stripe
  // agrega al volver (successUrl/cancelUrl), no de estado en memoria.
  const paid = searchParams.get('paid');

  useEffect(() => {
    if (paid !== 'true') return;
    const t = setTimeout(() => {
      router.replace(`/${slug}/kiosk`);
    }, THANKS_RESET_MS);
    return () => clearTimeout(t);
  }, [paid, router, slug]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.category && set.add(i.category));
    return Array.from(set);
  }, [items]);

  const visibleItems = category === ALL_TAB ? items : items.filter((i) => i.category === category);

  const fmt = useMemo(
    () => new Intl.NumberFormat('en-US', { style: 'currency', currency }),
    [currency],
  );

  function addToCart(item: KioskItem) {
    setCart((prev) => {
      const existing = prev.find((l) => l.itemId === item.id);
      if (existing) return prev.map((l) => (l.itemId === item.id ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { itemId: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  }

  function changeQty(itemId: string, delta: number) {
    setCart((prev) =>
      prev.map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + delta } : l)).filter((l) => l.qty > 0),
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

  async function handleCheckout() {
    if (cart.length === 0) return;
    setCheckoutState('loading');
    try {
      const origin = window.location.origin;
      const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((l) => ({ itemId: l.itemId, name: l.name, price: l.price, qty: l.qty })),
          subtotal,
          tax: 0,
          tip,
          total,
          currency,
          successUrl: `${origin}/${slug}/kiosk?paid=true`,
          cancelUrl: `${origin}/${slug}/kiosk?paid=false`,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.checkoutUrl) {
        setCheckoutState('unavailable');
        return;
      }
      // Navegación completa a Stripe (no fetch en background) — el kiosko literalmente se
      // convierte en la pantalla de pago hospedada de Stripe hasta que el cliente vuelve.
      window.location.href = data.checkoutUrl;
    } catch {
      setCheckoutState('unavailable');
    }
  }

  // Pantalla de "gracias" — reemplaza todo el kiosko mientras paid=true está en la URL, y se
  // limpia sola (vía el useEffect de arriba) para dejar el catálogo listo para el próximo cliente.
  if (paid === 'true') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center dark:bg-neutral-950">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">¡Pedido recibido!</h1>
        <p className="max-w-xs text-sm text-gray-500 dark:text-neutral-400">
          Tu pago se completó — {businessName} ya está preparando tu orden.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white lg:flex-row">
      <div className="min-w-0 flex-1 px-4 py-6 lg:px-8">
        <div className="flex items-center gap-3">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={businessName} className="h-10 w-10 rounded-full object-cover" />
          )}
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
              Autopedido
            </p>
            <h1 className="text-xl font-bold">{businessName}</h1>
          </div>
        </div>

        {paid === 'false' && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
            El pago se canceló. Puedes armar tu pedido de nuevo cuando quieras.
          </div>
        )}

        {items.length === 0 ? (
          <p className="mt-6 text-sm text-gray-400 dark:text-neutral-500">
            El catálogo no está disponible en este momento.
          </p>
        ) : (
          <>
            {categories.length > 0 && (
              <div className="-mx-1 mt-5 flex gap-2 overflow-x-auto px-1 pb-1">
                <button
                  type="button"
                  onClick={() => setCategory(ALL_TAB)}
                  className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
                    category === ALL_TAB
                      ? 'border-[#C8102E] bg-[#C8102E] text-white'
                      : 'border-gray-300 text-gray-700 dark:border-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  Todo
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
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

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {visibleItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addToCart(item)}
                  className="flex flex-col overflow-hidden rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-left shadow-sm transition-transform active:scale-95 hover:border-[#C8102E]"
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} className="h-28 w-full object-cover" />
                  ) : (
                    <div className="flex h-28 w-full items-center justify-center bg-gray-100 dark:bg-neutral-800 text-3xl">
                      {itemFallbackIcon}
                    </div>
                  )}
                  <div className="flex min-h-[80px] flex-col items-start justify-between p-3">
                    <span className="text-sm font-semibold leading-snug">{item.name}</span>
                    <span className="mt-2 text-base font-bold text-[#C8102E]">{fmt.format(item.price)}</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Mismo fix de sticky/self-start/h-screen que el POS del dashboard — sin esto el panel
          se estira a la altura del grid de productos y el botón de pagar queda fuera de vista. */}
      <div className="flex w-full flex-col border-t border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 lg:sticky lg:top-0 lg:h-screen lg:w-96 lg:self-start lg:border-l lg:border-t-0">
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-sm font-semibold">Tu pedido</h2>
          {cart.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400 dark:text-neutral-500">
              Toca un producto para agregarlo.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {cart.map((line) => (
                <div
                  key={line.itemId}
                  className="flex items-center justify-between gap-2 rounded-xl border border-gray-200/70 dark:border-neutral-800 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{line.name}</p>
                    <p className="text-xs text-gray-400 dark:text-neutral-500">{fmt.format(line.price)} c/u</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changeQty(line.itemId, -1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 text-base font-bold hover:border-[#C8102E] hover:text-[#C8102E]"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-semibold">{line.qty}</span>
                    <button
                      type="button"
                      onClick={() => changeQty(line.itemId, 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 text-base font-bold hover:border-[#C8102E] hover:text-[#C8102E]"
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
          {isRestaurant && cart.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400">Propina</p>
              <div className="mt-1.5 flex gap-1.5">
                {[0.1, 0.15, 0.2].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setTipMode((prev) => (prev === pct ? null : pct))}
                    className={`flex-1 rounded-full border px-2 py-2 text-xs font-semibold ${
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
                  className={`flex-1 rounded-full border px-2 py-2 text-xs font-semibold ${
                    tipMode === 'custom'
                      ? 'border-[#C8102E] bg-[#C8102E] text-white'
                      : 'border-gray-300 text-gray-600 dark:border-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  Otro
                </button>
              </div>
              {tipMode === 'custom' && (
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  placeholder="Monto de propina"
                  className="mt-1.5 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-2 py-2 text-xs"
                />
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total</span>
            <span>{fmt.format(total)}</span>
          </div>

          {onlinePayments ? (
            <>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || checkoutState === 'loading'}
                className="mt-3 w-full rounded-full bg-[#C8102E] px-5 py-3.5 text-base font-bold text-white disabled:opacity-40"
              >
                {checkoutState === 'loading'
                  ? 'Redirigiendo…'
                  : cart.length === 0
                    ? 'Agrega productos'
                    : `Pagar ${fmt.format(total)} con tarjeta`}
              </button>
              {checkoutState === 'unavailable' && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  No pudimos iniciar el pago — pídele ayuda al personal.
                </p>
              )}
            </>
          ) : (
            <p className="mt-3 text-xs text-gray-500 dark:text-neutral-400">
              El pago con tarjeta no está disponible todavía — pídele ayuda al personal para completar tu pedido.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
