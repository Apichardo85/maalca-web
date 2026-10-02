'use client';

import { useState } from 'react';
import { formatPhoneInput, isValidPhone, normalizePhone, PHONE_INPUT_PROPS } from '@/lib/phone';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/**
 * Formulario de inscripción de la vitrina Comunidad: voluntariado (causa de tipo "tiempo") o
 * registro a un evento (con cupo opcional). Publica en /api/public/affiliates/{slug}/signups
 * (ver CommunitySignup.cs). Los colores salen de las variables --cm-* de la plantilla, así que
 * sigue el modo claro/oscuro sin lógica propia.
 */
export interface CommunitySignupFormProps {
  slug: string;
  kind: 'volunteer' | 'event';
  /** Id de la causa (voluntariado) o del evento. */
  targetId: string;
  language: 'es' | 'en';
  /** Fondo/relleno del botón principal y el texto que va encima (ya resueltos a variable CSS). */
  accentFill: string;
  onAccent: string;
  /** Eventos: lugares que quedan (null/undefined = sin límite); limita el selector de personas. */
  spotsLeft?: number | null;
  /** Se llama al inscribirse con éxito (la vitrina descuenta el cupo en pantalla). */
  onDone?: (partySize: number) => void;
  /** Línea de contacto directo del negocio, como alternativa (opcional). */
  fallbackContact?: string | null;
}

const MAX_PARTY = 10;

export function CommunitySignupForm({
  slug,
  kind,
  targetId,
  language,
  accentFill,
  onAccent,
  spotsLeft,
  onDone,
  fallbackContact,
}: CommunitySignupFormProps) {
  const t = (es: string, en: string) => (language === 'es' ? es : en);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [party, setParty] = useState(1);
  const [notes, setNotes] = useState('');
  // Honeypot: un humano no lo ve ni lo llena; un bot de formularios sí.
  const [website, setWebsite] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState('');

  const maxParty = Math.max(1, Math.min(MAX_PARTY, spotsLeft ?? MAX_PARTY));
  const phoneFilled = phone.trim().length > 0;
  const phoneOk = !phoneFilled || isValidPhone(phone);
  const hasContact = phoneFilled || email.trim().length > 0;
  const canSubmit = name.trim().length > 0 && hasContact && phoneOk && state !== 'sending';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    if (website.trim()) {
      // Bot: se finge éxito sin enviar nada.
      setState('done');
      setDoneMessage('');
      return;
    }
    setState('sending');
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/signups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          causaId: kind === 'volunteer' ? targetId : undefined,
          activityId: kind === 'event' ? targetId : undefined,
          name: name.trim(),
          phone: phoneFilled ? normalizePhone(phone) : undefined,
          email: email.trim() || undefined,
          partySize: kind === 'event' ? party : undefined,
          notes: notes.trim() || undefined,
          language,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error?.message ?? t('No pudimos completar tu inscripción. Intenta de nuevo.', "We couldn't complete your sign-up. Please try again."));
        setState('idle');
        return;
      }
      setDoneMessage(
        kind === 'event'
          ? email.trim()
            ? t('¡Listo, ya tienes tu lugar! Te enviamos la confirmación por correo.', "You're in! We emailed you the confirmation.")
            : t('¡Listo, ya tienes tu lugar!', "You're in!")
          : t('¡Gracias! Recibimos tu solicitud y el equipo te contactará pronto.', 'Thank you! We got your request and the team will reach out soon.'),
      );
      setState('done');
      onDone?.(kind === 'event' ? party : 1);
    } catch {
      setError(t('Sin conexión. Intenta de nuevo.', 'No connection. Please try again.'));
      setState('idle');
    }
  }

  const field: React.CSSProperties = {
    width: '100%',
    borderRadius: 8,
    border: '1px solid var(--cm-border, #E3E6EC)',
    backgroundColor: 'var(--cm-bg, #F7F8FA)',
    color: 'var(--cm-ink, #161A22)',
    padding: '8px 10px',
    fontSize: 14,
  };
  const label: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--cm-muted, #5B6472)', marginBottom: 4 };

  if (state === 'done') {
    return (
      <div
        role="status"
        style={{
          borderRadius: 10,
          padding: '12px 14px',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--cm-green, #1A8A5C)',
          backgroundColor: 'var(--cm-green-bg, #E8F6EF)',
        }}
      >
        ✓ {doneMessage || t('¡Gracias!', 'Thank you!')}
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <label style={label} htmlFor={`su-name-${targetId}`}>{t('Nombre', 'Name')}</label>
        <input id={`su-name-${targetId}`} style={field} value={name} maxLength={100} autoComplete="name" onChange={(e) => setName(e.target.value)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        <div>
          <label style={label} htmlFor={`su-phone-${targetId}`}>{t('Teléfono', 'Phone')}</label>
          <input
            id={`su-phone-${targetId}`}
            style={field}
            {...PHONE_INPUT_PROPS}
            value={phone}
            onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
          />
          {phoneFilled && !phoneOk && (
            <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--cm-amber, #B4740E)' }}>{t('Escribe 10 dígitos.', 'Enter 10 digits.')}</p>
          )}
        </div>
        <div>
          <label style={label} htmlFor={`su-email-${targetId}`}>{t('Correo', 'Email')}</label>
          <input id={`su-email-${targetId}`} style={field} type="email" inputMode="email" autoComplete="email" maxLength={200} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      <p style={{ margin: '-4px 0 0', fontSize: 11, color: 'var(--cm-muted, #5B6472)' }}>
        {t('Con uno de los dos basta.', 'Either one is enough.')}
      </p>
      {kind === 'event' && (
        <div>
          <label style={label} htmlFor={`su-party-${targetId}`}>{t('¿Cuántas personas?', 'How many people?')}</label>
          <select id={`su-party-${targetId}`} style={field} value={party} onChange={(e) => setParty(Number(e.target.value))}>
            {Array.from({ length: maxParty }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label style={label} htmlFor={`su-notes-${targetId}`}>
          {kind === 'volunteer' ? t('¿Cuándo puedes ayudar? (opcional)', 'When can you help? (optional)') : t('Comentario (opcional)', 'Comment (optional)')}
        </label>
        <textarea id={`su-notes-${targetId}`} style={{ ...field, minHeight: 56, resize: 'vertical' }} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      {/* Honeypot fuera de pantalla */}
      <input
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
        name="website"
      />
      {error && (
        <p role="alert" style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--cm-amber, #B4740E)' }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={!canSubmit}
        style={{
          borderRadius: 9999,
          border: 'none',
          padding: '10px 16px',
          fontSize: 14,
          fontWeight: 700,
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          opacity: canSubmit ? 1 : 0.55,
          backgroundColor: accentFill,
          color: onAccent,
        }}
      >
        {state === 'sending'
          ? t('Enviando…', 'Sending…')
          : kind === 'event'
            ? t('Reservar mi lugar', 'Reserve my spot')
            : t('Quiero ser voluntario/a', "I'd like to volunteer")}
      </button>
      {fallbackContact && (
        <p style={{ margin: 0, fontSize: 11, color: 'var(--cm-muted, #5B6472)' }}>{fallbackContact}</p>
      )}
    </form>
  );
}
