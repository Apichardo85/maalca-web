// src/components/public/creator/theme.tsx
//
// Tema del espacio de autor (businessType 'creator'), dirección "La careta": noche (#141318) con secciones
// en papel (#F2EDE4), Bodoni Moda para títulos, Source Serif 4 para el texto y Courier Prime para las notas
// al margen. Es un override deliberado del tema global (como TLD o Pegote): el espacio de un autor tiene su
// propia piel y no sigue el sol/luna de la plataforma. El acento sale del color primario del negocio
// (Identidad); sin color, el rojo de la careta.
import localFont from 'next/font/local';
import type { CSSProperties, ReactNode } from 'react';

export const bodoni = localFont({
  src: [
    { path: '../../../fonts/bodoni-moda-latin-wght-normal.woff2', style: 'normal', weight: '400 900' },
    { path: '../../../fonts/bodoni-moda-latin-wght-italic.woff2', style: 'italic', weight: '400 900' },
  ],
  variable: '--font-cw-display',
  display: 'swap',
});

export const sourceSerif = localFont({
  src: [
    { path: '../../../fonts/source-serif-4-latin-wght-normal.woff2', style: 'normal', weight: '200 900' },
    { path: '../../../fonts/source-serif-4-latin-wght-italic.woff2', style: 'italic', weight: '200 900' },
  ],
  variable: '--font-cw-body',
  display: 'swap',
});

export const courierPrime = localFont({
  src: '../../../fonts/courier-prime-latin-400-normal.woff2',
  weight: '400',
  variable: '--font-cw-mono',
  display: 'swap',
});

export const CW = {
  night: '#141318',
  paper: '#F2EDE4',
  ink: '#1C1A20',
  text: '#F2EDE4',
  textSoft: '#D9D2C6',
  muted: '#B9B2A6',
  line: '#2A2830',
  lineSoft: '#2E2B34',
  gold: '#C9A97A',
  paperText: '#3A3640',
  paperFaint: '#5A5560',
  paperLine: '#D6CEC0',
  open: '#9FC7A8',
  locked: '#D99AA1',
  defaultAccent: '#8E0F10',
} as const;

export const FONT = {
  display: 'var(--font-cw-display), "Bodoni Moda", Georgia, serif',
  body: 'var(--font-cw-body), "Source Serif 4", Georgia, serif',
  mono: 'var(--font-cw-mono), "Courier Prime", ui-monospace, monospace',
} as const;

/** El acento solo se acepta como hex de 6 dígitos; cualquier otra cosa cae al rojo de la careta. */
export function creatorAccent(primary?: string | null): string {
  return primary && /^#[0-9a-f]{6}$/i.test(primary) ? primary : CW.defaultAccent;
}

export const monoNote: CSSProperties = { fontFamily: FONT.mono, fontSize: 15 };

/** Raíz de toda página del autor: fuentes, fondo de noche y el acento como variable. */
export function CreatorRoot({ accent, children }: { accent: string; children: ReactNode }) {
  return (
    <div
      className={`${bodoni.variable} ${sourceSerif.variable} ${courierPrime.variable} cw-root`}
      style={{
        fontFamily: FONT.body,
        color: CW.text,
        backgroundColor: CW.night,
        minHeight: '100vh',
        ['--cw-accent' as string]: accent,
      }}
    >
      <style>{`
.cw-root a{color:inherit}
.cw-root .cw-link{color:${CW.gold};text-decoration:none}
.cw-root .cw-link:hover{color:#E2C9A0}
.cw-root .cw-btn{display:inline-block;text-decoration:none;padding:15px 26px;border-radius:2px;font-size:16px;line-height:1.2;transition:opacity .15s}
.cw-root .cw-btn:hover{opacity:.88}
.cw-root .cw-prose p{margin:0 0 1.1em}
.cw-root .cw-prose h2,.cw-root .cw-prose h3{font-family:${FONT.display};font-weight:400;margin:1.6em 0 .6em}
.cw-root .cw-prose blockquote{margin:1.2em 0;padding-left:1em;border-left:2px solid var(--cw-accent);font-style:italic}
.cw-root .cw-prose em{font-style:italic}
.cw-root :focus-visible{outline:2px solid ${CW.gold};outline-offset:3px}
`}</style>
      {children}
    </div>
  );
}
