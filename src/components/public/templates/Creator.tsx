'use client';
// src/components/public/templates/Creator.tsx
//
// Página pública de un autor (BusinessType.Creator), dirección "La careta" (ver components/public/creator/theme).
// Las obras vienen de su propia tabla (Work, ver WorkService.cs en maalca-api) por `business.works`, no del
// catálogo genérico; el catálogo (`items`) se muestra aparte como servicios/productos del autor (talleres,
// corrección, ediciones firmadas). Todo el texto literario sale de lo que el autor escribió en su espacio
// (Identidad y Obras): la plantilla no inventa frases.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { PublicTemplateProps } from '@/lib/templates/registry';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { sanitizeRichText, stripRichTextToPlain } from '@/lib/sanitize-html';
import { formatMoney, kindLabel, readableLabel, workCover, workSynopsis, workTitle, type PublicWorkSummary } from '@/lib/creator';
import { resolveWhatsAppDigits } from '@/lib/public-contact';
import { useCart } from '@/components/public/cart/useCart';
import { WhatsAppCart } from '@/components/public/cart/WhatsAppCart';
import { MembershipButton, SubscribeForm } from '@/components/public/creator/ReaderForms';
import { CreatorRoot, CW, FONT, creatorAccent, monoNote } from '@/components/public/creator/theme';
import { CreatorFooter, CreatorNav, authorHref } from '@/components/public/creator/CreatorChrome';

const wrap = { maxWidth: 1200, margin: '0 auto', padding: '104px 24px' } as const;
const twoCols = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 64 } as const;

/** Primera oración como titular y el resto como bajada, ambos del texto que el autor puso en Identidad. */
function splitDescription(html?: string | null): { headline: string | null; rest: string | null } {
  const plain = stripRichTextToPlain(html ?? '').replace(/\s+/g, ' ').trim();
  if (!plain) return { headline: null, rest: null };
  const m = plain.match(/^(.{20,180}?[.!?…])\s+(.+)$/);
  return m ? { headline: m[1], rest: m[2] } : { headline: plain.length <= 180 ? plain : null, rest: plain.length <= 180 ? null : plain };
}

