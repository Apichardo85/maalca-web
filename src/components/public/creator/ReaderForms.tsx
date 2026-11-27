'use client';
// src/components/public/creator/ReaderForms.tsx — formularios del club de lectores (cartas, entrar, membresía).
// Todos pasan por /api/readers/[slug]/* (que pone la sesión del API sin exponerla al navegador).
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { CW, FONT } from './theme';

type Lang = 'es' | 'en';
const t = (lang: Lang, es: string, en: string) => (lang === 'es' ? es : en);

async function post(slug: string, action: string, body: unknown): Promise<{ ok: boolean; data: Record<string, unknown> | null; status: number }> {
  try {
    const res = await fetch(`/api/readers/${encodeURIComponent(slug)}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
    const data = res.status === 204 ? null : await res.json().catch(() => null);
    return { ok: res.ok, data, status: res.status };
  } catch {
    return { ok: false, data: null, status: 0 };
  }
}

function errorMessage(data: Record<string, unknown> | null, lang: Lang): string {
  const err = data?.error as { message?: string } | string | undefined;
  if (typeof err === 'object' && err?.message) return err.message;
  return t(lang, 'No se pudo. Intenta de nuevo en un momento.', 'That did not work. Try again in a moment.');
}

const visuallyHidden: CSSProperties = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' };

interface FormTone {
  /** "paper" para secciones claras, "night" para secciones oscuras. */
  tone?: 'paper' | 'night';
  accent: string;
}

function inputStyle(tone: 'paper' | 'night'): CSSProperties {
  return {
    flex: '1 1 260px',
    maxWidth: 380,
    font: `17px ${FONT.body}`,
    padding: '14px 16px',
    border: `1px solid ${tone === 'paper' ? '#A89E8C' : '#4A4652'}`,
    borderRadius: 2,
    background: tone === 'paper' ? '#FBF8F2' : '#1C1A20',
    color: tone === 'paper' ? CW.ink : CW.text,
  };
}

function buttonStyle(accent: string): CSSProperties {
  return { background: accent, color: '#FFFFFF', font: `17px ${FONT.body}`, border: 0, padding: '14px 26px', borderRadius: 2, cursor: 'pointer' };
}

/** Correo para recibir las cartas (doble opt-in: llega un correo para confirmar). */
export function SubscribeForm({ slug, lang, accent, tone = 'paper', workSlug, cta }: FormTone & { slug: string; lang: Lang; workSlug?: string; cta?: string }) {
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const id = `cw-sub-${workSlug ?? 'page'}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState('sending');
    const r = await post(slug, 'subscribe', { email: email.trim(), language: lang, workSlug: workSlug ?? null, website: trap });
    if (r.ok) {
      setState('done');
      setMessage(t(lang, 'Listo. Revisa tu correo y confirma con el enlace que te llegó.', 'Done. Check your email and confirm with the link we sent.'));
    } else {
      setState('error');
      setMessage(errorMessage(r.data, lang));
    }
  }

  if (state === 'done') {
    return <p role="status" style={{ margin: 0, fontSize: 18, lineHeight: 1.6, color: tone === 'paper' ? CW.paperText : CW.muted }}>{message}</p>;
  }
  return (
    <form onSubmit={submit} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
      <label htmlFor={id} style={visuallyHidden}>{t(lang, 'Correo electrónico', 'Email address')}</label>
      <input id={id} type="email" required autoComplete="email" placeholder={t(lang, 'tu@correo.com', 'you@email.com')} value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle(tone)} />
      {/* Campo trampa: invisible para personas y lectores de pantalla; los bots lo llenan y el API descarta el alta. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={trap}
        onChange={(e) => setTrap(e.target.value)}
        style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, opacity: 0 }}
      />
      <button type="submit" disabled={state === 'sending'} style={{ ...buttonStyle(accent), opacity: state === 'sending' ? 0.6 : 1 }}>
        {state === 'sending' ? t(lang, 'Enviando…', 'Sending…') : cta ?? t(lang, 'Quiero las cartas', 'Send me the letters')}
      </button>
      <p style={{ flexBasis: '100%', margin: 0, fontSize: 14, color: tone === 'paper' ? CW.paperFaint : CW.muted, textAlign: 'center' }}>
        {t(lang, 'Tu correo es solo para las cartas. Te das de baja cuando quieras.', 'Your email is only for the letters. Unsubscribe anytime.')}
      </p>
      {state === 'error' && <p role="alert" style={{ flexBasis: '100%', margin: 0, fontSize: 15, color: CW.locked }}>{message}</p>}
    </form>
  );
}

/** Pedir el enlace para entrar (sin contraseña). */
export function LoginForm({ slug, lang, accent, tone = 'paper' }: FormTone & { slug: string; lang: Lang }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState('sending');
    const r = await post(slug, 'login', { email: email.trim(), language: lang });
    if (r.ok) {
      setState('done');
      setMessage(t(lang, 'Si ese correo está en la lista, te llegó un enlace para entrar. Vence en 30 minutos.', 'If that email is on the list, a sign-in link is on its way. It expires in 30 minutes.'));
    } else {
      setState('error');
      setMessage(errorMessage(r.data, lang));
    }
  }

  if (state === 'done') return <p role="status" style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: tone === 'paper' ? CW.paperText : CW.muted }}>{message}</p>;
  return (
    <form onSubmit={submit} style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      <label htmlFor="cw-login" style={visuallyHidden}>{t(lang, 'Correo electrónico', 'Email address')}</label>
      <input id="cw-login" type="email" required autoComplete="email" placeholder={t(lang, 'tu@correo.com', 'you@email.com')} value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle(tone)} />
      <button type="submit" disabled={state === 'sending'} style={{ ...buttonStyle(tone === 'paper' ? CW.ink : CW.paper), color: tone === 'paper' ? CW.paper : CW.night, opacity: state === 'sending' ? 0.6 : 1 }}>
        {state === 'sending' ? t(lang, 'Enviando…', 'Sending…') : t(lang, 'Enviarme el enlace', 'Email me the link')}
      </button>
      {state === 'error' && <p role="alert" style={{ flexBasis: '100%', margin: 0, fontSize: 15, color: CW.locked }}>{message}</p>}
    </form>
  );
}

