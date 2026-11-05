'use client';

// Hoja "Mi cuenta" de la tienda pública: iniciar sesión (Google o enlace por correo), pedir membresía (miembro /
// mayorista), ver el estado de la solicitud y "Mis pedidos". Los colores llegan de la plantilla (marca del negocio).
import { useEffect, useState } from 'react';
import type { StoreOrderSummary, UseStoreAccount } from '@/lib/store-account';

interface Props {
  open: boolean;
  onClose: () => void;
  account: UseStoreAccount;
  businessName: string;
  getText: (es: string, en: string) => string;
  language: 'es' | 'en';
  accent: string;
  onAccent: string;
  ink: string;
  muted: string;
  surface: string;
  border: string;
  currency?: string;
  /** "Repetir pedido": la plantilla vuelve a cargar sus líneas en el carrito. Ausente = sin el botón. */
  onReorder?: (order: StoreOrderSummary) => void;
}

const STATUS_LABEL: Record<string, { es: string; en: string }> = {
  Pending: { es: 'Pendiente', en: 'Pending' },
  Paid: { es: 'Confirmado', en: 'Confirmed' },
  Preparing: { es: 'Preparando', en: 'Preparing' },
  Ready: { es: 'Listo', en: 'Ready' },
  Fulfilled: { es: 'Entregado', en: 'Delivered' },
  Canceled: { es: 'Cancelado', en: 'Canceled' },
};