export function CreatorTemplate({ business, items, capabilities }: PublicTemplateProps) {
  const { language } = useSimpleLanguage();
  const lang: 'es' | 'en' = language === 'es' ? 'es' : 'en';
  const t = (es: string, en: string) => (lang === 'es' ? es : en);
  const accent = creatorAccent(business.primary_color);

  const works = business.works ?? [];
  const featured = works.find((w) => w.featured) ?? works[0] ?? null;
  const others = works.filter((w) => w.id !== featured?.id);
  const library = works.filter((w) => w.readableNow !== 'none');
  const firstReadable = library[0] ?? null;

  const description = lang === 'en' && business.descriptionEn ? business.descriptionEn : business.description;
  const { headline, rest } = splitDescription(description);
  const heroImage = business.cover_image_url || business.logo_url;
  const services = items.filter((i) => i.status == null || i.status.toLowerCase() === 'active').filter((i) => !i.is_demo);
  const currency = business.currency ?? 'USD';

  // Tienda: el mismo carrito y checkout de las demás plantillas (pedido → Stripe Connect del autor o WhatsApp).
  const { cart, addToCart, removeFromCart, clearCart, cartTotal, cartCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const waDigits = resolveWhatsAppDigits(business);
  const onlinePayments = capabilities.onlinePayments && capabilities.stripeReady !== false;
  const sells = services.some((i) => typeof i.price === 'number' && i.price > 0) && business.ordersEnabled !== false && (onlinePayments || !!waDigits);

  const club = business.readerClub ?? null;
  const price = club?.membershipAvailable && club.monthlyPrice ? formatMoney(club.monthlyPrice, club.currency, lang) : null;
  const benefits = lang === 'en' && club?.benefitsEn ? club.benefitsEn : club?.benefits;
  const pitch = lang === 'en' && club?.lettersPitchEn ? club.lettersPitchEn : club?.lettersPitch;
  const hasClub = Boolean(club?.lettersEnabled || price);

  // La portada se cachea igual para todos; si el lector ya entró, se sabe aquí (cookie httpOnly vía /me)
  // para que "Hacerme miembro" vaya directo al pago sin volver a pedir el correo.
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    if (!price) return;
    let alive = true;
    fetch(`/api/readers/${encodeURIComponent(business.slug)}/me`)
      .then((r) => { if (alive) setSignedIn(r.ok); })
      .catch(() => {});
    return () => { alive = false; };
  }, [price, business.slug]);

  const author = {
    slug: business.slug,
    name: business.name,
    logoUrl: business.logo_url,
    contactEmail: business.contactEmail,
    canales: business.canales,
  };

  return (
    <CreatorRoot accent={accent}>
      <CreatorNav author={author} lang={lang} showLibrary={library.length > 0} showReaders={hasClub} />

      {/* ── Portada ─────────────────────────────────────────────── */}
      <section style={{ ...wrap, ...twoCols, gap: 72, alignItems: 'center', paddingTop: 96, paddingBottom: 120 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ height: 1, width: 64, background: CW.gold }} />
          <h1 style={{ margin: 0, fontFamily: FONT.display, fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(38px, 5.2vw, 60px)', lineHeight: 1.12, color: CW.text }}>
            {headline ?? business.name}
          </h1>
          {rest && (
            <p style={{ margin: 0, fontSize: 19, lineHeight: 1.7, color: CW.muted, maxWidth: 540 }}>{rest}</p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {firstReadable && (
              <Link href={authorHref(business.slug, `/obras/${firstReadable.slug}`)} className="cw-btn" style={{ background: CW.paper, color: CW.night }}>
                {t('Leer gratis', 'Read for free')}
              </Link>
            )}
            {works.length > 0 && (
              <a href="#obras" className="cw-btn" style={{ border: '1px solid #4A4652', color: CW.text }}>
                {t('Ver las obras', 'See the works')}
              </a>
            )}
          </div>
        </div>
        {heroImage && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImage} alt={business.name} style={{ width: '100%', maxWidth: 440, height: 'auto', objectFit: 'contain' }} />
          </div>
        )}
      </section>

      {/* ── Obras ───────────────────────────────────────────────── */}
      <section id="obras" style={{ background: CW.paper, color: CW.ink }}>
        <div style={{ ...wrap, ...twoCols }}>
          {featured ? (
            <FeaturedWork work={featured} slug={business.slug} lang={lang} accent={accent} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <span style={{ ...monoNote, color: accent }}>{t('obras', 'works')}</span>
              <p style={{ margin: 0, fontSize: 18, color: CW.paperText }}>{t('Pronto.', 'Soon.')}</p>
            </div>
          )}
          {others.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ ...monoNote, color: accent, marginBottom: 12 }}>{t('más obras', 'more works')}</span>
              {others.map((w) => (
                <Link
                  key={w.id}
                  href={authorHref(business.slug, `/obras/${w.slug}`)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, padding: '18px 0', borderBottom: `1px solid ${CW.paperLine}`, textDecoration: 'none', color: CW.ink }}
                >
                  <span style={{ fontFamily: FONT.display, fontSize: 26 }}>{workTitle(w, lang)}</span>
                  <span style={{ fontFamily: FONT.mono, fontSize: 14, color: CW.paperFaint, whiteSpace: 'nowrap' }}>
                    {[kindLabel(w.kind, lang), w.year].filter(Boolean).join(' · ')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Biblioteca: lo que se puede leer ahora ──────────────── */}
      {library.length > 0 && (
        <section id="biblioteca" style={{ ...wrap, ...twoCols, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <span style={{ ...monoNote, color: CW.gold }}>{t('biblioteca abierta', 'open library')}</span>
            <h2 style={{ margin: 0, fontFamily: FONT.display, fontWeight: 400, fontSize: 'clamp(34px, 4vw, 48px)', lineHeight: 1.1 }}>
              {t('Para leer aquí', 'To read here')}
            </h2>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.7, color: CW.muted }}>
              {t(
                'Algunas obras se abren completas por tiempo limitado; otras dejan leer los primeros capítulos.',
                'Some works open in full for a limited time; others let you read the first chapters.',
              )}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {library.map((w) => (
              <Link
                key={w.id}
                href={authorHref(business.slug, `/obras/${w.slug}`)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, padding: '20px 0', borderBottom: `1px solid ${CW.lineSoft}`, textDecoration: 'none' }}
              >
                <span style={{ fontFamily: FONT.display, fontStyle: 'italic', fontSize: 24, color: CW.text }}>{workTitle(w, lang)}</span>
                <span style={{ fontFamily: FONT.mono, fontSize: 14, color: w.freeUntil || w.readableNow === 'full' ? CW.open : CW.gold, whiteSpace: 'nowrap' }}>
                  {readableLabel(w, lang)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Servicios / tienda: el catálogo del autor ───────────── */}
      {services.length > 0 && (
        <section id="tienda" style={{ background: CW.paper, color: CW.ink }}>
          <div style={{ ...wrap, display: 'flex', flexDirection: 'column', gap: 40 }}>
            <h2 style={{ margin: 0, fontFamily: FONT.display, fontWeight: 400, fontSize: 'clamp(34px, 4vw, 48px)' }}>
              {t('Libros y servicios', 'Books and services')}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              {services.map((i) => {
                const name = lang === 'en' && i.nameEn ? i.nameEn : i.name;
                const desc = stripRichTextToPlain((lang === 'en' && i.descriptionEn ? i.descriptionEn : i.description) ?? '');
                return (
                  <div key={i.id} style={{ border: '1px solid #CFC6B6', padding: 26, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {i.category && <span style={{ fontFamily: FONT.mono, fontSize: 14, color: accent }}>{i.category}</span>}
                    <span style={{ fontFamily: FONT.display, fontSize: 26 }}>{name}</span>
                    {desc && <span style={{ fontSize: 15, lineHeight: 1.6, color: CW.paperText }}>{desc}</span>}
                    {typeof i.price === 'number' && i.price > 0 && (
                      sells ? (
                        <button
                          type="button"
                          onClick={() => addToCart({ id: i.id, name, price: i.price as number, image: i.imageUrl ?? i.image_url ?? undefined })}
                          style={{ marginTop: 'auto', background: CW.night, color: CW.paper, font: `16px ${FONT.body}`, border: 0, padding: 13, borderRadius: 2, cursor: 'pointer' }}
                        >
                          {formatMoney(i.price, currency, lang)} · {t('Añadir', 'Add')}
                        </button>
                      ) : (
                        <span style={{ marginTop: 'auto', fontFamily: FONT.mono, fontSize: 15 }}>{formatMoney(i.price, currency, lang)}</span>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Membresía ───────────────────────────────────────────── */}
      {price && (
        <section id="membresia" style={{ ...wrap, ...twoCols, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <span style={{ ...monoNote, color: CW.gold }}>{t('membresía', 'membership')}</span>
            <h2 style={{ margin: 0, fontFamily: FONT.display, fontWeight: 400, fontSize: 'clamp(34px, 4vw, 48px)', lineHeight: 1.1 }}>
              {price} <span style={{ fontSize: '0.55em', color: CW.muted }}>{t('al mes', 'a month')}</span>
            </h2>
            {benefits && (
              <div className="cw-prose" style={{ fontSize: 18, lineHeight: 1.7, color: CW.muted }} dangerouslySetInnerHTML={{ __html: sanitizeRichText(benefits) }} />
            )}
          </div>
          <div style={{ border: `2px solid ${accent}`, padding: 32, display: 'flex', flexDirection: 'column', gap: 16, background: CW.paper, color: CW.ink }}>
            <MembershipButton slug={business.slug} lang={lang} accent={accent} signedIn={signedIn} />
            {!signedIn && (
              <Link href={authorHref(business.slug, '/lectores')} style={{ fontFamily: FONT.mono, fontSize: 14, color: CW.paperFaint }}>
                {t('¿ya eres miembro? entra', 'already a member? sign in')}
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ── Cartas por correo ───────────────────────────────────── */}
      {club?.lettersEnabled && (
        <section id="cartas" style={{ background: CW.paper, color: CW.ink }}>
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '104px 24px', display: 'flex', flexDirection: 'column', gap: 22, textAlign: 'center', alignItems: 'center' }}>
            {business.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={business.logo_url} alt="" width={88} height={88} style={{ width: 88, height: 88, objectFit: 'contain' }} />
            )}
            <span style={{ ...monoNote, color: accent }}>{t('cartas por correo', 'letters by email')}</span>
            <h2 style={{ margin: 0, fontFamily: FONT.display, fontWeight: 400, fontStyle: 'italic', fontSize: 'clamp(32px, 4vw, 44px)' }}>
              {t(`Cartas desde ${business.name}`, `Letters from ${business.name}`)}
            </h2>
            {pitch && <p style={{ margin: 0, fontSize: 18, lineHeight: 1.7, color: CW.paperText }}>{pitch}</p>}
            <SubscribeForm slug={business.slug} lang={lang} accent={accent} />
          </div>
        </section>
      )}

      <CreatorFooter author={author} lang={lang} />

      {sells && (
        <WhatsAppCart
          cart={cart}
          clearCart={clearCart}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          cartTotal={cartTotal}
          cartCount={cartCount}
          whatsappNumber={waDigits ?? ''}
          businessName={business.name}
          slug={business.slug}
          currency={currency}
          onlinePayments={onlinePayments}
          pickupNewCustomerLimit={capabilities.pickupNewCustomerLimit ?? null}
          shippingMethods={capabilities.shippingMethods}
          taxRate={(capabilities.salesTaxRate ?? 0) / 100}
          taxOnShipping={capabilities.salesTaxOnShipping !== false}
          taxState={capabilities.salesTaxState ?? null}
          ordersPaused={business.ordersEnabled === false}
          pickupOrders
          getText={t}
          isOpen={cartOpen}
          onOpenChange={setCartOpen}
        />
      )}
    </CreatorRoot>
  );
}

function FeaturedWork({ work, slug, lang, accent }: { work: PublicWorkSummary; slug: string; lang: 'es' | 'en'; accent: string }) {
  const t = (es: string, en: string) => (lang === 'es' ? es : en);
  const synopsis = workSynopsis(work, lang);
  const kicker = [kindLabel(work.kind, lang), work.imprint, work.year].filter(Boolean).join(' · ');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <span style={{ ...monoNote, color: accent }}>{kicker}</span>
      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {workCover(work, lang) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={workCover(work, lang)!} alt="" style={{ width: 150, height: 'auto', boxShadow: '0 18px 40px rgba(20,19,24,.25)' }} />
        )}
        <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ margin: 0, fontFamily: FONT.display, fontWeight: 400, fontSize: 'clamp(40px, 5vw, 52px)', lineHeight: 1.05 }}>{workTitle(work, lang)}</h2>
          {work.subtitle && <span style={{ fontStyle: 'italic', fontSize: 18, color: CW.paperText }}>{work.subtitle}</span>}
        </div>
      </div>
      {synopsis && (
        <div className="cw-prose" style={{ fontSize: 18, lineHeight: 1.75, color: CW.paperText }} dangerouslySetInnerHTML={{ __html: sanitizeRichText(synopsis) }} />
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {work.readableNow !== 'none' && (
          <Link href={authorHref(slug, `/obras/${work.slug}`)} className="cw-btn" style={{ background: accent, color: '#FFFFFF' }}>
            {work.readableNow === 'full' ? t('Leer la obra', 'Read the work') : t('Leer el comienzo', 'Read the opening')}
          </Link>
        )}
        {work.buyLinks.map((l) => (
          <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="cw-btn" style={{ border: `1px solid ${CW.ink}`, color: CW.ink }}>
            {l.label}
          </a>
        ))}
        {work.readableNow === 'none' && work.buyLinks.length === 0 && (
          <Link href={authorHref(slug, `/obras/${work.slug}`)} className="cw-btn" style={{ border: `1px solid ${CW.ink}`, color: CW.ink }}>
            {t('Ver la obra', 'See the work')}
          </Link>
        )}
      </div>
      {work.freeUntil && (
        <span style={{ fontFamily: FONT.mono, fontSize: 14, color: CW.paperFaint }}>{readableLabel(work, lang)}</span>
      )}
    </div>
  );
}
