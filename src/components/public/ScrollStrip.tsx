'use client';

// Franja horizontal con scroll y flechas ‹ › (solo en dispositivos con mouse; en el celular se
// desliza con el dedo). Las flechas se ocultan cuando ya no hay más contenido hacia ese lado.

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

export function ScrollStrip({
  children,
  language = 'es',
  bleed = 24,
  gap = 12,
}: {
  children: ReactNode;
  language?: 'es' | 'en';
  /** Cuánto "sangra" la franja hacia los lados (px) para que las tarjetas lleguen al borde. */
  bleed?: number;
  gap?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update, children]);

  const scrollBy = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.8), behavior: 'smooth' });
  };

  const arrow = (dir: -1 | 1, visible: boolean) =>
    visible ? (
      <button
        type="button"
        className="ss-arrow"
        onClick={() => scrollBy(dir)}
        aria-label={dir === -1 ? (language === 'es' ? 'Anterior' : 'Previous') : language === 'es' ? 'Siguiente' : 'Next'}
        style={{
          position: 'absolute',
          top: '50%',
          [dir === -1 ? 'left' : 'right']: 4,
          transform: 'translateY(-50%)',
          zIndex: 2,
          width: 40,
          height: 40,
          borderRadius: 9999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          fontSize: 22,
          lineHeight: 1,
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {dir === -1 ? '‹' : '›'}
      </button>
    ) : null;

  return (
    <div style={{ position: 'relative', margin: `0 -${bleed}px` }}>
      <style>{`.ss-arrow{display:none;border:1px solid rgba(0,0,0,0.08);background:#ffffff;color:#1f1a14}@media (hover:hover){.ss-arrow{display:flex}}[data-theme="dark"] .ss-arrow{border-color:rgba(255,255,255,0.14);background:#2a2723;color:#ece8e0}`}</style>
      <div
        ref={ref}
        style={{
          display: 'flex',
          gap,
          overflowX: 'auto',
          scrollSnapType: 'x proximity',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          padding: `2px ${bleed}px 6px`,
        }}
      >
        {children}
      </div>
      {arrow(-1, canLeft)}
      {arrow(1, canRight)}
    </div>
  );
}
