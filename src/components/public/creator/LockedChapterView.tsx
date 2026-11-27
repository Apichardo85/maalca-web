'use client';
// src/components/public/creator/LockedChapterView.tsx — un capítulo que existe pero hoy no se puede leer aquí
// (fuera de la muestra, o solo para miembros). Quien llega por un enlace compartido ve qué es y cómo leerlo
// (comprar el libro, hacerse miembro o leer la muestra) en vez de un 404. El texto nunca viaja: el API no lo manda.
import Link from 'next/link';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { formatMoney, workTitle, type CreatorAuthor, type PublicReaderClub, type PublicWork, type PublicWorkChapterRef } from '@/lib/creator';
import { CreatorRoot, CW, FONT, creatorAccent, monoNote } from './theme';
import { CreatorFooter, CreatorNav, authorHref } from './CreatorChrome';
import { MembershipButton } from './ReaderForms';

export function LockedChapterView({ author, data, chapter, club, signedIn }: {
  author: CreatorAuthor;
  data: PublicWork;
  chapter: PublicWorkChapterRef;
  club: PublicReaderClub | null;
  signedIn: boolean;
}) {
  const { language } = useSimpleLanguage();
  const lang: 'es' | 'en' = language === 'es' ? 'es' : 'en';
  const t = (es: string, en: string) => (lang === 'es' ? es : en);
  const accent = creatorAccent(author.primaryColor);
  const { work, chapters } = data;
  const poem = work.kind === 'poetry';
  const firstReadable = chapters.find((c) => c.readable);
  const price = club?.membershipAvailable && club.monthlyPrice ? formatMoney(club.monthlyPrice, club.currency, lang) : null;
  const forMembers = chapter.membersOnly && price;

  const headline = forMembers
    ? poem ? t('Este poema es para los miembros', 'This poem is for members') : t('Este capítulo es para los miembros', 'This chapter is for members')
    : poem ? t('Este poema está en el libro', 'This poem is in the book') : t('Este capítulo está en el libro', 'This chapter is in the book');

  return (
    <CreatorRoot accent={accent}>
      <CreatorNav author={author} lang={lang} />

      <section style={{ background: CW.paper, color: CW.ink }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '88px 24px 104px', display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'center', textAlign: 'center' }}>
          <Link href={authorHref(author.slug, `/obras/${work.slug}`)} style={{ ...monoNote, fontSize: 14, color: CW.paperFaint, textDecoration: 'none' }}>
            ← {workTitle(work, lang)}
          </Link>
          <span style={{ ...monoNote, color: accent }}>{chapter.number}</span>
          <h1 style={{ margin: 0, fontFamily: FONT.display, fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.08 }}>{chapter.title}</h1>
          <p style={{ margin: 0, fontSize: 19, lineHeight: 1.7, color: CW.paperText }}>{headline}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {forMembers ? (
              <MembershipButton slug={author.slug} lang={lang} accent={accent} signedIn={signedIn} />
            ) : (
              work.buyLinks.map((l, i) => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="cw-btn" style={i === 0 ? { background: accent, color: '#FFFFFF' } : { border: `1px solid ${CW.ink}`, color: CW.ink }}>
                  {l.label}
                </a>
              ))
            )}
            {firstReadable && (
              <Link href={authorHref(author.slug, `/obras/${work.slug}/${firstReadable.number}`)} className="cw-btn" style={{ border: `1px solid ${CW.ink}`, color: CW.ink }}>
                {t('Leer la muestra gratis', 'Read the free sample')}
              </Link>
            )}
          </div>

          {forMembers && !signedIn && (
            <Link href={authorHref(author.slug, '/lectores')} style={{ fontFamily: FONT.mono, fontSize: 14, color: CW.paperFaint }}>
              {t('¿ya eres miembro? entra', 'already a member? sign in')}
            </Link>
          )}
        </div>
      </section>

      <CreatorFooter author={author} lang={lang} />
    </CreatorRoot>
  );
}