export function StoreAccountSheet({
  open, onClose, account, businessName, getText, language, accent, onAccent, ink, muted, surface, border, currency = 'USD', onReorder,
}: Props) {
  const { me, token, email } = account;
  const [mail, setMail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', businessName: '', taxId: '', message: '' });
  const [orders, setOrders] = useState<StoreOrderSummary[] | null>(null);
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency });

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Mis pedidos: se cargan al abrir la hoja con sesión.
  useEffect(() => {
    if (!open || !token || !me || me.status === 'unavailable') return;
    account.loadOrders().then(setOrders).catch(() => setOrders([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, token, me?.status]);

  if (!open) return null;

  const input: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 10, border: `1px solid ${border}`,
    fontSize: 14, color: ink, background: 'transparent', marginBottom: 8,
  };
  const primary: React.CSSProperties = {
    width: '100%', minHeight: 46, borderRadius: 9999, border: 'none', background: accent, color: onAccent,
    fontWeight: 700, fontSize: 14, cursor: 'pointer',
  };
  const secondary: React.CSSProperties = { ...primary, background: 'transparent', color: ink, border: `1px solid ${border}` };

  async function sendLink() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.trim())) {
      setError(getText('Escribe un correo válido.', 'Enter a valid email.'));
      return;
    }
    setBusy(true);
    setError(null);
    const err = await account.signInWithEmail(mail);
    setBusy(false);
    if (err) setError(err);
    else setSent(true);
  }

  async function submitJoin() {
    if (form.name.trim().length < 2) {
      setError(getText('Escribe tu nombre.', 'Enter your name.'));
      return;
    }
    setBusy(true);
    setError(null);
    const err = await account.join({
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      businessName: form.businessName.trim() || undefined,
      taxId: form.taxId.trim() || undefined,
      message: form.message.trim() || undefined,
    });
    setBusy(false);
    if (err) setError(err);
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={getText('Mi cuenta', 'My account')} style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
      <div
        style={{
          position: 'relative', width: '100%', maxWidth: 460, maxHeight: '88vh', overflowY: 'auto', background: surface,
          borderRadius: '20px 20px 0 0', padding: '22px 20px calc(22px + env(safe-area-inset-bottom, 0px))', color: ink,
        }}
      >
        <button type="button" onClick={onClose} aria-label={getText('Cerrar', 'Close')} style={{ position: 'absolute', top: 14, right: 14, width: 36, height: 36, borderRadius: 9999, border: 'none', background: 'transparent', color: muted, fontSize: 20, cursor: 'pointer' }}>×</button>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: muted }}>{businessName}</p>
        <h2 style={{ margin: '4px 0 14px', fontSize: 20, fontWeight: 800 }}>{getText('Mi cuenta', 'My account')}</h2>

        {account.loading ? (
          <p style={{ color: muted, fontSize: 14 }}>{getText('Cargando…', 'Loading…')}</p>
        ) : !token ? (
          <>
            <p style={{ margin: '0 0 14px', fontSize: 14, color: muted, lineHeight: 1.5 }}>
              {getText(
                'Inicia sesión para ver tus precios de miembro o mayorista y seguir tus pedidos.',
                'Sign in to see your member or wholesale prices and track your orders.',
              )}
            </p>
            <button type="button" onClick={() => account.signInWithGoogle()} style={{ ...secondary, marginBottom: 14 }}>
              {getText('Continuar con Google', 'Continue with Google')}
            </button>
            {sent ? (
              <p role="status" style={{ fontSize: 13, color: ink, background: 'rgba(16,185,129,0.12)', padding: '10px 12px', borderRadius: 10 }}>
                {getText(`Te enviamos un enlace a ${mail.trim()}. Ábrelo en este mismo navegador.`, `We sent a link to ${mail.trim()}. Open it in this same browser.`)}
              </p>
            ) : (
              <>
                <input type="email" autoComplete="email" value={mail} onChange={(e) => setMail(e.target.value)} placeholder={getText('Tu correo', 'Your email')} style={input} />
                <button type="button" disabled={busy} onClick={sendLink} style={{ ...primary, opacity: busy ? 0.6 : 1 }}>
                  {getText('Enviarme un enlace para entrar', 'Email me a sign-in link')}
                </button>
              </>
            )}
          </>
        ) : !me || me.status === 'unavailable' ? (
          <p style={{ fontSize: 14, color: muted }}>{getText('Esta tienda no tiene cuentas de cliente por ahora.', "This store doesn't have customer accounts right now.")}</p>
        ) : (
          <>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: muted }}>{email}</p>

            {me.status === 'none' || me.status === 'rejected' ? (
              <>
                <p style={{ margin: '0 0 10px', fontSize: 14, lineHeight: 1.5 }}>
                  {me.status === 'rejected'
                    ? getText('Tu solicitud anterior no fue aprobada. Puedes enviar una nueva.', 'Your previous request was not approved. You can send a new one.')
                    : me.signupMode === 'open'
                      ? getText('Hazte miembro para ver tus precios especiales.', 'Become a member to see your special prices.')
                      : getText('Pide tu membresía: el negocio la revisa y te da acceso a sus precios.', 'Request membership: the business reviews it and gives you access to its prices.')}
                </p>
                {me.signupNote && <p style={{ margin: '0 0 10px', fontSize: 12, color: muted, whiteSpace: 'pre-line' }}>{me.signupNote}</p>}
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={120} autoComplete="name" placeholder={getText('Tu nombre', 'Your name')} style={input} />
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} autoComplete="tel" placeholder={getText('Teléfono (opcional)', 'Phone (optional)')} style={input} />
                <input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} maxLength={160} placeholder={getText('Negocio (si compras para revender)', 'Business (if you buy to resell)')} style={input} />
                <input value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} maxLength={40} placeholder={getText('Tax ID / certificado de reventa (opcional)', 'Tax ID / resale certificate (optional)')} style={input} />
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={500} rows={2} placeholder={getText('Mensaje para el negocio (opcional)', 'Message to the business (optional)')} style={{ ...input, resize: 'vertical' }} />
                <button type="button" disabled={busy} onClick={submitJoin} style={{ ...primary, opacity: busy ? 0.6 : 1 }}>
                  {me.signupMode === 'open' ? getText('Hacerme miembro', 'Become a member') : getText('Enviar solicitud', 'Send request')}
                </button>
              </>
            ) : me.status === 'pending' ? (
              <p role="status" style={{ fontSize: 14, lineHeight: 1.5, background: 'rgba(245,158,11,0.12)', padding: '12px 14px', borderRadius: 12 }}>
                ⏳ {getText('Tu solicitud está en revisión. Mientras tanto ves el precio público.', 'Your request is under review. Meanwhile you see the public price.')}
              </p>
            ) : (
              <p role="status" style={{ fontSize: 14, lineHeight: 1.5, background: 'rgba(16,185,129,0.12)', padding: '12px 14px', borderRadius: 12 }}>
                ✅ {me.priceListName
                  ? getText(`Compras con precio ${me.priceListName}.`, `You buy at ${me.priceListName} prices.`)
                  : getText('Eres miembro. El negocio todavía no te asignó una lista de precios.', "You're a member. The business hasn't assigned you a price list yet.")}
                {me.minOrderAmount ? <span style={{ display: 'block', marginTop: 4, fontSize: 12, color: muted }}>{getText(`Pedido mínimo: ${fmt.format(me.minOrderAmount)}`, `Minimum order: ${fmt.format(me.minOrderAmount)}`)}</span> : null}
              </p>
            )}

            {error && <p style={{ margin: '10px 0 0', fontSize: 12, color: '#b91c1c' }}>{error}</p>}

            {orders && orders.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700 }}>{getText('Mis pedidos', 'My orders')}</p>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {orders.map((o) => (
                    <li key={o.id} style={{ borderTop: `1px solid ${border}`, padding: '10px 0', display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13 }}>
                      <span>
                        {new Date(o.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'es', { day: 'numeric', month: 'short' })}
                        {' · '}{o.itemCount} {getText(o.itemCount === 1 ? 'artículo' : 'artículos', o.itemCount === 1 ? 'item' : 'items')}
                        {' · '}<span style={{ color: muted }}>{STATUS_LABEL[o.status]?.[language] ?? o.status}</span>
                      </span>
                      <span style={{ whiteSpace: 'nowrap' }}>
                        <strong>{fmt.format(o.total)}</strong>
                        {o.trackingToken && (
                          <a href={`/t/${o.trackingToken}`} style={{ marginLeft: 8, color: ink, textDecoration: 'underline' }}>{getText('Ver', 'View')}</a>
                        )}
                        {onReorder && o.status !== 'Canceled' && (o.items?.length ?? 0) > 0 && (
                          <button
                            type="button"
                            onClick={() => onReorder(o)}
                            style={{ marginLeft: 8, background: 'none', border: 0, padding: 0, color: ink, fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', fontSize: 13 }}
                          >
                            {getText('Repetir', 'Reorder')}
                          </button>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {me && me.status === 'approved' && !(orders && orders.length > 0) && (
              <div style={{ marginTop: 20 }}>
                <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700 }}>{getText('Mis pedidos', 'My orders')}</p>
                {orders === null ? (
                  <p style={{ margin: 0, fontSize: 13, color: muted }}>{getText('Cargando…', 'Loading…')}</p>
                ) : orders.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 13, color: muted }}>
                    {getText('Aún no tienes pedidos con esta cuenta. Cuando hagas uno aparecerá aquí.', "You don't have orders on this account yet. Your next order will show up here.")}
                  </p>
                ) : null}
              </div>
            )}

            <button type="button" onClick={() => account.signOut()} style={{ ...secondary, marginTop: 18, minHeight: 40, fontSize: 13 }}>
              {getText('Cerrar sesión', 'Sign out')}
            </button>
          </>
        )}
        {!token && error && <p style={{ margin: '10px 0 0', fontSize: 12, color: '#b91c1c' }}>{error}</p>}
      </div>
    </div>
  );
}
