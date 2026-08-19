'use client'
import { useMemo, useState } from 'react'
import type { CartEntry, CartItem } from './useCart'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

const FALLBACK_IMG_ES =
  'data:image/svg+xml;base64,' +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="#ece9e2"><rect width="80" height="80"/><text x="40" y="46" text-anchor="middle" fill="#aaa" font-family="sans-serif" font-size="11">sin foto</text></svg>`,
  )
const FALLBACK_IMG_EN =
  'data:image/svg+xml;base64,' +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="#ece9e2"><rect width="80" height="80"/><text x="40" y="46" text-anchor="middle" fill="#aaa" font-family="sans-serif" font-size="11">no photo</text></svg>`,
  )

function buildWhatsAppUrl(
  cart: CartEntry[],
  subtotal: number,
  tax: number,
  tip: number,
  total: number,
  phone: string,
  businessName: string,
  taxRate: number,
  getText: (es: string, en: string) => string,
): string {
  const lines = cart.map(e => {
    const base = `• ${e.qty}x ${e.item.name} — $${(e.item.price * e.qty).toFixed(2)}`
    return e.notes?.trim() ? `${base}\n   (${e.notes.trim()})` : base
  })
  const taxLabel =
    taxRate > 0
      ? `Tax (${(taxRate * 100).toFixed(3).replace(/\.?0+$/, '')}%): $${tax.toFixed(2)}`
      : null
  const tipLabel = tip > 0 ? `${getText('Propina', 'Tip')}: $${tip.toFixed(2)}` : null
  const msg = [
    `🍽 *${getText('Orden', 'Order')} — ${businessName}*`,
    '',
    ...lines,
    '',
    `Subtotal: $${subtotal.toFixed(2)}`,
    taxLabel,
    tipLabel,
    `*Total: $${total.toFixed(2)}*`,
    '',
    `${getText('Nombre', 'Name')}: `,
  ]
    .filter((l): l is string => l !== null)
    .join('\n')
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
}

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  cart: CartEntry[]
  addToCart: (item: CartItem) => void
  removeFromCart: (itemId: string) => void
  cartTotal: number
  cartCount: number
  taxRate: number
  whatsappNumber: string
  businessName: string
  currency?: string
  /** Slug del afiliado — requerido solo si onlinePayments está activo (para crear el pedido). */
  slug?: string
  /** capabilities.onlinePayments del plan — gatea el botón de pago con tarjeta, no garantiza
   *  que el afiliado ya conectó Stripe (eso lo confirma el backend al crear el pedido). */
  onlinePayments?: boolean
  /** Edita las notas de personalización de una línea — solo se usa si restaurantMode. */
  updateNotes?: (itemId: string, notes: string) => void
  /** Restaurante: habilita notas de personalización por línea + selector de propina. */
  restaurantMode?: boolean
  /** Idioma seleccionado por el visitante — con fallback a español si el template no lo pasa aún. */
  getText?: (es: string, en: string) => string
}

