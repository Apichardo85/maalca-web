'use client';
// src/components/public/creator/WorkView.tsx — ficha pública de una obra (ver app/[slug]/obras/[work]).
import Link from 'next/link';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { sanitizeRichText } from '@/lib/sanitize-html';
import { kindLabel, readableLabel, readingMinutes, workSynopsis, workTitle, type CreatorAuthor, type PublicWork } from '@/lib/creator';
import { CreatorRoot, CW, FONT, creatorAccent, monoNote } from './theme';
import { CreatorFooter, CreatorNav, authorHref } from './CreatorChrome';

export function WorkView({ author, data }: { author: CreatorAuthor; data: PublicWork }) {
  const { language } = useSimpleLanguage();
  const lang: 'es' | 'en' = language === 'es' ? 'es' : 'en';
  const t = (es: string, en: string) => (lang === 'es' ? es : en);
  const accent = creatorAccent(author.primaryColor);
  const { work, chapters } = data;
  const synopsis = workSynopsis(work, lang);
  const firstReadable = chapters.find((c) => c.readable);
  const kicker = [kindLabel(work.kind, lang), work.imprint, work.year].filter(Boolean).join(' · ');

  return (
    <CreatorRoot accent={accent}>
      <CreatorNav author={author} lang={lang} />

      <section style={{ background: CW.paper, color: CW.ink }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 24px 96px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 56, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <Link href={authorHref(author.slug, '#obras')} style={{ ...monoNote, fontSize: 14, color: CW.paperFaint, textDecoration: 'none' }}>
              ← {t('obras', 'works')}
            </Link>
            <span style={{ ...monoNote, color: accent }}>{kicker}</span>
            <h1 style={{ margin: 0, fontFamily: FONT.display, fontWeight: 400, fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: 1.04 }}>{workTitle(work, lang)}</h1>
            {work.subtitle && <span style={{ fontStyle: 'italic', fontSize: 20, color: CW.paperText }}>{work.subtitle}</span>}
            {synopsis && (
              <div className="cw-prose" style={{ fontSize: 18, lineHeight: 1.75, color: CW.paperText }} dangerouslySetInnerHTML={{ __html: sanitizeRichText(synopsis) }} />
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {firstReadable && (
                <Link href={authorHref(author.slug, `/obras/${work.slug}/${firstReadable.number}`)} className="cw-btn" style={{ background: accent, color: '#FFFFFF' }}>
                  {t('Empezar a leer', 'Start reading')}
                </Link>
              )}
              {work.buyLinks.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="cw-btn" style={{ border: `1px solid ${CW.ink}`, color: CW.ink }}>
                  {l.label}
                </a>
              ))}
            </div>
            <span style={{ fontFamily: FONT.mono, fontSize: 14, color: CW.paperFaint }}>
              {[readableLabel(work, lang), data.isbn ? `ISBN ${data.isbn}` : null].filter(Boolean).join(' · ')}
            </span>
          </div>
          {work.coverUrl && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={work.coverUrl} alt={workTitle(work, lang)} style={{ width: '100%', maxWidth: 360, height: 'auto', boxShadow: '0 24px 60px rgba(20,19,24,.28)' }} />
            </div>
          )}
        </div>
      </section>

      {chapters.length > 0 && (
        <section style={{ maxWidth: 860, margin: '0 auto', padding: '88px 24px 104px' }}>
          <span style={{ ...monoNote, color: CW.gold }}>{t('índice', 'contents')}</span>
          <ol style={{ listStyle: 'none', margin: '20px 0 0', padding: 0 }}>
            {chapters.map((c) => {
              const row = (
                <>
                  <span style={{ display: 'flex', gap: 18, alignItems: 'baseline' }}>
                    <span style={{ fontFamily: FONT.mono, fontSize: 14, color: CW.muted, minWidth: 28 }}>{c.number}</span>
                    <span style={{ fontFamily: FONT.display, fontStyle: 'italic', fontSize: 22, color: c.readable ? CW.text : CW.muted }}>{c.title}</span>
                  </span>
                  <span style={{ fontFamily: FONT.mono, fontSize: 13, color: c.readable ? CW.open : CW.locked, whiteSpace: 'nowrap' }}>
                    {c.readable ? `${readingMinutes(c.wordCount)} min` : t('en el libro', 'in the book')}
                  </span>
                </>
              );
              const style = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, padding: '18px 0', borderBottom: `1px solid ${CW.lineSoft}`, textDecoration: 'none' } as const;
              return (
                <li key={c.number}>
                  {c.readable ? (
                    <Link href={authorHref(author.slug, `/obras/${work.slug}/${c.number}`)} style={style}>{row}</Link>
                  ) : (
                    <div style={style} aria-label={`${c.title} — ${t('no disponible para leer aquí', 'not available to read here')}`}>{row}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <CreatorFooter author={author} lang={lang} />
    </CreatorRoot>
  );
}
