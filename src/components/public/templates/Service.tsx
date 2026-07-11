'use client';
// src/components/public/templates/Service.tsx
//
// "Dossier" layout — an asymmetric two-column template for professional/
// consultative services (consulting, trades, AI platforms, anything sold via
// a conversation rather than a shopping cart). Sticky identity sidebar +
// editorial main column, with a numbered "Service Index" (mono, leader-dot
// pricing, expandable) as the signature element — deliberately distinct from
// the circular numbered badges used for the Process/"Cómo trabajamos" flow,
// so the two numbering systems never read as the same thing.
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Fraunces, IBM_Plex_Mono } from 'next/font/google';
import type { FaqEntry, ProcessStep, PublicTemplateProps } from '@/lib/templates/registry';
import { resolveWhatsAppDigits, resolveContactItems } from '@/lib/public-contact';
import { trackCanalClick } from '@/lib/public-events';
import { PublicFooter } from '@/components/public/PublicFooter';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

// Scoped to this template only — Fraunces gives the pull-quote/headers real
// character; Plex Mono is the "spec sheet" voice for numbers, prices, labels.
const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-service-display' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500'], variable: '--font-service-mono' });

const PAPER = '#FAF8F4';
const MIST = '#F0EEE9';
const INK = '#1C1B1F';
const STONE = '#8A8578';

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 12 3.5 6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 4h3.2l1.3 4.3-2 1.6a12.6 12.6 0 0 0 5.1 5.1l1.6-2 4.3 1.3v3.2a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3 5.6 1.5 1.5 0 0 1 4.5 4Z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4.5 7 7 5.2L18.5 7" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5.5h16v10H9.5L5 19v-3.5H4z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 transition-transform"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CaseIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7.5" width="18" height="12" rx="2" />
      <path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
      <path d="M3 12h18" />
    </svg>
  );
}

