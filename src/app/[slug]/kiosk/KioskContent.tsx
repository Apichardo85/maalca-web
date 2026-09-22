'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useSimpleLanguage';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export interface KioskModifierOption {
  id: string;
  name: string;
  /** Precio real de la opción (ej. el precio del Acompañante en catálogo) — se suma al
   *  precio base del plato, nunca un monto hardcodeado. Ver ModifierService/consolidate_
   *  guarnicion.sql en maalca-api. */
  priceDelta: number;
  isDefault: boolean;
}

export interface KioskModifierGroup {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  required: boolean;
  options: KioskModifierOption[];
}

export interface KioskItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  imageUrl?: string | null;
  /** Receta (Restaurante) — solo presente si el plato tiene ingredientes ligados en
   *  Inventario. Cuando existe, el cliente puede destildar los que no quiera en su pedido
   *  (ver toggleIngredient) en vez de escribirlo a mano en notas. */
  ingredients?: { id: string; name: string }[];
  /** Grupos de modificadores reusables (ej. "Guarnición") — cuando existe(n), tocar la tarjeta
   *  abre el selector (ver openCustomize) en vez de agregar directo al carrito. */
  modifierGroups?: KioskModifierGroup[];
}

interface CartLineModifierSelection {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceDelta: number;
}

interface CartLine {
  /** Identifica la línea en el carrito. Igual a itemId para items sin modificadores (así se
   *  siguen agrupando por cantidad como antes); para items con guarnición elegida, cada
   *  selección distinta arma su propia línea — ver addCustomizedToCart. */
  lineId: string;
  itemId: string;
  name: string;
  price: number;
  qty: number;
  /** Personalización de esta línea (ej. "sin cebolla, extra queso") — Restaurante.
   *  Mismo campo que CartDrawer.tsx (tarea #178), portado acá porque el kiosko tiene su
   *  propio carrito local en vez de useCart — se le había quedado afuera cuando salió #178. */
  notes?: string;
  /** IDs de KioskItem.ingredients que el cliente quitó de esta línea. Solo tiene sentido
   *  cuando el item tiene receta — para items sin receta, `notes` sigue siendo el único
   *  campo de personalización, como antes. */
  excludedIngredientIds?: string[];
  /** Modificadores elegidos (ej. Guarnición: Tostones +$7) — ya sumados en `price`. */
  selectedModifiers?: CartLineModifierSelection[];
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
  const { t } = useTranslation();
  const itemFallbackIcon = businessType === 'retail' ? '🛍️' : '🍽️';

