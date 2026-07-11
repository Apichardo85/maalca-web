'use client';
// src/components/public/templates/Barber.tsx
//
// "Grid & Blade" — a high-contrast, condensed-type template for barbershops
// and similarly precision/rhythm-driven trades. Deliberately cold (Escarcha
// background, not the warm-cream family used by Service/Restaurant/Retail),
// with a single bold accent rule ("the blade") as the recurring graphic
// motif and a perforated "ticket stub" service card as the signature
// element — distinct from Service's mono rate-card index.
import { useState } from 'react';
import { Oswald } from 'next/font/google';
import type { PublicTemplateProps } from '@/lib/templates/registry';
import { resolveWhatsAppDigits, resolveContactItems } from '@/lib/public-contact';
import { trackCanalClick } from '@/lib/public-events';
import { AboutSection } from '@/components/public/AboutSection';
import { PublicFooter } from '@/components/public/PublicFooter';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

// Scoped to this template only — condensed uppercase display for headers,
// duration and price (no separate mono role; the condensed weight already
// carries the "precision" voice this template needs).
const oswald = Oswald({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-barber-display' });

const ALL_TAB = '__all__';

const TINTA = '#151312';
const ESCARCHA = '#EFF1F4';
const ACERO = '#5B5B5B';
const ACERO_LIGHT = '#E4E6EA';

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function BarberTemplate({
  business,
  items,
  categories: categoriesProp,
  capabilities,
}: PublicTemplateProps) {
  const accent = business.primary_color ?? '#C8102E';
  const waRaw = resolveWhatsAppDigits(business);
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const waHeroLink = waRaw
    ? `https://wa.me/${waRaw}?text=${encodeURIComponent(`Hola, quiero info sobre ${business.name}`)}`
    : null;

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

  const groupedForAll: Array<{ categoryName: string; groupItems: typeof items }> =
    categoryNames.length > 0
      ? categoryNames
          .map((name) => ({ categoryName: name, groupItems: itemsFor(name) }))
          .filter((g) => g.groupItems.length > 0)
      : [{ categoryName: '', groupItems: items }];

  const visibleItems = itemsFor(activeTab);

  return (
    <div className={oswald.variable} style={{ minHeight: '100vh', backgroundColor: ESCARCHA }}>
      {/* ── HERO — Tinta + duotone-leaning cover treatment ── */}
      <section
        style={{
          position: 'relative',
          height: '420px',
          backgroundColor: TINTA,
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
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'grayscale(55%) contrast(1.15)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(180deg, rgba(21,19,18,0.35), rgba(21,19,18,0.85))`,
              }}
            />
          </>
        )}

        {/* content: anchored bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '0 32px 40px',
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
                border: '2px solid rgba(255,255,255,0.25)',
                marginBottom: '14px',
              }}
            />
          ) : (
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                marginBottom: '14px',
              }}
            >
              ✂️
            </div>
          )}

          <h1
            className={oswald.className}
            style={{
              margin: 0,
              fontSize: '38px',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.05,
              letterSpacing: '0.01em',
              textTransform: 'uppercase',
            }}
          >
            {business.name}
          </h1>

          {business.address && (
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>
              📍 {business.address}
            </p>
          )}

          {/* "the blade" — single bold accent rule, the recurring graphic motif */}
          <div style={{ height: '4px', width: '64px', backgroundColor: accent, marginTop: '18px', marginBottom: '18px' }} />

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {waHeroLink && (
              <a
                href={waHeroLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCanalClick(business.slug, 'WhatsApp')}
                className={oswald.className}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: accent,
                  color: '#ffffff',
                  padding: '10px 22px',
                  fontSize: '13px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
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
                className={oswald.className}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.4)',
                  color: '#ffffff',
                  padding: '10px 22px',
                  fontSize: '13px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  textDecoration: 'none',
                }}
              >
                {getText('Cómo llegar', 'Get directions')}
              </a>
            )}
          </div>
        </div>
      </section>

      <AboutSection description={business.description} maxWidth="1000px" language={language} />

      {/* ── NAV TABS — bold, condensed, underlined ── */}
      {categoryNames.length > 0 && (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            backgroundColor: ESCARCHA,
            borderBottom: `1px solid #dcdfe3`,
          }}
        >
          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
            <div
              className={`${oswald.className} [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`}
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
                    padding: '14px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    color: activeTab === key ? TINTA : ACERO,
                    background: 'none',
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderBottom: activeTab === key ? `3px solid ${accent}` : '3px solid transparent',
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

      {/* ── CONTENT ── */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
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
            <span style={{ fontSize: '48px' }}>✂️</span>
            <p style={{ marginTop: '16px', fontSize: '14px', color: ACERO }}>
              {getText('Servicios disponibles pronto.', 'Services available soon.')}
            </p>
          </div>
        ) : activeTab === ALL_TAB ? (
          groupedForAll.map(({ categoryName, groupItems }) => (
            <div key={categoryName || '__ungrouped__'} style={{ marginBottom: '32px' }}>
              {categoryName && <SectLabel label={categoryName} />}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {groupItems.map((item) => (
                  <ServiceCard key={item.id} item={item} waRaw={waRaw} businessName={business.name} accent={accent} displayClassName={oswald.className} language={language} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {visibleItems.map((item) => (
              <ServiceCard key={item.id} item={item} waRaw={waRaw} businessName={business.name} accent={accent} displayClassName={oswald.className} language={language} />
            ))}
          </div>
        )}
      </main>

      {/* ── CONTACTO ── */}
      <ContactSection business={business} language={language} />

      {/* ── FOOTER ── */}
      <PublicFooter business={business} capabilities={capabilities} />
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
          color: ACERO,
          letterSpacing: '0.08em',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', backgroundColor: '#dcdfe3' }} />
    </div>
  );
}

function ServiceCard({
  item,
  waRaw,
  businessName,
  accent,
  displayClassName,
  language,
}: {
  item: PublicTemplateProps['items'][number];
  waRaw: string | null;
  businessName: string;
  accent: string;
  displayClassName: string;
  language: 'es' | 'en';
}) {
  const imageUrl = item.imageUrl ?? item.image_url;
  const description = language === 'en' && item.descriptionEn ? item.descriptionEn : item.description;
  const waLink = waRaw
    ? `https://wa.me/${waRaw}?text=${encodeURIComponent(
        `Hola ${businessName}, quiero reservar: ${item.name}`,
      )}`
    : null;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #dcdfe3',
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={item.name}
          style={{ display: 'block', width: '100%', height: '110px', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '110px',
            backgroundColor: ACERO_LIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
          }}
        >
          ✂️
        </div>
      )}

      {/* ticket-stub perforation — the signature detail separating photo from price */}
      <div style={{ borderTop: `2px dashed #c7cbd1`, margin: '0 10px' }} />

      <div style={{ padding: '10px' }}>
        <p
          className={displayClassName}
          style={{
            margin: 0,
            fontWeight: 600,
            fontSize: '13px',
            color: TINTA,
            lineHeight: 1.3,
            textTransform: 'uppercase',
          }}
        >
          {item.name}
        </p>

        {description && (
          <p
            className="line-clamp-2"
            style={{
              margin: '4px 0 0',
              fontSize: '11px',
              color: '#6b6f76',
              lineHeight: 1.4,
            }}
          >
            {description}
          </p>
        )}

        {item.durationMinutes != null && (
          <div
            style={{
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '11px',
              color: ACERO,
            }}
          >
            <ClockIcon className="w-[11px] h-[11px] shrink-0" />
            {formatDuration(item.durationMinutes)}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '8px',
          }}
        >
          {item.price != null ? (
            <p className={displayClassName} style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: accent }}>
              {priceFormatter.format(item.price)}
            </p>
          ) : (
            <span />
          )}

          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp — ${item.name}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: accent,
                flexShrink: 0,
                textDecoration: 'none',
              }}
            >
              <WhatsAppIcon className="w-[14px] h-[14px] text-white" />
            </a>
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
    <section style={{ borderTop: '1px solid #dcdfe3' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
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
                border: '1px solid #dcdfe3',
                borderRadius: '10px',
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
                  color: ACERO,
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
                  color: TINTA,
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

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
