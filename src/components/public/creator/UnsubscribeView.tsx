'use client';
// src/components/public/creator/UnsubscribeView.tsx — confirmar la baja de las cartas con un clic.
import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import type { CreatorAuthor } from '@/lib/creator';
import { CreatorRoot, CW, FONT, creatorAccent } from './theme';
import { CreatorFooter, CreatorNav, authorHref } from './CreatorChrome';

export function UnsubscribeView({ author, token }: { author: CreatorAuthor; token: string }) {
  const { language } = useSimpleLanguage();
  const lang: 'es' | 'en' = language === 'es' ? 'es' : 'en';
  const t = (es: string, en: string) => (lang === 'es' ? es : en);
  const accent = creatorAccent(author.primaryColor);
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>(token ? 'idle' : 'error');
  const [stillMember, setStillMember] = useState(false);

  async function confirm() {
    setState('busy');
    try {
      const res = await fetch(`/api/readers/${encodeURIComponent(author.slug)}/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error();
      setStillMember(data?.stillMember === true);
      setState('done');
    } catch {
      setState('error');
    }
  }

  return (
    <CreatorRoot accent={accent}>
      <CreatorNav author={author} lang={lang} />
      <main style={{ background: CW.paper, color: CW.ink }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '88px 24px 112px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <h1 style={{ margin: 0, fontFamily: FONT.display, fontStyle: 'italic', fontWeight: 400, fontSize: 40 }}>{t('Dejar de recibir las cartas', 'Stop receiving the letters')}</h1>
          {state === 'done' ? (
            <p role="status" style={{ margin: 0, fontSize: 18, lineHeight: 1.7 }}>
              {stillMember
                ? t('Listo, ya no te llegan las cartas. Tu membresía sigue igual.', 'Done, the letters will stop. Your membership stays as it is.')
                : t('Listo, ya no te llegan las cartas.', 'Done, the letters will stop.')}
            </p>
          ) : state === 'error' ? (
            <p role="alert" style={{ margin: 0, fontSize: 18 }}>{t('Ese enlace no es válido. Usa el enlace del último correo que te llegó.', 'That link is not valid. Use the link in the latest email you received.')}</p>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: 18, lineHeight: 1.7, color: CW.paperText }}>{t('Confirma y no te mandamos más cartas.', "Confirm and we won't send you more letters.")}</p>
              <button type="button" onClick={confirm} disabled={state === 'busy'} className="cw-btn" style={{ alignSelf: 'flex-start', background: CW.ink, color: CW.paper, border: 0, cursor: 'pointer', fontFamily: FONT.body }}>
                {state === 'busy' ? t('Un momento…', 'One moment…') : t('Sí, darme de baja', 'Yes, unsubscribe me')}
              </button>
            </>
          )}
          <a href={authorHref(author.slug)} style={{ fontFamily: FONT.mono, fontSize: 14, color: CW.paperFaint }}>← {author.name}</a>
        </div>
      </main>
      <CreatorFooter author={author} lang={lang} />
    </CreatorRoot>
  );
}
