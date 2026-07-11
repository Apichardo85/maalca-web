'use client';

import { useState } from 'react';
import type { PublicTemplateProps } from '@/lib/templates/registry';
import { useCart } from '@/components/public/cart/useCart';
import { WhatsAppCart } from '@/components/public/cart/WhatsAppCart';
import { resolveWhatsAppDigits, resolveContactItems } from '@/lib/public-contact';
import { trackCanalClick } from '@/lib/public-events';
import { AboutSection } from '@/components/public/AboutSection';
import { PublicFooter } from '@/components/public/PublicFooter';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { MEAL_PERIOD_LABELS, MEAL_PERIOD_ORDER } from '@/lib/menu-availability';
import type { MealPeriod } from '@/lib/types';

const ALL_TAB = '__all__';
const ALL_PERIODS = '__all_periods__';

const FLAG_ICONS: Record<string, string> = {
  vegetarian: '🌱',
  spicy: '🌶️',
  glutenFree: '🌾',
};

const MEAL_PERIOD_LABELS_EN: Record<MealPeriod, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  late_night: 'Late night',
  all_day: 'All day',
};

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

export function RestaurantTemplate({
  business,
  items,
  categories: categoriesProp,
  capabilities,
}: PublicTemplateProps) {
  const primaryColor = business.primary_color ?? '#C8102E';
  const waRaw = resolveWhatsAppDigits(business);
  const waHeroLink = waRaw
    ? `https://wa.me/${waRaw}?text=${encodeURIComponent(`Hola, quiero info sobre ${business.name}`)}`
    : null;

  const { cart, addToCart, removeFromCart, cartTotal, cartCount } = useCart();
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const periodLabel = (p: MealPeriod) => (language === 'en' ? MEAL_PERIOD_LABELS_EN[p] : MEAL_PERIOD_LABELS[p]);

  const categoryNames: string[] =
    categoriesProp.length > 0
      ? [...categoriesProp].sort((a, b) => a.sort_order - b.sort_order).map((c) => c.name)
      : Array.from(new Set(items.map((i) => i.category).filter((c): c is string => !!c)));

  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);
  const [activePeriod, setActivePeriod] = useState<string>(ALL_PERIODS);

  const availablePeriods = MEAL_PERIOD_ORDER.filter(
    (p): p is Exclude<MealPeriod, 'all_day'> =>
      p !== 'all_day' && items.some((i) => i.periods?.includes(p)),
  );

  function matchesPeriod(item: (typeof items)[number]): boolean {
    if (activePeriod === ALL_PERIODS) return true;
    if (!item.periods || item.periods.length === 0) return true;
    return item.periods.includes(activePeriod as MealPeriod);
  }

  function itemsFor(tab: string): typeof items {
    const catId = categoriesProp.find((c) => c.name === tab)?.id;
    const base =
      tab === ALL_TAB
        ? items
        : items.filter(
            (i) => (catId !== undefined && i.category_id === catId) || i.category === tab,
          );
    return base.filter(matchesPeriod);
  }

  const groupedForAll: Array<{ categoryName: string; groupItems: typeof items }> =
    categoryNames.length > 0
      ? categoryNames
          .map((name) => ({ categoryName: name, groupItems: itemsFor(name) }))
          .filter((g) => g.groupItems.length > 0)
      : [{ categoryName: '', groupItems: items }];

  const visibleItems = itemsFor(activeTab);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f6f1' }}>

      {/* TODO: Starter plan adds: gallery, hours, location */}

      {/* ── HERO ── */}
      <section
        style={{
          position: 'relative',
          height: '380px',
          backgroundColor: primaryColor,
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
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.55)',
              }}
            />
          </>
        )}

        {/* content anchored bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            maxWidth: '960px',
            margin: '0 auto',
            padding: '0 32px 48px',
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
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                objectFit: 'cover',
                border: '2px solid rgba(255,255,255,0.2)',
                marginBottom: '12px',
              }}
            />
          ) : (
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '12px',
              }}
            >
              🍽️
            </div>
          )}

          <h1
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            {business.name}
          </h1>

          {business.address && (
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              📍 {business.address}
            </p>
          )}

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '18px' }}>
            {waHeroLink && (
              <a
                href={waHeroLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCanalClick(business.slug, 'WhatsApp')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </a>
            )}
            {business.address && (
              <a
                href={`https://maps.google.com?q=${encodeURIComponent(business.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.35)',
                  color: '#ffffff',
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                📍 {getText('Cómo llegar', 'Get directions')}
              </a>
            )}
          </div>
        </div>
      </section>

      <AboutSection description={business.description} maxWidth="960px" language={language} />

      {/* ── NAV TABS ── */}
      {categoryNames.length > 0 && (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e3de',
          }}
        >
          <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }}>
            <div
              className="[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              style={{ display: 'flex', overflowX: 'auto' }}
            >
              {[
                { key: ALL_TAB, label: getText('Todos', 'All') },
                ...categoryNames.map((n) => ({ key: n, label: n })),
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    flexShrink: 0,
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: activeTab === key ? 600 : 400,
                    color: activeTab === key ? '#1a1a1a' : '#888888',
                    background: 'none',
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderBottom: activeTab === key
                      ? `2px solid ${primaryColor}`
                      : '2px solid transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PERIOD FILTER ── */}
      {availablePeriods.length > 0 && (
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '16px 24px 0' }}>
          <div
            className="[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}
          >
            {[
              { key: ALL_PERIODS, label: getText('Todos los horarios', 'All hours') },
              ...availablePeriods.map((p) => ({ key: p, label: periodLabel(p) })),
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActivePeriod(key)}
                style={{
                  flexShrink: 0,
                  padding: '6px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '9999px',
                  border: activePeriod === key ? `1px solid ${primaryColor}` : '1px solid #e5e3de',
                  backgroundColor: activePeriod === key ? primaryColor : '#ffffff',
                  color: activePeriod === key ? '#ffffff' : '#888888',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── CONTENT ── */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
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
            <span style={{ fontSize: '48px' }}>🍽️</span>
            <p style={{ marginTop: '16px', fontSize: '14px', color: '#aaa' }}>
              {getText('El menú estará disponible pronto.', 'The menu will be available soon.')}
            </p>
          </div>
        ) : activeTab === ALL_TAB ? (
          groupedForAll.length === 0 ? (
            <EmptyFilterState getText={getText} />
          ) : (
            groupedForAll.map(({ categoryName, groupItems }) => (
              <div key={categoryName || '__ungrouped__'} style={{ marginBottom: '32px' }}>
                {categoryName && <SectLabel label={categoryName} />}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groupItems.map((item) => {
                    const cartQty = cart.find(e => e.item.id === item.id)?.qty ?? 0;
                    return (
                      <MenuCard
                        key={item.id}
                        item={item}
                        language={language}
                        cartQty={cartQty}
                        onAdd={() => addToCart({
                          id: item.id,
                          name: item.name,
                          price: item.price ?? 0,
                          image: item.imageUrl ?? item.image_url ?? undefined,
                        })}
                        onRemove={() => removeFromCart(item.id)}
                      />
                    );
                  })}
                </div>
              </div>
            ))
          )
        ) : visibleItems.length === 0 ? (
          <EmptyFilterState getText={getText} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visibleItems.map((item) => {
              const cartQty = cart.find(e => e.item.id === item.id)?.qty ?? 0;
              return (
                <MenuCard
                  key={item.id}
                  item={item}
                  language={language}
                  cartQty={cartQty}
                  onAdd={() => addToCart({
                    id: item.id,
                    name: item.name,
                    price: item.price ?? 0,
                    image: item.imageUrl ?? item.image_url ?? undefined,
                  })}
                  onRemove={() => removeFromCart(item.id)}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* ── CONTACTO ── */}
      <ContactSection business={business} language={language} />

      {/* ── FOOTER ── */}
      <PublicFooter business={business} capabilities={capabilities} />

      {/* ── CART ── */}
      <WhatsAppCart
        cart={cart}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        cartTotal={cartTotal}
        cartCount={cartCount}
        whatsappNumber={waRaw ?? ''}
        businessName={business.name}
        taxRate={0}
      />
    </div>
  );
}

// ── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function SectLabel({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <span
        style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          color: '#aaa',
          letterSpacing: '0.08em',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e3de' }} />
    </div>
  );
}

function EmptyFilterState({ getText }: { getText: (es: string, en: string) => string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 0',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: '32px' }}>🍽️</span>
      <p style={{ marginTop: '12px', fontSize: '14px', color: '#aaa' }}>
        {getText('No hay platos para este filtro.', 'No dishes match this filter.')}
      </p>
    </div>
  );
}

function MenuCard({
  item,
  language,
  cartQty,
  onAdd,
  onRemove,
}: {
  item: PublicTemplateProps['items'][number];
  language: 'es' | 'en';
  cartQty: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const imageUrl = item.imageUrl ?? item.image_url;
  const description = language === 'en' && item.descriptionEn ? item.descriptionEn : item.description;
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '0.5px solid #ece9e2',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        minHeight: '120px',
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0, margin: '8px 0 8px 8px' }}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={item.name}
            style={{
              display: 'block',
              width: '120px',
              height: '120px',
              objectFit: 'cover',
              borderRadius: '12px',
            }}
          />
        ) : (
          <div
            style={{
              width: '120px',
              height: '120px',
              backgroundColor: '#f0ede8',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}
          >
            🍽️
          </div>
        )}
        {(item.featured || item.popular) && (
          <div style={{ position: 'absolute', top: '4px', left: '4px', display: 'flex', gap: '4px' }}>
            {item.featured && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  backgroundColor: '#f5b301',
                  color: '#1a1a1a',
                }}
              >
                ⭐ {getText('Destacado', 'Featured')}
              </span>
            )}
            {item.popular && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  backgroundColor: '#ff5a3c',
                  color: '#ffffff',
                }}
              >
                🔥 {getText('Popular', 'Popular')}
              </span>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          flex: 1,
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minWidth: 0,
        }}
      >
        {/* Name + description */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: '14px',
                color: '#1a1a1a',
                lineHeight: 1.3,
              }}
            >
              {item.name}
            </p>
            {item.flags && item.flags.length > 0 && (
              <span style={{ fontSize: '12px' }} title={item.flags.join(', ')}>
                {item.flags.map((f) => FLAG_ICONS[f] ?? '').join(' ')}
              </span>
            )}
          </div>
          {description && (
            <p
              className="line-clamp-2"
              style={{
                margin: '4px 0 0',
                fontSize: '12px',
                color: '#888',
                lineHeight: 1.5,
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Price + cart controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '8px',
            gap: '8px',
          }}
        >
          {item.price != null ? (
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1a1a1a' }}>
              {priceFormatter.format(item.price)}
            </p>
          ) : (
            <span />
          )}

          {cartQty === 0 ? (
            <button
              onClick={onAdd}
              aria-label={`${getText('Agregar', 'Add')} ${item.name}`}
              style={{
                backgroundColor: '#25D366',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              + {getText('Agregar', 'Add')}
            </button>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
              }}
            >
              <button
                onClick={onRemove}
                aria-label={`${getText('Quitar', 'Remove')} ${item.name}`}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#f0ede8',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                −
              </button>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '13px',
                  minWidth: '16px',
                  textAlign: 'center',
                  color: '#1a1a1a',
                }}
              >
                {cartQty}
              </span>
              <button
                onClick={onAdd}
                aria-label={`${getText('Agregar', 'Add')} ${item.name}`}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#25D366',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
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
    <section style={{ borderTop: '1px solid #e5e3de' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
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
                border: '0.5px solid #ece9e2',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                textDecoration: 'none',
              }}
            >
              <span style={{ fontSize: '22px' }}>{c.icon}</span>
              <span
                style={{
                  fontSize: '11px',
                  color: '#aaa',
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
                  color: '#1a1a1a',
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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
