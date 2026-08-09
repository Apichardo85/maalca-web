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
import { useState } from 'react';
import { Roboto_Slab } from 'next/font/google';
import type { PublicTemplateProps } from '@/lib/templates/registry';
import { useCart } from '@/components/public/cart/useCart';
import { WhatsAppCart } from '@/components/public/cart/WhatsAppCart';
import { resolveWhatsAppDigits, resolveContactItems } from '@/lib/public-contact';
import { trackCanalClick } from '@/lib/public-events';
import { AboutSection } from '@/components/public/AboutSection';
import { ClampedDescription } from '@/components/public/ClampedDescription';
import { CONTACT_ICON_BY_TIPO } from '@/components/public/ContactIcons';
import { PublicFooter } from '@/components/public/PublicFooter';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import SimpleLanguageToggle from '@/components/ui/SimpleLanguageToggle';

// Scoped to this template only — a slab serif reads as "catalog/hardware
// store signage", distinct from Service's editorial Fraunces and Barber's
// condensed Oswald.
const robotoSlab = Roboto_Slab({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-retail-display' });

const ALL_TAB = '__all__';

const PIEDRA = '#E6E2D8';
const INK = '#2B2820';
const MUTED = '#7A7468';

const SWATCHES = [
  { name: 'Ladrillo', hex: '#A6452B' },
  { name: 'Ocre Mostaza', hex: '#C98A2B' },
  { name: 'Salvia', hex: '#7A8B6F' },
  { name: 'Azul Óxido', hex: '#46647A' },
];

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

export function RetailTemplate({
  business,
  items,
  categories: categoriesProp,
  capabilities,
}: PublicTemplateProps) {
  const accent = business.primary_color ?? SWATCHES[0].hex;
  const waRaw = resolveWhatsAppDigits(business);
  // Resolved canal (with canalId) for click tracking — waRaw above is digits-only, used for
  // the href; the canalId is what lets maalca-api attribute this click to a specific canal row
  // instead of excluding it from the byCanal breakdown (Program.cs:854).
  const whatsappEntry = resolveContactItems(business).find((c) => c.tipo === 'WhatsApp');
  const { cart, addToCart, removeFromCart, cartTotal, cartCount } = useCart();
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  const categoryNames: string[] =
    categoriesProp.length > 0
      ? [...categoriesProp].sort((a, b) => a.sort_order - b.sort_order).map((c) => c.name)
      : Array.from(new Set(items.map((i) => i.category).filter((c): c is string => !!c)));

  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);

  function itemsFor(tab: string): typeof items {
    if (tab === ALL_TAB) return items;
    const catId = categoriesProp.find((c) => c.name === tab)?.id;
    return items.filter(
      (i) => (catId !== undefined && i.category_id === catId) || i.category === tab,
    );
  }

  const visibleItems = itemsFor(activeTab);

  return (
    <div className={robotoSlab.variable} style={{ minHeight: '100vh', backgroundColor: PIEDRA }}>
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
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 2 }}>
          <SimpleLanguageToggle variant="dark" />
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
            color: '#fff',
          }}
        >
          {business.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logo_url}
              alt={business.name}
              style={{
                display: 'block',
                width: '60px',
                height: '60px',
                borderRadius: '8px',
                objectFit: 'cover',
                border: '2px solid rgba(255,255,255,0.3)',
                marginBottom: '14px',
              }}
            />
          ) : (
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                marginBottom: '14px',
              }}
            >
              <NoImageIcon size={26} />
            </div>
          )}

          <h1
            className={robotoSlab.className}
            style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}
          >
            {business.name}
          </h1>

          {business.address && (
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>
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
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(4px)',
                color: '#ffffff',
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

      {/* ── CATEGORY TABS — rendered as paint chips, cycling the swatch palette ── */}
      {categoryNames.length > 0 && (
        <div className="mx-auto max-w-public-content" style={{ padding: '20px 24px 0' }}>
          <div
            className="[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}
          >
            <ChipTab
              label={getText('Todos', 'All')}
              active={activeTab === ALL_TAB}
              color={INK}
              onClick={() => setActiveTab(ALL_TAB)}
            />
            {categoryNames.map((name, i) => (
              <ChipTab
                key={name}
                label={name}
                active={activeTab === name}
                color={SWATCHES[i % SWATCHES.length].hex}
                onClick={() => setActiveTab(name)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── CONTENT ── */}
      <main className="mx-auto max-w-public-content" style={{ padding: '28px 24px 40px' }}>
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
              {getText('No hay productos en esta categoría.', 'No products in this category.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {visibleItems.map((item, i) => (
              <ProductCard
                key={item.id}
                item={item}
                chipColor={SWATCHES[i % SWATCHES.length].hex}
                cartQty={cart.find((e) => e.item.id === item.id)?.qty ?? 0}
                accent={accent}
                language={language}
                getText={getText}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── FAQ ── */}
      <FaqSection faq={business.faq} getText={getText} />

      {/* ── CONTACTO ── */}
      <ContactSection business={business} language={language} />

      <PublicFooter business={business} capabilities={capabilities} language={language} />

      {waRaw && (
        <WhatsAppCart
          cart={cart}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          cartTotal={cartTotal}
          cartCount={cartCount}
          whatsappNumber={waRaw}
          businessName={business.name}
          slug={business.slug}
          onlinePayments={capabilities.onlinePayments}
        />
      )}
    </div>
  );
}

// ── SUB-COMPONENTS ──────────────────────────────────────────────────────────

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
  language,
  getText,
  addToCart,
  removeFromCart,
}: {
  item: PublicTemplateProps['items'][number];
  chipColor: string;
  cartQty: number;
  accent: string;
  language: 'es' | 'en';
  getText: (es: string, en: string) => string;
  addToCart: (item: { id: string; name: string; price: number; image?: string }) => void;
  removeFromCart: (itemId: string) => void;
}) {
  const imageUrl = item.imageUrl ?? item.image_url;
  const description = language === 'en' && item.descriptionEn ? item.descriptionEn : item.description;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid #d9d4c8',
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      {/* swatch tab — every card carries a corner of the strip above */}
      <div style={{ height: '5px', backgroundColor: chipColor, flexShrink: 0 }} />

      <div className="aspect-square" style={{ backgroundColor: '#f1efe9', flexShrink: 0 }}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center" style={{ color: '#c7c2b4' }}>
            <NoImageIcon size={32} />
          </div>
        )}
      </div>

      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p
          className={robotoSlab.className}
          style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: INK, lineHeight: 1.3 }}
        >
          {item.name}
        </p>
        {description && (
          <ClampedDescription
            text={description}
            language={language}
            textStyle={{ margin: '4px 0 0', fontSize: '11px', color: MUTED, lineHeight: 1.4 }}
            buttonColor={accent}
            buttonStyle={{ fontSize: '11px' }}
          />
        )}
        {item.price != null && (
          <p style={{ margin: '6px 0 0', fontSize: '14px', fontWeight: 700, color: INK }}>
            {priceFormatter.format(item.price)}
          </p>
        )}

        {cartQty === 0 ? (
          <button
            onClick={() => addToCart({
              id: item.id,
              name: item.name,
              price: item.price ?? 0,
              image: imageUrl ?? undefined,
            })}
            aria-label={`${getText('Agregar', 'Add')} ${item.name}`}
            className="block w-full rounded-full py-1.5 text-center text-xs font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: accent, marginTop: 'auto' }}
          >
            + {getText('Agregar', 'Add')}
          </button>
        ) : (
          <div className="flex items-center justify-between gap-1" style={{ marginTop: 'auto' }}>
            <button
              onClick={() => removeFromCart(item.id)}
              aria-label={`${getText('Quitar', 'Remove')} ${item.name}`}
              className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold"
              style={{ backgroundColor: '#f0ede4', color: INK }}
            >
              −
            </button>
            <span className="text-sm font-bold" style={{ color: INK }}>
              {cartQty}
            </span>
            <button
              onClick={() => addToCart({
                id: item.id,
                name: item.name,
                price: item.price ?? 0,
                image: imageUrl ?? undefined,
              })}
              aria-label={`${getText('Agregar', 'Add')} ${item.name}`}
              className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold text-white"
              style={{ backgroundColor: accent }}
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
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
        backgroundColor: active ? color : '#ffffff',
        color: active ? '#ffffff' : INK,
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        boxShadow: active ? 'none' : 'inset 0 0 0 1px #d9d4c8',
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
      <div style={{ borderTop: '1px solid #d9d4c8' }}>
        {faq.map((entry, i) => (
          <details key={`${i}-${entry.question}`} style={{ borderBottom: '1px solid #d9d4c8', padding: '14px 0' }}>
            <summary style={{ cursor: 'pointer', listStyle: 'none', fontWeight: 600, color: INK, fontSize: '14px' }}>
              {entry.question}
            </summary>
            <p style={{ margin: '8px 0 0', fontSize: '13px', lineHeight: 1.6, color: MUTED }}>
              {entry.answer}
            </p>
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
    <section style={{ borderTop: '1px solid #d9d4c8' }}>
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
                backgroundColor: '#ffffff',
                border: '1px solid #d9d4c8',
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
