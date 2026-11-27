'use client';
// src/components/public/creator/ReaderView.tsx — lector de un capítulo (ver app/[slug]/obras/[work]/[capitulo]).
// Papel claro, columna estrecha, tamaño de letra ajustable y barra de avance. El lugar guardado y el tamaño
// viven en localStorage del visitante (conveniencia por navegador, con try/catch: puede no existir).
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { readingMinutes, type CreatorAuthor, type PublicWorkChapter } from '@/lib/creator';
import { CreatorRoot, CW, FONT, creatorAccent } from './theme';
import { authorHref } from './CreatorChrome';
import { saveProgress } from './ReaderForms';

const SIZES = [17, 19, 21, 23] as const;
const SIZE_KEY = 'cw-reader-size';

function readStore(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function writeStore(key: string, value: string) {
  try { window.localStorage.setItem(key, value); } catch { /* navegador sin almacenamiento */ }
}

export function ReaderView({ author, chapter, html, signedIn }: { author: CreatorAuthor; chapter: PublicWorkChapter; html: string; signedIn: boolean }) {
  const { language } = useSimpleLanguage();
  const lang: 'es' | 'en' = language === 'es' ? 'es' : 'en';
  const t = (es: string, en: string) => (lang === 'es' ? es : en);
  const accent = creatorAccent(author.primaryColor);
  const [sizeIdx, setSizeIdx] = useState(1);
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState(!!chapter.contentNotice);

  const placeKey = `cw-place:${author.slug}:${chapter.workSlug}`;
  const workHref = authorHref(author.slug, `/obras/${chapter.workSlug}`);

  useEffect(() => {
    const saved = Number(readStore(SIZE_KEY));
    if (Number.isInteger(saved) && saved >= 0 && saved < SIZES.length) setSizeIdx(saved);
    // Recordar el último capítulo abierto de esta obra (para "seguir leyendo" en la ficha más adelante).
    writeStore(placeKey, String(chapter.number));
    // Con sesión de lector, el lugar también queda en el servidor (sigue en otro dispositivo).
    if (signedIn) void saveProgress(author.slug, chapter.workSlug, chapter.number);
    if (readStore(`cw-notice:${author.slug}:${chapter.workSlug}`) === '1') setNotice(false);
  }, [placeKey, chapter.number, author.slug, chapter.workSlug, signedIn]);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 1);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const changeSize = (delta: number) => {
    setSizeIdx((i) => {
      const next = Math.max(0, Math.min(SIZES.length - 1, i + delta));
      writeStore(SIZE_KEY, String(next));
      return next;
    });
  };

  const acceptNotice = () => {
    writeStore(`cw-notice:${author.slug}:${chapter.workSlug}`, '1');
    setNotice(false);
  };

  const btn = { minHeight: 44, minWidth: 44, border: 0, background: 'transparent', color: CW.paper, cursor: 'pointer', fontFamily: FONT.display, fontSize: 18 } as const;

  return (
    <CreatorRoot accent={accent}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: CW.night }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Link href={workHref} style={{ fontFamily: FONT.mono, fontSize: 15, color: CW.textSoft, textDecoration: 'none', padding: '12px 4px' }}>
            ← {chapter.workTitle}
          </Link>
          <div role="group" aria-label={t('Tamaño de letra', 'Text size')} style={{ display: 'flex' }}>
            <button type="button" onClick={() => changeSize(-1)} disabled={sizeIdx === 0} aria-label={t('Letra más pequeña', 'Smaller text')} style={{ ...btn, fontSize: 15, opacity: sizeIdx === 0 ? 0.4 : 1 }}>A</button>
            <button type="button" onClick={() => changeSize(1)} disabled={sizeIdx === SIZES.length - 1} aria-label={t('Letra más grande', 'Larger text')} style={{ ...btn, fontSize: 21, opacity: sizeIdx === SIZES.length - 1 ? 0.4 : 1 }}>A</button>
          </div>
        </div>
        <div style={{ height: 3, background: '#2E2B34' }} aria-hidden>
          <div style={{ width: `${Math.round(progress * 100)}%`, height: 3, background: accent, transition: 'width .1s linear' }} />
        </div>
      </div>

      <main style={{ background: CW.paper, color: CW.ink, minHeight: 'calc(100vh - 59px)' }}>
        <article style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px 72px' }}>
          <div style={{ padding: '10px 0', borderTop: '1px solid #CFC6B6', borderBottom: '1px solid #CFC6B6', fontFamily: FONT.mono, fontSize: 13, color: CW.paperText, display: 'flex', justifyContent: 'space-between' }}>
            <span>{t('capítulo', 'chapter')} {chapter.number}</span>
            <span>{readingMinutes(chapter.wordCount)} min</span>
          </div>
          <h1 style={{ margin: '36px 0 20px', fontFamily: FONT.display, fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(32px, 5vw, 42px)', lineHeight: 1.15 }}>{chapter.title}</h1>
          <div style={{ height: 1, width: 48, background: accent, marginBottom: 32 }} />

          {notice ? (
            <div role="note" style={{ border: `1px solid ${CW.paperLine}`, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <span style={{ fontFamily: FONT.mono, fontSize: 14, color: accent }}>{t('aviso del autor', "author's note")}</span>
              <p style={{ margin: 0, fontSize: 18, lineHeight: 1.7, color: CW.paperText }}>{chapter.contentNotice}</p>
              <button type="button" onClick={acceptNotice} className="cw-btn" style={{ alignSelf: 'flex-start', background: CW.ink, color: CW.paper, border: 0, cursor: 'pointer', fontFamily: FONT.body }}>
                {t('Seguir leyendo', 'Continue reading')}
              </button>
            </div>
          ) : (
            <div
              className="cw-prose"
              style={{ fontSize: SIZES[sizeIdx], lineHeight: 1.8, color: '#2A272E', hyphens: 'auto', overflowWrap: 'break-word' }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}

          <nav aria-label={t('Capítulos', 'Chapters')} style={{ marginTop: 56, paddingTop: 24, borderTop: '1px solid #CFC6B6', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            {chapter.prevNumber ? (
              <Link href={`${workHref}/${chapter.prevNumber}`} className="cw-btn" style={{ border: `1px solid ${CW.ink}`, color: CW.ink }}>← {t('Anterior', 'Previous')}</Link>
            ) : <span />}
            {chapter.nextNumber ? (
              <Link href={`${workHref}/${chapter.nextNumber}`} className="cw-btn" style={{ background: accent, color: '#FFFFFF' }}>{t('Siguiente', 'Next')} →</Link>
            ) : (
              <Link href={workHref} className="cw-btn" style={{ background: CW.ink, color: CW.paper }}>{t('Volver a la obra', 'Back to the work')}</Link>
            )}
          </nav>
        </article>
      </main>
    </CreatorRoot>
  );
}
