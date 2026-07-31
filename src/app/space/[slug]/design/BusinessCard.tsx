'use client';

import { useRef, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { resolveContactItems, resolveSocialLinks } from '@/lib/public-contact';
import { CONTACT_ICON_BY_TIPO } from '@/components/public/ContactIcons';
import { SOCIAL_ICON_BY_TIPO } from '@/components/public/SocialIcons';
import type { PublicTemplateProps } from '@/lib/templates/registry';

interface Props {
  business: PublicTemplateProps['business'];
  qrDataUrl: string;
}

export function BusinessCard({ business, qrDataUrl }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const description = language === 'en' ? business.descriptionEn ?? business.description : business.description;
  const contacts = resolveContactItems(business, language);
  const social = resolveSocialLinks(business);
  const primaryColor = business.primary_color || '#C8102E';

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
        className="flex w-full max-w-xs flex-col items-center rounded-2xl p-6 text-center"
        style={{ aspectRatio: '9 / 16', background: primaryColor }}
      >
        {business.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={business.logo_url}
            alt={business.name}
            width={72}
            height={72}
            className="rounded-full object-cover"
            style={{ width: 72, height: 72 }}
          />
        ) : (
          <div
            className="flex items-center justify-center rounded-full text-xl font-bold text-white"
            style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)' }}
          >
            {business.name.charAt(0).toUpperCase()}
          </div>
        )}

        <p className="mt-3 text-base font-bold text-white">{business.name}</p>

        {description && (
          <p className="mt-1 line-clamp-3 text-xs text-white/70">
            {description}
          </p>
        )}

        {contacts.length > 0 && (
          <div className="mt-4 flex flex-col items-center gap-1.5">
            {contacts.map((c) => {
              const Icon = CONTACT_ICON_BY_TIPO[c.tipo];
              return (
                <div
                  key={c.tipo}
                  className="flex items-center gap-1.5 text-xs text-white/80"
                >
                  {Icon && <Icon size={12} />}
                  <span>{c.value}</span>
                </div>
              );
            })}
          </div>
        )}

        {social.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            {social.map((s) => {
              const Icon = SOCIAL_ICON_BY_TIPO[s.tipo];
              return (
                <span
                  key={s.tipo}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-white"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  {Icon && <Icon size={12} />}
                </span>
              );
            })}
          </div>
        )}

        <div className="mt-auto flex flex-col items-center gap-2 pt-4">
          {qrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt={getText('Código QR', 'QR code')}
              width={80}
              height={80}
              className="rounded-md"
            />
          )}
          <span className="text-[10px] text-white/50">maalca.com/{business.slug}</span>
        </div>
      </div>

      <button
        onClick={download}
        disabled={downloading}
        className="mt-4 w-full max-w-xs rounded-full bg-[#C8102E] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#A00D26] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {downloading ? getText('Generando...', 'Generating...') : getText('Descargar tarjeta', 'Download card')}
      </button>
    </div>
  );
}
