'use client';
// src/components/public/templates/Retail.tsx
//
// "Grain & Pigment" — a materials/texture-driven template for hardware,
// paint, and craft-goods retailers. The signature element is a literal
// paint-chip swatch strip (Ladrillo/Ocre Mostaza/Salvia/Azul Óxido) reused
// as the category-tab treatment, so the store's own product category (paint
// and finishes) becomes the page's own graphic device instead of a generic
// icon-and-card grid — deliberately distinct from Service's mono rate-card
// index and Barber's ticket-stub cards.
import { useEffect, useState } from 'react';
import { OpenStatusBar } from '@/components/public/OpenStatusBar';
import { getOpenStatus, getScheduleTarget, cartScheduleFrom, todayKeyInTimezone, type OpenStatus } from '@/lib/business-hours';
import { Roboto_Slab } from 'next/font/google';
import type { ProcessStep, PublicTemplateProps } from '@/lib/templates/registry';
import { useCart } from '@/components/public/cart/useCart';
import { WhatsAppCart } from '@/components/public/cart/WhatsAppCart';
import { resolveWhatsAppDigits, resolveContactItems } from '@/lib/public-contact';
import { trackCanalClick } from '@/lib/public-events';
import { AboutSection } from '@/components/public/AboutSection';
import { sanitizeRichText } from '@/lib/sanitize-html';
import { ClampedDescription } from '@/components/public/ClampedDescription';
import { ItemDetailSheet } from '@/components/public/ItemDetailSheet';
import { CONTACT_ICON_BY_TIPO } from '@/components/public/ContactIcons';
import { PublicFooter } from '@/components/public/PublicFooter';
import { PublicCartBar } from '@/components/public/PublicCartBar';
import { PublicBottomNav } from '@/components/public/PublicBottomNav';
import { PublicHoursSection } from '@/components/public/PublicHoursSection';
import { CatalogSearchInput } from '@/components/public/CatalogSearchInput';
import { matchesCatalogQuery } from '@/lib/catalog-search';
import { PublicGalleryLightbox } from '@/components/public/PublicGalleryLightbox';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import SimpleLanguageToggle from '@/components/ui/SimpleLanguageToggle';
import { formatPrice } from '@/lib/currency';
import { categoryLabel } from '@/lib/category-label';
import PublicThemeToggle from '@/components/public/PublicThemeToggle';
import { deriveBrandPalette, deriveDarkBrandPalette, themeVarsCss } from '@/lib/brand-palette';

