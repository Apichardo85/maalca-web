// src/components/public/PublicFooter.tsx
// Shared footer for all 4 public templates — social links, business identity,
// address, and "Powered by MaalCa". Only ever imported by the 4 templates,
// which already declare 'use client', so it doesn't need its own directive
// (same pattern as AboutSection.tsx).
import Link from 'next/link';
import type { PublicTemplateProps } from '@/lib/templates/registry';
import { resolveSocialLinks } from '@/lib/public-contact';
import { trackCanalClick } from '@/lib/public-events';

interface Props {
  business: PublicTemplateProps['business'];
  capabilities: PublicTemplateProps['capabilities'];
}

export function PublicFooter({ business, capabilities }: Props) {
  const social = resolveSocialLinks(business);

  return (
    <footer style={{ borderTop: '1px solid #e5e3de', backgroundColor: '#f8f6f1' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px 32px', textAlign: 'center' }}>
        {social.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '28px' }}>
            {social.map((s) => (
              <a
                key={s.tipo}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.tipo}
                onClick={() => trackCanalClick(business.slug, s.tipo, s.canalId)}
                style={{
                  fontSize: '22px',
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
                {s.icon}
              </a>
            ))}
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
