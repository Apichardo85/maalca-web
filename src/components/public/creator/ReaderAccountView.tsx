'use client';
// src/components/public/creator/ReaderAccountView.tsx — vista de /[slug]/lectores (ver la page).
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { sanitizeRichText } from '@/lib/sanitize-html';
import { formatMoney, type CreatorAuthor, type PublicReaderClub, type ReaderMe } from '@/lib/creator';
import { CreatorRoot, CW, FONT, creatorAccent, monoNote } from './theme';
import { CreatorFooter, CreatorNav, authorHref } from './CreatorChrome';
import { LoginForm, MembershipButton, SubscribeForm, logout, openPortal } from './ReaderForms';

const FLASH: Record<string, { es: string; en: string; tone: 'ok' | 'warn' }> = {
  confirmado: { es: 'Confirmado. Ya estás en la lista de las cartas.', en: "Confirmed. You're on the list for the letters.", tone: 'ok' },
  entraste: { es: 'Entraste. Bienvenido de vuelta.', en: "You're in. Welcome back.", tone: 'ok' },
  miembro: { es: 'Tu membresía está activa. Ya puedes leer todo lo de miembros.', en: 'Your membership is active. You can read everything for members.', tone: 'ok' },
  miembro_entrar: { es: 'Tu membresía está activa. Entra con tu correo para leer.', en: 'Your membership is active. Sign in with your email to read.', tone: 'ok' },
  pago_pendiente: { es: 'El pago todavía no se confirma. Si ya pagaste, en unos minutos queda activo.', en: "The payment isn't confirmed yet. If you paid, it will be active in a few minutes.", tone: 'warn' },
  cancelada: { es: 'No se completó el pago. Puedes intentarlo cuando quieras.', en: "The payment wasn't completed. You can try again anytime.", tone: 'warn' },
  enlace: { es: 'Ese enlace ya se usó o no es válido. Pide otro abajo.', en: 'That link was already used or is not valid. Ask for a new one below.', tone: 'warn' },
  vencido: { es: 'Ese enlace venció. Pide otro abajo.', en: 'That link expired. Ask for a new one below.', tone: 'warn' },
};

