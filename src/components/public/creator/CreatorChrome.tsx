'use client';
// src/components/public/creator/CreatorChrome.tsx
// Barra y pie del espacio de autor. Sin "Powered by MaalCa": el autor es la cara de su espacio.
import Link from 'next/link';
import { SOCIAL_ICON_BY_TIPO } from '@/components/public/SocialIcons';
import SimpleLanguageToggle from '@/components/ui/SimpleLanguageToggle';
import { resolveSocialLinks, type PublicCanal } from '@/lib/public-contact';
import { trackCanalClick } from '@/lib/public-events';
import { CW, FONT } from './theme';

/** Rutas del espacio del autor. Hoy viven bajo maalca.com/{slug}; con dominio propio cambia solo aquí. */
export function authorHref(slug: string, path = ''): string {
  return `/${slug}${path}`;
}

interface ChromeAuthor {
  slug: string;
  name: string;
  logoUrl?: string | null;
  contactEmail?: string | null;
  canales?: PublicCanal[];
}

/** showLibrary: la portada lo apaga si no hay nada para leer (no hay sección #biblioteca a la que saltar). */
export function CreatorNav({ author, lang, showLibrary = true }: { author: ChromeAuthor; lang: 'es' | 'en'; showLibrary?: boolean }) {
  const t = (es: string, en: string) => (lang === 'es' ? es : en);
  return (
    <header style={{ borderBottom: `1px solid ${CW.line}` }}>
      <nav
        aria-label={t('Principal', 'Main')}
        style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
      >
        <Link
          href={authorHref(author.slug)}
          style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT.display, fontSize: 26, color: CW.text, textDecoration: 'none' }}
        >
          {author.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={author.logoUrl} alt="" width={40} height={40} style={{ width: 40, height: 40, objectFit: 'contain' }} />
          )}
          {author.name}
        </Link>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24, fontFamily: FONT.mono, fontSize: 15 }}>
          <Link href={authorHref(author.slug, '#obras')} style={{ color: CW.textSoft, textDecoration: 'none' }}>{t('obras', 'works')}</Link>
          {showLibrary && (
            <Link href={authorHref(author.slug, '#biblioteca')} style={{ color: CW.textSoft, textDecoration: 'none' }}>{t('biblioteca', 'library')}</Link>
          )}
          <Link href={authorHref(author.slug, '/lectores')} style={{ color: CW.textSoft, textDecoration: 'none' }}>{t('lectores', 'readers')}</Link>
          {author.contactEmail && (
            <a href={`mailto:${author.contactEmail}`} style={{ color: CW.textSoft, textDecoration: 'none' }}>{t('contacto', 'contact')}</a>
          )}
          <SimpleLanguageToggle variant="dark" />
        </div>
      </nav>
    </header>
  );
}

export function CreatorFooter({ author, lang }: { author: ChromeAuthor; lang: 'es' | 'en' }) {
  const social = resolveSocialLinks(author);
  const year = new Date().getFullYear();
  return (
    <footer style={{ borderTop: `1px solid ${CW.line}` }}>
      <div
        style={{ maxWidth: 1200, margin: '0 auto', padding: '44px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 24, fontFamily: FONT.mono, fontSize: 14, color: CW.muted }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT.display, fontSize: 22, color: CW.text }}>
          {author.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={author.logoUrl} alt="" width={32} height={32} style={{ width: 32, height: 32, objectFit: 'contain' }} />
          )}
          {author.name}
        </span>
        {social.length > 0 && (
          <div style={{ display: 'flex', gap: 18 }}>
            {social.map((s) => {
              const Icon = SOCIAL_ICON_BY_TIPO[s.tipo];
              return (
                <a
                  key={s.tipo}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.tipo}
                  onClick={() => trackCanalClick(author.slug, s.tipo, s.canalId)}
                  style={{ color: CW.textSoft, display: 'inline-flex', padding: 6 }}
                >
                  {Icon ? <Icon size={18} /> : s.tipo}
                </a>
              );
            })}
          </div>
        )}
        <span>© {year} {author.name}{lang === 'es' ? '. Todos los derechos reservados.' : '. All rights reserved.'}</span>
      </div>
    </footer>
  );
}
