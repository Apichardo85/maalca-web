'use client';

import { useRef, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { resolveContactItems, resolveSocialLinks, type ResolvedSocialLink } from '@/lib/public-contact';
import { CONTACT_ICON_BY_TIPO } from '@/components/public/ContactIcons';
import { SOCIAL_ICON_BY_TIPO } from '@/components/public/SocialIcons';
import type { PublicTemplateProps } from '@/lib/templates/registry';
import { stripRichTextToPlain } from '@/lib/sanitize-html';
import { deriveBrandPalette } from '@/lib/brand-palette';

interface Props {
  business: PublicTemplateProps['business'];
  qrDataUrl: string;
}

// Instagram/TikTok handles read as "@handle" by convention; Facebook page slugs don't carry
// the @ prefix. resolveSocialLinks() only gives tipo/href/canalId (no handle field — it's
// meant for a plain icon link), so the readable part is pulled straight out of the URL path.
const HANDLE_PREFIX: Record<string, string> = { Instagram: '@', TikTok: '@' };

function socialHandle(link: ResolvedSocialLink): string {
  let path = '';
  try {
    path = new URL(link.href).pathname.replace(/^\/+|\/+$/g, '');
  } catch {
    path = link.href.replace(/^https?:\/\/(www\.)?[^/]+\/?/, '').replace(/\/+$/, '');
  }
  if (!path) return link.tipo;
  return `${HANDLE_PREFIX[link.tipo] ?? ''}${path}`;
}

export function BusinessCard({ business, qrDataUrl }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // Tarjeta de presentación es texto plano (imagen descargable) — el RichTextEditor de
  // Diseño guarda HTML, así que hay que despojarlo acá igual que en el vCard/meta tags.
  // Se omiten los encabezados (p. ej. "💫 Nosotros"): en 2 renglones de tarjeta aportan menos que el texto.
  const rawDescription = language === 'en' ? business.descriptionEn ?? business.description : business.description;
  const description =
    stripRichTextToPlain(rawDescription?.replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, '')) ||
    stripRichTextToPlain(rawDescription);
  const contacts = resolveContactItems(business, language);
  const social = resolveSocialLinks(business);
  // Tarjeta descargable = imagen fija en claro (no depende del tema del panel). Mismos 3 roles que las
  // plantillas públicas: secundario → cabecera, acento → franja/detalles, primario → botón y texto de marca.
  const pal = deriveBrandPalette(business.primary_color, business.secondary_color, business.accent_color);

  const download = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `tarjeta-${business.slug}.png`;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={cardRef}
        className="flex w-full max-w-xs flex-col overflow-hidden rounded-2xl shadow-sm"
        style={{ aspectRatio: '9 / 16', border: `1px solid ${pal.border}` }}
      >
        {/* Zone 1 — secondary (ink): logo + name + description, con franja del color de acento */}
        <div
          className="flex flex-col items-center gap-1 px-6 pt-6 pb-5 text-center"
          style={{ background: pal.ink, borderBottom: `4px solid ${pal.detail}` }}
        >
          {business.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logo_url}
              alt={business.name}
              width={64}
              height={64}
              className="rounded-full object-cover"
              style={{ width: 64, height: 64, boxShadow: `0 0 0 2px ${pal.detail}` }}
            />
          ) : (
            <div
              className="flex items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)' }}
            >
              {business.name.charAt(0).toUpperCase()}
            </div>
          )}

          <p className="mt-2 text-base font-bold text-white">{business.name}</p>

          {description && (
            <p className="line-clamp-2 text-xs text-white/70">
              {description}
            </p>
          )}
        </div>

        {/* Zone 2 — neutro con el matiz de la marca: contacts, social handles, QR as the focal element */}
        <div
          className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-4 text-center"
          style={{ background: pal.bg }}
        >
          {contacts.length > 0 && (
            <div className="flex flex-col items-center gap-1">
              {contacts.map((c) => {
                const Icon = CONTACT_ICON_BY_TIPO[c.tipo];
                return (
                  <div key={c.tipo} className="flex items-center gap-1.5 text-xs" style={{ color: pal.muted }}>
                    {Icon && <Icon size={12} />}
                    <span>{c.value}</span>
                  </div>
                );
              })}
            </div>
          )}

          {social.length > 0 && (
            <div className="flex flex-col items-center gap-1">
              {social.map((s) => {
                const Icon = SOCIAL_ICON_BY_TIPO[s.tipo];
                return (
                  <div key={s.tipo} className="flex items-center gap-1.5 text-xs" style={{ color: pal.muted }}>
                    {Icon && <Icon size={12} />}
                    <span>{socialHandle(s)}</span>
                  </div>
                );
              })}
            </div>
          )}

          {qrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt={getText('Código QR', 'QR code')}
              width={128}
              height={128}
              className="rounded-lg"
              style={{ background: '#ffffff', border: `1px solid ${pal.borderSoft}` }}
            />
          )}
          <span className="text-[10px]" style={{ color: pal.accentText }}>maalca.com/{business.slug}</span>
        </div>
      </div>

      <button
        onClick={download}
        disabled={downloading}
        style={{ backgroundColor: pal.accent, color: pal.onAccent }}
        className="mt-4 w-full max-w-xs rounded-full px-5 py-2.5 text-sm font-medium transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {downloading ? getText('Generando...', 'Generating...') : getText('Descargar tarjeta', 'Download card')}
      </button>
    </div>
  );
}
