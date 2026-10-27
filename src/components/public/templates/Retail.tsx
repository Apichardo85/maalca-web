'use client';
// src/components/public/templates/Retail.tsx
//
// "Boutique" — plantilla de tienda dirigida por la MARCA del negocio: toda la paleta (fondo, superficies,
// bordes, texto) se deriva del color primario (y secundario si es cromático) con deriveBrandPalette /
// deriveDarkBrandPalette, así una tienda de jabones rosa, una ferretería roja o una joyería verde se ven
// cada una como suyas. Foto primero: grilla de fotos 4:5 con el "+" de pedido sobre la imagen, hero
// centrado y calmado, chips en píldora y un serif editorial solo para títulos y nombre.
import { useEffect, useState } from 'react';
import { OpenStatusBar } from '@/components/public/OpenStatusBar';
import { getOpenStatus, getScheduleTarget, cartScheduleFrom, todayKeyInTimezone, type OpenStatus } from '@/lib/business-hours';
import { Playfair_Display } from 'next/font/google';
import type { ProcessStep, PublicTemplateProps } from '@/lib/templates/registry';
import { useCart } from '@/components/public/cart/useCart';
import { WhatsAppCart } from '@/components/public/cart/WhatsAppCart';
import { resolveWhatsAppDigits, resolveContactItems } from '@/lib/public-contact';
import { trackCanalClick } from '@/lib/public-events';
import { AboutSection } from '@/components/public/AboutSection';
import { sanitizeRichText } from '@/lib/sanitize-html';
import { ClampedDescription } from '@/components/public/ClampedDescription';
import { ItemDetailSheet } from '@/components/public/ItemDetailSheet';
import { CardOpenButton } from '@/components/public/CardOpenButton';
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
import { brandPaletteCss, deriveBrandPalette, deriveDarkBrandPalette } from '@/lib/brand-palette';
import { useDeepLinkedItemId } from '@/lib/use-deep-linked-item';