const TIP_PRESETS = [0.1, 0.15, 0.2] as const

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  addToCart,
  removeFromCart,
  cartTotal,
  cartCount,
  taxRate,
  whatsappNumber,
  businessName,
  currency = 'USD',
  slug,
  onlinePayments = false,
  updateNotes,
  restaurantMode = false,
  getText = (es) => es,
}: CartDrawerProps) {
  const FALLBACK_IMG = getText(FALLBACK_IMG_ES, FALLBACK_IMG_EN)
  const fmt = useMemo(
    () => new Intl.NumberFormat('en-US', { style: 'currency', currency }),
    [currency],
  )
  const [checkoutState, setCheckoutState] = useState<'idle' | 'loading' | 'unavailable'>('idle')
  // null = sin propina, number = porcentaje del preset elegido (ej. 0.15), 'custom' = usa customTip.
  const [tipMode, setTipMode] = useState<number | 'custom' | null>(null)
  const [customTip, setCustomTip] = useState('')

  if (!isOpen) return null

  const tax = cartTotal * taxRate
  const tip = !restaurantMode
    ? 0
    : tipMode === 'custom'
      ? Math.max(0, Number(customTip) || 0)
      : tipMode
        ? cartTotal * tipMode
        : 0
  const total = cartTotal + tax + tip
  const waUrl = buildWhatsAppUrl(cart, cartTotal, tax, tip, total, whatsappNumber, businessName, taxRate, getText)

  async function handleCardCheckout() {
    if (!slug) return
    setCheckoutState('loading')
    try {
      const origin = window.location.origin
      const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(e => ({
            itemId: e.item.id,
            name: e.item.name,
            price: e.item.price,
            qty: e.qty,
            notes: e.notes?.trim() || undefined,
          })),
          subtotal: cartTotal,
          tax,
          tip,
          total,
          currency,
          successUrl: `${origin}${window.location.pathname}?paid=true`,
          cancelUrl: `${origin}${window.location.pathname}?paid=false`,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.checkoutUrl) {
        // El pedido queda guardado igual (visible para el afiliado) aunque no haya cobro —
        // esto solo significa que el afiliado no completó su conexión de Stripe todavía.
        setCheckoutState('unavailable')
        return
      }
      window.location.href = data.checkoutUrl
    } catch {
      setCheckoutState('unavailable')
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'rgba(0,0,0,.4)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 'min(420px, 95vw)',
          backgroundColor: '#ffffff',
          boxShadow: '-20px 0 60px rgba(0,0,0,.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #e5e3de',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: '11px',
                color: '#aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600,
              }}
            >
              {getText('Tu orden', 'Your order')}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 700, color: '#1a1a1a' }}>
              {cartCount} {getText(cartCount === 1 ? 'plato' : 'platos', cartCount === 1 ? 'item' : 'items')}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={getText('Cerrar carrito', 'Close cart')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#f8f6f1',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1a1a1a',
            }}
          >
            ×
          </button>
        </div>

        {/* ── Items ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {cart.map(entry => (
            <div
              key={entry.item.id}
              style={{
                padding: '12px 0',
                borderBottom: '1px solid #f0ede8',
              }}
            >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.item.image ?? FALLBACK_IMG}
                alt={entry.item.name}
                loading="lazy"
                onError={e => {
                  ;(e.target as HTMLImageElement).src = FALLBACK_IMG
                }}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  flexShrink: 0,
                  backgroundColor: '#f0ede8',
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    fontSize: '13px',
                    color: '#1a1a1a',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {entry.item.name}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#888' }}>
                  {fmt.format(entry.item.price * entry.qty)}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => removeFromCart(entry.item.id)}
                  aria-label={`${getText('Quitar', 'Remove')} ${entry.item.name}`}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#f0ede8',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '16px',
                    color: '#1a1a1a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  −
                </button>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: '14px',
                    minWidth: '18px',
                    textAlign: 'center',
                  }}
                >
                  {entry.qty}
                </span>
                <button
                  onClick={() => addToCart(entry.item)}
                  aria-label={`${getText('Agregar', 'Add')} ${entry.item.name}`}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#1a1a1a',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '16px',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  +
                </button>
              </div>
            </div>
            {restaurantMode && updateNotes && (
              <input
                value={entry.notes ?? ''}
                onChange={e => updateNotes(entry.item.id, e.target.value)}
                placeholder={getText('Personalizar (ej. sin cebolla)…', 'Customize (e.g. no onion)…')}
                style={{
                  marginTop: '8px',
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #e5e3de',
                  fontSize: '12px',
                  color: '#1a1a1a',
                  backgroundColor: '#ffffff',
                }}
              />
            )}
            </div>
          ))}
        </div>

        {/* ── Footer: totals + CTA ── */}
        <div
          style={{
            padding: '20px 24px calc(20px + env(safe-area-inset-bottom, 0px))',
            borderTop: '1px solid #e5e3de',
            backgroundColor: '#f8f6f1',
          }}
        >
          {restaurantMode && (
            <div style={{ marginBottom: '14px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 600, color: '#888' }}>
                {getText('Propina', 'Tip')}
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                {TIP_PRESETS.map(pct => (
                  <button
                    key={pct}
                    onClick={() => setTipMode(tipMode === pct ? null : pct)}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: '9999px',
                      border: tipMode === pct ? 'none' : '1px solid #e5e3de',
                      backgroundColor: tipMode === pct ? '#1a1a1a' : '#ffffff',
                      color: tipMode === pct ? '#ffffff' : '#1a1a1a',
                      fontWeight: 600,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {Math.round(pct * 100)}%
                  </button>
                ))}
                <button
                  onClick={() => setTipMode(tipMode === 'custom' ? null : 'custom')}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: '9999px',
                    border: tipMode === 'custom' ? 'none' : '1px solid #e5e3de',
                    backgroundColor: tipMode === 'custom' ? '#1a1a1a' : '#ffffff',
                    color: tipMode === 'custom' ? '#ffffff' : '#1a1a1a',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  {getText('Otro', 'Other')}
                </button>
              </div>
              {tipMode === 'custom' && (
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={customTip}
                  onChange={e => setCustomTip(e.target.value)}
                  placeholder={getText('Monto de propina', 'Tip amount')}
                  style={{
                    marginTop: '8px',
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #e5e3de',
                    fontSize: '13px',
                  }}
                />
              )}
            </div>
          )}
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#888' }}>Subtotal</span>
              <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{fmt.format(cartTotal)}</span>
            </div>
            {taxRate > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#aaa' }}>
                  Tax ({(taxRate * 100).toFixed(3).replace(/\.?0+$/, '')}%)
                </span>
                <span style={{ color: '#aaa' }}>{fmt.format(tax)}</span>
              </div>
            )}
            {tip > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#aaa' }}>{getText('Propina', 'Tip')}</span>
                <span style={{ color: '#aaa' }}>{fmt.format(tip)}</span>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '16px',
                paddingTop: '8px',
                borderTop: '1px solid #e5e3de',
              }}
            >
              <span style={{ fontWeight: 700, color: '#1a1a1a' }}>{getText('Total', 'Total')}</span>
              <span style={{ fontWeight: 700, color: '#1a1a1a' }}>{fmt.format(total)}</span>
            </div>
          </div>

          {onlinePayments && slug && (
            <>
              <button
                onClick={handleCardCheckout}
                disabled={checkoutState === 'loading'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  backgroundColor: '#1a1a1a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '14px',
                  fontWeight: 600,
                  fontSize: '14px',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                  cursor: checkoutState === 'loading' ? 'default' : 'pointer',
                  opacity: checkoutState === 'loading' ? 0.7 : 1,
                  marginBottom: '10px',
                }}
              >
                {checkoutState === 'loading'
                  ? getText('Redirigiendo...', 'Redirecting...')
                  : getText(`Pagar ${fmt.format(total)} con tarjeta`, `Pay ${fmt.format(total)} with card`)}
              </button>
              {checkoutState === 'unavailable' && (
                <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#b91c1c', textAlign: 'center' }}>
                  {getText(
                    'Los pagos en línea no están disponibles ahora mismo — confirma por WhatsApp.',
                    'Online payments are not available right now — confirm via WhatsApp.',
                  )}
                </p>
              )}
            </>
          )}

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              backgroundColor: '#25D366',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '14px',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
              minHeight: '48px',
              boxSizing: 'border-box',
            }}
          >
            <WhatsAppIcon />
            {getText('Confirmar por WhatsApp', 'Confirm via WhatsApp')}
          </a>
        </div>
      </div>
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
