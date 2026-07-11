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
import { PublicFooter } from '@/components/public/PublicFooter';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

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

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            maxWidth: '1080px',
            margin: '0 auto',
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
                fontSize: '26px',
                marginBottom: '14px',
              }}
            >
              🖌️
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
              onClick={() => trackCanalClick(business.slug, 'WhatsApp')}
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

      <AboutSection description={business.description} maxWidth="1080px" language={language} />

      {/* ── CATEGORY TABS — rendered as paint chips, cycling the swatch palette ── */}
      {categoryNames.length > 0 && (
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '20px 24px 0' }}>
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
      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '28px 24px 40px' }}>
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
            <span style={{ fontSize: '40px' }}>🖌️</span>
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
            {visibleItems.map((item, i) => {
              const cartQty = cart.find((e) => e.item.id === item.id)?.qty ?? 0;
              const imageUrl = item.imageUrl ?? item.image_url;
              const description = language === 'en' && item.descriptionEn ? item.descriptionEn : item.description;
              const chipColor = SWATCHES[i % SWATCHES.length].hex;

              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d9d4c8',
                    borderRadius: '10px',
                    overflow: 'hidden',
                  }}
                >
                  {/* swatch tab — every card carries a corner of the strip above */}
                  <div style={{ height: '5px', backgroundColor: chipColor }} />

                  <div className="aspect-square" style={{ backgroundColor: '#f1efe9' }}>
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl" style={{ color: '#c7c2b4' }}>
                        🖌️
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '10px' }}>
                    <p
                      className={robotoSlab.className}
                      style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: INK, lineHeight: 1.3 }}
                    >
                      {item.name}
                    </p>
                    {description && (
                      <p
                        className="line-clamp-2"
                        style={{ margin: '4px 0 0', fontSize: '11px', color: MUTED, lineHeight: 1.4 }}
                      >
                        {description}
                      </p>
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
                        className="mt-2 block w-full rounded-full py-1.5 text-center text-xs font-semibold text-white transition hover:opacity-90"
                        style={{ backgroundColor: accent }}
                      >
                        + {getText('Agregar', 'Add')}
                      </button>
                    ) : (
                      <div className="mt-2 flex items-center justify-between gap-1">
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
            })}
          </div>
        )}
      </main>

      {/* ── CONTACTO ── */}
      <ContactSection business={business} language={language} />

      <PublicFooter business={business} capabilities={capabilities} />

      {waRaw && (
        <WhatsAppCart
          cart={cart}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          cartTotal={cartTotal}
          cartCount={cartCount}
          whatsappNumber={waRaw}
          businessName={business.name}
        />
      )}
    </div>
  );
}

// ── SUB-COMPONENTS ──────────────────────────────────────────────────────────

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
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '28px 24px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {contacts.map((c) => (
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
              <span style={{ fontSize: '20px' }}>{c.icon}</span>
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
          ))}
        </div>
      </div>
    </section>
  );
}
