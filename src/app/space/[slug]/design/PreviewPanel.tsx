'use client';

import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { resolveWhatsAppDigits, resolveContactItems, resolveSocialLinks } from '@/lib/public-contact';
import { CONTACT_ICON_BY_TIPO } from '@/components/public/ContactIcons';
import { SOCIAL_ICON_BY_TIPO } from '@/components/public/SocialIcons';
import type { CanalDto } from './types';

interface Props {
  name: string;
  description: string;
  address: string;
  website: string;
  whatsapp: string;
  contactEmail: string;
  primaryColor: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  canales: CanalDto[];
}

export function PreviewPanel({
  name,
  description,
  address,
  website,
  whatsapp,
  contactEmail,
  primaryColor,
  logoUrl,
  coverImageUrl,
  canales,
}: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  // Same resolution logic as the real public page (src/lib/public-contact.ts) — an active
  // WhatsApp canal takes priority over the legacy flat field, so this preview matches what
  // actually publishes, not an approximation of it.
  const waDigits = resolveWhatsAppDigits({ whatsapp, canales });
  const contactItems = resolveContactItems({ whatsapp, address, contactEmail, canales });
  const social = resolveSocialLinks({ canales });

  return (
    <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm">
      {/* Cover */}
      <div
        className="relative flex h-32 items-end p-4"
        style={{
          backgroundColor: primaryColor,
          backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {coverImageUrl && <div className="absolute inset-0 bg-black/40" />}
        <div className="relative flex items-center gap-3">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-white shadow-md">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg font-bold" style={{ color: primaryColor }}>
                {(name || '?').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <p className="font-bold text-white drop-shadow">{name || getText('Tu negocio', 'Your business')}</p>
        </div>
      </div>

      <div className="p-4">
        {description && (
          <p className="text-sm leading-relaxed text-gray-600 dark:text-neutral-400 whitespace-pre-line">{description}</p>
        )}

        {waDigits && (
          <a
            href={`https://wa.me/${waDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block w-full rounded-full py-2 text-center text-sm font-medium text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {getText('Escríbenos por WhatsApp', 'Message us on WhatsApp')}
          </a>
        )}

        {website && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400">
            <span>🌐</span> {website}
          </p>
        )}

        {contactItems.length > 0 && (
          <div className="mt-3 border-t border-gray-100 dark:border-neutral-800 pt-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500">
              {getText('Contacto', 'Contact')}
            </p>
            <div className="flex flex-wrap gap-2">
              {contactItems.map((c) => {
                const Icon = CONTACT_ICON_BY_TIPO[c.tipo];
                return (
                  <a
                    key={c.label}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-neutral-300"
                  >
                    {Icon && <Icon size={12} />}
                    {c.value}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {social.length > 0 && (
          <div className="mt-3 border-t border-gray-100 dark:border-neutral-800 pt-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500">
              {getText('Redes sociales', 'Social media')}
            </p>
            <div className="flex flex-wrap gap-2">
              {social.map((s) => {
                const Icon = SOCIAL_ICON_BY_TIPO[s.tipo];
                return (
                  <a
                    key={s.tipo}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.tipo}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300"
                  >
                    {Icon && <Icon size={14} />}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
