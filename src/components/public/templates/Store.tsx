'use client';
// src/components/public/templates/Store.tsx
//
// "Distribuidor" — plantilla de tienda para catálogos grandes y venta por volumen (perfumería mayorista,
// distribuidoras): buscador como protagonista, departamentos, filtros por marca/tamaño/precio, fichas con caja de
// compra (precio de su lista, precio por cantidad, reglas de caja) y "Comprar de nuevo". Mismo motor de comercio que
// la boutique (Retail.tsx): carrito, listas de precio, envíos, impuesto y cuentas de cliente; el API recalcula todo
// al crear el pedido. La paleta sale de los colores del negocio (Diseño): primario = acciones, secundario = barras.
//
// Navegación interna en tres vistas (inicio · resultados · ficha) con historial del navegador, para que "atrás"
// funcione como en cualquier tienda. Se adapta por container queries (@…:) y no por viewport, así la vista previa
// del editor de Diseño se ve igual que la página real.
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PublicTemplateProps } from '@/lib/templates/registry';
import { useCart, type CartItem } from '@/components/public/cart/useCart';
import { WhatsAppCart } from '@/components/public/cart/WhatsAppCart';
import { resolveWhatsAppDigits, resolveContactItems } from '@/lib/public-contact';
import { trackCanalClick } from '@/lib/public-events';
import { AboutSection } from '@/components/public/AboutSection';
import { OpenStatusBar } from '@/components/public/OpenStatusBar';
import { PublicFooter } from '@/components/public/PublicFooter';
import { PublicHoursSection } from '@/components/public/PublicHoursSection';
import { CONTACT_ICON_BY_TIPO } from '@/components/public/ContactIcons';
import { StoreAccountSheet } from '@/components/public/StoreAccountSheet';
import { getOpenStatus, getScheduleTarget, cartScheduleFrom, todayKeyInTimezone, type OpenStatus } from '@/lib/business-hours';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import SimpleLanguageToggle from '@/components/ui/SimpleLanguageToggle';
import PublicThemeToggle from '@/components/public/PublicThemeToggle';
import { formatPrice } from '@/lib/currency';
import { categoryLabel } from '@/lib/category-label';
import { matchesCatalogQuery } from '@/lib/catalog-search';
import { brandPaletteCss, deriveBrandPalette, deriveDarkBrandPalette } from '@/lib/brand-palette';
import { useDeepLinkedItemId } from '@/lib/use-deep-linked-item';
import { sanitizeRichText } from '@/lib/sanitize-html';
import {
  addStep, addWouldExceed, CHOKING_WARNINGS, nextTier, qtyRuleError, qtyRulesLabel, qtyStep, removeStep, unitPriceFor,
  type RetailAttributes,
} from '@/lib/commerce';
import { useStoreAccount, type StoreOrderSummary } from '@/lib/store-account';

type Item = PublicTemplateProps['items'][number];
type View = { kind: 'home' } | { kind: 'results' } | { kind: 'product'; id: string };
type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name' | 'new';

// Variables de la paleta (scope .st-scope, claro/oscuro en CSS). Los hex son respaldo.
const BG = 'var(--st-bg, #f4f2ee)';
const SURFACE = 'var(--st-surface, #ffffff)';
const INK = 'var(--st-ink, #13151a)';
const MUTED = 'var(--st-muted, #5e636d)';
const BORDER = 'var(--st-border, #e4e1da)';
const BORDER_SOFT = 'var(--st-border-soft, #efece6)';
const PLACEHOLDER = 'var(--st-placeholder, #f1eee8)';
// Barras (cabecera, hero, franja mayorista): el color secundario del negocio tal cual, en claro y en oscuro.
const BAR = 'var(--st-bar, #13151a)';
const ACCENT = 'var(--st-accent, #e3a93b)';
const ON_ACCENT = 'var(--st-on-accent, #13151a)';
const ACCENT_TEXT = 'var(--st-accent-text, #7a4e00)';
const DETAIL = 'var(--st-detail, #e3a93b)';
// Ahorro / oferta: colores funcionales fijos (no de marca), con contraste AA sobre blanco.
const SAVE = '#1f6b4f';
const SAVE_BG = 'rgba(31,107,79,0.1)';
const DEAL = '#b42318';
const ON_BAR = '#ffffff';
const ON_BAR_MUTED = 'rgba(255,255,255,0.72)';

// Estados seleccionados por CSS (aria-pressed), no por estilo inline: al alternar estilos inline con var() React
// dejaba el valor anterior pegado en algunos navegadores. Así el estado visual siempre sigue al atributo.
const PRESSED_CSS = [
  '.st-pill{border:1px solid var(--st-border);background:var(--st-surface);color:var(--st-ink)}',
  '.st-pill[aria-pressed="true"]{border-color:var(--st-ink);background:var(--st-ink);color:var(--st-surface)}',
  '.st-opt{border:1px solid var(--st-border);background:var(--st-surface);color:var(--st-ink)}',
  '.st-opt[aria-pressed="true"]{border:2px solid var(--st-ink)}',
  '.st-tier{border:1px solid var(--st-border);background:var(--st-surface);color:var(--st-ink)}',
  '.st-tier[aria-pressed="true"]{border:2px solid var(--st-accent);background:var(--st-accent-soft)}',
  '.st-thumb{border:2px solid transparent}.st-thumb[aria-pressed="true"]{border-color:var(--st-ink)}',
  '.st-tab{color:var(--st-muted);font-weight:500}.st-tab[aria-current="page"]{color:var(--st-ink);font-weight:700}',
].join('');

const DEFAULT_BRAND = '#E3A93B';
const DEFAULT_BAR = '#13151A';
const MAX_W = 1440;

function isOnSale(i: Item): boolean {
  return i.price != null && i.compareAtPrice != null && i.compareAtPrice > i.price;
}
function percentOff(i: Item): number {
  return isOnSale(i) ? Math.round((1 - (i.price as number) / (i.compareAtPrice as number)) * 100) : 0;
}
function stockLeft(i: Item): number | null {
  return i.trackStock ? Math.max(0, i.stock ?? 0) : null;
}
function imageOf(i: Item): string | null {
  return i.imageUrl ?? i.image_url ?? null;
}
function groupKeyOf(i: Item): string {
  return i.retail?.variantGroup?.trim().toLowerCase() || `item:${i.id}`;
}
function hasTiers(i: Item): boolean {
  return (i.retail?.volumeTiers?.length ?? 0) > 0;
}

