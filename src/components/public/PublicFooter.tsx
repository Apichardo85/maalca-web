// src/components/public/PublicFooter.tsx
// Shared footer for all 4 public templates — social links, business identity,
// address, and "Powered by MaalCa". Only ever imported by the 4 templates,
// which already declare 'use client', so it doesn't need its own directive
// (same pattern as AboutSection.tsx).
import Link from 'next/link';
import type { PublicTemplateProps } from '@/lib/templates/registry';
import { resolveSocialLinks } from '@/lib/public-contact';
import { trackCanalClick } from '@/lib/public-events';
import { SOCIAL_ICON_BY_TIPO } from '@/components/public/SocialIcons';

interface Props {
  business: PublicTemplateProps['business'];
  capabilities: PublicTemplateProps['capabilities'];
  language?: 'es' | 'en';
}

// Matches HorarioDayDto.dia values, which come from the backend's
// DiaSemanaTokens.Whitelist (lunes/martes/miercoles/jueves/viernes/sabado/
// domingo, no accents) — not English weekday names.
const WEEK_DAY_ORDER = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
const WEEK_DAY_LABELS_ES: Record<string, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves',
  viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
};
const WEEK_DAY_LABELS_EN: Record<string, string> = {
  lunes: 'Monday', martes: 'Tuesday', miercoles: 'Wednesday', jueves: 'Thursday',
  viernes: 'Friday', sabado: 'Saturday', domingo: 'Sunday',
};
const EN_TO_ES_DAY: Record<string, string> = {
  monday: 'lunes', tuesday: 'martes', wednesday: 'miercoles', thursday: 'jueves',
  friday: 'viernes', saturday: 'sabado', sunday: 'domingo',
};

/** Weekday AS SEEN IN the given IANA timezone, via Intl.DateTimeFormat — not the
 *  visitor's local day, which would be wrong for a business hours display. Intl
 *  only gives us the day in English reliably; mapped to the Spanish key used by
 *  HorarioDayDto.dia so callers can match it directly. Returns null for a
 *  missing/invalid timezone so the caller can skip the "today" line. */
function todayInTimezone(timezone: string | null | undefined): string | null {
  if (!timezone) return null;
  try {
    const weekday = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'long' }).format(new Date());
    return EN_TO_ES_DAY[weekday.toLowerCase()] ?? null;
  } catch {
    return null;
  }
}

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
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              marginTop: '20px',
              fontSize: '12px',
              color: '#aaa',
              textDecoration: 'none',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-icon.svg" alt="" width={14} height={14} style={{ display: 'block' }} />
            Powered by <span style={{ fontWeight: 600, color: '#888' }}>MaalCa</span>
          </Link>
        )}
      </div>
    </footer>
  );
}