  const [cart, setCart] = useState<CartLine[]>([]);
  const [category, setCategory] = useState(ALL_TAB);
  const [checkoutState, setCheckoutState] = useState<'idle' | 'loading' | 'unavailable'>('idle');
  const [tipMode, setTipMode] = useState<number | 'custom' | null>(null);
  const [customTip, setCustomTip] = useState('');
  // Nombre del cliente — opcional, mismo criterio que el resto de flujos públicos (nadie debería
  // quedar bloqueado por no querer dar su nombre), pero antes ni siquiera existía el campo y el
  // pedido llegaba sin nombre a Cocina/POS. Backend ya acepta CustomerName/Phone desde siempre
  // (CreateOrderRequest) — esto solo estaba faltando en la UI.
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  // Detalles de un item (nombre/foto/descripción/precio/ingredientes) — solo informativo,
  // no agrega al carrito. Mismo patrón que PosContent.tsx del dashboard.
  const [infoItem, setInfoItem] = useState<KioskItem | null>(null);
  // Selector de guarnición/modificadores — se abre en vez de agregar directo cuando el plato
  // tiene modifierGroups (ver openCustomize). pendingSelections mapea groupId -> optionIds
  // elegidos (un solo id para grupos de selección única, varios para maxSelect > 1).
  const [customizeItem, setCustomizeItem] = useState<KioskItem | null>(null);
  const [pendingSelections, setPendingSelections] = useState<Record<string, string[]>>({});
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
      const existing = prev.find((l) => l.lineId === item.id);
      if (existing) return prev.map((l) => (l.lineId === item.id ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { lineId: item.id, itemId: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  }

  /** Abre el selector de guarnición/modificadores para `item`, preseleccionando las opciones
   *  marcadas IsDefault en cada grupo (ej. "Ninguna" en Guarnición). */
  function openCustomize(item: KioskItem) {
    const initial: Record<string, string[]> = {};
    (item.modifierGroups ?? []).forEach((g) => {
      const defaults = g.options.filter((o) => o.isDefault).map((o) => o.id);
      initial[g.id] = g.maxSelect > 1 ? defaults : defaults.slice(0, 1);
    });
    setPendingSelections(initial);
    setCustomizeItem(item);
  }

  function toggleModifierOption(group: KioskModifierGroup, optionId: string) {
    setPendingSelections((prev) => {
      const current = prev[group.id] ?? [];
      if (group.maxSelect > 1) {
        const next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : current.length < group.maxSelect
            ? [...current, optionId]
            : current;
        return { ...prev, [group.id]: next };
      }
      // Selección única: tocar la opción ya elegida la destilda solo si el grupo no es
      // obligatorio — un grupo required siempre mantiene exactamente una elección.
      const next = current.includes(optionId) && !group.required ? [] : [optionId];
      return { ...prev, [group.id]: next };
    });
  }

  /** Agrega `item` con las guarniciones/modificadores ya elegidos en pendingSelections. A
   *  diferencia de addToCart, cada selección distinta arma su propia línea — así el cliente
   *  puede pedir dos Chicharrón con guarniciones distintas sin que se mezclen en una sola
   *  línea de cantidad 2. El precio de la línea ya incluye el valor real de cada opción
   *  elegida (nunca un delta hardcodeado). */
  function addCustomizedToCart(item: KioskItem) {
    const selections: CartLineModifierSelection[] = (item.modifierGroups ?? []).flatMap((g) => {
      const selected = pendingSelections[g.id] ?? [];
      return g.options
        .filter((o) => selected.includes(o.id))
        .map((o) => ({ groupId: g.id, groupName: g.name, optionId: o.id, optionName: o.name, priceDelta: o.priceDelta }));
    });
    const modifiersTotal = selections.reduce((sum, s) => sum + s.priceDelta, 0);
    const lineId = `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setCart((prev) => [
      ...prev,
      {
        lineId,
        itemId: item.id,
        name: item.name,
        price: item.price + modifiersTotal,
        qty: 1,
        selectedModifiers: selections,
      },
    ]);
    setCustomizeItem(null);
  }

  function changeQty(lineId: string, delta: number) {
    setCart((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, qty: l.qty + delta } : l)).filter((l) => l.qty > 0),
    );
  }

  function updateNotes(lineId: string, notes: string) {
    setCart((prev) => prev.map((l) => (l.lineId === lineId ? { ...l, notes } : l)));
  }

  function toggleIngredient(lineId: string, ingredientId: string) {
    setCart((prev) =>
      prev.map((l) => {
        if (l.lineId !== lineId) return l;
        const excluded = new Set(l.excludedIngredientIds ?? []);
        if (excluded.has(ingredientId)) excluded.delete(ingredientId);
        else excluded.add(ingredientId);
        return { ...l, excludedIngredientIds: Array.from(excluded) };
      }),
    );
  }

  /** Arma el texto de notas que de verdad viaja en el pedido (mismo campo `notes` de
   *  siempre) combinando los ingredientes que el cliente quitó con lo que haya escrito a
   *  mano — así Cocina sigue viendo un solo texto plano, sin necesitar tocar el backend. */
  function buildLineNotes(line: CartLine): string | undefined {
    const item = items.find((i) => i.id === line.itemId);
    const parts: string[] = [];
    if (line.selectedModifiers?.length) {
      parts.push(line.selectedModifiers.map((s) => s.optionName).join(', '));
    }
    if (line.excludedIngredientIds?.length && item?.ingredients) {
      const names = item.ingredients
        .filter((ing) => line.excludedIngredientIds!.includes(ing.id))
        .map((ing) => ing.name);
      if (names.length > 0) parts.push(`Sin: ${names.join(', ')}`);
    }
    if (line.notes?.trim()) parts.push(line.notes.trim());
    return parts.length > 0 ? parts.join(' — ') : undefined;
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

  const customizeTotal = useMemo(() => {
    if (!customizeItem) return 0;
    const modifiersTotal = (customizeItem.modifierGroups ?? []).reduce((sum, g) => {
      const selected = pendingSelections[g.id] ?? [];
      return sum + g.options.filter((o) => selected.includes(o.id)).reduce((s, o) => s + o.priceDelta, 0);
    }, 0);
    return customizeItem.price + modifiersTotal;
  }, [customizeItem, pendingSelections]);

  const customizeSelectionsValid = useMemo(() => {
    if (!customizeItem) return true;
    return (customizeItem.modifierGroups ?? []).every((g) => {
      const selected = pendingSelections[g.id] ?? [];
      return !g.required || selected.length >= Math.max(1, g.minSelect || 1);
    });
  }, [customizeItem, pendingSelections]);

  async function handleCheckout() {
    if (cart.length === 0) return;
    setCheckoutState('loading');
    try {
      const origin = window.location.origin;
      const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((l) => ({
            itemId: l.itemId,
            name: l.name,
            price: l.price,
            qty: l.qty,
            notes: buildLineNotes(l),
          })),
          subtotal,
          tax: 0,
          tip,
          total,
          currency,
          customerName: customerName.trim() || null,
          customerPhone: customerPhone.trim() || null,
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('kiosk.orderReceived')}</h1>
        <p className="max-w-xs text-sm text-gray-500 dark:text-neutral-400">
          {t('kiosk.paymentComplete').replace('{business}', businessName)}
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
              {t('kiosk.selfOrder')}
            </p>
            <h1 className="text-xl font-bold">{businessName}</h1>
          </div>
        </div>

        {paid === 'false' && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
            {t('kiosk.paymentCancelled')}
          </div>
        )}

        {/* Mini-cuenta pegajosa — mismo patrón que PosContent.tsx (tarea #147): en mobile el
            panel completo del carrito queda abajo del todo del grid de productos, así que sin
            esto el cliente agrega productos "a ciegas" y no ve qué lleva hasta bajar toda la
            pantalla. En desktop/tablet grande no hace falta: el panel lateral ya es visible. */}
        {cart.length > 0 && (
          <button
            type="button"
            onClick={() => document.getElementById('kiosk-cart-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="sticky top-0 z-20 mt-3 flex w-full items-center justify-between gap-2 rounded-xl border border-[#C8102E]/30 bg-[#C8102E] px-4 py-3 text-white shadow-md lg:hidden"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              🛒 {cart.reduce((sum, l) => sum + l.qty, 0)} {cart.reduce((sum, l) => sum + l.qty, 0) === 1 ? t('kiosk.item') : t('kiosk.items')}
            </span>
            <span className="flex items-center gap-1 text-sm font-bold">
              {fmt.format(total)}
              <span aria-hidden="true">▾</span>
            </span>
          </button>
        )}

        {items.length === 0 ? (
          <p className="mt-6 text-sm text-gray-400 dark:text-neutral-500">
            {t('kiosk.catalogUnavailable')}
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
                  {t('kiosk.all')}
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
                <div key={item.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => (item.modifierGroups?.length ? openCustomize(item) : addToCart(item))}
                    className="flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-left shadow-sm transition-transform active:scale-95 hover:border-[#C8102E]"
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
                  {(item.description || (item.ingredients && item.ingredients.length > 0)) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInfoItem(item);
                      }}
                      aria-label={t('kiosk.viewDetails')}
                      title={t('kiosk.viewDetails')}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-sm font-bold text-white backdrop-blur-sm hover:bg-black/70"
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

      {/* Mismo fix de sticky/self-start/h-screen que el POS del dashboard — sin esto el panel
          se estira a la altura del grid de productos y el botón de pagar queda fuera de vista. */}
      <div
        id="kiosk-cart-panel"
        className="flex w-full scroll-mt-4 flex-col border-t border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 lg:sticky lg:top-0 lg:h-screen lg:w-96 lg:self-start lg:border-l lg:border-t-0"
      >
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-sm font-semibold">{t('kiosk.yourOrder')}</h2>
          {cart.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400 dark:text-neutral-500">
              {t('kiosk.tapToAdd')}
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {cart.map((line) => {
                const lineItem = items.find((i) => i.id === line.itemId);
                const hasRecipe = !!lineItem?.ingredients && lineItem.ingredients.length > 0;
                return (
                  <div
                    key={line.lineId}
                    className="rounded-xl border border-gray-200/70 dark:border-neutral-800 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{line.name}</p>
                        <p className="text-xs text-gray-400 dark:text-neutral-500">{fmt.format(line.price)} {t('kiosk.perUnit')}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => changeQty(line.lineId, -1)}
                          aria-label={t('kiosk.removeOne')}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 text-base font-bold hover:border-[#C8102E] hover:text-[#C8102E]"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm font-semibold">{line.qty}</span>
                        <button
                          type="button"
                          onClick={() => changeQty(line.lineId, 1)}
                          aria-label={t('kiosk.addOne')}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 text-base font-bold hover:border-[#C8102E] hover:text-[#C8102E]"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Guarnición/modificadores elegidos — ya sumados en line.price. Solo
                        muestra lo elegido; para cambiarlo el cliente quita la línea y vuelve
                        a agregar el plato. */}
                    {line.selectedModifiers && line.selectedModifiers.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {line.selectedModifiers.map((s) => (
                          <span
                            key={s.optionId}
                            className="rounded-full bg-[#C8102E]/10 px-2.5 py-1 text-xs font-medium text-[#C8102E]"
                          >
                            {s.optionName}
                            {s.priceDelta !== 0 ? ` (${s.priceDelta > 0 ? '+' : ''}${fmt.format(s.priceDelta)})` : ''}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Receta real (Inventario) — solo cuando el plato la tiene definida.
                        Destildar un ingrediente arma "Sin: X, Y" automáticamente en las notas
                        del pedido, en vez de que el cliente tenga que escribirlo a mano. */}
                    {hasRecipe && (
                      <div className="mt-2">
                        <p className="text-[11px] font-medium text-gray-500 dark:text-neutral-400">
                          {t('kiosk.ingredientsHint')}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {lineItem!.ingredients!.map((ing) => {
                            const excluded = line.excludedIngredientIds?.includes(ing.id) ?? false;
                            return (
                              <button
                                key={ing.id}
                                type="button"
                                onClick={() => toggleIngredient(line.lineId, ing.id)}
                                aria-pressed={!excluded}
                                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                                  excluded
                                    ? 'border-gray-200 bg-gray-100 text-gray-400 line-through dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-500'
                                    : 'border-[#C8102E]/40 bg-[#C8102E]/10 text-[#C8102E]'
                                }`}
                              >
                                {ing.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {isRestaurant && (
                      <input
                        value={line.notes ?? ''}
                        onChange={(e) => updateNotes(line.lineId, e.target.value)}
                        placeholder={hasRecipe ? t('kiosk.anythingElse') : t('kiosk.customizePlaceholder')}
                        className="mt-2 w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-transparent px-2.5 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 focus:border-gray-400 dark:focus:border-neutral-500 focus:outline-none"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-gray-200 dark:border-neutral-800 p-4">
          {cart.length > 0 && (
            <div className="mb-3 space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400">
                {t('kiosk.yourName')}
              </p>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t('kiosk.nameForOrder')}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder={t('kiosk.phoneOptional')}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              />
            </div>
          )}

          {isRestaurant && cart.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400">{t('kiosk.tip')}</p>
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
                  {t('kiosk.other')}
                </button>
              </div>
              {tipMode === 'custom' && (
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  placeholder={t('kiosk.tipAmount')}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-2 py-2 text-xs"
                />
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-lg font-bold">
            <span>{t('kiosk.total')}</span>
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
                  ? t('kiosk.redirecting')
                  : cart.length === 0
                    ? t('kiosk.addProducts')
                    : t('kiosk.payWithCard').replace('{amount}', fmt.format(total))}
              </button>
              {checkoutState === 'unavailable' && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  {t('kiosk.checkoutUnavailable')}
                </p>
              )}
            </>
          ) : (
            <p className="mt-3 text-xs text-gray-500 dark:text-neutral-400">
              {t('kiosk.cardPaymentUnavailable')}
            </p>
          )}
        </div>
      </div>

      {/* Detalles de un item — foto/descripción/precio/ingredientes. Solo informativo, igual
          que en el POS del dashboard; no agrega al carrito por sí solo. */}
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
            <div className="max-h-[60vh] overflow-y-auto p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold">{infoItem.name}</h3>
                <span className="shrink-0 text-base font-bold text-[#C8102E]">{fmt.format(infoItem.price)}</span>
              </div>
              {infoItem.description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-neutral-300">{infoItem.description}</p>
              )}
              {infoItem.ingredients && infoItem.ingredients.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-neutral-500">
                    {t('kiosk.contains')}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {infoItem.ingredients.map((ing) => (
                      <span
                        key={ing.id}
                        className="rounded-full bg-gray-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-neutral-300"
                      >
                        {ing.name}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[11px] text-gray-400 dark:text-neutral-500">
                    {t('kiosk.canRemoveIngredients')}
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  if (infoItem.modifierGroups?.length) {
                    setInfoItem(null);
                    openCustomize(infoItem);
                    return;
                  }
                  addToCart(infoItem);
                  setInfoItem(null);
                }}
                className="mt-4 w-full rounded-full bg-[#C8102E] px-4 py-3 text-sm font-bold text-white"
              >
                {infoItem.modifierGroups?.length ? t('kiosk.chooseSide') : t('kiosk.add').replace('{amount}', fmt.format(infoItem.price))}
              </button>
              <button
                type="button"
                onClick={() => setInfoItem(null)}
                className="mt-2 w-full rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium"
              >
                {t('kiosk.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selector de guarnición/modificadores — se abre en vez de agregar directo cuando el
          plato tiene modifierGroups (ver openCustomize). El precio de cada opción es el
          precio real del acompañante en el catálogo, no un monto inventado. */}
      {customizeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setCustomizeItem(null)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {customizeItem.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={customizeItem.imageUrl} alt={customizeItem.name} className="h-40 w-full object-cover" />
            ) : (
              <div className="flex h-40 w-full items-center justify-center bg-gray-100 dark:bg-neutral-800 text-4xl">
                {itemFallbackIcon}
              </div>
            )}
            <div className="max-h-[60vh] overflow-y-auto p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold">{customizeItem.name}</h3>
                <span className="shrink-0 text-base font-bold text-[#C8102E]">{fmt.format(customizeItem.price)}</span>
              </div>
              {customizeItem.description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-neutral-300">{customizeItem.description}</p>
              )}

              {customizeItem.modifierGroups?.map((group) => {
                const selected = pendingSelections[group.id] ?? [];
                const multi = group.maxSelect > 1;
                return (
                  <div key={group.id} className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-neutral-500">
                      {group.name}
                      {group.required && <span className="text-[#C8102E]"> *</span>}
                    </p>
                    <div className="mt-1.5 space-y-1.5">
                      {group.options.map((opt) => {
                        const isSelected = selected.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => toggleModifierOption(group, opt.id)}
                            aria-pressed={isSelected}
                            className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                              isSelected
                                ? 'border-[#C8102E] bg-[#C8102E]/10 font-semibold text-[#C8102E]'
                                : 'border-gray-200 text-gray-700 dark:border-neutral-700 dark:text-neutral-300'
                            }`}
                          >
                            <span>
                              {multi ? (isSelected ? '☑' : '☐') : isSelected ? '●' : '○'} {opt.name}
                            </span>
                            <span>
                              {opt.priceDelta > 0
                                ? `+${fmt.format(opt.priceDelta)}`
                                : opt.priceDelta < 0
                                  ? fmt.format(opt.priceDelta)
                                  : t('kiosk.included')}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => addCustomizedToCart(customizeItem)}
                disabled={!customizeSelectionsValid}
                className="mt-5 w-full rounded-full bg-[#C8102E] px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
              >
                {t('kiosk.add').replace('{amount}', fmt.format(customizeTotal))}
              </button>
              <button
                type="button"
                onClick={() => setCustomizeItem(null)}
                className="mt-2 w-full rounded-full border border-gray-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
              >
                {t('kiosk.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
