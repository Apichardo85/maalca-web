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
  language?: 'es' | 'en';
}

const WEEK_DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const WEEK_DAY_LABELS_ES: Record<string, string> = {
  monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves',
  friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo',
};
const WEEK_DAY_LABELS_EN: Record<string, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday',
  friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};

/** Weekday AS SEEN IN the given IANA timezone, via Intl.DateTimeFormat — not the
 *  visitor's local day, which would be wrong for a business hours display. Returns
 *  null for a missing/invalid timezone so the caller can skip the "today" line. */
function todayInTimezone(timezone: string | null | undefined): string | null {
  if (!timezone) return null;
  try {
    const weekday = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'long' }).format(new Date());
    return weekday.toLowerCase();
  } catch {
    return null;
  }
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

export function PublicFooter({ business, capabilities, language = 'es' }: Props) {
  const social = resolveSocialLinks(business);
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const horario = business.horario ?? [];
  const today = todayInTimezone(business.timezone);
  const todayEntry = today ? horario.find((h) => h.dia === today) : null;

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

        {horario.length > 0 && (
          <div style={{ marginTop: '14px', fontSize: '13px', color: '#888' }}>
            {todayEntry && (
              <p style={{ margin: 0 }}>
                🕒{' '}
                {todayEntry.cerrado
                  ? getText('Cerrado hoy', 'Closed today')
                  : `${getText('Hoy', 'Today')}: ${todayEntry.abre} – ${todayEntry.cierra}`}
              </p>
            )}
            <details style={{ marginTop: todayEntry ? '6px' : 0, display: 'inline-block', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#aaa', fontSize: '12px' }}>
                {getText('Ver horario completo', 'View full hours')}
              </summary>
              <div style={{ marginTop: '8px' }}>
                {WEEK_DAY_ORDER.map((day) => {
                  const entry = horario.find((h) => h.dia === day);
                  if (!entry) return null;
                  const label = language === 'en' ? WEEK_DAY_LABELS_EN[day] : WEEK_DAY_LABELS_ES[day];
                  return (
                    <p key={day} style={{ margin: '2px 0', fontSize: '12px', fontWeight: day === today ? 700 : 400 }}>
                      {label}: {entry.cerrado ? getText('Cerrado', 'Closed') : `${entry.abre} – ${entry.cierra}`}
                    </p>
                  );
                })}
              </div>
            </details>
          </div>
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
