'use client';
// src/components/public/ClampedDescription.tsx
// Shared "2 lines + Ver más/Ver menos" description block used by all public
// templates' item cards (Restaurant, Barber, Retail). Each template used to
// carry its own copy of this clamp/expand logic (own useState/useRef/
// useEffect), which is how Barber ended up missing the long-word overflow
// fix that Restaurant had — the four copies had already started to diverge.
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

export function ClampedDescription({
  text,
  language,
  textStyle,
  buttonColor,
  buttonStyle,
}: {
  text: string;
  language: 'es' | 'en';
  textStyle?: CSSProperties;
  buttonColor: string;
  buttonStyle?: CSSProperties;
}) {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) setIsClamped(el.scrollHeight > el.clientHeight + 1);
  }, [text]);

  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  return (
    <>
      <p
        ref={ref}
        className={expanded ? undefined : 'line-clamp-2'}
        style={{ overflowWrap: 'break-word', wordBreak: 'break-word', ...textStyle }}
      >
        {text}
      </p>
      {isClamped && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            marginTop: '2px',
            padding: 0,
            border: 'none',
            background: 'none',
            fontWeight: 600,
            color: buttonColor,
            cursor: 'pointer',
            ...buttonStyle,
          }}
        >
          {expanded ? getText('Ver menos', 'Show less') : getText('Ver más', 'Show more')}
        </button>
      )}
    </>
  );
}