/** Ir al Checkout de la membresía. Sin sesión pide el correo primero (Stripe lo usa para el recibo). */
export function MembershipButton({ slug, lang, accent, signedIn, label }: { slug: string; lang: Lang; accent: string; signedIn: boolean; label?: string }) {
  const [email, setEmail] = useState('');
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function go(withEmail?: string) {
    setBusy(true);
    setMessage('');
    const r = await post(slug, 'checkout', { email: withEmail ?? null, language: lang });
    const url = r.data?.url;
    if (r.ok && typeof url === 'string') {
      window.location.href = url;
      return;
    }
    setBusy(false);
    setMessage(errorMessage(r.data, lang));
  }

  const btn = { ...buttonStyle(accent), opacity: busy ? 0.6 : 1 };
  if (!signedIn && asking) {
    return (
      <form onSubmit={(e) => { e.preventDefault(); if (email.trim()) go(email.trim()); }} style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <label htmlFor="cw-member-email" style={visuallyHidden}>{t(lang, 'Correo electrónico', 'Email address')}</label>
        <input id="cw-member-email" type="email" required autoComplete="email" placeholder={t(lang, 'tu@correo.com', 'you@email.com')} value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle('paper')} />
        <button type="submit" disabled={busy} style={btn}>{busy ? t(lang, 'Abriendo pago…', 'Opening checkout…') : t(lang, 'Continuar al pago', 'Continue to payment')}</button>
        {message && <p role="alert" style={{ flexBasis: '100%', margin: 0, fontSize: 15, color: CW.locked }}>{message}</p>}
      </form>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
      <button type="button" disabled={busy} onClick={() => (signedIn ? go() : setAsking(true))} style={btn}>
        {busy ? t(lang, 'Abriendo pago…', 'Opening checkout…') : label ?? t(lang, 'Hacerme miembro', 'Become a member')}
      </button>
      {message && <p role="alert" style={{ margin: 0, fontSize: 15, color: CW.locked }}>{message}</p>}
    </div>
  );
}

export async function openPortal(slug: string): Promise<string | null> {
  const r = await post(slug, 'portal', {});
  const url = r.data?.url;
  return r.ok && typeof url === 'string' ? url : null;
}

export async function logout(slug: string): Promise<void> {
  await post(slug, 'logout', {});
}

export async function saveProgress(slug: string, workSlug: string, chapterNumber: number): Promise<void> {
  await post(slug, 'progress', { workSlug, chapterNumber });
}