export function ServiceTemplate({ business, items, capabilities }: PublicTemplateProps) {
  const accent = business.primary_color ?? '#C8102E';
  const waRaw = resolveWhatsAppDigits(business);
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const contacts = resolveContactItems(business);
  const secondaryContacts = contacts.filter((c) => c.tipo === 'Telefono' || c.tipo === 'Email');
  const addressEntry = contacts.find((c) => c.tipo === 'Direccion');

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const waHeroLink = waRaw
    ? `https://wa.me/${waRaw}?text=${encodeURIComponent(`Hola, quiero info sobre ${business.name}`)}`
    : null;

  return (
    <div
      className={`${fraunces.variable} ${plexMono.variable} min-h-screen`}
      style={{ backgroundColor: PAPER, color: INK }}
    >
      {/* Cover strip — purely atmospheric, no text overlay (identity lives in the sidebar/mobile bar) */}
      {business.cover_image_url && (
        <div className="relative h-36 w-full overflow-hidden lg:h-52">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={business.cover_image_url} alt="" className="h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.15), ${PAPER})` }}
          />
        </div>
      )}

      {/* Mobile identity bar — logo + name + CTA inline, sticky */}
      <div
        className="sticky top-0 z-20 flex items-center gap-3 border-b px-4 py-3 lg:hidden"
        style={{ backgroundColor: PAPER, borderColor: MIST }}
      >
        {business.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.logo_url} alt={business.name} className="h-11 w-11 shrink-0 rounded-xl object-cover" />
        ) : (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-semibold text-white"
            style={{ backgroundColor: accent }}
          >
            {business.name.charAt(0).toUpperCase()}
          </div>
        )}
        <p className={`${fraunces.className} min-w-0 flex-1 truncate text-[17px] font-semibold`}>
          {business.name}
        </p>
        {waHeroLink && (
          <a
            href={waHeroLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCanalClick(business.slug, 'WhatsApp')}
            className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white"
            style={{ backgroundColor: accent }}
          >
            <ChatIcon className="h-3.5 w-3.5" />
            WhatsApp
          </a>
        )}
      </div>

      {/* Mobile secondary contacts — phone/email stay visible on every screen size;
          only address is footer-only. Nobody should have to guess these exist. */}
      {secondaryContacts.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b px-4 py-3 text-sm lg:hidden"
          style={{ backgroundColor: PAPER, borderColor: MIST, color: STONE }}
        >
          {secondaryContacts.map((c) => (
            <a
              key={c.tipo}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCanalClick(business.slug, c.tipo, c.canalId)}
              className="flex min-w-0 items-center gap-1.5 hover:underline"
            >
              {c.tipo === 'Telefono' ? <PhoneIcon className="h-3.5 w-3.5 shrink-0" /> : <MailIcon className="h-3.5 w-3.5 shrink-0" />}
              <span className="truncate">{c.value}</span>
            </a>
          ))}
        </div>
      )}

      <div className="mx-auto max-w-[1180px] px-4 py-8 lg:grid lg:grid-cols-[288px_1fr] lg:gap-16 lg:px-8 lg:py-14">
        {/* Sidebar — desktop only */}
        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-5">
            {business.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={business.logo_url} alt={business.name} className="h-16 w-16 rounded-2xl object-cover" />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-semibold text-white"
                style={{ backgroundColor: accent }}
              >
                {business.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <p className={`${fraunces.className} text-xl font-semibold leading-tight`}>{business.name}</p>
              {addressEntry && (
                <p className="mt-2 flex items-start gap-1.5 text-sm" style={{ color: STONE }}>
                  <PinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {addressEntry.value}
                </p>
              )}
            </div>

            {waHeroLink && (
              <a
                href={waHeroLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCanalClick(business.slug, 'WhatsApp')}
                className="flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: accent }}
              >
                <ChatIcon className="h-4 w-4" />
                WhatsApp
              </a>
            )}

            {secondaryContacts.length > 0 && (
              <div className="space-y-2 border-t pt-4" style={{ borderColor: MIST }}>
                {secondaryContacts.map((c) => (
                  <a
                    key={c.tipo}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackCanalClick(business.slug, c.tipo, c.canalId)}
                    className="flex items-center gap-2 text-sm hover:underline"
                    style={{ color: STONE }}
                  >
                    {c.tipo === 'Telefono' ? <PhoneIcon className="h-3.5 w-3.5 shrink-0" /> : <MailIcon className="h-3.5 w-3.5 shrink-0" />}
                    <span className="truncate">{c.value}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main column */}
        <main className="pt-6 lg:pt-0">
          <p
            className={`${plexMono.className} text-xs font-medium uppercase tracking-[0.18em]`}
            style={{ color: STONE }}
          >
            {getText('Servicios profesionales', 'Professional services')}
          </p>
          {business.description && (
            <p
              className={`${fraunces.className} mt-3 max-w-[38rem] text-[26px] font-medium leading-[1.35] lg:text-[30px]`}
              style={{ whiteSpace: 'pre-line' }}
            >
              {business.description}
            </p>
          )}

          <ProcessSection steps={business.processSteps} accent={accent} displayClassName={fraunces.className} getText={getText} />

          <section className="mt-12">
            <h2 className={`${fraunces.className} text-lg font-semibold`}>{getText('Servicios', 'Services')}</h2>

            {items.length === 0 ? (
              <div
                className="mt-4 flex flex-col items-center justify-center gap-3 rounded-2xl border py-16 text-center"
                style={{ borderColor: MIST }}
              >
                <CaseIcon className="h-8 w-8" style={{ color: STONE }} />
                <p className="text-sm" style={{ color: STONE }}>{getText('Información disponible pronto.', 'Information available soon.')}</p>
              </div>
            ) : (
              <div className="mt-4 border-t" style={{ borderColor: MIST }}>
                {items.map((item, i) => {
                  const imageUrl = item.imageUrl ?? item.image_url;
                  const description = language === 'en' && item.descriptionEn ? item.descriptionEn : item.description;
                  const isOpen = openItems.has(item.id);
                  const itemWaLink = waRaw
                    ? `https://wa.me/${waRaw}?text=${encodeURIComponent(`Hola ${business.name}, me interesa: ${item.name}`)}`
                    : null;

                  return (
                    <div key={item.id} className="border-b" style={{ borderColor: MIST }}>
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className="flex w-full items-center gap-4 py-4 text-left"
                        aria-expanded={isOpen}
                      >
                        <span className={`${plexMono.className} text-sm`} style={{ color: STONE }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-[15px] font-medium">{item.name}</span>
                        <span className="h-px flex-1 border-b border-dotted" style={{ borderColor: '#c9c5ba' }} />
                        {item.price != null && (
                          <span className={`${plexMono.className} text-sm`}>${item.price.toFixed(2)}</span>
                        )}
                        <ChevronIcon open={isOpen} />
                      </button>

                      {isOpen && (
                        <div className="flex flex-col gap-4 pb-6 pl-9 sm:flex-row sm:items-start">
                          {imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imageUrl}
                              alt={item.name}
                              className="h-32 w-full shrink-0 rounded-xl object-cover sm:w-44"
                            />
                          )}
                          <div className="flex flex-1 flex-col gap-3">
                            {description && (
                              <p className="text-sm leading-relaxed" style={{ color: '#4a4740' }}>
                                {description}
                              </p>
                            )}
                            {itemWaLink && (
                              <a
                                href={itemWaLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => trackCanalClick(business.slug, 'WhatsApp')}
                                className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white"
                                style={{ backgroundColor: accent }}
                              >
                                {capabilities.bookingCalendar
                                  ? getText('Reservar', 'Book')
                                  : getText('Cotizar por WhatsApp', 'Get a quote via WhatsApp')}
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <FaqSection faq={business.faq} displayClassName={fraunces.className} getText={getText} />
        </main>
      </div>

      <PublicFooter business={business} capabilities={capabilities} language={language} />
    </div>
  );
}

// ── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function ProcessSection({
  steps,
  accent,
  displayClassName,
  getText,
}: {
  steps?: ProcessStep[] | null;
  accent: string;
  displayClassName: string;
  getText: (es: string, en: string) => string;
}) {
  if (!steps || steps.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className={`${displayClassName} text-lg font-semibold`}>{getText('Cómo trabajamos', 'How we work')}</h2>
      <ol className="mt-5 grid gap-6 sm:grid-cols-3">
        {steps.map((step, i) => (
          <li key={`${i}-${step.title}`}>
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: accent }}
            >
              {i + 1}
            </span>
            <p className="mt-3 font-semibold">{step.title}</p>
            <p className="mt-1 text-sm" style={{ color: STONE }}>{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function FaqSection({
  faq,
  displayClassName,
  getText,
}: {
  faq?: FaqEntry[] | null;
  displayClassName: string;
  getText: (es: string, en: string) => string;
}) {
  if (!faq || faq.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className={`${displayClassName} text-lg font-semibold`}>{getText('Preguntas frecuentes', 'FAQ')}</h2>
      <div className="mt-4 border-t" style={{ borderColor: MIST }}>
        {faq.map((entry, i) => (
          <details key={`${i}-${entry.question}`} className="group border-b py-4" style={{ borderColor: MIST }}>
            <summary className="cursor-pointer list-none font-medium marker:content-none">
              {entry.question}
            </summary>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: STONE }}>{entry.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
