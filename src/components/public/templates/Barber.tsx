'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PublicTemplateProps } from '@/lib/templates/registry';

const ALL_TAB = '__all__';

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
  const waRaw = business.whatsapp?.replace(/\D/g, '') ?? null;
  const waHeroLink = waRaw
    ? `https://wa.me/${waRaw}?text=${encodeURIComponent(`Hola, quiero info sobre ${business.name}`)}`
    : null;

  console.log('[Barber] whatsapp raw:', business.whatsapp, 'waRaw:', waRaw);

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
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f6f1' }}>

      {/* ── HERO ── */}
      <section
        style={{
          position: 'relative',
          height: '420px',
          backgroundColor: '#1a1a1a',
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
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
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
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  marginBottom: '12px',
                }}
              >
                ✂️
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

            {business.description && (
              <p
                style={{
                  margin: '10px 0 0',
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.5,
                  maxWidth: '480px',
                }}
              >
                {business.description}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '18px' }}>
              {waHeroLink && (
                <a
                  href={waHeroLink}
                  target="_blank"
                  rel="noopener noreferrer"
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
                  📍 Cómo llegar
                </a>
              )}
            </div>
        </div>
      </section>

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
                { key: ALL_TAB, label: 'Todos' },
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
                    borderBottom: activeTab === key ? '2px solid #1a1a1a' : '2px solid transparent',
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
            <span style={{ fontSize: '48px' }}>✂️</span>
            <p style={{ marginTop: '16px', fontSize: '14px', color: '#aaa' }}>
              Servicios disponibles pronto.
            </p>
          </div>
        ) : activeTab === ALL_TAB ? (
          groupedForAll.map(({ categoryName, groupItems }) => (
            <div key={categoryName || '__ungrouped__'} style={{ marginBottom: '32px' }}>
              {categoryName && <SectLabel label={categoryName} />}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {groupItems.map((item) => (
                  <ServiceCard key={item.id} item={item} waRaw={waRaw} businessName={business.name} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {visibleItems.map((item) => (
              <ServiceCard key={item.id} item={item} waRaw={waRaw} businessName={business.name} />
            ))}
          </div>
        )}
      </main>

      {/* ── CONTACTO ── */}
      <ContactSection business={business} waHeroLink={waHeroLink} />

      {/* ── FOOTER ── */}
      {!capabilities.hidePoweredBy && (
        <footer
          style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e5e3de',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <Link
            href="/servicios"
            style={{ fontSize: '12px', color: '#aaa', textDecoration: 'none' }}
          >
            Powered by <span style={{ fontWeight: 600, color: '#888' }}>MaalCa</span>
          </Link>
        </footer>
      )}
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

function ServiceCard({
  item,
  waRaw,
  businessName,
}: {
  item: PublicTemplateProps['items'][number];
  waRaw: string | null;
  businessName: string;
}) {
  const imageUrl = item.imageUrl ?? item.image_url;
  const waLink = waRaw
    ? `https://wa.me/${waRaw}?text=${encodeURIComponent(
        `Hola ${businessName}, quiero reservar: ${item.name}`,
      )}`
    : null;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '0.5px solid #ece9e2',
        borderRadius: '16px',
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
            backgroundColor: '#f0ede8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
          }}
        >
          ✂️
        </div>
      )}

      <div style={{ padding: '12px' }}>
        <p
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: '13px',
            color: '#1a1a1a',
            lineHeight: 1.3,
          }}
        >
          {item.name}
        </p>

        {item.durationMinutes != null && (
          <div
            style={{
              marginTop: '3px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '11px',
              color: '#aaa',
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
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>
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
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: '#25D366',
                flexShrink: 0,
                textDecoration: 'none',
              }}
            >
              <WhatsAppIcon className="w-[15px] h-[15px] text-white" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function ContactSection({
  business,
  waHeroLink,
}: {
  business: PublicTemplateProps['business'];
  waHeroLink: string | null;
}) {
  type ContactItem = { icon: string; label: string; value: string; href: string };

  const contacts: ContactItem[] = [
    waHeroLink && business.whatsapp
      ? { icon: '📱', label: 'WhatsApp', value: business.whatsapp, href: waHeroLink }
      : null,
    business.address
      ? {
          icon: '📍',
          label: 'Dirección',
          value: business.address,
          href: `https://maps.google.com?q=${encodeURIComponent(business.address)}`,
        }
      : null,
    business.contactEmail
      ? {
          icon: '✉️',
          label: 'Email',
          value: business.contactEmail,
          href: `mailto:${business.contactEmail}`,
        }
      : null,
  ].filter((c): c is ContactItem => c !== null);

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