// Serif editorial solo para títulos (hero, secciones, nombre del producto en el detalle). El resto va en la
// sans del sitio para que precios y descripciones se lean limpios en móvil.
const display = Playfair_Display({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-retail-display' });

const ALL_TAB = '__all__';
const DEFAULT_BRAND = '#A6452B';

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

// Todo son variables CSS (scope `.rl-scope`) definidas por brandPaletteCss: claro por defecto y oscuro bajo
// html[data-theme="dark"], así el tema se resuelve en CSS (sin parpadeo). Los hex son solo respaldo.
const BG = 'var(--rl-bg, #f7f3f0)';
const INK = 'var(--rl-ink, #2B2820)';
const MUTED = 'var(--rl-muted, #6b655c)';
const SURFACE = 'var(--rl-surface, #ffffff)';
const BORDER = 'var(--rl-border, #e5dfd6)';
const BORDER_SOFT = 'var(--rl-border-soft, #efeae2)';
const PLACEHOLDER = 'var(--rl-placeholder, #f1ece4)';
const ACCENT_SOFT = 'var(--rl-accent-soft, rgba(166,69,43,0.1))';
// INK como FONDO bajo texto blanco (barra del carrito): la tinta se vuelve casi blanca en oscuro.
const INK_SURFACE = 'var(--rl-ink-surface, #2B2820)';

export function RetailTemplate({
  business,
  items,
  categories: categoriesProp,
  capabilities,
}: PublicTemplateProps) {
  const accent = business.primary_color ?? DEFAULT_BRAND;
  // Paleta completa por tema: neutros con el matiz de la marca + acento ajustado por contraste (botones,
  // texto en color de marca y texto sobre el botón). El hero usa el color de marca tal cual.
  const lightBrand = deriveBrandPalette(accent, business.secondary_color, business.accent_color);
  const darkBrand = deriveDarkBrandPalette(accent, business.secondary_color, business.accent_color);
  const themeCss = brandPaletteCss('rl-scope', 'rl', lightBrand, darkBrand);
  // Sin portada, el hero es el color de marca: con un primario claro (amarillo) el texto blanco no se lee,
  // así que usa el color de texto que elige la paleta por contraste. Con portada hay degradado oscuro.
  const heroDark = !business.cover_image_url && lightBrand.onAccent !== '#ffffff';
  const heroFg = heroDark ? lightBrand.onAccent : '#ffffff';
  const heroSoft = heroDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.18)';
  const heroLine = heroDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)';
  const heroMuted = heroDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.82)';
  const heroBg = heroDark
    ? 'linear-gradient(160deg, var(--rl-brand), color-mix(in srgb, var(--rl-brand) 78%, #ffffff))'
    : 'linear-gradient(160deg, var(--rl-brand), color-mix(in srgb, var(--rl-brand) 70%, #000000))';
  const accentFill = `var(--rl-accent, ${accent})`;
  const accentText = `var(--rl-accent-text, ${accent})`;
  const onAccent = 'var(--rl-on-accent, #ffffff)';
  // waRaw alimenta el carrito por WhatsApp (WhatsAppCart, abajo). WhatsApp como CONTACTO ya no
  // va destacado en el hero: vive en la fila de canales (ContactSection) como un canal más.
  const waRaw = resolveWhatsAppDigits(business);
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
  // Enlace compartido (/{slug}/p/{id}): abre el detalle de ese producto al cargar.
  const deepLinkedId = useDeepLinkedItemId();
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
    <div id="top" className={`${display.variable} rl-scope`} style={{ minHeight: '100vh', backgroundColor: BG, containerType: 'inline-size' } as React.CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      <OpenStatusBar status={openStatus} language={language} sticky />
      {/* ── HERO — centrado y calmado: marca, nombre y dos acciones ── */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: heroBg,
          borderRadius: '0 0 32px 32px',
          color: heroFg,
        }}
      >
        {business.cover_image_url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={business.cover_image_url}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'var(--rl-hero-overlay)' }} />
          </>
        ) : (
          <>
            {/* Dos halos suaves: dan profundidad sin imagen y sin un motivo ajeno a la marca. */}
            <div aria-hidden style={{ position: 'absolute', top: '-90px', right: '-70px', width: '280px', height: '280px', borderRadius: '50%', background: `radial-gradient(circle, ${heroDark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.18)'}, transparent 70%)` }} />
            <div aria-hidden style={{ position: 'absolute', bottom: '-110px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: `radial-gradient(circle, ${heroDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.16)'}, transparent 70%)` }} />
          </>
        )}

        {/* language/theme toggles — esquina superior derecha, fuera del contenido centrado */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 2, display: 'flex', gap: '8px' }}>
          <SimpleLanguageToggle variant={heroDark ? 'light' : 'dark'} spanishFlag={business.spanishFlag} />
          <PublicThemeToggle variant={heroDark ? 'light' : 'dark'} />
        </div>

        <div
          className="mx-auto max-w-public-content"
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '76px 24px 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {business.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logo_url}
              alt={business.name}
              style={{
                display: 'block',
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `3px solid ${heroLine}`,
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                backgroundColor: '#ffffff',
              }}
            />
          ) : (
            <div
              className={display.className}
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                backgroundColor: heroSoft,
                border: `3px solid ${heroLine}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                fontWeight: 600,
              }}
            >
              {business.name.trim().charAt(0).toUpperCase()}
            </div>
          )}

          <h1
            className={display.className}
            style={{ margin: '18px 0 0', fontSize: 'clamp(30px, 8vw, 42px)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.01em' }}
          >
            {business.name}
          </h1>

          {business.address && (
            <p style={{ margin: '10px 0 0', fontSize: '13px', color: heroMuted, display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
              <PinIcon size={14} />
              {business.address}
            </p>
          )}

          <div style={{ marginTop: '22px', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {items.length > 0 && (
              <a
                href="#catalog"
                className="min-h-11"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  color: lightBrand.accentText,
                  padding: '0 22px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.16)',
                }}
              >
                {getText('Ver catálogo', 'Shop now')}
              </a>
            )}
          </div>
        </div>
      </section>

      <AboutSection description={business.description} descriptionEn={business.descriptionEn} maxWidthClassName="max-w-public-content" language={language} />

      {/* ── PASOS ── */}
      <ProcessSection steps={business.processSteps} visible={business.sectionVisibility?.processSteps !== false} getText={getText} />

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

      {/* ── CATEGORÍAS — píldoras; la activa toma el color de marca ── */}
      {categoryNames.length > 0 && (
        <div className="mx-auto max-w-public-content" style={{ padding: '18px 24px 0' }}>
          <div
            className="[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overflow-x-auto md:overflow-x-visible md:flex-wrap"
            style={{ display: 'flex', gap: '8px' }}
          >
            <ChipTab
              label={getText('Todos', 'All')}
              active={activeTab === ALL_TAB}
              accent={accentFill}
              onAccent={onAccent}
              onClick={() => setActiveTab(ALL_TAB)}
            />
            {categoryNames.map((name) => (
              <ChipTab
                key={name}
                label={categoryLabel(name, language, business.categoryTranslations)}
                active={activeTab === name}
                accent={accentFill}
                onAccent={onAccent}
                onClick={() => setActiveTab(name)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── CONTEO / OFERTAS / ORDENAR ── */}
      {items.length > 1 && (
        <div className="mx-auto max-w-public-content" style={{ padding: '14px 24px 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: '13px', color: MUTED, flex: '1 0 auto', whiteSpace: 'nowrap' }}>
            {visibleItems.length} {getText(visibleItems.length === 1 ? 'producto' : 'productos', visibleItems.length === 1 ? 'product' : 'products')}
          </p>
          {hasOffers && (
            <button
              type="button"
              onClick={() => setOnlyOffers((v) => !v)}
              aria-pressed={onlyOffers}
              className="min-h-11 shrink-0 whitespace-nowrap rounded-full px-4 text-xs font-semibold"
              style={{
                backgroundColor: onlyOffers ? accentFill : SURFACE,
                color: onlyOffers ? onAccent : INK,
                border: `1px solid ${onlyOffers ? accentFill : BORDER}`,
              }}
            >
              🏷 {getText('Ofertas', 'Deals')}
            </button>
          )}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label={getText('Ordenar', 'Sort')}
            className="min-h-11 rounded-full px-3 text-xs font-semibold"
            style={{ backgroundColor: SURFACE, color: INK, border: `1px solid ${BORDER}`, flex: '0 1 auto', minWidth: 0 }}
          >
            <option value="default">{getText('Relevancia', 'Recommended')}</option>
            <option value="price-asc">{getText('Precio: menor a mayor', 'Price: low to high')}</option>
            <option value="price-desc">{getText('Precio: mayor a menor', 'Price: high to low')}</option>
            <option value="name">{getText('Nombre A–Z', 'Name A–Z')}</option>
          </select>
        </div>
      )}

      {/* ── CONTENT ── */}
      <main className="mx-auto max-w-public-content" style={{ padding: '16px 24px 40px' }}>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-7">
            {visibleItems.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
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
                shareUrl={`https://maalca.com/${business.slug}/p/${item.id}`}
                autoOpen={deepLinkedId === item.id}
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
          headingClassName={display.className}
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
        pickupNewCustomerLimit={capabilities.pickupNewCustomerLimit ?? null}
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className={display.className} style={{ margin: '0 0 14px', fontSize: '22px', fontWeight: 600, color: INK, letterSpacing: '-0.01em' }}>
      {children}
    </h2>
  );
}

function ProcessSection({
  steps,
  visible,
  getText,
}: {
  steps?: ProcessStep[] | null;
  visible: boolean;
  getText: (es: string, en: string) => string;
}) {
  if (!visible || !steps || steps.length === 0) return null;

  return (
    <div className="mx-auto max-w-public-content" style={{ padding: '28px 24px 0' }}>
      <SectionTitle>{getText('Cómo trabajamos', 'How we work')}</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div
            key={`${i}-${step.title}`}
            style={{
              backgroundColor: SURFACE,
              border: `1px solid ${BORDER_SOFT}`,
              borderRadius: '18px',
              padding: '16px',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--rl-accent)',
                color: 'var(--rl-on-accent)',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {i + 1}
            </span>
            <p style={{ margin: '12px 0 0', fontSize: '14px', fontWeight: 700, color: INK }}>
              {step.title}
            </p>
            {step.description && (
              <div
                className="prose-sm whitespace-pre-line [&_h2]:text-[13px] [&_h2]:font-semibold [&_h3]:text-[12px] [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_a]:underline"
                style={{ margin: '6px 0 0', fontSize: '13px', lineHeight: 1.55, color: MUTED }}
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
    <div className="mx-auto max-w-public-content" style={{ padding: '28px 24px 0' }}>
      <SectionTitle>{getText('Galería', 'Gallery')}</SectionTitle>
      <PublicGalleryLightbox images={images} accent={accent} getText={getText} />
    </div>
  );
}

// Same outline used for the "no image" state in the dashboard's catalog
// ItemRow (CatalogView.tsx).
function NoImageIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function PinIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ProductCard({
  item,
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
  shareUrl,
  autoOpen,
}: {
  item: PublicTemplateProps['items'][number];
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
  shareUrl: string;
  autoOpen: boolean;
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
  useEffect(() => {
    if (autoOpen) setDetailOpen(true);
  }, [autoOpen]);
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const hasDetail = Boolean(imageUrl || description);
  const addThis = () => addToCart({ id: item.id, name: displayName, price: item.price ?? 0, image: imageUrl ?? undefined });
  const badge: React.CSSProperties = { fontSize: 11, fontWeight: 700, padding: '4px 9px', borderRadius: 9999, lineHeight: 1.2, whiteSpace: 'nowrap' };

  return (
    <>
    <div
      onClick={hasDetail ? () => setDetailOpen(true) : undefined}
      className="group"
      style={{ cursor: hasDetail ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Foto 4:5. Sin foto: bloque tintado con la inicial, para que la grilla no pierda ritmo. */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '4 / 5',
          borderRadius: '18px',
          overflow: 'hidden',
          backgroundColor: PLACEHOLDER,
          backgroundImage: `linear-gradient(${ACCENT_SOFT}, ${ACCENT_SOFT})`,
          flexShrink: 0,
        }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={displayName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            style={soldOut ? { opacity: 0.55, filter: 'grayscale(0.5)' } : undefined}
          />
        ) : (
          <div
            className={display.className}
            style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px', fontWeight: 600, color: accentText, opacity: 0.55 }}
          >
            {displayName.trim().charAt(0).toUpperCase()}
          </div>
        )}

        {/* Insignias: discretas, arriba a la izquierda */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
          {soldOut && (
            <span style={{ ...badge, backgroundColor: '#1f2937', color: '#ffffff' }}>{getText('Agotado', 'Sold out')}</span>
          )}
          {onSale && off > 0 && !soldOut && (
            <span style={{ ...badge, backgroundColor: accent, color: onAccent }}>−{off}%</span>
          )}
          {(item.featured || item.popular) && !soldOut && (
            <span style={{ ...badge, backgroundColor: 'rgba(255,255,255,0.92)', color: '#2B2820' }}>
              {item.featured ? `⭐ ${getText('Destacado', 'Featured')}` : `🔥 ${getText('Popular', 'Popular')}`}
            </span>
          )}
        </div>

        {/* Pedido rápido sobre la foto: "+" redondo; con unidades en el carrito pasa a −/N/+ */}
        {!soldOut && (
          <div onClick={stop} style={{ position: 'absolute', right: 8, bottom: 8 }}>
            {cartQty === 0 ? (
              <button
                onClick={addThis}
                aria-label={`${getText('Agregar', 'Add')} ${displayName}`}
                className="flex h-11 w-11 items-center justify-center rounded-full text-xl font-semibold transition active:scale-95"
                style={{ backgroundColor: accent, color: onAccent, boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}
              >
                +
              </button>
            ) : (
              <div
                className="flex h-11 items-center rounded-full"
                style={{ backgroundColor: SURFACE, boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}
              >
                <button
                  onClick={() => removeFromCart(item.id)}
                  aria-label={`${getText('Quitar', 'Remove')} ${displayName}`}
                  className="flex h-11 w-10 items-center justify-center text-lg font-semibold"
                  style={{ color: INK }}
                >
                  −
                </button>
                <span className="min-w-4 text-center text-sm font-bold" style={{ color: INK }}>
                  {cartQty}
                </span>
                <button
                  onClick={addThis}
                  disabled={atMax}
                  aria-label={`${getText('Agregar', 'Add')} ${displayName}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-semibold disabled:opacity-40"
                  style={{ backgroundColor: accent, color: onAccent }}
                >
                  +
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: '10px 2px 0', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: INK, lineHeight: 1.3 }}>
          {hasDetail ? <CardOpenButton onOpen={() => setDetailOpen(true)}>{displayName}</CardOpenButton> : displayName}
        </p>
        {description && (
          <div onClick={stop}>
            <ClampedDescription
              text={description}
              language={language}
              textStyle={{ margin: '3px 0 0', fontSize: '12px', color: MUTED, lineHeight: 1.45 }}
              buttonColor={accentText}
              buttonStyle={{ fontSize: '12px' }}
            />
          </div>
        )}
        {item.price != null && (
          <p style={{ margin: '6px 0 0', fontSize: '15px', fontWeight: 700, color: onSale ? accentText : INK }}>
            {formatPrice(item.price, currency)}
            {onSale && (
              <s style={{ marginLeft: 6, fontSize: 12, fontWeight: 500, color: MUTED }}>
                {formatPrice(item.compareAtPrice as number, currency)}
              </s>
            )}
          </p>
        )}
        {lowStock && (
          <p style={{ margin: '3px 0 0', fontSize: '11px', fontWeight: 600, color: accentText }}>
            {getText(`Quedan ${left}`, `${left} left`)}
          </p>
        )}
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
      shareUrl={shareUrl}
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
  accent,
  onAccent,
  onClick,
}: {
  label: string;
  active: boolean;
  accent: string;
  onAccent: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className="min-h-10"
      style={{
        flexShrink: 0,
        padding: '0 18px',
        borderRadius: '9999px',
        border: 'none',
        backgroundColor: active ? accent : SURFACE,
        color: active ? onAccent : INK,
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        boxShadow: active ? 'none' : `inset 0 0 0 1px ${BORDER}`,
        transition: 'background-color .15s, color .15s',
      }}
    >
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
      <h2 className={display.className} style={{ margin: '0 0 14px', fontSize: '22px', fontWeight: 600, color: INK, letterSpacing: '-0.01em' }}>
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
                border: `1px solid ${BORDER_SOFT}`,
                borderRadius: '18px',
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
