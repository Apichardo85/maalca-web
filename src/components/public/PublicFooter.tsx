// src/components/public/PublicFooter.tsx
// Shared footer for all 4 public templates — social links, business identity,
// address, and "Powered by MaalCa". Only ever imported by the 4 templates,
// which already declare 'use client', so it doesn't need its own directive
// (same pattern as AboutSection.tsx).
import Link from 'next/link';
import type { ComponentType } from 'react';
import type { PublicTemplateProps } from '@/lib/templates/registry';
import { resolveSocialLinks } from '@/lib/public-contact';
import { trackCanalClick } from '@/lib/public-events';

interface Props {
  business: PublicTemplateProps['business'];
  capabilities: PublicTemplateProps['capabilities'];
}

function FacebookIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.87.24-1.5 1.5-1.5H16V4.14C15.72 4.1 14.94 4 14 4c-2.06 0-3.5 1.26-3.5 3.5V10.5H8v3h2.5V21h3Z" />
    </svg>
  );
}

function InstagramIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.5 3c.3 1.9 1.6 3.4 3.5 3.9v2.8a6.6 6.6 0 0 1-3.5-1.2v6.6a5.6 5.6 0 1 1-5.6-5.6c.2 0 .4 0 .6.03v2.9a2.7 2.7 0 1 0 1.9 2.6V3h3.1Z" />
    </svg>
  );
}

const SOCIAL_ICON_BY_TIPO: Record<string, ComponentType<{ size: number }>> = {
  Facebook: FacebookIcon,
  Instagram: InstagramIcon,
  TikTok: TikTokIcon,
};

export function PublicFooter({ business, capabilities }: Props) {
  const social = resolveSocialLinks(business);

  return (
    <footer style={{ borderTop: '1px solid #e5e3de', backgroundColor: '#f8f6f1' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px 32px', textAlign: 'center' }}>
        {social.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '28px' }}>
            {social.map((s) => {
              const Icon = SOCIAL_ICON_BY_TIPO[s.tipo];
              return (
                <a
                  key={s.tipo}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.tipo}
                  onClick={() => trackCanalClick(business.slug, s.tipo, s.canalId)}
                  style={{
                    color: '#4a4a4a',
                    backgroundColor: '#ffffff',
                    border: '0.5px solid #ece9e2',
                    borderRadius: '9999px',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  }}
                >
                  {Icon && <Icon size={20} />}
                </a>
              );
            })}
          </div>
        )}

        <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1a1a1a' }}>
          {business.name}
        </p>

        {business.address && (
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#888' }}>
            📍 {business.address}
          </p>
        )}

        {!capabilities.hidePoweredBy && (
          <Link
            href="/servicios"
            style={{
              display: 'inline-block',
              marginTop: '20px',
              fontSize: '12px',
              color: '#aaa',
              textDecoration: 'none',
            }}
          >
            Powered by <span style={{ fontWeight: 600, color: '#888' }}>MaalCa</span>
          </Link>
        )}
      </div>
    </footer>
  );
}
