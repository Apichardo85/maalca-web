'use client';

import { useMemo, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';

export interface PosItem {
  id: string;
  name: string;
  price: number;
  category?: string | null;
  imageUrl?: string | null;
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
  currency: 'USD' | 'DOP';
  items: PosItem[];
}

const PAYMENT_METHODS: { value: string; es: string; en: string; icon: string }[] = [
  { value: 'Cash', es: 'Efectivo', en: 'Cash', icon: '💵' },
  { value: 'Card', es: 'Tarjeta', en: 'Card', icon: '💳' },
  { value: 'Other', es: 'Otro', en: 'Other', icon: '🧾' },
];

const ALL_TAB = '__all__';

export function PosContent({ slug, currency, items }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();

  const [cart, setCart] = useState<CartLine[]>([]);
  const [category, setCategory] = useState(ALL_TAB);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [charging, setCharging] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.category && set.add(i.category));
    return Array.from(set);
  }, [items]);

  const visibleItems = category === ALL_TAB ? items : items.filter((i) => i.category === category);

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);

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

  const total = cart.reduce((sum, l) => sum + l.price * l.qty, 0);

  async function chargeSale() {
    if (cart.length === 0 || !paymentMethod) return;
    setCharging(true);
    try {
      const res = await fetch(`/api/space/${slug}/pos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((l) => ({ itemId: l.itemId, name: l.name, price: l.price, qty: l.qty })),
          subtotal: total,
          tax: 0,
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
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      toast.error(msg);
    } finally {
      setCharging(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white lg:flex-row">
      {/* Grid de productos — táctil, botones grandes */}
      <div className="flex-1 px-4 py-6 lg:px-6">
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
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addToCart(item)}
                  className="flex min-h-[96px] flex-col items-start justify-between rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 text-left shadow-sm transition-transform active:scale-95 hover:border-[#C8102E]"
                >
                  <span className="text-sm font-semibold leading-snug">{item.name}</span>
                  <span className="mt-2 text-base font-bold text-[#C8102E]">{fmt(item.price)}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Carrito + cobro — fijo abajo en mobile, panel lateral en desktop */}
      <div className="flex w-full flex-col border-t border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 lg:w-96 lg:border-l lg:border-t-0">
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
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
    </div>
  );
}