// Scoped to this template only — a slab serif reads as "catalog/hardware
// store signage", distinct from Service's editorial Fraunces and Barber's
// condensed Oswald.
const robotoSlab = Roboto_Slab({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-retail-display' });

const ALL_TAB = '__all__';

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'name';

/** Oferta = hay precio "antes" y es mayor que el actual (el dueño puede dejar un valor viejo sin sentido). */
function isOnSale(item: { price?: number | null; compareAtPrice?: number | null }): boolean {
  return item.price != null && item.compareAtPrice != null && item.compareAtPrice > item.price;
}

/** Con control de stock activo: unidades disponibles (>= 0); null = sin control. */
function stockLeft(item: { trackStock?: boolean | null; stock?: number | null }): number | null {
  return item.trackStock ? Math.max(0, item.stock ?? 0) : null;
}

/** Orden "Relevancia": destacados primero, luego populares, luego el orden del dueño (sort estable). */
function featuredRank(item: { featured?: boolean; popular?: boolean }): number {
  return (item.featured ? 2 : 0) + (item.popular ? 1 : 0);
}

function percentOff(item: { price?: number | null; compareAtPrice?: number | null }): number {
  if (!isOnSale(item)) return 0;
  return Math.round((1 - (item.price as number) / (item.compareAtPrice as number)) * 100);
}

// Neutrals are CSS variables (scope `.rl-scope`) with the light hex as fallback; the dark values
// live under html[data-theme="dark"] via themeVarsCss, so the theme resolves in CSS (no flash).
const PIEDRA = 'var(--rl-bg, #E6E2D8)';
const INK = 'var(--rl-ink, #2B2820)';
const MUTED = 'var(--rl-muted, #7A7468)';
const SURFACE = 'var(--rl-surface, #ffffff)';
const BORDER = 'var(--rl-border, #d9d4c8)';
const SOFT = 'var(--rl-soft, #f0ede4)';
const IMG_BG = 'var(--rl-img-bg, #f1efe9)';
// INK as a BACKGROUND under white text (active "Todos" chip): ink turns near-white in dark mode.
const INK_SURFACE = 'var(--rl-ink-surface, #2B2820)';

const LIGHT_VARS: Record<string, string> = {
  'rl-bg': '#E6E2D8',
  'rl-ink': '#2B2820',
  'rl-muted': '#7A7468',
  'rl-surface': '#ffffff',
  'rl-border': '#d9d4c8',
  'rl-soft': '#f0ede4',
  'rl-img-bg': '#f1efe9',
  'rl-ink-surface': '#2B2820',
};
const DARK_VARS: Record<string, string> = {
  'rl-bg': '#16140F',
  'rl-ink': '#EFEBE1',
  'rl-muted': '#A39C8E',
  'rl-surface': '#1F1C16',
  'rl-border': '#34302A',
  'rl-soft': '#2A2620',
  'rl-img-bg': '#26231C',
  'rl-ink-surface': '#3B362D',
};

const SWATCHES = [
  { name: 'Ladrillo', hex: '#A6452B' },
  { name: 'Ocre Mostaza', hex: '#C98A2B' },
  { name: 'Salvia', hex: '#7A8B6F' },
  { name: 'Azul Óxido', hex: '#46647A' },
];

export function RetailTemplate({
  business,
  items,
  categories: categoriesProp,
  capabilities,
}: PublicTemplateProps) {
  const accent = business.primary_color ?? SWATCHES[0].hex;
  // Brand color adjusted for contrast in both themes (buttons, "Ver más" links). The hero banner keeps
  // the raw brand color (white text).
  const lightBrand = deriveBrandPalette(accent, business.secondary_color, business.accent_color);
  const darkBrand = deriveDarkBrandPalette(accent, business.secondary_color, business.accent_color);
  const themeCss = themeVarsCss(
    'rl-scope',
    // Fondos de botón = marca tal cual; texto en color de marca y texto sobre el botón se ajustan por
    // contraste (un primario amarillo/claro dejaba "Ver más" ilegible y el "+ Agregar" blanco sobre amarillo).
    { ...LIGHT_VARS, 'rl-accent': accent, 'rl-accent-text': lightBrand.accentText, 'rl-on-accent': lightBrand.onAccent },
    { ...DARK_VARS, 'rl-accent': darkBrand.accent, 'rl-accent-text': darkBrand.accentText, 'rl-on-accent': darkBrand.onAccent },
  );
  // Sin portada, el hero es el color de marca liso: con un primario claro (amarillo) el texto blanco no se
  // lee, así que usa el color de texto que elige la paleta por contraste. Con portada hay degradado oscuro.
  const heroDark = !business.cover_image_url && lightBrand.onAccent !== '#ffffff';
  const heroFg = heroDark ? lightBrand.onAccent : '#ffffff';
  const heroSoft = heroDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)';
  const heroLine = heroDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.3)';
  const heroMuted = heroDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.75)';
  const accentFill = `var(--rl-accent, ${accent})`;
  const accentText = `var(--rl-accent-text, ${accent})`;
  const onAccent = 'var(--rl-on-accent, #ffffff)';
  const waRaw = resolveWhatsAppDigits(business);
  // Resolved canal (with canalId) for click tracking — waRaw above is digits-only, used for
  // the href; the canalId is what lets maalca-api attribute this click to a specific canal row
  // instead of excluding it from the byCanal breakdown (Program.cs:854).
  const whatsappEntry = resolveContactItems(business).find((c) => c.tipo === 'WhatsApp');
  const { cart, addToCart, removeFromCart, cartTotal, cartCount } = useCart();
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  // Abierto/cerrado depende del reloj: solo en cliente (la página es ISR) y se refresca cada minuto.
  // Cerrado => el pedido se programa para la próxima apertura; el API lo exige igual (ResolveSchedule)
  // y sin esto un pedido fuera de horario era rechazado.
  const [openStatus, setOpenStatus] = useState<OpenStatus | null>(null);
  const [todayKey, setTodayKey] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
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

  const categoryNames: string[] =
    categoriesProp.length > 0
      ? [...categoriesProp].sort((a, b) => a.sort_order - b.sort_order).map((c) => c.name)
      : Array.from(new Set(items.map((i) => i.category).filter((c): c is string => !!c)));

  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('default');
  const [onlyOffers, setOnlyOffers] = useState(false);
  const searchActive = query.trim().length > 0;
  const hasOffers = items.some(isOnSale);

  function itemsFor(tab: string): typeof items {
    if (tab === ALL_TAB) return items;
    const catId = categoriesProp.find((c) => c.name === tab)?.id;
    return items.filter(
      (i) => (catId !== undefined && i.category_id === catId) || i.category === tab,
    );
  }

  // Con búsqueda activa se filtra sobre la pestaña vigente; al escribir se vuelve a "Todos" para no
  // buscar solo dentro de una categoría sin que se note.
  const filteredItems = itemsFor(activeTab)
    .filter((i) => matchesCatalogQuery(query, [i.name, i.nameEn, i.category]))
    .filter((i) => !onlyOffers || isOnSale(i));
  // Orden estable: el "default" respeta el orden que definió el dueño (SortOrder del API).
  const visibleItems =
    sort === 'default'
      ? [...filteredItems].sort((a, b) => featuredRank(b) - featuredRank(a))
      : [...filteredItems].sort((a, b) =>
          sort === 'name'
            ? a.name.localeCompare(b.name, language)
            : sort === 'price-asc'
              ? (a.price ?? 0) - (b.price ?? 0)
              : (b.price ?? 0) - (a.price ?? 0),
        );

  return (
    <div id="top" className={`${robotoSlab.variable} rl-scope`} style={{ minHeight: '100vh', backgroundColor: PIEDRA, containerType: 'inline-size' } as React.CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      <OpenStatusBar status={openStatus} language={language} sticky />
      {/* ── HERO ── */}
      <section
        style={{
          position: 'relative',
          height: '320px',
          backgroundColor: accent,
          overflow: 'hidden',
        }}
      >
        {business.cover_image_url && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={business.cover_image_url}
              alt=""
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
                filter: 'saturate(0.85) contrast(1.05)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: `linear-gradient(180deg, rgba(43,40,32,0.25), rgba(43,40,32,0.7))`,
              }}
            />
          </>
        )}

        {/* language toggle — top-right corner, clear of the bottom-anchored
            content below and never covered by it at any viewport */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 2, display: 'flex', gap: '8px' }}>
          <SimpleLanguageToggle variant={heroDark ? 'light' : 'dark'} spanishFlag={business.spanishFlag} />
          <PublicThemeToggle variant={heroDark ? 'light' : 'dark'} />
        </div>

        <div
          className="mx-auto max-w-public-content"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            padding: '0 32px 32px',
            color: heroFg,
          }}
        >
          {business.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logo_url}
              alt={business.name}
              style={{
                display: 'block',
                width: '78px',
                height: '78px',
                borderRadius: '11px',
                objectFit: 'cover',
                border: `2px solid ${heroLine}`,
                marginBottom: '14px',
              }}
            />
          ) : (
            <div
              style={{
                width: '78px',
                height: '78px',
                borderRadius: '11px',
                backgroundColor: heroSoft,
                border: `2px solid ${heroLine}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: heroFg,
                marginBottom: '14px',
              }}
            >
              <NoImageIcon size={30} />
            </div>
          )}

          <h1
            className={robotoSlab.className}
            style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: heroFg, lineHeight: 1.1 }}
          >
            {business.name}
          </h1>

          {business.address && (
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: heroMuted }}>
              📍 {business.address}
            </p>
          )}

          {waRaw && (
            <a
              href={`https://wa.me/${waRaw}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCanalClick(business.slug, 'WhatsApp', whatsappEntry?.canalId)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '16px',
                backgroundColor: heroSoft,
                backdropFilter: 'blur(4px)',
                color: heroFg,
                padding: '9px 18px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              💬 WhatsApp
            </a>
          )}
        </div>
      </section>

      {/* ── SWATCH STRIP — the signature element: a literal paint-chip fan,
          reused below as the category-tab treatment ── */}
      <div style={{ display: 'flex', height: '10px' }}>
        {SWATCHES.map((s) => (
          <div key={s.hex} style={{ flex: 1, backgroundColor: s.hex }} title={s.name} />
        ))}
      </div>

      <AboutSection description={business.description} descriptionEn={business.descriptionEn} maxWidthClassName="max-w-public-content" language={language} />

      {/* ── PASOS ── */}
      <ProcessSection steps={business.processSteps} visible={business.sectionVisibility?.processSteps !== false} accent={accent} getText={getText} />

      {/* ── GALERÍA ── */}
      <GallerySection images={business.galleryImages} visible={business.sectionVisibility?.gallery !== false} accent={accent} getText={getText} />

      {/* ── SEARCH — independiente de las pestañas; ancla #catalog de la barra inferior ── */}
      <div id="catalog" style={{ scrollMarginTop: '56px' }} />
      {items.length > 0 && (
        <CatalogSearchInput
          value={query}
          onChange={(next) => {
            setQuery(next);
            if (next.trim()) setActiveTab(ALL_TAB);
          }}
          onClear={() => setQuery('')}
          placeholder={getText('Buscar en el catálogo...', 'Search the catalog...')}
          clearLabel={getText('Borrar búsqueda', 'Clear search')}
          surface={SURFACE}
          border={BORDER}
          muted={MUTED}
          ink={INK}
        />
      )}

      {/* ── CATEGORY TABS — rendered as paint chips, cycling the swatch palette ── */}
      {categoryNames.length > 0 && (
        <div className="mx-auto max-w-public-content" style={{ padding: '20px 24px 0' }}>
          <div
            className="[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overflow-x-auto md:overflow-x-visible md:flex-wrap"
            style={{ display: 'flex', gap: '10px' }}
          >
            <ChipTab
              label={getText('Todos', 'All')}
              active={activeTab === ALL_TAB}
              color={INK_SURFACE}
              onClick={() => setActiveTab(ALL_TAB)}
            />
            {categoryNames.map((name, i) => (
              <ChipTab
                key={name}
                label={categoryLabel(name, language, business.categoryTranslations)}
                active={activeTab === name}
                color={SWATCHES[i % SWATCHES.length].hex}
                onClick={() => setActiveTab(name)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── ORDENAR / OFERTAS ── */}
      {items.length > 1 && (
        <div className="mx-auto max-w-public-content" style={{ padding: '14px 24px 0', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {hasOffers && (
            <button
              type="button"
              onClick={() => setOnlyOffers((v) => !v)}
              aria-pressed={onlyOffers}
              className="min-h-11 rounded-full px-4 text-xs font-semibold"
              style={{
                backgroundColor: onlyOffers ? accentFill : SURFACE,
                color: onlyOffers ? onAccent : INK,
                border: `1px solid ${onlyOffers ? accentFill : BORDER}`,
              }}
            >
              🏷 {getText('Ofertas', 'Deals')}
            </button>
          )}
          <label className="ml-auto flex items-center gap-2 text-xs" style={{ color: MUTED }}>
            {getText('Ordenar', 'Sort')}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="min-h-11 rounded-full px-3 text-xs font-semibold"
              style={{ backgroundColor: SURFACE, color: INK, border: `1px solid ${BORDER}` }}
            >
              <option value="default">{getText('Relevancia', 'Recommended')}</option>
              <option value="price-asc">{getText('Precio: menor a mayor', 'Price: low to high')}</option>
              <option value="price-desc">{getText('Precio: mayor a menor', 'Price: high to low')}</option>
              <option value="name">{getText('Nombre A–Z', 'Name A–Z')}</option>
            </select>
          </label>
        </div>
      )}

      {/* ── CONTENT ── */}
      <main className="mx-auto max-w-public-content" style={{ padding: '20px 24px 40px' }}>
        {items.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 0',
              textAlign: 'center',
            }}
          >
            <span style={{ color: MUTED }}>
              <NoImageIcon size={40} />
            </span>
            <p style={{ marginTop: '16px', fontSize: '14px', color: MUTED }}>
              {getText('Productos disponibles pronto.', 'Products available soon.')}
            </p>
          </div>
        ) : visibleItems.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: MUTED }}>
              {searchActive
                ? getText('No hay productos que coincidan con tu búsqueda.', 'No products match your search.')
                : getText('No hay productos en esta categoría.', 'No products in this category.')}
            </p>
            {searchActive && (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{ marginTop: '10px', background: 'none', border: 'none', color: accentText, fontSize: '13px', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              >
                {getText('Borrar búsqueda', 'Clear search')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {visibleItems.map((item, i) => (
              <ProductCard
                key={item.id}
                item={item}
                chipColor={SWATCHES[i % SWATCHES.length].hex}
                cartQty={cart.find((e) => e.item.id === item.id)?.qty ?? 0}
                accent={accentFill}
                accentText={accentText}
                onAccent={onAccent}
                language={language}
                getText={getText}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
                currency={business.currency}
                categoryTranslations={business.categoryTranslations}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── FAQ ── */}
      <FaqSection faq={business.faq} getText={getText} />

      {/* ── HORARIO + CONTACTO — destino del botón "Info" de la barra inferior ── */}
      <div id="info" style={{ scrollMarginTop: '48px' }}>
        <PublicHoursSection
          horario={business.horario}
          todayKey={todayKey}
          language={language}
          getText={getText}
          headingClassName={robotoSlab.className}
          headingColor={accentText}
          ink={INK}
          muted={MUTED}
          surface={SURFACE}
          border={BORDER}
          rowBorder={BORDER}
        />
        <ContactSection business={business} language={language} />
      </div>

      <PublicFooter business={business} capabilities={capabilities} language={language} />

      {/* Carrito siempre disponible: sin WhatsApp el cliente igual puede pedir y pagar al recoger (o con
          tarjeta si hay Stripe); el carrito oculta las opciones que el negocio no tiene. */}
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
        ordersPaused={business.ordersEnabled === false}
        pickupOrders
        schedule={cartSchedule}
        getText={getText}
        isOpen={cartOpen}
        onOpenChange={setCartOpen}
        hideFab
        bottomInset={64}
      />

      {/* Barra de pedido + navegación inferior (móvil): reemplazan al botón flotante genérico. */}
      <PublicCartBar
        count={cartCount}
        total={cartTotal}
        currency={business.currency}
        accent={accentFill}
        onAccent={onAccent}
        inkSurface={INK_SURFACE}
        hidden={cartOpen}
        onOpen={() => setCartOpen(true)}
        getText={getText}
      />
      <PublicBottomNav
        cartCount={cartCount}
        accent={accentFill}
        onAccent={onAccent}
        surface={SURFACE}
        border={BORDER}
        muted={MUTED}
        ink={INK}
        onOpenCart={() => setCartOpen(true)}
        getText={getText}
        catalogLabel={{ es: 'Catálogo', en: 'Catalog' }}
        cartLabel={{ es: 'Carrito', en: 'Cart' }}
        catalogAnchorId="catalog"
      />
      <div className="@public-sm:hidden" aria-hidden style={{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))' }} />
    </div>
  );
}

// ── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function ProcessSection({
  steps,
  visible,
  accent,
  getText,
}: {
  steps?: ProcessStep[] | null;
  visible: boolean;
  accent: string;
  getText: (es: string, en: string) => string;
}) {
  if (!visible || !steps || steps.length === 0) return null;

  return (
    <div className="mx-auto max-w-public-content" style={{ padding: '20px 24px 0' }}>
      <h2 className={robotoSlab.className} style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 700, color: INK }}>
        {getText('Cómo trabajamos', 'How we work')}
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div
            key={`${i}-${step.title}`}
            style={{
              backgroundColor: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: '10px',
              padding: '14px',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '26px',
                height: '26px',
                borderRadius: '2px',
                backgroundColor: SWATCHES[i % SWATCHES.length].hex,
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {i + 1}
            </span>
            <p className={robotoSlab.className} style={{ margin: '10px 0 0', fontSize: '13px', fontWeight: 700, color: INK }}>
              {step.title}
            </p>
            {step.description && (
              <div
                className="prose-sm whitespace-pre-line [&_h2]:text-[13px] [&_h2]:font-semibold [&_h3]:text-[12px] [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_a]:underline"
                style={{ margin: '6px 0 0', fontSize: '12px', lineHeight: 1.5, color: MUTED }}
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(step.description) }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function GallerySection({
  images,
  visible,
  accent,
  getText,
}: {
  images?: string[] | null;
  visible: boolean;
  accent: string;
  getText: (es: string, en: string) => string;
}) {
  if (!visible || !images || images.length === 0) return null;

  return (
    <div className="mx-auto max-w-public-content" style={{ padding: '20px 24px 0' }}>
      <h2 className={robotoSlab.className} style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 700, color: INK }}>
        {getText('Galería', 'Gallery')}
      </h2>
      <PublicGalleryLightbox images={images} accent={accent} getText={getText} />
    </div>
  );
}

// Same outline used for the "no image" state in the dashboard's catalog
// ItemRow (CatalogView.tsx) — reused here instead of the 🖌️ emoji placeholder.
function NoImageIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function ProductCard({
  item,
  chipColor,
  cartQty,
  accent,
  accentText,
  onAccent,
  language,
  getText,
  addToCart,
  removeFromCart,
  currency,
  categoryTranslations,
}: {
  item: PublicTemplateProps['items'][number];
  chipColor: string;
  cartQty: number;
  accent: string;
  accentText: string;
  onAccent: string;
  language: 'es' | 'en';
  getText: (es: string, en: string) => string;
  addToCart: (item: { id: string; name: string; price: number; image?: string }) => void;
  removeFromCart: (itemId: string) => void;
  currency?: 'USD' | 'DOP';
  categoryTranslations?: PublicTemplateProps['business']['categoryTranslations'];
}) {
  const imageUrl = item.imageUrl ?? item.image_url;
  const description = language === 'en' && item.descriptionEn ? item.descriptionEn : item.description;
  const displayName = language === 'en' && item.nameEn ? item.nameEn : item.name;
  const onSale = isOnSale(item);
  const off = percentOff(item);
  const left = stockLeft(item);
  const soldOut = left === 0;
  const atMax = left !== null && cartQty >= left;
  const lowStock = left !== null && left > 0 && left <= 5;
  const [detailOpen, setDetailOpen] = useState(false);
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const hasDetail = Boolean(imageUrl || description);
  const addThis = () => addToCart({ id: item.id, name: displayName, price: item.price ?? 0, image: imageUrl ?? undefined });

  return (
    <>
    <div
      role={hasDetail ? 'button' : undefined}
      tabIndex={hasDetail ? 0 : undefined}
      onClick={hasDetail ? () => setDetailOpen(true) : undefined}
      onKeyDown={hasDetail ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDetailOpen(true); } } : undefined}
      style={{
        cursor: hasDetail ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      {/* swatch tab — every card carries a corner of the strip above */}
      <div style={{ height: '5px', backgroundColor: chipColor, flexShrink: 0 }} />

      {imageUrl && (
        <div className="aspect-square" style={{ backgroundColor: IMG_BG, flexShrink: 0, position: 'relative' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={displayName} className="h-full w-full object-cover" />
          {soldOut && (
            <span
              style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#1f2937', color: '#ffffff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 9999 }}
            >
              {getText('Agotado', 'Sold out')}
            </span>
          )}
          {(item.featured || item.popular) && (
            <span
              style={{ position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(255,255,255,0.92)', color: '#2B2820', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 9999 }}
            >
              {item.featured ? `⭐ ${getText('Destacado', 'Featured')}` : `🔥 ${getText('Popular', 'Popular')}`}
            </span>
          )}
          {onSale && off > 0 && (
            <span
              style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#b91c1c', color: '#ffffff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 9999 }}
            >
              −{off}%
            </span>
          )}
        </div>
      )}

      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p
          className={robotoSlab.className}
          style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: INK, lineHeight: 1.3 }}
        >
          {displayName}
        </p>
        {description && (
          <div onClick={stop}>
            <ClampedDescription
              text={description}
              language={language}
              textStyle={{ margin: '4px 0 0', fontSize: '11px', color: MUTED, lineHeight: 1.4 }}
              buttonColor={accentText}
              buttonStyle={{ fontSize: '11px' }}
            />
          </div>
        )}
        {item.price != null && (
          <p style={{ margin: '6px 0 0', fontSize: '14px', fontWeight: 700, color: onSale ? '#b91c1c' : INK }}>
            {formatPrice(item.price, currency)}
            {onSale && (
              <s style={{ marginLeft: 6, fontSize: 12, fontWeight: 500, color: MUTED }}>
                {formatPrice(item.compareAtPrice as number, currency)}
              </s>
            )}
          </p>
        )}

        <div onClick={stop} style={{ marginTop: 'auto' }}>
        {lowStock && (
          <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, color: '#b45309' }}>
            {getText(`Quedan ${left}`, `${left} left`)}
          </p>
        )}
        {soldOut ? (
          <p className="min-h-11 flex items-center justify-center text-xs font-semibold" style={{ color: MUTED }}>
            {getText('Agotado', 'Sold out')}
          </p>
        ) : cartQty === 0 ? (
          <button
            onClick={addThis}
            aria-label={`${getText('Agregar', 'Add')} ${displayName}`}
            className="block min-h-11 w-full rounded-full py-2.5 text-center text-xs font-semibold transition hover:opacity-90"
            style={{ backgroundColor: accent, color: onAccent }}
          >
            + {getText('Agregar', 'Add')}
          </button>
        ) : (
          <div className="flex items-center justify-between gap-1">
            <button
              onClick={() => removeFromCart(item.id)}
              aria-label={`${getText('Quitar', 'Remove')} ${displayName}`}
              className="flex h-11 w-11 items-center justify-center rounded-md text-sm font-bold"
              style={{ backgroundColor: SOFT, color: INK }}
            >
              −
            </button>
            <span className="text-sm font-bold" style={{ color: INK }}>
              {cartQty}
            </span>
            <button
              onClick={() => addToCart({
                id: item.id,
                name: displayName,
                price: item.price ?? 0,
                image: imageUrl ?? undefined,
              })}
              disabled={atMax}
              aria-label={`${getText('Agregar', 'Add')} ${displayName}`}
              className="flex h-11 w-11 items-center justify-center rounded-md text-sm font-bold disabled:opacity-40"
              style={{ backgroundColor: accent, color: onAccent }}
            >
              +
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
    <ItemDetailSheet
      open={detailOpen}
      onClose={() => setDetailOpen(false)}
      name={displayName}
      description={description}
      priceLabel={item.price != null ? formatPrice(item.price, currency) : null}
      imageUrl={imageUrl}
      images={item.images}
      tags={[
        ...(item.featured ? [`⭐ ${getText('Destacado', 'Featured')}`] : []),
        ...(item.popular ? [`🔥 ${getText('Popular', 'Popular')}`] : []),
      ]}
      compareAtLabel={onSale ? formatPrice(item.compareAtPrice as number, currency) : null}
      category={categoryLabel(item.category, language, categoryTranslations)}
      qty={cartQty}
      onAdd={atMax ? () => {} : addThis}
      unavailableLabel={soldOut ? getText('Agotado', 'Sold out') : null}
      onRemove={() => removeFromCart(item.id)}
      accent={accent}
      onAccent={onAccent}
      textColor={INK}
      mutedColor={MUTED}
      surfaceColor={SURFACE}
      language={language}
    />
    </>
  );
}

function ChipTab({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px 8px 10px',
        borderRadius: '8px 8px 2px 2px',
        border: 'none',
        backgroundColor: active ? color : SURFACE,
        color: active ? '#ffffff' : INK,
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        boxShadow: active ? 'none' : `inset 0 0 0 1px ${BORDER}`,
      }}
    >
      <span
        style={{
          width: '9px',
          height: '9px',
          borderRadius: '2px',
          backgroundColor: active ? 'rgba(255,255,255,0.8)' : color,
          flexShrink: 0,
        }}
      />
      {label}
    </button>
  );
}

function FaqSection({
  faq,
  getText,
}: {
  faq?: PublicTemplateProps['business']['faq'];
  getText: (es: string, en: string) => string;
}) {
  if (!faq || faq.length === 0) return null;

  return (
    <section className="mx-auto max-w-public-content" style={{ padding: '0 24px 28px' }}>
      <h2 className={robotoSlab.className} style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 700, color: INK }}>
        {getText('Preguntas frecuentes', 'FAQ')}
      </h2>
      <div style={{ borderTop: `1px solid ${BORDER}` }}>
        {faq.map((entry, i) => (
          <details key={`${i}-${entry.question}`} style={{ borderBottom: `1px solid ${BORDER}`, padding: '14px 0' }}>
            <summary style={{ cursor: 'pointer', listStyle: 'none', fontWeight: 600, color: INK, fontSize: '14px' }}>
              {entry.question}
            </summary>
            <div
              className="prose-sm whitespace-pre-line [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:text-[13px] [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_a]:underline"
              style={{ margin: '8px 0 0', fontSize: '13px', lineHeight: 1.6, color: MUTED }}
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(entry.answer) }}
            />
          </details>
        ))}
      </div>
    </section>
  );
}

function ContactSection({
  business,
  language,
}: {
  business: PublicTemplateProps['business'];
  language: 'es' | 'en';
}) {
  const contacts = resolveContactItems(business, language);

  if (contacts.length === 0) return null;

  return (
    <section style={{ borderTop: `1px solid ${BORDER}` }}>
      <div className="mx-auto max-w-public-content" style={{ padding: '28px 24px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {contacts.map((c) => {
            const Icon = CONTACT_ICON_BY_TIPO[c.tipo];
            return (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCanalClick(business.slug, c.tipo, c.canalId)}
              style={{
                backgroundColor: SURFACE,
                border: `1px solid ${BORDER}`,
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                textDecoration: 'none',
              }}
            >
              {Icon && <span style={{ color: INK }}><Icon size={20} /></span>}
              <span
                style={{
                  fontSize: '11px',
                  color: MUTED,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {c.label}
              </span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: INK,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {c.value}
              </span>
            </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