export function ReaderAccountView({ author, club, me, flash }: { author: CreatorAuthor; club: PublicReaderClub | null; me: ReaderMe | null; flash: string | null }) {
  const { language } = useSimpleLanguage();
  const lang: 'es' | 'en' = language === 'es' ? 'es' : 'en';
  const t = (es: string, en: string) => (lang === 'es' ? es : en);
  const router = useRouter();
  const accent = creatorAccent(author.primaryColor);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const f = flash ? FLASH[flash] : null;

  const benefits = lang === 'en' && club?.benefitsEn ? club.benefitsEn : club?.benefits;
  const pitch = lang === 'en' && club?.lettersPitchEn ? club.lettersPitchEn : club?.lettersPitch;
  const price = club?.membershipAvailable && club.monthlyPrice ? formatMoney(club.monthlyPrice, club.currency, lang) : null;

  async function manage() {
    setBusy(true);
    const url = await openPortal(author.slug);
    if (url) window.location.href = url;
    else {
      setBusy(false);
      setError(t('No pudimos abrir el portal de pago.', "We couldn't open the billing portal."));
    }
  }

  async function signOut() {
    await logout(author.slug);
    router.refresh();
  }

  const card = { border: `1px solid ${CW.paperLine}`, padding: 28, display: 'flex', flexDirection: 'column', gap: 16 } as const;

  return (
    <CreatorRoot accent={accent}>
      <CreatorNav author={author} lang={lang} />
      <main style={{ background: CW.paper, color: CW.ink }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '72px 24px 96px', display: 'flex', flexDirection: 'column', gap: 28 }}>
          <span style={{ ...monoNote, color: accent }}>{t('lectores', 'readers')}</span>
          <h1 style={{ margin: 0, fontFamily: FONT.display, fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(36px, 5vw, 48px)' }}>
            {me ? t('Tu lugar aquí', 'Your place here') : t('Entra o súmate', 'Sign in or join')}
          </h1>

          {f && (
            <p role="status" style={{ margin: 0, padding: '14px 18px', fontSize: 17, background: f.tone === 'ok' ? '#E3EEE5' : '#F4E4DC', color: CW.ink }}>
              {f[lang]}
            </p>
          )}

          {me ? (
            <>
              <section style={card}>
                <span style={{ fontFamily: FONT.mono, fontSize: 14, color: CW.paperFaint }}>{me.email}</span>
                <p style={{ margin: 0, fontSize: 18 }}>
                  {me.lettersOptIn && me.status === 'confirmed'
                    ? t('Recibes las cartas por correo.', 'You receive the letters by email.')
                    : t('No estás recibiendo las cartas.', "You're not receiving the letters.")}
                </p>
                {!me.lettersOptIn && club?.lettersEnabled && (
                  <SubscribeForm slug={author.slug} lang={lang} accent={accent} cta={t('Volver a recibirlas', 'Get them again')} />
                )}
              </section>

              <section style={card}>
                <span style={{ ...monoNote, color: accent }}>{t('membresía', 'membership')}</span>
                {me.isMember ? (
                  <>
                    <p style={{ margin: 0, fontSize: 18 }}>
                      {me.membershipStatus === 'past_due'
                        ? t('Tu pago está atrasado. Actualiza la tarjeta para no perder el acceso.', 'Your payment is late. Update your card to keep access.')
                        : t('Eres miembro. Puedes leer todo lo de miembros.', "You're a member. You can read everything for members.")}
                    </p>
                    {me.membershipCurrentPeriodEnd && (
                      <span style={{ fontFamily: FONT.mono, fontSize: 14, color: CW.paperFaint }}>
                        {t('período pagado hasta', 'paid through')} {new Date(me.membershipCurrentPeriodEnd).toLocaleDateString(lang === 'es' ? 'es-DO' : 'en-US')}
                      </span>
                    )}
                    <button type="button" onClick={manage} disabled={busy} className="cw-btn" style={{ alignSelf: 'flex-start', border: `1px solid ${CW.ink}`, background: 'transparent', color: CW.ink, cursor: 'pointer', fontFamily: FONT.body }}>
                      {t('Gestionar pago o cancelar', 'Manage payment or cancel')}
                    </button>
                    {error && <p role="alert" style={{ margin: 0, color: '#8E0F10' }}>{error}</p>}
                  </>
                ) : price ? (
                  <>
                    <p style={{ margin: 0, fontSize: 18 }}>{price} {t('al mes', 'a month')}</p>
                    {benefits && <div className="cw-prose" style={{ fontSize: 17, lineHeight: 1.7, color: CW.paperText }} dangerouslySetInnerHTML={{ __html: sanitizeRichText(benefits) }} />}
                    <MembershipButton slug={author.slug} lang={lang} accent={accent} signedIn />
                  </>
                ) : (
                  <p style={{ margin: 0, fontSize: 17, color: CW.paperText }}>{t('Este autor no ofrece membresía por ahora.', "This author doesn't offer a membership right now.")}</p>
                )}
              </section>

              <button type="button" onClick={signOut} style={{ alignSelf: 'flex-start', background: 'none', border: 0, padding: 0, fontFamily: FONT.mono, fontSize: 14, color: CW.paperFaint, cursor: 'pointer', textDecoration: 'underline' }}>
                {t('salir', 'sign out')}
              </button>
            </>
          ) : (
            <>
              <section style={card}>
                <h2 style={{ margin: 0, fontFamily: FONT.display, fontWeight: 400, fontSize: 28 }}>{t('Entrar', 'Sign in')}</h2>
                <p style={{ margin: 0, fontSize: 17, color: CW.paperText }}>{t('Sin contraseña: te mandamos un enlace a tu correo.', 'No password: we email you a link.')}</p>
                <LoginForm slug={author.slug} lang={lang} accent={accent} />
              </section>

              {club?.lettersEnabled && (
                <section style={card}>
                  <h2 style={{ margin: 0, fontFamily: FONT.display, fontWeight: 400, fontSize: 28 }}>{t('Las cartas', 'The letters')}</h2>
                  {pitch && <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: CW.paperText }}>{pitch}</p>}
                  <SubscribeForm slug={author.slug} lang={lang} accent={accent} />
                </section>
              )}

              {price && (
                <section style={{ ...card, border: `2px solid ${accent}` }}>
                  <h2 style={{ margin: 0, fontFamily: FONT.display, fontWeight: 400, fontSize: 28 }}>{t('Membresía', 'Membership')} · {price} {t('al mes', 'a month')}</h2>
                  {benefits && <div className="cw-prose" style={{ fontSize: 17, lineHeight: 1.7, color: CW.paperText }} dangerouslySetInnerHTML={{ __html: sanitizeRichText(benefits) }} />}
                  <MembershipButton slug={author.slug} lang={lang} accent={accent} signedIn={false} />
                </section>
              )}
            </>
          )}

          <a href={authorHref(author.slug)} style={{ fontFamily: FONT.mono, fontSize: 14, color: CW.paperFaint }}>← {author.name}</a>
        </div>
      </main>
      <CreatorFooter author={author} lang={lang} />
    </CreatorRoot>
  );
}