export function StoreTemplate({ business, items, categories: categoriesProp, capabilities }: PublicTemplateProps) {
  const { language } = useSimpleLanguage();
  const getText = useCallback((es: string, en: string) => (language === 'es' ? es : en), [language]);
  const money = (n: number) => formatPrice(n, business.currency);

  // ── Paleta: primario = botones; secundario (o tinta derivada) = barras oscuras ──
  const primary = business.primary_color ?? DEFAULT_BRAND;
  const light = deriveBrandPalette(primary, business.secondary_color ?? DEFAULT_BAR, business.accent_color);
  const dark = deriveDarkBrandPalette(primary, business.secondary_color ?? DEFAULT_BAR, business.accent_color);
  // Barras = secundario tal cual (en oscuro el derivado toma el matiz del primario y un dorado quedaba oliva).
  const bar = /^#[0-9a-f]{6}$/i.test(business.secondary_color ?? '') ? (business.secondary_color as string) : DEFAULT_BAR;
  // Modo oscuro: los neutros salen del color de las barras (un primario dorado teñía todo de oliva).
  const darkNeutrals = '[data-theme="dark"] .st-scope{--st-bg:color-mix(in srgb,var(--st-bar) 70%,#000);--st-surface:color-mix(in srgb,var(--st-bar) 90%,#fff);--st-border:color-mix(in srgb,var(--st-bar) 76%,#fff);--st-border-soft:color-mix(in srgb,var(--st-bar) 84%,#fff);--st-placeholder:color-mix(in srgb,var(--st-bar) 84%,#fff)}';
  const themeCss = brandPaletteCss('st-scope', 'st', light, dark) + `.st-scope{--st-bar:${bar}}` + darkNeutrals;

  // ── Carrito, cuenta de cliente y horario (mismo motor que la boutique) ──
  const waRaw = resolveWhatsAppDigits(business);
  const { cart, addToCart, removeFromCart, reprice, cartTotal, cartCount } = useCart();
  const storeAccounts = capabilities.storeAccounts === true;
  const account = useStoreAccount(business.slug, storeAccounts);
  const { memberPrices } = account;
  const approved = account.me?.status === 'approved';
  const memberListName = approved ? account.me?.priceListName ?? null : null;
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (storeAccounts && url.searchParams.get('cuenta') === '1') {
      setAccountOpen(true);
      url.searchParams.delete('cuenta');
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
  }, [storeAccounts]);
  useEffect(() => {
    reprice((it) => memberPrices.get(it.id) ?? it.basePrice ?? it.price);
  }, [memberPrices, reprice]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const [openStatus, setOpenStatus] = useState<OpenStatus | null>(null);
  const [todayKey, setTodayKey] = useState<string | null>(null);
  useEffect(() => {
    const update = () => {
      setOpenStatus(getOpenStatus(business.horario, business.timezone));
      setTodayKey(todayKeyInTimezone(business.timezone));
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [business.horario, business.timezone]);
  const cartSchedule = cartScheduleFrom(getScheduleTarget(openStatus, business.timezone));

  // Pedidos anteriores del cliente con sesión → "Comprar de nuevo".
  const [orders, setOrders] = useState<StoreOrderSummary[]>([]);
  const canReorder = storeAccounts && !!account.token && !!account.me && account.me.status !== 'unavailable';
  useEffect(() => {
    if (!canReorder) {
      setOrders([]);
      return;
    }
    account.loadOrders().then((o) => setOrders(o.filter((x) => x.status !== 'Canceled' && (x.items?.length ?? 0) > 0))).catch(() => setOrders([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canReorder, account.token, account.me?.status]);

  // ── Vistas con historial ──
  const [view, setView] = useState<View>({ kind: 'home' });
  const go = useCallback((v: View) => {
    setView(v);
    try {
      window.history.pushState({ ...(window.history.state ?? {}), stView: v }, '');
    } catch { /* sandbox sin historial: igual cambia de vista */ }
    document.getElementById('top')?.scrollIntoView({ block: 'start' });
  }, []);
  useEffect(() => {
    const onPop = (e: PopStateEvent) => setView((e.state?.stView as View | undefined) ?? { kind: 'home' });
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const deepLinkedId = useDeepLinkedItemId();
  useEffect(() => {
    if (deepLinkedId && items.some((i) => i.id === deepLinkedId)) setView({ kind: 'product', id: deepLinkedId });
  }, [deepLinkedId, items]);

  // ── Catálogo ──
  const itemById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const groupMembers = useMemo(() => {
    const m = new Map<string, Item[]>();
    for (const i of items) m.set(groupKeyOf(i), [...(m.get(groupKeyOf(i)) ?? []), i]);
    return m;
  }, [items]);
  const inCategory = (i: Item, cat: string) => {
    const catId = categoriesProp.find((c) => c.name === cat)?.id;
    return (catId !== undefined && i.category_id === catId) || i.category === cat;
  };
  // Solo departamentos con productos: una categoría vacía (ej. las de ejemplo de un espacio nuevo) no se ofrece.
  const categoryNames: string[] = (
    categoriesProp.length > 0
      ? [...categoriesProp].sort((a, b) => a.sort_order - b.sort_order).map((c) => c.name)
      : Array.from(new Set(items.map((i) => i.category).filter((c): c is string => !!c)))
  ).filter((c) => items.some((i) => inCategory(i, c)));
  const brandCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of items) {
      const b = i.retail?.brand?.trim();
      if (b) m.set(b, (m.get(b) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [items]);
  const sizes = useMemo(
    () => Array.from(new Set(items.map((i) => i.retail?.variantLabel?.trim()).filter((s): s is string => !!s))).sort(
      (a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0) || a.localeCompare(b),
    ),
    [items],
  );
  const memberPriceOf = (id: string) => memberPrices.get(id);
  const priceOf = (i: Item) => memberPriceOf(i.id) ?? i.price ?? 0;
  const qtyInCart = (id: string) => cart.find((e) => e.item.id === id)?.qty ?? 0;

  // ── Filtros (resultados) ──
  const [query, setQuery] = useState('');
  const [draftQuery, setDraftQuery] = useState('');
  const [dept, setDept] = useState<string | null>(null);
  const [brandsSel, setBrandsSel] = useState<string[]>([]);
  const [size, setSize] = useState<string | null>(null);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [onlyDeals, setOnlyDeals] = useState(false);
  const [onlyStock, setOnlyStock] = useState(false);
  const [onlyVolume, setOnlyVolume] = useState(false);
  const [sort, setSort] = useState<SortKey>('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  const clearFilters = () => {
    setQuery('');
    setDraftQuery('');
    setDept(null);
    setBrandsSel([]);
    setSize(null);
    setPriceMin('');
    setPriceMax('');
    setOnlyDeals(false);
    setOnlyStock(false);
    setOnlyVolume(false);
  };
  const openResults = (patch?: { dept?: string | null; brand?: string | null; deals?: boolean; query?: string }) => {
    clearFilters();
    if (patch?.dept) setDept(patch.dept);
    if (patch?.brand) setBrandsSel([patch.brand]);
    if (patch?.deals) setOnlyDeals(true);
    if (patch?.query) {
      setQuery(patch.query);
      setDraftQuery(patch.query);
    }
    go({ kind: 'results' });
  };

  const min = parseFloat(priceMin);
  const max = parseFloat(priceMax);
  const filtered = items
    .filter((i) => matchesCatalogQuery(query, [i.name, i.nameEn, i.category, i.retail?.brand, i.retail?.variantGroup, i.retail?.variantLabel, i.description]))
    .filter((i) => !dept || inCategory(i, dept))
    .filter((i) => brandsSel.length === 0 || brandsSel.includes(i.retail?.brand?.trim() ?? ''))
    .filter((i) => !size || i.retail?.variantLabel?.trim() === size)
    .filter((i) => !onlyDeals || isOnSale(i))
    .filter((i) => !onlyStock || stockLeft(i) !== 0)
    .filter((i) => !onlyVolume || hasTiers(i))
    .filter((i) => (Number.isFinite(min) ? priceOf(i) >= min : true) && (Number.isFinite(max) ? priceOf(i) <= max : true));
  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'price-asc': return priceOf(a) - priceOf(b);
      case 'price-desc': return priceOf(b) - priceOf(a);
      case 'name': return a.name.localeCompare(b.name, language);
      case 'new': return 0;
      default: return (Number(!!b.featured) * 2 + Number(!!b.popular)) - (Number(!!a.featured) * 2 + Number(!!a.popular));
    }
  });
  // Una tarjeta por producto base: la variante que pasó los filtros es la que se muestra primero.
  const seen = new Set<string>();
  const results = sorted.filter((i) => {
    const k = groupKeyOf(i);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const activeChips: { label: string; clear: () => void }[] = [
    ...(query ? [{ label: `“${query}”`, clear: () => { setQuery(''); setDraftQuery(''); } }] : []),
    ...(dept ? [{ label: categoryLabel(dept, language, business.categoryTranslations), clear: () => setDept(null) }] : []),
    ...brandsSel.map((b) => ({ label: b, clear: () => setBrandsSel(brandsSel.filter((x) => x !== b)) })),
    ...(size ? [{ label: size, clear: () => setSize(null) }] : []),
    ...(onlyDeals ? [{ label: getText('En oferta', 'On sale'), clear: () => setOnlyDeals(false) }] : []),
    ...(onlyStock ? [{ label: getText('En existencia', 'In stock'), clear: () => setOnlyStock(false) }] : []),
    ...(onlyVolume ? [{ label: getText('Precio por cantidad', 'Volume pricing'), clear: () => setOnlyVolume(false) }] : []),
    ...(priceMin || priceMax ? [{ label: `${priceMin ? money(min || 0) : '…'} – ${priceMax ? money(max || 0) : '…'}`, clear: () => { setPriceMin(''); setPriceMax(''); } }] : []),
  ];

  // ── Agregar al carrito ──
  const cartItemOf = (i: Item, title?: string): CartItem => {
    const group = groupMembers.get(groupKeyOf(i)) ?? [i];
    const base = i.retail?.variantGroup && group.length > 1 ? i.retail.variantGroup : (language === 'en' && i.nameEn ? i.nameEn : i.name);
    const name = title ?? (i.retail?.variantLabel && group.length > 1 ? `${base} · ${i.retail.variantLabel}` : base);
    return { id: i.id, name, price: priceOf(i), basePrice: i.price ?? 0, image: imageOf(i) ?? undefined, rules: i.retail ?? null };
  };
  const addItem = (i: Item, qty?: number) => addToCart(cartItemOf(i), qty ?? addStep(qtyInCart(i.id), i.retail));
  const removeItem = (i: Item) => removeFromCart(i.id, removeStep(qtyInCart(i.id), i.retail));

  /** Repetir un pedido: vuelve a cargar las líneas que siguen a la venta (el API recalcula precios al pedir). */
  const repeatOrder = (o: StoreOrderSummary) => {
    let added = 0;
    let skipped = 0;
    for (const line of o.items ?? []) {
      const it = itemById.get(line.itemId);
      const left = it ? stockLeft(it) : null;
      if (!it || it.price == null || left === 0) {
        skipped++;
        continue;
      }
      let qty = line.qty;
      if (left != null) qty = Math.min(qty, left);
      if (it.retail?.maxPerOrder) qty = Math.min(qty, it.retail.maxPerOrder - qtyInCart(it.id));
      if (qty <= 0) {
        skipped++;
        continue;
      }
      addToCart(cartItemOf(it), qty);
      added++;
    }
    setNotice(
      added === 0
        ? getText('Ninguno de esos productos está disponible ahora.', 'None of those products are available now.')
        : skipped > 0
          ? getText(`Agregamos ${added} producto(s). ${skipped} ya no está(n) disponible(s).`, `Added ${added} product(s). ${skipped} no longer available.`)
          : getText(`Agregamos ${added} producto(s) al carrito.`, `Added ${added} product(s) to your cart.`),
    );
    if (added > 0) setCartOpen(true);
  };

  // Productos comprados antes (únicos, los más recientes primero) para la fila "Comprar de nuevo".
  const buyAgain = useMemo(() => {
    const out: { item: Item; qty: number }[] = [];
    const ids = new Set<string>();
    for (const o of orders)
      for (const l of o.items ?? []) {
        const it = itemById.get(l.itemId);
        if (it && !ids.has(it.id)) {
          ids.add(it.id);
          out.push({ item: it, qty: l.qty });
        }
      }
    return out.slice(0, 10);
  }, [orders, itemById]);

  // ── Datos de inicio ──
  const deals = items.filter(isOnSale).sort((a, b) => percentOff(b) - percentOff(a));
  const featured = items.filter((i) => i.featured || i.popular);
  const dedupe = (list: Item[]) => {
    const s = new Set<string>();
    return list.filter((i) => (s.has(groupKeyOf(i)) ? false : (s.add(groupKeyOf(i)), true)));
  };
  const quads = categoryNames
    .map((name) => ({ name, items: dedupe(items.filter((i) => inCategory(i, name))) }))
    .filter((q) => q.items.length > 0)
    .slice(0, 4);
  const shipMethods = capabilities.onlinePayments && capabilities.stripeReady !== false ? capabilities.shippingMethods ?? [] : [];
  const freeOver = shipMethods.map((m) => m.freeOverAmount).filter((v): v is number => !!v && v > 0).sort((a, b) => a - b)[0];
  const groundOnly = shipMethods.length > 0 && items.some((i) => i.retail?.hazmat);
  const anyTiers = items.some(hasTiers);
  const trust: { title: string; text: string; icon: keyof typeof ICONS }[] = [
    ...(shipMethods.length > 0
      ? [{
          title: freeOver ? getText(`Envío gratis desde ${money(freeOver)}`, `Free shipping over ${money(freeOver)}`) : getText('Envío a domicilio', 'Home delivery'),
          text: groundOnly
            ? getText('Los perfumes viajan por tierra; ves el costo y el tiempo antes de pagar.', 'Fragrances ship by ground; you see cost and timing before paying.')
            : getText('Ves el costo y el tiempo de entrega antes de pagar.', 'See cost and delivery time before paying.'),
          icon: 'truck' as const,
        }]
      : []),
    ...(business.ordersEnabled !== false && items.length > 0
      ? [{ title: getText('Recoge en tienda', 'Store pickup'), text: business.address ?? getText('Sin costo de envío.', 'No shipping cost.'), icon: 'store' as const }]
      : []),
    ...(capabilities.salesTaxRate
      ? [{
          title: getText('Impuesto calculado al pagar', 'Tax calculated at checkout'),
          text: storeAccounts
            ? getText('Clientes con certificado de reventa, exentos.', 'Resale-certificate customers are exempt.')
            : getText('Sin sorpresas en el total.', 'No surprises in the total.'),
          icon: 'receipt' as const,
        }]
      : []),
    ...(capabilities.onlinePayments && capabilities.stripeReady !== false
      ? [{ title: getText('Pago seguro', 'Secure payment'), text: getText('Tarjeta procesada de forma segura. No guardamos tus datos.', 'Card processed securely. We never store your details.'), icon: 'lock' as const }]
      : []),
  ];

  const viewProduct = view.kind === 'product' ? itemById.get(view.id) ?? null : null;
  const cardProps = {
    priceOf, memberPriceOf, qtyInCart, addItem, removeItem, money, getText, language,
    groupMembers, memberListName,
    onOpen: (i: Item) => go({ kind: 'product', id: i.id }),
  };

  return (
    <div
      id="top"
      className="st-scope"
      style={{ minHeight: '100vh', backgroundColor: BG, color: INK, containerType: 'inline-size', fontFamily: 'var(--font-inter, Inter), system-ui, sans-serif' } as React.CSSProperties}
    >
      <style dangerouslySetInnerHTML={{ __html: themeCss + PRESSED_CSS }} />
      <OpenStatusBar status={openStatus} language={language} />

      {/* ── CABECERA: marca, buscador, cuenta y carrito ── */}
      <header style={{ backgroundColor: BAR, color: ON_BAR }}>
        <div style={{ maxWidth: MAX_W, margin: '0 auto', padding: '10px 16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px 18px' }}>
          <a href="#top" onClick={(e) => { e.preventDefault(); go({ kind: 'home' }); }} style={{ display: 'flex', alignItems: 'center', gap: 10, color: ON_BAR, textDecoration: 'none', minHeight: 44 }}>
            {business.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={business.logo_url} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', backgroundColor: '#ffffff' }} />
            )}
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>{business.name}</span>
              {business.address && (
                <span className="hidden @3xl:block" style={{ fontSize: 11, color: ON_BAR_MUTED, marginTop: 2 }}>{business.address}</span>
              )}
            </span>
          </a>

          <form
            role="search"
            className="order-last w-full @4xl:order-none @4xl:w-auto"
            onSubmit={(e) => {
              e.preventDefault();
              openResults({ query: draftQuery.trim(), dept: dept ?? undefined });
            }}
            style={{ flex: '1 1 380px', display: 'flex', height: 44, borderRadius: 8, overflow: 'hidden', backgroundColor: '#ffffff' }}
          >
            {categoryNames.length > 0 && (
              <>
                <label htmlFor="st-dept" className="sr-only">{getText('Departamento', 'Department')}</label>
                <select
                  id="st-dept"
                  value={dept ?? ''}
                  onChange={(e) => setDept(e.target.value || null)}
                  className="hidden @2xl:block"
                  style={{ border: 0, backgroundColor: '#ebe8e2', color: '#13151a', padding: '0 8px', fontSize: 13, maxWidth: 160 }}
                >
                  <option value="">{getText('Todo', 'All')}</option>
                  {categoryNames.map((c) => (
                    <option key={c} value={c}>{categoryLabel(c, language, business.categoryTranslations)}</option>
                  ))}
                </select>
              </>
            )}
            <label htmlFor="st-q" className="sr-only">{getText('Buscar', 'Search')}</label>
            <input
              id="st-q"
              type="search"
              value={draftQuery}
              onChange={(e) => setDraftQuery(e.target.value)}
              placeholder={getText('Busca marca, producto o tamaño', 'Search brand, product or size')}
              style={{ flex: 1, minWidth: 0, border: 0, padding: '0 12px', fontSize: 15, color: '#13151a', backgroundColor: '#ffffff' }}
            />
            <button type="submit" aria-label={getText('Buscar', 'Search')} style={{ width: 52, border: 0, backgroundColor: ACCENT, color: ON_ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name="search" size={20} />
            </button>
          </form>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            {storeAccounts && (
              <button
                type="button"
                onClick={() => setAccountOpen(true)}
                style={{ background: 'none', border: 0, color: ON_BAR, textAlign: 'left', lineHeight: 1.15, padding: '4px 8px', minHeight: 44, cursor: 'pointer' }}
              >
                <span style={{ display: 'block', fontSize: 11, color: ON_BAR_MUTED }}>
                  {account.me?.name ? getText(`Hola, ${account.me.name.split(' ')[0]}`, `Hi, ${account.me.name.split(' ')[0]}`) : getText('Hola, identifícate', 'Hello, sign in')}
                </span>
                <strong style={{ fontSize: 13 }}>{memberListName ?? getText('Cuenta y pedidos', 'Account & orders')}</strong>
              </button>
            )}
            <SimpleLanguageToggle variant="dark" spanishFlag={business.spanishFlag} />
            <PublicThemeToggle variant="dark" />
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={getText(`Carrito, ${cartCount} artículos`, `Cart, ${cartCount} items`)}
              style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 4, background: 'none', border: 0, color: ON_BAR, padding: '4px 8px', minHeight: 44, cursor: 'pointer' }}
            >
              <Icon name="cart" size={28} />
              <span style={{ position: 'absolute', top: 0, left: 22, minWidth: 18, fontSize: 13, fontWeight: 800, color: DETAIL, textAlign: 'center' }}>{cartCount}</span>
              <strong className="hidden @2xl:inline" style={{ fontSize: 13 }}>{getText('Carrito', 'Cart')}</strong>
            </button>
          </div>
        </div>

        {/* Departamentos */}
        <nav aria-label={getText('Departamentos', 'Departments')} style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <div
            className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ maxWidth: MAX_W, margin: '0 auto', padding: '0 12px', display: 'flex', gap: 2, overflowX: 'auto', fontSize: 14 }}
          >
            <NavLink onClick={() => openResults()} icon>{getText('Todo', 'All')}</NavLink>
            {categoryNames.map((c) => (
              <NavLink key={c} onClick={() => openResults({ dept: c })}>{categoryLabel(c, language, business.categoryTranslations)}</NavLink>
            ))}
            {deals.length > 0 && <NavLink onClick={() => openResults({ deals: true })}>{getText('Ofertas', 'Deals')}</NavLink>}
            {storeAccounts && !memberListName && (
              <NavLink onClick={() => setAccountOpen(true)} highlight>{getText('Cuenta mayorista', 'Wholesale account')}</NavLink>
            )}
          </div>
        </nav>
      </header>

      <div id="catalog" style={{ scrollMarginTop: 8 }} />

      {/* ── INICIO ── */}
      {view.kind === 'home' && (
        <main style={{ maxWidth: MAX_W, margin: '0 auto', padding: '16px 16px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <div
              style={{
                flex: '999 1 560px', minWidth: 0, minHeight: 'clamp(220px, 28cqi, 320px)', borderRadius: 12, overflow: 'hidden', position: 'relative',
                backgroundColor: BAR, color: ON_BAR, display: 'flex', alignItems: 'flex-end',
              }}
            >
              {business.cover_image_url && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={business.cover_image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'var(--st-hero-overlay)' }} />
                </>
              )}
              <div style={{ position: 'relative', padding: 'clamp(24px, 5cqi, 48px)', display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 640 }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: DETAIL }}>
                  {storeAccounts ? getText('Al detalle y al por mayor', 'Retail & wholesale') : getText('Tienda en línea', 'Online store')}
                </span>
                <h1 style={{ margin: 0, fontSize: 'clamp(28px, 4.2cqi, 46px)', lineHeight: 1.08, fontWeight: 700, letterSpacing: '-0.02em' }}>
                  {business.name}
                </h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
                  <button type="button" onClick={() => openResults()} style={pillBtn(ACCENT, ON_ACCENT)}>
                    {getText('Ver catálogo', 'Shop the catalog')}
                  </button>
                  {deals.length > 0 && (
                    <button type="button" onClick={() => openResults({ deals: true })} style={{ ...pillBtn('transparent', ON_BAR), border: '1px solid rgba(255,255,255,0.45)' }}>
                      {getText('Ver ofertas', 'See deals')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {storeAccounts && (
              <aside style={{ flex: '1 1 280px', minWidth: 0, ...card, padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {memberListName ? (
                  <>
                    <h2 style={h2}>{account.me?.name ? getText(`Hola, ${account.me.name.split(' ')[0]}`, `Hi, ${account.me.name.split(' ')[0]}`) : getText('Tu cuenta', 'Your account')}</h2>
                    <span style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: SAVE_BG, color: SAVE, fontSize: 13, fontWeight: 700, padding: '5px 10px', borderRadius: 9999 }}>
                      <Icon name="check" size={14} /> {memberListName}
                    </span>
                    <p style={pMuted}>
                      {account.me?.minOrderAmount
                        ? getText(`Tu precio ya aparece en todo el catálogo. Pedido mínimo: ${money(account.me.minOrderAmount)}.`, `Your price shows across the catalog. Minimum order: ${money(account.me.minOrderAmount)}.`)
                        : getText('Tu precio ya aparece en todo el catálogo.', 'Your price shows across the catalog.')}
                    </p>
                    {orders[0] && (
                      <button type="button" onClick={() => repeatOrder(orders[0])} style={{ ...pillBtn(BAR, ON_BAR), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <Icon name="repeat" size={16} /> {getText('Repetir último pedido', 'Reorder last order')}
                      </button>
                    )}
                    <button type="button" onClick={() => setAccountOpen(true)} style={linkBtn}>{getText('Ver mis pedidos', 'View my orders')}</button>
                  </>
                ) : account.me?.status === 'pending' ? (
                  <>
                    <h2 style={h2}>{getText('Solicitud en revisión', 'Request under review')}</h2>
                    <p style={pMuted}>{getText('Te avisamos cuando tu cuenta esté aprobada. Mientras tanto ves el precio público.', 'We will let you know once approved. Meanwhile you see public prices.')}</p>
                    <button type="button" onClick={() => setAccountOpen(true)} style={linkBtn}>{getText('Ver mi cuenta', 'View my account')}</button>
                  </>
                ) : (
                  <>
                    <h2 style={h2}>{getText('Inicia sesión para ver tu precio', 'Sign in to see your price')}</h2>
                    <p style={pMuted}>
                      {getText(
                        'Clientes aprobados ven su precio en cada producto, compran por caja y repiten pedidos en un clic.',
                        'Approved customers see their price on every product, buy by the case and reorder in one click.',
                      )}
                    </p>
                    <button type="button" onClick={() => setAccountOpen(true)} style={pillBtn(ACCENT, ON_ACCENT)}>
                      {account.token ? getText('Solicitar cuenta mayorista', 'Request a wholesale account') : getText('Iniciar sesión', 'Sign in')}
                    </button>
                    {!account.token && (
                      <button type="button" onClick={() => setAccountOpen(true)} style={linkBtn}>
                        {getText('¿Tienes una tienda? Solicita cuenta mayorista', 'Own a store? Request a wholesale account')}
                      </button>
                    )}
                  </>
                )}
              </aside>
            )}
          </section>

          {quads.length > 0 && (
            <section aria-label={getText('Compra por categoría', 'Shop by category')} className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @5xl:grid-cols-4">
              {quads.map((q) => (
                <div key={q.name} style={{ ...card, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
                  <h2 style={{ ...h2, fontSize: 18 }}>{categoryLabel(q.name, language, business.categoryTranslations)}</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {q.items.slice(0, 4).map((i) => (
                      <button key={i.id} type="button" onClick={() => go({ kind: 'product', id: i.id })} style={{ background: 'none', border: 0, padding: 0, textAlign: 'left', cursor: 'pointer', color: INK, minWidth: 0 }}>
                        <Thumb item={i} radius={8} />
                        <span style={{ display: 'block', marginTop: 6, fontSize: 12, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {i.retail?.variantGroup || (language === 'en' && i.nameEn ? i.nameEn : i.name)}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => openResults({ dept: q.name })} style={{ ...linkBtn, marginTop: 'auto' }}>
                    {getText('Ver todo', 'See all')} ({q.items.length})
                  </button>
                </div>
              ))}
            </section>
          )}

          {buyAgain.length > 0 && (
            <Shelf title={getText('Comprar de nuevo', 'Buy again')} action={{ label: getText('Ver pedidos', 'View orders'), onClick: () => setAccountOpen(true) }}>
              <div className="grid grid-cols-1 gap-3 @2xl:grid-cols-2 @5xl:grid-cols-4">
                {buyAgain.slice(0, 8).map(({ item: i, qty }) => (
                  <div key={i.id} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: 10, display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
                    <button type="button" onClick={() => go({ kind: 'product', id: i.id })} aria-label={i.name} style={{ width: 60, flex: 'none', background: 'none', border: 0, padding: 0, cursor: 'pointer' }}>
                      <Thumb item={i} radius={6} compact />
                    </button>
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, fontSize: 13 }}>
                      <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cartItemOf(i).name}</strong>
                      <span style={{ color: MUTED }}>{getText(`Última vez: ${qty} u.`, `Last time: ${qty} units`)} · {money(priceOf(i))}</span>
                      <button
                        type="button"
                        disabled={stockLeft(i) === 0 || i.price == null}
                        onClick={() => {
                          addItem(i, Math.max(qty, addStep(0, i.retail)));
                          setNotice(getText('Agregado al carrito.', 'Added to cart.'));
                        }}
                        style={{ alignSelf: 'flex-start', background: SURFACE, color: INK, border: `1px solid ${INK}`, borderRadius: 9999, fontSize: 12, fontWeight: 700, padding: '0 12px', minHeight: 32, cursor: 'pointer' }}
                      >
                        {stockLeft(i) === 0 ? getText('Agotado', 'Sold out') : getText(`Agregar ${qty}`, `Add ${qty}`)}
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </Shelf>
          )}

          {brandCounts.length >= 2 && (
            <Shelf title={getText('Compra por marca', 'Shop by brand')} action={{ label: getText('Todas las marcas', 'All brands'), onClick: () => openResults() }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {brandCounts.slice(0, 18).map(([b]) => (
                  <button key={b} type="button" onClick={() => openResults({ brand: b })} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: '0 16px', minHeight: 44, backgroundColor: SURFACE, color: INK, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    {b}
                  </button>
                ))}
              </div>
            </Shelf>
          )}

          {deals.length > 0 && (
            <Shelf title={getText('Ofertas', 'Deals')} action={{ label: getText('Ver todas las ofertas', 'See all deals'), onClick: () => openResults({ deals: true }) }}>
              <Row>{dedupe(deals).slice(0, 12).map((i) => <MiniCard key={i.id} item={i} {...cardProps} />)}</Row>
            </Shelf>
          )}

          {featured.length > 0 && (
            <Shelf title={getText('Lo más pedido', 'Best sellers')} action={{ label: getText('Ver catálogo', 'Shop all'), onClick: () => openResults() }}>
              <Row>{dedupe(featured).slice(0, 12).map((i) => <MiniCard key={i.id} item={i} {...cardProps} />)}</Row>
            </Shelf>
          )}

          {deals.length === 0 && featured.length === 0 && items.length > 0 && (
            <Shelf title={getText('Productos', 'Products')} action={{ label: getText('Ver catálogo', 'Shop all'), onClick: () => openResults() }}>
              <Row>{dedupe(items).slice(0, 12).map((i) => <MiniCard key={i.id} item={i} {...cardProps} />)}</Row>
            </Shelf>
          )}

          {items.length === 0 && (
            <div style={{ ...card, padding: '64px 24px', textAlign: 'center', color: MUTED }}>{getText('Productos disponibles pronto.', 'Products available soon.')}</div>
          )}

          {storeAccounts && !memberListName && (
            <section style={{ borderRadius: 12, backgroundColor: BAR, color: ON_BAR, padding: 'clamp(24px, 4cqi, 40px)', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
              <div style={{ flex: '1 1 360px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: DETAIL }}>
                  {getText('Para tiendas y revendedores', 'For stores and resellers')}
                </span>
                <h2 style={{ margin: 0, fontSize: 'clamp(24px, 3cqi, 34px)', lineHeight: 1.12, fontWeight: 700 }}>
                  {anyTiers ? getText('Mientras más compras, menos pagas por unidad.', 'The more you buy, the less you pay per unit.') : getText('Precios especiales para tu negocio.', 'Special prices for your business.')}
                </h2>
                <p style={{ margin: 0, color: ON_BAR_MUTED, fontSize: 15, lineHeight: 1.5, maxWidth: '56ch' }}>
                  {getText(
                    'Solicita tu cuenta. Al aprobarla ves tu lista de precios en todo el catálogo; con certificado de reventa compras exento de impuesto.',
                    'Request your account. Once approved you see your price list across the catalog; with a resale certificate you buy tax-exempt.',
                  )}
                </p>
              </div>
              <button type="button" onClick={() => setAccountOpen(true)} style={pillBtn(ACCENT, ON_ACCENT)}>
                {getText('Solicitar cuenta mayorista', 'Request a wholesale account')}
              </button>
            </section>
          )}

          {trust.length > 0 && (
            <section className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @5xl:grid-cols-4">
              {trust.map((t) => (
                <div key={t.title} style={{ ...card, padding: 18, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span aria-hidden style={{ width: 40, height: 40, flex: 'none', borderRadius: 9999, backgroundColor: 'var(--st-accent-soft)', color: ACCENT_TEXT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={t.icon} size={20} />
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <strong style={{ fontSize: 15 }}>{t.title}</strong>
                    <span style={{ fontSize: 13, lineHeight: 1.45, color: MUTED }}>{t.text}</span>
                  </span>
                </div>
              ))}
            </section>
          )}

          <AboutSection description={business.description} descriptionEn={business.descriptionEn} maxWidthClassName="max-w-[1440px]" language={language} />
          <FaqSection faq={business.faq} getText={getText} />
        </main>
      )}

      {/* ── RESULTADOS ── */}
      {view.kind === 'results' && (
        <>
          <div style={{ backgroundColor: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ maxWidth: MAX_W, margin: '0 auto', padding: '10px 16px', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', fontSize: 14 }}>
              <span aria-live="polite">
                {results.length} {getText(results.length === 1 ? 'resultado' : 'resultados', results.length === 1 ? 'result' : 'results')}
                {query && <> {getText('para', 'for')} <strong style={{ color: ACCENT_TEXT }}>“{query}”</strong></>}
              </span>
              <button type="button" className="inline-flex @5xl:hidden" onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen} style={{ ...outlineBtn, alignItems: 'center', gap: 6 }}>
                <Icon name="filter" size={16} /> {getText('Filtros', 'Filters')}{activeChips.length > 0 ? ` (${activeChips.length})` : ''}
              </button>
              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                <label htmlFor="st-sort" style={{ fontSize: 13, color: MUTED }}>{getText('Ordenar por', 'Sort by')}</label>
                <select id="st-sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} style={{ fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '0 10px', minHeight: 40, backgroundColor: BG, color: INK }}>
                  <option value="featured">{getText('Destacados', 'Featured')}</option>
                  <option value="price-asc">{getText('Precio: menor a mayor', 'Price: low to high')}</option>
                  <option value="price-desc">{getText('Precio: mayor a menor', 'Price: high to low')}</option>
                  <option value="name">{getText('Nombre A–Z', 'Name A–Z')}</option>
                </select>
              </span>
            </div>
          </div>

          <div style={{ maxWidth: MAX_W, margin: '0 auto', padding: '16px 16px 40px', display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'flex-start' }}>
            <aside
              aria-label={getText('Filtros', 'Filters')}
              className={filtersOpen ? 'flex w-full @5xl:w-auto' : 'hidden @5xl:flex'}
              style={{ flex: '1 1 230px', maxWidth: filtersOpen ? undefined : 270, flexDirection: 'column', gap: 22, fontSize: 14 }}
            >
              {categoryNames.length > 0 && (
                <Facet title={getText('Departamento', 'Department')}>
                  <FacetOption type="radio" name="st-f-dept" checked={!dept} onChange={() => setDept(null)}>{getText('Todos', 'All')}</FacetOption>
                  {categoryNames.map((c) => (
                    <FacetOption key={c} type="radio" name="st-f-dept" checked={dept === c} onChange={() => setDept(c)}>
                      {categoryLabel(c, language, business.categoryTranslations)}
                    </FacetOption>
                  ))}
                </Facet>
              )}
              <Facet title={getText('Disponibilidad y precio', 'Availability & price')}>
                {items.some((i) => i.trackStock) && <FacetOption checked={onlyStock} onChange={() => setOnlyStock(!onlyStock)}>{getText('Solo en existencia', 'In stock only')}</FacetOption>}
                {deals.length > 0 && <FacetOption checked={onlyDeals} onChange={() => setOnlyDeals(!onlyDeals)}>{getText('En oferta', 'On sale')}</FacetOption>}
                {anyTiers && <FacetOption checked={onlyVolume} onChange={() => setOnlyVolume(!onlyVolume)}>{getText('Con precio por cantidad', 'With volume pricing')}</FacetOption>}
              </Facet>
              {brandCounts.length >= 2 && (
                <Facet title={getText('Marca', 'Brand')}>
                  {(showAllBrands ? brandCounts : brandCounts.slice(0, 8)).map(([b, n]) => (
                    <FacetOption key={b} checked={brandsSel.includes(b)} onChange={() => setBrandsSel(brandsSel.includes(b) ? brandsSel.filter((x) => x !== b) : [...brandsSel, b])} count={n}>
                      {b}
                    </FacetOption>
                  ))}
                  {brandCounts.length > 8 && (
                    <button type="button" onClick={() => setShowAllBrands((v) => !v)} style={{ ...linkBtn, fontSize: 13 }}>
                      {showAllBrands ? getText('Ver menos', 'Show less') : getText(`Ver las ${brandCounts.length} marcas`, `See all ${brandCounts.length} brands`)}
                    </button>
                  )}
                </Facet>
              )}
              {sizes.length >= 2 && (
                <Facet title={getText('Tamaño', 'Size')}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {sizes.map((s) => (
                      <button key={s} type="button" aria-pressed={size === s} onClick={() => setSize(size === s ? null : s)} className="st-pill" style={pill()}>{s}</button>
                    ))}
                  </div>
                </Facet>
              )}
              <Facet title={getText('Precio', 'Price')}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <label htmlFor="st-pmin" className="sr-only">{getText('Mínimo', 'Minimum')}</label>
                  <input id="st-pmin" inputMode="decimal" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder={getText('$ Mín', '$ Min')} style={priceInput} />
                  <span aria-hidden>–</span>
                  <label htmlFor="st-pmax" className="sr-only">{getText('Máximo', 'Maximum')}</label>
                  <input id="st-pmax" inputMode="decimal" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder={getText('$ Máx', '$ Max')} style={priceInput} />
                </div>
              </Facet>
              {filtersOpen && (
                <button type="button" className="@5xl:hidden" onClick={() => setFiltersOpen(false)} style={pillBtn(BAR, ON_BAR)}>
                  {getText(`Ver ${results.length} resultados`, `Show ${results.length} results`)}
                </button>
              )}
            </aside>

            <main style={{ flex: '999 1 560px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activeChips.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  {activeChips.map((c) => (
                    <button key={c.label} type="button" onClick={c.clear} aria-label={getText(`Quitar filtro ${c.label}`, `Remove filter ${c.label}`)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${BORDER}`, backgroundColor: SURFACE, color: INK, borderRadius: 9999, padding: '0 12px', minHeight: 34, fontSize: 13, cursor: 'pointer' }}>
                      {c.label} <Icon name="x" size={12} />
                    </button>
                  ))}
                  <button type="button" onClick={clearFilters} style={{ ...linkBtn, fontSize: 13 }}>{getText('Limpiar filtros', 'Clear filters')}</button>
                </div>
              )}
              {memberListName && (
                <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
                  {getText(`Precios con tu lista ${memberListName}. El precio público aparece tachado.`, `Prices with your ${memberListName} list. Public price is struck through.`)}
                </p>
              )}
              {results.length === 0 ? (
                <div style={{ ...card, padding: '48px 24px', textAlign: 'center' }}>
                  <p style={{ margin: 0, color: MUTED }}>{getText('No encontramos productos con esos filtros.', 'No products match those filters.')}</p>
                  <button type="button" onClick={clearFilters} style={{ ...linkBtn, marginTop: 8 }}>{getText('Limpiar filtros', 'Clear filters')}</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-3 @6xl:grid-cols-4">
                  {results.map((i) => <ResultCard key={i.id} item={i} {...cardProps} />)}
                </div>
              )}
            </main>
          </div>
        </>
      )}

      {/* ── FICHA ── */}
      {view.kind === 'product' && (
        viewProduct ? (
          <ProductView
            key={viewProduct.id}
            item={viewProduct}
            {...cardProps}
            business={business}
            related={dedupe(items.filter((i) => i.id !== viewProduct.id && groupKeyOf(i) !== groupKeyOf(viewProduct) && (
              (viewProduct.retail?.brand && i.retail?.brand === viewProduct.retail.brand) || (!viewProduct.retail?.brand && i.category === viewProduct.category)
            ))).slice(0, 12)}
            onBrand={(b) => openResults({ brand: b })}
            onCategory={(c) => openResults({ dept: c })}
            onBuyNow={() => setCartOpen(true)}
            groundOnly={groundOnly}
            shipMethodsCount={shipMethods.length}
          />
        ) : (
          <main style={{ maxWidth: MAX_W, margin: '0 auto', padding: '48px 16px', textAlign: 'center', color: MUTED }}>
            {getText('Este producto ya no está disponible.', 'This product is no longer available.')}{' '}
            <button type="button" onClick={() => openResults()} style={linkBtn}>{getText('Ver catálogo', 'Shop the catalog')}</button>
          </main>
        )
      )}

      {/* ── HORARIO + CONTACTO + PIE (todas las vistas) ── */}
      <div id="info" style={{ scrollMarginTop: 8, backgroundColor: SURFACE, borderTop: `1px solid ${BORDER}` }}>
        <PublicHoursSection
          horario={business.horario}
          todayKey={todayKey}
          language={language}
          getText={getText}
          headingColor={INK}
          ink={INK}
          muted={MUTED}
          surface={SURFACE}
          border={BORDER}
          rowBorder={BORDER}
        />
        <ContactSection business={business} language={language} />
      </div>
      <PublicFooter business={business} capabilities={capabilities} language={language} />

      {notice && (
        <div role="status" style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 84, zIndex: 60, backgroundColor: BAR, color: ON_BAR, padding: '10px 16px', borderRadius: 10, fontSize: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.25)', maxWidth: 'calc(100% - 32px)' }}>
          {notice}
        </div>
      )}

      {storeAccounts && (
        <StoreAccountSheet
          open={accountOpen}
          onClose={() => setAccountOpen(false)}
          account={account}
          businessName={business.name}
          getText={getText}
          language={language}
          accent={ACCENT}
          onAccent={ON_ACCENT}
          ink={INK}
          muted={MUTED}
          surface={SURFACE}
          border={BORDER}
          currency={business.currency}
          onReorder={(o) => {
            setAccountOpen(false);
            repeatOrder(o);
          }}
        />
      )}

      <WhatsAppCart
        cart={cart}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        cartTotal={cartTotal}
        cartCount={cartCount}
        whatsappNumber={waRaw ?? ''}
        businessName={business.name}
        slug={business.slug}
        onlinePayments={capabilities.onlinePayments && capabilities.stripeReady !== false}
        pickupNewCustomerLimit={capabilities.pickupNewCustomerLimit ?? null}
        shippingMethods={capabilities.shippingMethods}
        taxRate={(capabilities.salesTaxRate ?? 0) / 100}
        taxOnShipping={capabilities.salesTaxOnShipping !== false}
        taxState={capabilities.salesTaxState ?? null}
        storeSession={
          account.token && account.me && account.me.status !== 'unavailable'
            ? { token: account.token, name: account.me.name, email: account.me.email ?? account.email, priceListName: memberListName, minOrderAmount: memberListName ? account.me.minOrderAmount : null, taxExempt: !!memberListName && account.me.taxExempt === true }
            : null
        }
        ordersPaused={business.ordersEnabled === false}
        pickupOrders
        schedule={cartSchedule}
        getText={getText}
        isOpen={cartOpen}
        onOpenChange={setCartOpen}
        hideFab
        bottomInset={64}
      />

      {/* Navegación inferior (móvil) */}
      <nav
        aria-label={getText('Principal', 'Main')}
        className="grid @3xl:hidden"
        style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40, backgroundColor: SURFACE, borderTop: `1px solid ${BORDER}`, gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <BottomTab icon="home" label={getText('Inicio', 'Home')} active={view.kind === 'home'} onClick={() => go({ kind: 'home' })} />
        <BottomTab icon="grid" label={getText('Catálogo', 'Catalog')} active={view.kind === 'results'} onClick={() => openResults()} />
        <BottomTab icon="repeat" label={getText('Pedidos', 'Orders')} onClick={() => (storeAccounts ? setAccountOpen(true) : document.getElementById('info')?.scrollIntoView({ behavior: 'smooth' }))} />
        <BottomTab icon="cart" label={getText('Carrito', 'Cart')} badge={cartCount} onClick={() => setCartOpen(true)} />
      </nav>
      <div className="@3xl:hidden" aria-hidden style={{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))' }} />
    </div>
  );
}

// ── Estilos compartidos ─────────────────────────────────────────────────────

const card: React.CSSProperties = { backgroundColor: SURFACE, borderRadius: 12, border: `1px solid ${BORDER_SOFT}` };
const h2: React.CSSProperties = { margin: 0, fontSize: 20, fontWeight: 700, color: INK, letterSpacing: '-0.01em' };
const pMuted: React.CSSProperties = { margin: 0, fontSize: 14, lineHeight: 1.5, color: MUTED };
const linkBtn: React.CSSProperties = { background: 'none', border: 0, padding: '6px 0', color: ACCENT_TEXT, fontSize: 14, fontWeight: 700, cursor: 'pointer', textAlign: 'left', alignSelf: 'flex-start' };
const outlineBtn: React.CSSProperties = { border: `1px solid ${BORDER}`, backgroundColor: SURFACE, color: INK, borderRadius: 8, padding: '0 12px', minHeight: 40, fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const priceInput: React.CSSProperties = { width: 84, fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '0 8px', minHeight: 40, backgroundColor: SURFACE, color: INK };
function pillBtn(bg: string, fg: string): React.CSSProperties {
  return { backgroundColor: bg, color: fg, border: 0, borderRadius: 9999, padding: '0 22px', minHeight: 44, fontSize: 14, fontWeight: 700, cursor: 'pointer' };
}
/** Píldora seleccionable: el color del estado lo pone .st-pill[aria-pressed] (PRESSED_CSS). */
function pill(): React.CSSProperties {
  return { minHeight: 36, padding: '0 10px', borderRadius: 8, fontSize: 13, cursor: 'pointer' };
}

// ── Piezas ──────────────────────────────────────────────────────────────────

function NavLink({ children, onClick, icon, highlight }: { children: React.ReactNode; onClick: () => void; icon?: boolean; highlight?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 0, color: highlight ? DETAIL : ON_BAR, padding: '0 10px', minHeight: 40, fontSize: 14, fontWeight: icon || highlight ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
    >
      {icon && <Icon name="menu" size={18} />}
      {children}
    </button>
  );
}

function Shelf({ title, action, children }: { title: string; action?: { label: string; onClick: () => void }; children: React.ReactNode }) {
  return (
    <section style={{ ...card, padding: '18px 18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <h2 style={h2}>{title}</h2>
        {action && <button type="button" onClick={action.onClick} style={{ ...linkBtn, padding: 0 }}>{action.label}</button>}
      </div>
      {children}
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="[scrollbar-width:thin]" style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(150px, 180px)', gap: 14, overflowX: 'auto', paddingBottom: 6, scrollSnapType: 'x proximity' }}>
      {children}
    </div>
  );
}

function Facet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <legend style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 6, padding: 0 }}>{title}</legend>
      {children}
    </fieldset>
  );
}

function FacetOption({ children, checked, onChange, type = 'checkbox', name, count }: {
  children: React.ReactNode; checked: boolean; onChange: () => void; type?: 'checkbox' | 'radio'; name?: string; count?: number;
}) {
  return (
    <label style={{ display: 'flex', gap: 10, alignItems: 'center', minHeight: 32, cursor: 'pointer', color: INK }}>
      <input type={type} name={name} checked={checked} onChange={onChange} style={{ width: 18, height: 18, accentColor: 'var(--st-ink-surface)' }} />
      <span style={{ flex: 1 }}>{children}</span>
      {count != null && <span style={{ fontSize: 12, color: MUTED }}>{count}</span>}
    </label>
  );
}

function BottomTab({ icon, label, onClick, active, badge }: { icon: keyof typeof ICONS; label: string; onClick: () => void; active?: boolean; badge?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className="st-tab"
      style={{ position: 'relative', background: 'none', border: 0, minHeight: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, fontSize: 11, cursor: 'pointer' }}
    >
      <Icon name={icon} size={22} />
      {label}
      {!!badge && (
        <span style={{ position: 'absolute', top: 6, left: '55%', minWidth: 18, height: 18, borderRadius: 9999, backgroundColor: ACCENT, color: ON_ACCENT, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{badge}</span>
      )}
    </button>
  );
}

/** Foto cuadrada; sin foto, marca + inicial sobre el color de reposo de la paleta. */
function Thumb({ item, radius = 10, compact }: { item: Item; radius?: number; compact?: boolean }) {
  const src = imageOf(item);
  const soldOut = stockLeft(item) === 0;
  return (
    <span style={{ position: 'relative', display: 'block', aspectRatio: '1', borderRadius: radius, overflow: 'hidden', backgroundColor: PLACEHOLDER }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: soldOut ? 0.5 : 1 }} />
      ) : (
        <span style={{ position: 'absolute', inset: compact ? 4 : 10, border: `1px solid ${BORDER}`, borderRadius: Math.max(4, radius - 4), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 6, textAlign: 'center' }}>
          {!compact && item.retail?.brand && (
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED }}>{item.retail.brand}</span>
          )}
          <span style={{ fontSize: compact ? 20 : 'clamp(26px, 6cqi, 44px)', fontWeight: 600, color: ACCENT_TEXT, opacity: 0.75, lineHeight: 1 }}>
            {(item.retail?.variantGroup || item.name).trim().charAt(0).toUpperCase()}
          </span>
        </span>
      )}
    </span>
  );
}

interface CardProps {
  item: Item;
  priceOf: (i: Item) => number;
  memberPriceOf: (id: string) => number | undefined;
  qtyInCart: (id: string) => number;
  addItem: (i: Item, qty?: number) => void;
  removeItem: (i: Item) => void;
  money: (n: number) => string;
  getText: (es: string, en: string) => string;
  language: 'es' | 'en';
  groupMembers: Map<string, Item[]>;
  memberListName: string | null;
  onOpen: (i: Item) => void;
}

function titleOf(i: Item, language: 'es' | 'en', grouped: boolean): string {
  if (grouped && i.retail?.variantGroup) return i.retail.variantGroup;
  return language === 'en' && i.nameEn ? i.nameEn : i.name;
}

/** Precio grande estilo tienda: $24<sup>99</sup>. */
function BigPrice({ value, money, size = 22 }: { value: number; money: (n: number) => string; size?: number }) {
  const label = money(value);
  const m = label.match(/^(\D*)([\d,]+)([.,](\d{2}))?(.*)$/);
  if (!m) return <span style={{ fontSize: size, fontWeight: 700 }}>{label}</span>;
  return (
    <span style={{ fontSize: size, fontWeight: 700, lineHeight: 1, whiteSpace: 'nowrap' }}>
      <sup style={{ fontSize: size * 0.5, top: '-0.6em' }}>{m[1]}</sup>
      {m[2]}
      {m[4] && <sup style={{ fontSize: size * 0.5, top: '-0.6em' }}>{m[4]}</sup>}
      {m[5]}
    </span>
  );
}

/** Mejor escalón por volumen QUE MEJORA el precio actual del cliente (con una lista mayorista más baja, puede no haber). */
function bestTier(i: Item, current: number) {
  const t = (i.retail?.volumeTiers ?? []).filter((x) => x.price < current);
  return t.length > 0 ? [...t].sort((a, b) => b.minQty - a.minQty)[0] : null;
}

function QtyStepper({ qty, onMinus, onPlus, plusDisabled, label, size = 40 }: { qty: number; onMinus: () => void; onPlus: () => void; plusDisabled?: boolean; label: string; size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${BORDER}`, borderRadius: 9999, overflow: 'hidden', backgroundColor: SURFACE }}>
      <button type="button" onClick={onMinus} aria-label={`− ${label}`} style={{ width: size, height: size, border: 0, backgroundColor: PLACEHOLDER, color: INK, fontSize: 18, cursor: 'pointer' }}>−</button>
      <span aria-live="polite" style={{ minWidth: 40, textAlign: 'center', fontWeight: 700, fontSize: 14, color: INK }}>{qty}</span>
      <button type="button" onClick={onPlus} disabled={plusDisabled} aria-label={`+ ${label}`} style={{ width: size, height: size, border: 0, backgroundColor: PLACEHOLDER, color: INK, fontSize: 18, cursor: plusDisabled ? 'not-allowed' : 'pointer', opacity: plusDisabled ? 0.4 : 1 }}>+</button>
    </div>
  );
}

/** Tarjeta pequeña para filas deslizables del inicio. */
function MiniCard({ item, priceOf, memberPriceOf, money, getText, language, groupMembers, onOpen }: CardProps) {
  const grouped = (groupMembers.get(groupKeyOf(item))?.length ?? 1) > 1;
  const price = priceOf(item);
  const member = memberPriceOf(item.id);
  const off = percentOff(item);
  return (
    <button type="button" onClick={() => onOpen(item)} style={{ background: 'none', border: 0, padding: 0, textAlign: 'left', cursor: 'pointer', color: INK, display: 'flex', flexDirection: 'column', gap: 6, scrollSnapAlign: 'start', minWidth: 0 }}>
      <Thumb item={item} />
      {off > 0 && (
        <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ backgroundColor: DEAL, color: '#ffffff', fontSize: 12, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>−{off}%</span>
          <span style={{ color: DEAL, fontSize: 12, fontWeight: 700 }}>{getText('Oferta', 'Deal')}</span>
        </span>
      )}
      {item.price != null && (
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
          <BigPrice value={price} money={money} size={18} />
          {(member != null && member !== item.price) ? (
            <s style={{ fontSize: 12, color: MUTED }}>{money(item.price)}</s>
          ) : isOnSale(item) ? (
            <s style={{ fontSize: 12, color: MUTED }}>{money(item.compareAtPrice as number)}</s>
          ) : null}
        </span>
      )}
      <span style={{ fontSize: 13, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {item.retail?.brand && <strong>{item.retail.brand} </strong>}
        {titleOf(item, language, grouped)}
      </span>
      {bestTier(item, price) && (
        <span style={{ fontSize: 12, color: SAVE, fontWeight: 700 }}>
          {getText(`${bestTier(item, price)!.minQty}+ u.: ${money(bestTier(item, price)!.price)} c/u`, `${bestTier(item, price)!.minQty}+ units: ${money(bestTier(item, price)!.price)} each`)}
        </span>
      )}
    </button>
  );
}

/** Tarjeta de resultados: foto, título, tamaños, precio (su lista), escalón por volumen y botón de compra. */
function ResultCard(props: CardProps) {
  const { item: lead, priceOf, memberPriceOf, qtyInCart, addItem, removeItem, money, getText, language, groupMembers, memberListName, onOpen } = props;
  const group = groupMembers.get(groupKeyOf(lead)) ?? [lead];
  const grouped = group.length > 1;
  const [variantId, setVariantId] = useState(lead.id);
  const item = group.find((v) => v.id === variantId) ?? lead;
  const price = priceOf(item);
  const member = memberPriceOf(item.id);
  const hasMember = member != null && item.price != null && member !== item.price;
  const left = stockLeft(item);
  const soldOut = left === 0;
  const inCart = qtyInCart(item.id);
  const atMax = addWouldExceed(inCart, item.retail, left);
  const tier = bestTier(item, price);
  const off = percentOff(item);
  return (
    <article style={{ ...card, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <button type="button" onClick={() => onOpen(item)} aria-label={titleOf(item, language, grouped)} style={{ position: 'relative', background: 'none', border: 0, padding: 10, cursor: 'pointer' }}>
        <Thumb item={item} radius={8} />
        <span style={{ position: 'absolute', top: 16, left: 16, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
          {soldOut && <Badge bg="#1f2937" fg="#ffffff">{getText('Agotado', 'Sold out')}</Badge>}
          {!soldOut && off > 0 && <Badge bg={DEAL} fg="#ffffff">−{off}%</Badge>}
        </span>
      </button>
      <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
        <button type="button" onClick={() => onOpen(item)} style={{ background: 'none', border: 0, padding: 0, textAlign: 'left', color: INK, fontSize: 14, lineHeight: 1.35, cursor: 'pointer' }}>
          {item.retail?.brand && <strong>{item.retail.brand} </strong>}
          {titleOf(item, language, grouped)}
        </button>
        {grouped && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {group.map((v) => (
              <button key={v.id} type="button" onClick={() => setVariantId(v.id)} aria-pressed={v.id === item.id} className="st-pill" style={{ ...pill(), minHeight: 28, fontSize: 12, padding: '0 8px' }}>
                {v.retail?.variantLabel || v.name}
              </button>
            ))}
          </div>
        )}
        {item.price != null && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
            <BigPrice value={price} money={money} />
            {hasMember ? (
              <span style={{ fontSize: 12, color: MUTED }}>{getText('Público', 'Public')}: <s>{money(item.price)}</s></span>
            ) : isOnSale(item) ? (
              <s style={{ fontSize: 12, color: MUTED }}>{money(item.compareAtPrice as number)}</s>
            ) : null}
          </div>
        )}
        {hasMember && memberListName && <span style={{ fontSize: 11, fontWeight: 700, color: SAVE, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{memberListName}</span>}
        {tier && (
          <span style={{ fontSize: 12, color: SAVE, fontWeight: 700 }}>
            {getText(`Desde ${tier.minQty} u.: ${money(tier.price)} c/u`, `From ${tier.minQty} units: ${money(tier.price)} each`)}
          </span>
        )}
        {left != null && left > 0 && left <= 5 && <span style={{ fontSize: 12, color: DEAL, fontWeight: 600 }}>{getText(`Quedan ${left}`, `Only ${left} left`)}</span>}
        {qtyRulesLabel(item.retail, getText) && <span style={{ fontSize: 12, color: MUTED }}>{qtyRulesLabel(item.retail, getText)}</span>}
        <div style={{ marginTop: 'auto', paddingTop: 6 }}>
          {item.price == null ? null : soldOut ? (
            <button type="button" disabled style={{ ...pillBtn(PLACEHOLDER, MUTED), width: '100%', cursor: 'not-allowed' }}>{getText('Agotado', 'Sold out')}</button>
          ) : inCart === 0 ? (
            <button type="button" onClick={() => addItem(item)} style={{ ...pillBtn(ACCENT, ON_ACCENT), width: '100%', minHeight: 40, fontSize: 13 }}>
              {getText('Agregar al carrito', 'Add to cart')}
            </button>
          ) : (
            <QtyStepper qty={inCart} onMinus={() => removeItem(item)} onPlus={() => addItem(item)} plusDisabled={atMax} label={item.name} />
          )}
        </div>
      </div>
    </article>
  );
}

function Badge({ children, bg, fg }: { children: React.ReactNode; bg: string; fg: string }) {
  return <span style={{ backgroundColor: bg, color: fg, fontSize: 12, fontWeight: 700, padding: '3px 7px', borderRadius: 4, lineHeight: 1.2 }}>{children}</span>;
}

/** Ficha de producto: galería, datos, caja de compra con precio por volumen y relacionados. */
function ProductView(props: CardProps & {
  business: PublicTemplateProps['business'];
  related: Item[];
  onBrand: (b: string) => void;
  onCategory: (c: string) => void;
  onBuyNow: () => void;
  groundOnly: boolean;
  shipMethodsCount: number;
}) {
  const { item: lead, priceOf, memberPriceOf, qtyInCart, addItem, money, getText, language, groupMembers, memberListName, onOpen, business, related, onBrand, onCategory, onBuyNow, shipMethodsCount } = props;
  const group = groupMembers.get(groupKeyOf(lead)) ?? [lead];
  const grouped = group.length > 1;
  const [variantId, setVariantId] = useState(lead.id);
  const item = group.find((v) => v.id === variantId) ?? lead;
  const rules: RetailAttributes | null = item.retail ?? null;
  const images = (item.images && item.images.length > 0 ? item.images : imageOf(item) ? [imageOf(item) as string] : []);
  const [photo, setPhoto] = useState(0);
  const step = qtyStep(rules);
  const [qty, setQty] = useState(() => addStep(0, rules));
  useEffect(() => {
    setQty(addStep(0, item.retail));
    setPhoto(0);
  }, [item.id, item.retail]);

  const base = priceOf(item);
  const member = memberPriceOf(item.id);
  const hasMember = member != null && item.price != null && member !== item.price;
  const inCart = qtyInCart(item.id);
  const totalQty = inCart + qty;
  const unit = unitPriceFor(base, rules?.volumeTiers, totalQty);
  const next = nextTier(rules?.volumeTiers, totalQty);
  const left = stockLeft(item);
  const soldOut = left === 0;
  const maxQty = Math.min(rules?.maxPerOrder ? rules.maxPerOrder - inCart : 999, left != null ? left - inCart : 999);
  const ruleError = qtyRuleError(item.name, totalQty, rules, getText);
  // Solo los escalones que mejoran su precio (con una lista mayorista más baja, un escalón puede no aplicar).
  const tiers = [...(rules?.volumeTiers ?? [])].sort((a, b) => a.minQty - b.minQty).filter((t) => t.price < base);
  const description = language === 'en' && item.descriptionEn ? item.descriptionEn : item.description;
  const title = grouped && item.retail?.variantGroup ? item.retail.variantGroup : (language === 'en' && item.nameEn ? item.nameEn : item.name);
  const choking = rules?.chokingWarning ? CHOKING_WARNINGS[rules.chokingWarning] : null;
  const clampQty = (n: number) => Math.max(addStep(0, rules), Math.min(Math.max(maxQty, 0), Math.round(n / step) * step || step));
  const add = () => {
    if (soldOut || maxQty <= 0) return;
    addItem(item, Math.min(qty, maxQty));
  };
  const details: [string, string][] = [
    ...(rules?.brand ? [[getText('Marca', 'Brand'), rules.brand] as [string, string]] : []),
    ...(rules?.variantLabel ? [[getText('Tamaño', 'Size'), rules.variantLabel] as [string, string]] : []),
    ...(item.category ? [[getText('Categoría', 'Category'), categoryLabel(item.category, language, business.categoryTranslations)] as [string, string]] : []),
    ...(rules?.weightOz ? [[getText('Peso con empaque', 'Shipping weight'), `${rules.weightOz} oz`] as [string, string]] : []),
    ...(rules?.hazmat ? [[getText('Envío', 'Shipping'), getText('Cantidad limitada de material inflamable: solo terrestre', 'Limited-quantity flammable: ground only')] as [string, string]] : []),
    ...(qtyRulesLabel(rules, getText) ? [[getText('Cantidades', 'Quantities'), qtyRulesLabel(rules, getText)] as [string, string]] : []),
  ];

  return (
    <main style={{ maxWidth: MAX_W, margin: '0 auto', padding: '14px 16px 40px' }}>
      <nav aria-label={getText('Ruta', 'Breadcrumb')} style={{ fontSize: 13, color: MUTED, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        {item.category && <button type="button" onClick={() => onCategory(item.category as string)} style={{ ...linkBtn, padding: 0, fontSize: 13, fontWeight: 600 }}>{categoryLabel(item.category, language, business.categoryTranslations)}</button>}
        {item.category && rules?.brand && <span aria-hidden>›</span>}
        {rules?.brand && <button type="button" onClick={() => onBrand(rules.brand as string)} style={{ ...linkBtn, padding: 0, fontSize: 13, fontWeight: 600 }}>{rules.brand}</button>}
      </nav>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginTop: 14, alignItems: 'flex-start' }}>
        {/* Galería */}
        <div style={{ flex: '1 1 360px', minWidth: 0, display: 'flex', gap: 10 }}>
          {images.length > 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {images.slice(0, 6).map((src, i) => (
                <button key={src + i} type="button" onClick={() => setPhoto(i)} aria-label={getText(`Foto ${i + 1}`, `Photo ${i + 1}`)} aria-pressed={photo === i} className="st-thumb" style={{ width: 60, height: 60, padding: 0, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', backgroundColor: PLACEHOLDER }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {images.length > 0 ? (
              <div style={{ aspectRatio: '1', borderRadius: 12, overflow: 'hidden', backgroundColor: PLACEHOLDER }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[photo] ?? images[0]} alt={title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            ) : (
              <Thumb item={item} radius={12} />
            )}
          </div>
        </div>

        {/* Información */}
        <div style={{ flex: '1 1 340px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rules?.brand && (
            <button type="button" onClick={() => onBrand(rules.brand as string)} style={{ ...linkBtn, padding: 0 }}>
              {getText(`Ver más de ${rules.brand}`, `More from ${rules.brand}`)}
            </button>
          )}
          <h1 style={{ margin: 0, fontSize: 'clamp(22px, 2.4cqi, 28px)', lineHeight: 1.25, fontWeight: 600, color: INK }}>{title}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {item.featured && <Badge bg="var(--st-accent-soft)" fg={ACCENT_TEXT}>{getText('Destacado', 'Featured')}</Badge>}
            {rules?.hazmat && <Badge bg={PLACEHOLDER} fg={INK}>{getText('Solo envío terrestre', 'Ground shipping only')}</Badge>}
          </div>
          {grouped && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 14 }}>{getText('Tamaño', 'Size')}: <strong>{item.retail?.variantLabel || item.name}</strong></span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {group.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariantId(v.id)}
                    aria-pressed={v.id === item.id}
                    className="st-opt"
                    style={{ minWidth: 92, minHeight: 52, padding: '6px 12px', borderRadius: 10, textAlign: 'left', cursor: 'pointer', opacity: stockLeft(v) === 0 ? 0.55 : 1 }}
                  >
                    <strong style={{ display: 'block', fontSize: 14 }}>{v.retail?.variantLabel || v.name}</strong>
                    {v.price != null && <span style={{ display: 'block', fontSize: 12, color: MUTED }}>{money(priceOf(v))}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
          {description && (
            <div
              className="prose-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:underline"
              style={{ fontSize: 14, lineHeight: 1.6, color: INK, marginTop: 4 }}
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(description) }}
            />
          )}
          {details.length > 0 && (
            <table style={{ borderCollapse: 'collapse', fontSize: 14, marginTop: 4 }}>
              <tbody>
                {details.map(([k, v]) => (
                  <tr key={k} style={{ borderTop: `1px solid ${BORDER_SOFT}` }}>
                    <th scope="row" style={{ textAlign: 'left', padding: '8px 16px 8px 0', color: MUTED, fontWeight: 600, width: '40%', verticalAlign: 'top' }}>{k}</th>
                    <td style={{ padding: '8px 0', color: INK }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {choking && (
            <div role="note" style={{ padding: '10px 12px', border: `2px solid ${INK}`, borderRadius: 10, fontSize: 13, lineHeight: 1.45, color: INK }}>
              <strong>⚠ {choking.en}</strong>
              {language === 'es' && <span style={{ display: 'block', marginTop: 4 }}>{choking.es}</span>}
            </div>
          )}
        </div>

        {/* Caja de compra */}
        <aside aria-label={getText('Comprar', 'Buy')} style={{ flex: '0 1 320px', minWidth: 270, ...card, border: `1px solid ${BORDER}`, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {item.price == null ? (
            <p style={pMuted}>{getText('Consulta el precio con la tienda.', 'Ask the store for pricing.')}</p>
          ) : (
            <>
              {hasMember && memberListName && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: SAVE }}>
                  <Icon name="check" size={14} /> {getText(`Tu precio · ${memberListName}`, `Your price · ${memberListName}`)}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <BigPrice value={unit} money={money} size={32} />
                <span style={{ fontSize: 13, color: MUTED }}>{getText('por unidad', 'per unit')}</span>
              </span>
              {(hasMember || isOnSale(item) || unit < base) && (
                <span style={{ fontSize: 13, color: MUTED, marginTop: -6 }}>
                  {hasMember ? getText('Precio público', 'Public price') : getText('Antes', 'Was')}:{' '}
                  <s>{money(hasMember ? (item.price as number) : isOnSale(item) ? (item.compareAtPrice as number) : base)}</s>
                </span>
              )}

              {tiers.length > 0 && (
                <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <legend style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: INK }}>{getText('Precio por cantidad', 'Volume pricing')}</legend>
                  {[{ minQty: addStep(0, rules), price: base, isBase: true }, ...tiers.map((t) => ({ ...t, isBase: false }))].map((t, idx, arr) => {
                    const upTo = arr[idx + 1] ? arr[idx + 1].minQty - 1 : null;
                    const active = totalQty >= t.minQty && (upTo == null || totalQty <= upTo);
                    const save = base > 0 ? Math.round((1 - t.price / base) * 100) : 0;
                    return (
                      <button
                        key={t.minQty + '-' + idx}
                        type="button"
                        onClick={() => setQty(clampQty(Math.max(t.minQty - inCart, addStep(0, rules))))}
                        aria-pressed={active}
                        className="st-tier"
                        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', minHeight: 44, padding: '6px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span style={{ flex: 1 }}>
                          {upTo != null ? getText(`${t.minQty}–${upTo} unidades`, `${t.minQty}–${upTo} units`) : getText(`${t.minQty}+ unidades`, `${t.minQty}+ units`)}
                        </span>
                        <strong>{money(t.price)}</strong>
                        <span style={{ minWidth: 70, textAlign: 'right', fontSize: 12, fontWeight: 700, color: SAVE }}>{!t.isBase && save > 0 ? getText(`Ahorra ${save}%`, `Save ${save}%`) : ''}</span>
                      </button>
                    );
                  })}
                </fieldset>
              )}

              {!soldOut && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{getText('Cantidad', 'Quantity')}</span>
                  <div style={{ alignSelf: 'flex-start' }}>
                    <QtyStepper
                      qty={qty}
                      size={44}
                      label={title}
                      onMinus={() => setQty(clampQty(qty - step))}
                      onPlus={() => setQty(clampQty(qty + step))}
                      plusDisabled={qty + step > maxQty}
                    />
                  </div>
                  <span style={{ fontSize: 12, color: ruleError && qty > 0 ? DEAL : MUTED }}>
                    {inCart > 0 && getText(`Ya tienes ${inCart} en el carrito. `, `You have ${inCart} in your cart. `)}
                    {next && next.price < base
                      ? getText(`Agrega ${next.minQty - totalQty} más para pagar ${money(next.price)} c/u.`, `Add ${next.minQty - totalQty} more to pay ${money(next.price)} each.`)
                      : tiers.length > 0 ? getText('Tienes el mejor precio por unidad.', 'You have the best unit price.') : ''}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, borderTop: `1px solid ${BORDER_SOFT}`, paddingTop: 10 }}>
                <span>{getText(`Subtotal (${qty} ${qty === 1 ? 'unidad' : 'unidades'})`, `Subtotal (${qty} ${qty === 1 ? 'unit' : 'units'})`)}</span>
                <strong>{money(unit * qty)}</strong>
              </div>

              <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                {soldOut ? (
                  <span style={{ color: DEAL, fontWeight: 700 }}>{getText('Agotado', 'Sold out')}</span>
                ) : (
                  <span style={{ color: SAVE, fontWeight: 700 }}>
                    {left != null && left <= 5 ? getText(`Quedan ${left}`, `Only ${left} left`) : getText('Disponible', 'Available')}
                  </span>
                )}
                {shipMethodsCount > 0 && (
                  <span style={{ display: 'block', color: MUTED }}>
                    {rules?.hazmat ? getText('Envío terrestre a domicilio o recoge en tienda.', 'Ground delivery or store pickup.') : getText('Envío a domicilio o recoge en tienda.', 'Delivery or store pickup.')}
                  </span>
                )}
              </div>

              <button type="button" disabled={soldOut || maxQty <= 0} onClick={add} style={{ ...pillBtn(ACCENT, ON_ACCENT), opacity: soldOut || maxQty <= 0 ? 0.5 : 1 }}>
                {getText('Agregar al carrito', 'Add to cart')}
              </button>
              <button type="button" disabled={soldOut || maxQty <= 0} onClick={() => { add(); onBuyNow(); }} style={{ ...pillBtn(BAR, ON_BAR), opacity: soldOut || maxQty <= 0 ? 0.5 : 1 }}>
                {getText('Comprar ahora', 'Buy now')}
              </button>
              <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', fontSize: 12, color: MUTED }}>
                <dt>{getText('Vende y envía', 'Sold & shipped by')}</dt>
                <dd style={{ margin: 0, color: INK }}>{business.name}</dd>
                {memberListName && (
                  <>
                    <dt>{getText('Tu lista', 'Your list')}</dt>
                    <dd style={{ margin: 0, color: INK }}>{memberListName}</dd>
                  </>
                )}
              </dl>
            </>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section style={{ marginTop: 36, borderTop: `1px solid ${BORDER}`, paddingTop: 20 }}>
          <h2 style={{ ...h2, marginBottom: 14 }}>{rules?.brand ? getText(`Más de ${rules.brand}`, `More from ${rules.brand}`) : getText('También te puede interesar', 'You may also like')}</h2>
          <Row>
            {related.map((r) => (
              <MiniCard key={r.id} {...props} item={r} onOpen={onOpen} />
            ))}
          </Row>
        </section>
      )}
    </main>
  );
}

function FaqSection({ faq, getText }: { faq?: PublicTemplateProps['business']['faq']; getText: (es: string, en: string) => string }) {
  if (!faq || faq.length === 0) return null;
  return (
    <section style={{ ...card, padding: '18px 18px 8px' }}>
      <h2 style={{ ...h2, marginBottom: 8 }}>{getText('Preguntas frecuentes', 'FAQ')}</h2>
      {faq.map((entry, i) => (
        <details key={`${i}-${entry.question}`} style={{ borderTop: `1px solid ${BORDER_SOFT}`, padding: '12px 0' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 14, color: INK }}>{entry.question}</summary>
          <div
            className="prose-sm whitespace-pre-line [&_ul]:list-disc [&_ul]:pl-4 [&_a]:underline"
            style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: MUTED }}
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(entry.answer) }}
          />
        </details>
      ))}
    </section>
  );
}

function ContactSection({ business, language }: { business: PublicTemplateProps['business']; language: 'es' | 'en' }) {
  const contacts = resolveContactItems(business, language);
  if (contacts.length === 0) return null;
  return (
    <div style={{ maxWidth: MAX_W, margin: '0 auto', padding: '8px 16px 28px' }} className="grid grid-cols-1 gap-3 @2xl:grid-cols-3">
      {contacts.map((c) => {
        const ContactIcon = CONTACT_ICON_BY_TIPO[c.tipo];
        return (
          <a
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCanalClick(business.slug, c.tipo, c.canalId)}
            style={{ ...card, padding: 14, display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: INK }}
          >
            {ContactIcon && <ContactIcon size={20} />}
            <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</span>
              <span style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.value}</span>
            </span>
          </a>
        );
      })}
    </div>
  );
}

// ── Íconos (trazo, sin emoji) ────────────────────────────────────────────────

const ICONS = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M20 20l-3.5-3.5',
  cart: 'M2 3h4l3 13h11l3-9H7.5 M10 20.5a1.2 1.2 0 1 0 0 .1 M18 20.5a1.2 1.2 0 1 0 0 .1',
  menu: 'M4 7h16 M4 12h16 M4 17h16',
  check: 'M5 12l5 5 9-10',
  repeat: 'M3 12a9 9 0 1 0 3-6.7L3 8 M3 3v5h5',
  x: 'M6 6l12 12 M18 6L6 18',
  filter: 'M4 6h16 M7 12h10 M10 18h4',
  home: 'M3 11l9-7 9 7v9H3z',
  grid: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
  truck: 'M3 6h11v10H3z M14 10h4l3 3v3h-7 M7 18.5a1.5 1.5 0 1 0 0 .1 M17 18.5a1.5 1.5 0 1 0 0 .1',
  store: 'M4 9l1.5-5h13L20 9 M4 9h16v11H4z M9 20v-6h6v6',
  receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2z M9 8h6 M9 12h6',
  lock: 'M6 11h12v10H6z M8.5 11V7.5a3.5 3.5 0 0 1 7 0V11',
} as const;

function Icon({ name, size = 20 }: { name: keyof typeof ICONS; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d={ICONS[name]} />
    </svg>
  );
}
