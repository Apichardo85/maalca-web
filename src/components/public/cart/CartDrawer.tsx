'use client'
import { formatPhoneInput, isValidPhone, normalizePhone, PHONE_INPUT_PROPS } from '@/lib/phone';
import { useEffect, useMemo, useState } from 'react'
import { addStep, addWouldExceed, deliveryDaysLabel, qtyRuleError, removeStep, shippingCost, US_ZIP, type PublicShippingMethod } from '@/lib/commerce'
import type { CartEntry, CartItem } from './useCart'
import { storeOrderEndpoint } from '@/lib/store-account'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

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
  scheduleNote?: string,
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
    scheduleNote ? `🕒 *${scheduleNote}*` : null,
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

export interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  cart: CartEntry[]
  addToCart: (item: CartItem, qty?: number) => void
  removeFromCart: (itemId: string, qty?: number) => void
  cartTotal: number
  cartCount: number
  taxRate: number
  /** El envío también paga impuesto (mismo criterio que SalesTax.Compute en el API). */
  taxOnShipping?: boolean
  /** Estado donde el negocio cobra impuesto: un envío a otro estado va sin impuesto (mismo criterio que el API). */
  taxState?: string | null
  whatsappNumber: string
  businessName: string
  currency?: string
  /** Slug del afiliado — requerido solo si onlinePayments está activo (para crear el pedido). */
  slug?: string
  /** capabilities.onlinePayments del plan — gatea el botón de pago con tarjeta, no garantiza
   *  que el afiliado ya conectó Stripe (eso lo confirma el backend al crear el pedido). */
  onlinePayments?: boolean
  /** Pedidos en línea pausados (módulo apagado): se muestra un aviso y solo queda el canal directo. */
  ordersPaused?: boolean
  /** Regla de confianza del negocio: un cliente NUEVO solo puede pagar al recoger hasta este total.
   *  Aquí solo se avisa (no sabemos si quien pide es nuevo); el API decide al crear el pedido. */
  pickupNewCustomerLimit?: number | null
  /** Envío a domicilio (Retail): métodos activos del negocio. Se ofrece solo con pago online (un envío se cobra
   *  antes de despacharse) y fuera de pedidos de mesa. Con perfumes en el carrito, solo métodos terrestres. */
  shippingMethods?: PublicShippingMethod[]
  /** Cliente con sesión en la tienda (miembro/mayorista): el pedido va con su token y el API aplica su lista. */
  storeSession?: { token: string; name?: string | null; email?: string | null; priceListName?: string | null; minOrderAmount?: number | null; taxExempt?: boolean } | null
  /** Edita las notas de personalización de una línea — solo se usa si restaurantMode. */
  updateNotes?: (itemId: string, notes: string) => void
  /** Restaurante: habilita notas de personalización por línea + selector de propina. */
  restaurantMode?: boolean
  /** Habilita el flujo de pedido para recoger (datos de contacto + "pagar al recoger") sin el resto del modo
   *  restaurante (propina, notas por línea). Lo usa Retail. Restaurant ya lo tiene vía restaurantMode. */
  pickupOrders?: boolean
  /** Idioma seleccionado por el visitante — con fallback a español si el template no lo pasa aún. */
  getText?: (es: string, en: string) => string
  /** Pedido desde la mesa (QR `?mesa=7`). Con valor: sin WhatsApp, y se ofrece "Pagar al mesero". */
  tableNumber?: string
  /** Negocio cerrado: el pedido solo se acepta programado para la próxima apertura. Null/ausente =
   *  abierto (o sin horario configurado): sin restricción. La web lo bloquea al instante; el API repite la regla. */
  schedule?: { dateIso: string; whenEs: string; whenEn: string; opensAtLabel: string } | null
  /** Se llama al cerrar el panel después de enviar un pedido: el padre vacía el carrito para no reenviarlo. */
  onOrderComplete?: () => void
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
  taxOnShipping = true,
  taxState = null,
  whatsappNumber,
  businessName,
  currency = 'USD',
  slug,
  onlinePayments = false,
  ordersPaused = false,
  pickupNewCustomerLimit = null,
  shippingMethods,
  storeSession = null,
  updateNotes,
  restaurantMode = false,
  pickupOrders = false,
  getText = (es) => es,
  tableNumber,
  schedule = null,
  onOrderComplete,
}: CartDrawerProps) {
  const fmt = useMemo(
    () => new Intl.NumberFormat('en-US', { style: 'currency', currency }),
    [currency],
  )
  const [checkoutState, setCheckoutState] = useState<'idle' | 'loading' | 'unavailable' | 'placed' | 'error'>('idle')
  const [tableError, setTableError] = useState('')
  // Datos de contacto opcionales (restaurante): si los dejan, el pedido crea/enlaza el cliente.
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  // Pedido para recoger pagando en el local: se envía al panel del restaurante, sin WhatsApp ni tarjeta.
  const [pickupPlaced, setPickupPlaced] = useState(false)
  const [pickupError, setPickupError] = useState('')
  // Token de seguimiento (/t/{token}) del pedido recién enviado — un solo enlace en lugar de correos por cada cambio.
  const [trackingToken, setTrackingToken] = useState<string | null>(null)
  // null = sin propina, number = porcentaje del preset elegido (ej. 0.15), 'custom' = usa customTip.
  const [tipMode, setTipMode] = useState<number | 'custom' | null>(null)
  const [customTip, setCustomTip] = useState('')
  // Cerrado: el cliente confirma que entiende que el pedido es para la próxima apertura.
  const [scheduleAck, setScheduleAck] = useState(false)
  // Envío a domicilio (Retail): recoger (default) o envío, con método y dirección.
  const [fulfillment, setFulfillment] = useState<'pickup' | 'shipping'>('pickup')
  const [shipMethodId, setShipMethodId] = useState<string | null>(null)
  const [shipTo, setShipTo] = useState({ line1: '', line2: '', city: '', state: '', zip: '' })

  // Con sesión de miembro: nombre y correo de su cuenta precargados (los puede cambiar).
  useEffect(() => {
    if (!isOpen || !storeSession) return
    if (storeSession.name) setGuestName(n => n || storeSession.name || '')
    if (storeSession.email) setGuestEmail(m => m || storeSession.email || '')
  }, [isOpen, storeSession])

  // Pedido con sesión → endpoint de tienda con su token (el API aplica la lista del cliente); invitado → público.
  const orderUrl = storeSession && slug ? storeOrderEndpoint(slug) : `${API_BASE}/api/public/affiliates/${slug}/orders`
  const orderHeaders: Record<string, string> = storeSession
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${storeSession.token}` }
    : { 'Content-Type': 'application/json' }

  // Con el carrito abierto la página de atrás no debe moverse: el scroll es solo del panel.
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  if (!isOpen) return null

  // Canales realmente disponibles: sin número de WhatsApp no se ofrece WhatsApp; sin Stripe conectado
  // (el padre pasa onlinePayments ya filtrado) no se ofrece tarjeta. Queda "recoger y pagar en el local".
  const hasWhatsApp = whatsappNumber.replace(/\D/g, '').length >= 7
  // Datos de contacto del cliente + "pagar al recoger": restaurantes y negocios que lo piden (pickupOrders).
  const guestCheckout = restaurantMode || pickupOrders

  // Pedido ya enviado: al cerrar se vacía el carrito y el panel vuelve a su estado inicial.
  const orderSent = pickupPlaced || (!!tableNumber && checkoutState === 'placed')
  function handleClose() {
    if (orderSent) {
      onOrderComplete?.()
      setPickupPlaced(false)
      setTrackingToken(null)
      setCheckoutState('idle')
    }
    onClose()
  }

  const scheduleWhen = schedule ? getText(schedule.whenEs, schedule.whenEn) : ''
  const scheduleNote = schedule
    ? getText(
        `PEDIDO PROGRAMADO para ${schedule.whenEs} a las ${schedule.opensAtLabel}`,
        `ORDER SCHEDULED for ${schedule.whenEn} at ${schedule.opensAtLabel}`,
      )
    : undefined
  // Envío a domicilio: solo con pago online y fuera de la mesa. Con perfumes (hazmat) solo métodos terrestres.
  const hazmatInCart = cart.some(e => !!e.item.rules?.hazmat)
  const shipMethods = (shippingMethods ?? []).filter(m => !hazmatInCart || m.allowsHazmat)
  const canShip = guestCheckout && !!slug && onlinePayments && !tableNumber && (shippingMethods?.length ?? 0) > 0
  const shipping = canShip && fulfillment === 'shipping'
  const shipMethod = shipping ? (shipMethods.find(m => m.id === shipMethodId) ?? shipMethods[0] ?? null) : null
  const shipCost = shipMethod ? shippingCost(shipMethod, cartTotal) : 0

  // Reglas de cantidad (mínimo / múltiplo / máximo): el API las exige igual; aquí se avisa antes de enviar.
  // Pedido mínimo de la lista del cliente (mayorista): sin llegar al mínimo no se puede pedir (el API lo exige igual).
  const belowMinOrder = !!storeSession?.minOrderAmount && cartTotal < storeSession.minOrderAmount
  const ruleError = cart.map(e => qtyRuleError(e.item.name, e.qty, e.item.rules, getText)).find(Boolean) ?? null

  // Cerrado y sin confirmar (o pedido de mesa, que no se programa): los botones de envío quedan apagados.
  // Un envío no depende del horario: se despacha cuando abran.
  const closedBlocked = !shipping && !!schedule && (!scheduleAck || !!tableNumber)
  const scheduledFor = !shipping && schedule && scheduleAck && !tableNumber ? schedule.dateIso : undefined

  // Mismo cálculo que el API (SalesTax.Compute): subtotal (+ envío si se grava), redondeado; lista exenta = 0.
  const outOfStateShipment = shipping && !!taxState && shipTo.state.trim().length === 2
    && shipTo.state.trim().toUpperCase() !== taxState.toUpperCase()
  const taxExempt = !!storeSession?.taxExempt || outOfStateShipment
  const tax = taxExempt ? 0 : Math.round((cartTotal + (taxOnShipping ? shipCost : 0)) * taxRate * 100) / 100
  const tip = !restaurantMode
    ? 0
    : tipMode === 'custom'
      ? Math.max(0, Number(customTip) || 0)
      : tipMode
        ? cartTotal * tipMode
        : 0
  const total = cartTotal + tax + tip + shipCost
  const waUrl = buildWhatsAppUrl(cart, cartTotal, tax, tip, total, whatsappNumber, businessName, taxRate, getText, scheduledFor ? scheduleNote : undefined)

  /** Validación del envío antes de ir a pagar: método, dirección completa y un contacto para avisar. */
  function shippingProblem(): string | null {
    if (!shipping) return null
    if (!shipMethod) return getText('Tu pedido incluye perfumes: este negocio no tiene envío terrestre. Elige recoger.', 'Your order includes perfumes: this business has no ground shipping. Choose pickup.')
    if (guestName.trim().length < 2) return getText('Escribe tu nombre para el envío.', 'Enter your name for shipping.')
    if (!(guestPhone && isValidPhone(guestPhone)) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim()))
      return getText('Déjanos un teléfono o correo para avisarte del envío.', 'Leave a phone or email so we can update you.')
    if (shipTo.line1.trim().length < 3 || shipTo.city.trim().length < 2 || shipTo.state.trim().length < 2)
      return getText('Completa la dirección (calle, ciudad y estado).', 'Complete the address (street, city and state).')
    if (!US_ZIP.test(shipTo.zip.trim())) return getText('El código postal (ZIP) no es válido.', 'The ZIP code is not valid.')
    return null
  }

  async function handleCardCheckout() {
    if (!slug || closedBlocked || ruleError || belowMinOrder) return
    const problem = shippingProblem()
    if (problem) {
      setTableError(problem)
      setCheckoutState('error')
      return
    }
    setCheckoutState('loading')
    setTableError('')
    try {
      const origin = window.location.origin
      const res = await fetch(orderUrl, {
        method: 'POST',
        headers: orderHeaders,
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
          customerName: guestName.trim() || undefined,
          customerPhone: guestPhone && isValidPhone(guestPhone) ? normalizePhone(guestPhone) : undefined,
          customerEmail: guestEmail.trim() || undefined,
          successUrl: `${origin}${window.location.pathname}?paid=true${tableNumber ? `&mesa=${encodeURIComponent(tableNumber)}` : ''}`,
          cancelUrl: `${origin}${window.location.pathname}?paid=false${tableNumber ? `&mesa=${encodeURIComponent(tableNumber)}` : ''}`,
          tableNumber: tableNumber || undefined,
          scheduledFor,
          ...(shipping && shipMethod
            ? {
                fulfillmentType: 'shipping',
                shippingMethodId: shipMethod.id,
                shipTo: {
                  name: guestName.trim(),
                  line1: shipTo.line1.trim(),
                  line2: shipTo.line2.trim() || undefined,
                  city: shipTo.city.trim(),
                  state: shipTo.state.trim().toUpperCase(),
                  zip: shipTo.zip.trim(),
                },
              }
            : {}),
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok && res.status < 500 && data?.error?.message) {
        // Regla del servidor (cerrado, plato de otro día…): se muestra el motivo real.
        setTableError(data.error.message)
        setCheckoutState('error')
        return
      }
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

  // Pedido para recoger pagando en el local: sin Stripe ni WhatsApp. Le llega al restaurante (panel + push)
  // y al cliente le llega correo cuando lo aceptan y cuando está listo.
  async function handlePayAtPickup() {
    if (!slug || tableNumber || closedBlocked || shipping || belowMinOrder) return
    if (ruleError) {
      setPickupError(ruleError)
      return
    }
    const name = guestName.trim()
    const phoneOk = !!guestPhone && isValidPhone(guestPhone)
    const email = guestEmail.trim()
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!name || (!phoneOk && !emailOk)) {
      setPickupError(getText(
        'Escribe tu nombre y un teléfono o correo para avisarte cuando esté listo.',
        'Enter your name and a phone or email so we can let you know when it is ready.',
      ))
      return
    }
    setPickupError('')
    setCheckoutState('loading')
    try {
      const res = await fetch(orderUrl, {
        method: 'POST',
        headers: orderHeaders,
        body: JSON.stringify({
          items: cart.map(e => ({ itemId: e.item.id, name: e.item.name, price: e.item.price, qty: e.qty, notes: e.notes?.trim() || undefined })),
          subtotal: cartTotal,
          tax,
          tip,
          total,
          currency,
          customerName: name,
          customerPhone: phoneOk ? normalizePhone(guestPhone) : undefined,
          customerEmail: emailOk ? email : undefined,
          scheduledFor,
          payAtPickup: true,
          language: getText('es', 'en'),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setPickupError(data?.error?.message ?? getText('No pudimos enviar el pedido. Inténtalo de nuevo.', 'We could not send the order. Please try again.'))
        setCheckoutState('error')
        return
      }
      const placed = await res.json().catch(() => null)
      const tk: string | null = placed?.trackingToken ?? null
      setTrackingToken(tk)
      if (tk) {
        try {
          const prev = JSON.parse(localStorage.getItem('maalca_orders') ?? '[]')
          localStorage.setItem('maalca_orders', JSON.stringify([{ slug, token: tk, at: Date.now() }, ...prev].slice(0, 10)))
        } catch { /* sin storage: el enlace igual se muestra en pantalla */ }
      }
      setPickupPlaced(true)
      setCheckoutState('placed')
    } catch {
      setPickupError(getText('No pudimos enviar el pedido. Inténtalo de nuevo.', 'We could not send the order. Please try again.'))
      setCheckoutState('error')
    }
  }

  // Pedido de mesa pagando al mesero: sin Stripe, el pedido le llega al personal para que lo acepte.
  async function handlePayAtTable() {
    if (!slug || !tableNumber || closedBlocked) return
    setCheckoutState('loading')
    setTableError('')
    try {
      const res = await fetch(orderUrl, {
        method: 'POST',
        headers: orderHeaders,
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
          customerName: guestName.trim() || undefined,
          customerPhone: guestPhone && isValidPhone(guestPhone) ? normalizePhone(guestPhone) : undefined,
          customerEmail: guestEmail.trim() || undefined,
          tableNumber,
          payAtTable: true,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setTableError(data?.error?.message ?? '')
        setCheckoutState('error')
        return
      }
      setCheckoutState('placed')
    } catch {
      setCheckoutState('error')
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
      onClick={handleClose}
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
          height: '100dvh',
          maxHeight: '100dvh',
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
              {cartCount} {getText(restaurantMode ? (cartCount === 1 ? 'plato' : 'platos') : (cartCount === 1 ? 'artículo' : 'artículos'), cartCount === 1 ? 'item' : 'items')}
            </p>
          </div>
          <button
            onClick={handleClose}
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
        <div style={{ flex: '1 1 auto', minHeight: '110px', overflowY: 'auto', overscrollBehavior: 'contain', padding: '16px 24px' }}>
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
              {/* Sin foto: no hay miniatura (como DoorDash) — el nombre y el precio ocupan todo el ancho. */}
              {entry.item.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={entry.item.image}
                  alt={entry.item.name}
                  loading="lazy"
                  onError={e => {
                    // Foto rota: se oculta en vez de mostrar un recuadro vacío.
                    ;(e.target as HTMLImageElement).style.display = 'none'
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
              )}
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
                {entry.item.listPrice != null && (
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#2f6b3f', fontWeight: 600 }}>
                    {getText(`Precio por volumen: ${fmt.format(entry.item.price)} c/u`, `Volume price: ${fmt.format(entry.item.price)} each`)}{' '}
                    <s style={{ color: '#888', fontWeight: 400 }}>{fmt.format(entry.item.listPrice)}</s>
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => removeFromCart(entry.item.id, removeStep(entry.qty, entry.item.rules))}
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
                  onClick={() => addToCart(entry.item, addStep(entry.qty, entry.item.rules))}
                  disabled={addWouldExceed(entry.qty, entry.item.rules, null)}
                  aria-label={`${getText('Agregar', 'Add')} ${entry.item.name}`}
                  style={{
                    opacity: addWouldExceed(entry.qty, entry.item.rules, null) ? 0.35 : 1,
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
            flex: '0 1 auto',
            maxHeight: '58%',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
          }}
        >
          {ordersPaused && (
            <div
              role="status"
              style={{
                marginBottom: '14px',
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa',
                color: '#9a3412',
                fontSize: '13px',
                lineHeight: 1.45,
              }}
            >
              {getText(
                hasWhatsApp
                  ? 'Por ahora no estamos recibiendo pedidos en línea. Envíanos tu pedido por WhatsApp y te confirmamos.'
                  : 'Por ahora no estamos recibiendo pedidos en línea. Contáctanos directamente para pedir.',
                hasWhatsApp
                  ? "We're not taking online orders right now. Send your order by WhatsApp and we'll confirm it."
                  : "We're not taking online orders right now. Please contact us directly to order.",
              )}
            </div>
          )}

          {restaurantMode && !orderSent && (
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
                    color: '#1a1a1a',
                    backgroundColor: '#ffffff',
                  }}
                />
              )}
            </div>
          )}
          {canShip && !orderSent && (
            <div style={{ marginBottom: '14px' }}>
              <div role="radiogroup" style={{ display: 'flex', gap: '6px', marginBottom: shipping ? '10px' : 0 }}>
                {(['pickup', 'shipping'] as const).map(opt => (
                  <button
                    key={opt}
                    role="radio"
                    aria-checked={fulfillment === opt}
                    onClick={() => setFulfillment(opt)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: '9999px', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                      border: fulfillment === opt ? 'none' : '1px solid #e5e3de',
                      backgroundColor: fulfillment === opt ? '#1a1a1a' : '#ffffff',
                      color: fulfillment === opt ? '#ffffff' : '#1a1a1a',
                    }}
                  >
                    {opt === 'pickup' ? getText('Recoger en tienda', 'Store pickup') : getText('Envío a domicilio', 'Ship to me')}
                  </button>
                ))}
              </div>
              {shipping && (
                <>
                  {shipMethods.length === 0 ? (
                    <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#b91c1c' }}>
                      {getText(
                        'Tu pedido incluye perfumes, que solo viajan por tierra, y este negocio no tiene envío terrestre. Elige recoger.',
                        'Your order includes perfumes, which ship by ground only, and this business has no ground shipping. Choose pickup.',
                      )}
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                      {shipMethods.map(m => {
                        const cost = shippingCost(m, cartTotal)
                        const days = deliveryDaysLabel(m, getText)
                        const selected = shipMethod?.id === m.id
                        return (
                          <label
                            key={m.id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                              border: selected ? '1.5px solid #1a1a1a' : '1px solid #e5e3de', backgroundColor: '#ffffff', fontSize: '13px',
                            }}
                          >
                            <input type="radio" name="ship-method" checked={selected} onChange={() => setShipMethodId(m.id)} />
                            <span style={{ flex: 1, minWidth: 0 }}>
                              <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{getText(m.name, m.nameEn || m.name)}</span>
                              {days && <span style={{ display: 'block', fontSize: '11px', color: '#888' }}>{days}</span>}
                            </span>
                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{cost === 0 ? getText('Gratis', 'Free') : fmt.format(cost)}</span>
                          </label>
                        )
                      })}
                      {hazmatInCart && (
                        <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>
                          {getText('Los perfumes solo viajan por tierra: te mostramos los envíos terrestres.', 'Perfumes ship by ground only: showing ground options.')}
                        </p>
                      )}
                    </div>
                  )}
                  <input
                    value={shipTo.line1}
                    onChange={e => setShipTo(a => ({ ...a, line1: e.target.value }))}
                    maxLength={200}
                    autoComplete="address-line1"
                    placeholder={getText('Dirección (calle y número)', 'Street address')}
                    style={{ width: '100%', marginBottom: '8px', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e3de', fontSize: '13px' }}
                  />
                  <input
                    value={shipTo.line2}
                    onChange={e => setShipTo(a => ({ ...a, line2: e.target.value }))}
                    maxLength={200}
                    autoComplete="address-line2"
                    placeholder={getText('Apto, suite (opcional)', 'Apt, suite (optional)')}
                    style={{ width: '100%', marginBottom: '8px', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e3de', fontSize: '13px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      value={shipTo.city}
                      onChange={e => setShipTo(a => ({ ...a, city: e.target.value }))}
                      maxLength={100}
                      autoComplete="address-level2"
                      placeholder={getText('Ciudad', 'City')}
                      style={{ flex: 2, minWidth: 0, boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e3de', fontSize: '13px' }}
                    />
                    <input
                      value={shipTo.state}
                      onChange={e => setShipTo(a => ({ ...a, state: e.target.value.toUpperCase() }))}
                      maxLength={2}
                      autoComplete="address-level1"
                      placeholder={getText('Estado', 'State')}
                      style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e3de', fontSize: '13px' }}
                    />
                    <input
                      value={shipTo.zip}
                      onChange={e => setShipTo(a => ({ ...a, zip: e.target.value }))}
                      maxLength={10}
                      inputMode="numeric"
                      autoComplete="postal-code"
                      placeholder="ZIP"
                      style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e3de', fontSize: '13px' }}
                    />
                  </div>
                </>
              )}
            </div>
          )}
          {guestCheckout && slug && checkoutState !== 'placed' && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                type="text"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                maxLength={80}
                autoComplete="name"
                placeholder={getText('Tu nombre', 'Your name')}
                style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e3de', fontSize: '13px' }}
              />
              <input
                {...PHONE_INPUT_PROPS}
                value={guestPhone}
                onChange={e => setGuestPhone(formatPhoneInput(e.target.value))}
                placeholder={getText('Teléfono', 'Phone')}
                style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e3de', fontSize: '13px' }}
              />
            </div>
          )}
          {guestCheckout && slug && !tableNumber && checkoutState !== 'placed' && (
            <input
              type="email"
              value={guestEmail}
              onChange={e => setGuestEmail(e.target.value)}
              maxLength={120}
              autoComplete="email"
              placeholder={getText('Correo (te avisamos cuando esté listo)', 'Email (we notify you when it is ready)')}
              style={{ width: '100%', marginBottom: '14px', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e3de', fontSize: '13px' }}
            />
          )}
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#888' }}>Subtotal</span>
              <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{fmt.format(cartTotal)}</span>
            </div>
            {taxRate > 0 && taxExempt && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#aaa' }}>Tax</span>
                <span style={{ color: '#aaa' }}>
                  {outOfStateShipment
                    ? getText(`Sin impuesto (envío fuera de ${taxState})`, `No tax (shipping outside ${taxState})`)
                    : getText('Exento (reventa)', 'Exempt (resale)')}
                </span>
              </div>
            )}
            {taxRate > 0 && !taxExempt && (
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
            {shipMethod && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#aaa' }}>{getText('Envío', 'Shipping')}</span>
                <span style={{ color: '#aaa' }}>{shipCost === 0 ? getText('Gratis', 'Free') : fmt.format(shipCost)}</span>
              </div>
            )}
            {ruleError && (
              <p role="alert" style={{ margin: '4px 0 0', fontSize: '12px', color: '#b91c1c' }}>{ruleError}</p>
            )}
            {storeSession?.priceListName && (
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#047857', fontWeight: 600 }}>
                🏷️ {getText(`Precio ${storeSession.priceListName} aplicado`, `${storeSession.priceListName} pricing applied`)}
                {storeSession.minOrderAmount && cartTotal < storeSession.minOrderAmount ? (
                  <span style={{ display: 'block', color: '#b45309', fontWeight: 500 }}>
                    {getText(`Pedido mínimo ${fmt.format(storeSession.minOrderAmount)} (te faltan ${fmt.format(storeSession.minOrderAmount - cartTotal)})`, `Minimum order ${fmt.format(storeSession.minOrderAmount)} (${fmt.format(storeSession.minOrderAmount - cartTotal)} to go)`)}
                  </span>
                ) : null}
              </p>
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

          {tableNumber && (
            <p
              style={{
                margin: '0 0 12px',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#f6f1e7',
                fontSize: '13px',
                fontWeight: 600,
                color: '#1a1a1a',
                textAlign: 'center',
              }}
            >
              {getText(`Mesa ${tableNumber}`, `Table ${tableNumber}`)}
            </p>
          )}

          {tableNumber && checkoutState === 'placed' && (
            <p
              role="status"
              style={{
                margin: '0 0 10px',
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: '#e8f5e9',
                color: '#1b5e20',
                fontSize: '14px',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              {getText(
                '¡Pedido enviado! Un mesero lo confirmará en un momento y pagas al final.',
                'Order sent! A server will confirm it shortly and you pay at the end.',
              )}
            </p>
          )}

          {schedule && !shipping && checkoutState !== 'placed' && (
            <div
              role="status"
              style={{
                margin: '0 0 12px',
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: '#FBF0DC',
                border: '1px solid #f0dfba',
                color: '#6B4A12',
                fontSize: '13px',
                lineHeight: 1.45,
              }}
            >
              <p style={{ margin: 0, fontWeight: 700 }}>
                {getText('Estamos cerrados ahora.', "We're closed right now.")}
              </p>
              {tableNumber ? (
                <p style={{ margin: '4px 0 0' }}>
                  {getText(
                    'Los pedidos de mesa solo se pueden hacer mientras estamos abiertos.',
                    'Table orders can only be placed while we are open.',
                  )}
                </p>
              ) : (
                <label style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={scheduleAck}
                    onChange={e => setScheduleAck(e.target.checked)}
                    style={{ marginTop: '2px', width: '18px', height: '18px', flexShrink: 0 }}
                  />
                  <span>
                    {getText(
                      `Programar mi pedido para ${scheduleWhen} a las ${schedule.opensAtLabel}.`,
                      `Schedule my order for ${scheduleWhen} at ${schedule.opensAtLabel}.`,
                    )}
                  </span>
                </label>
              )}
            </div>
          )}

          {onlinePayments && slug && !orderSent && (
            <>
              <button
                onClick={handleCardCheckout}
                disabled={checkoutState === 'loading' || closedBlocked || !!ruleError || belowMinOrder || (shipping && !shipMethod)}
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
                  cursor: checkoutState === 'loading' || closedBlocked ? 'default' : 'pointer',
                  opacity: checkoutState === 'loading' ? 0.7 : closedBlocked ? 0.45 : 1,
                  marginBottom: '10px',
                }}
              >
                {checkoutState === 'loading'
                  ? getText('Redirigiendo...', 'Redirecting...')
                  : getText(`Pagar ${fmt.format(total)} con tarjeta`, `Pay ${fmt.format(total)} with card`)}
              </button>
              {checkoutState === 'error' && !tableNumber && (
                <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#b91c1c', textAlign: 'center' }}>
                  {tableError || getText('No pudimos enviar el pedido. Inténtalo de nuevo.', 'We could not send the order. Please try again.')}
                </p>
              )}
              {checkoutState === 'unavailable' && (
                <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#b91c1c', textAlign: 'center' }}>
                  {getText(
                    hasWhatsApp
                      ? 'Los pagos en línea no están disponibles ahora mismo — confirma por WhatsApp.'
                      : 'Los pagos en línea no están disponibles ahora mismo — usa "Pedir y pagar al recoger".',
                    hasWhatsApp
                      ? 'Online payments are not available right now — confirm via WhatsApp.'
                      : 'Online payments are not available right now — use "Order and pay at pickup".',
                  )}
                </p>
              )}
            </>
          )}

          {tableNumber && slug && checkoutState !== 'placed' && (
            <>
              <button
                onClick={handlePayAtTable}
                disabled={checkoutState === 'loading' || closedBlocked}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  backgroundColor: onlinePayments ? '#ffffff' : '#1a1a1a',
                  color: onlinePayments ? '#1a1a1a' : '#ffffff',
                  border: onlinePayments ? '1px solid #1a1a1a' : 'none',
                  borderRadius: '9999px',
                  padding: '14px',
                  fontWeight: 600,
                  fontSize: '14px',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                  cursor: checkoutState === 'loading' || closedBlocked ? 'default' : 'pointer',
                  opacity: checkoutState === 'loading' ? 0.7 : closedBlocked ? 0.45 : 1,
                }}
              >
                {checkoutState === 'loading'
                  ? getText('Enviando...', 'Sending...')
                  : getText('Pedir y pagar al mesero', 'Order and pay the server')}
              </button>
              {checkoutState === 'error' && (
                <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#b91c1c', textAlign: 'center' }}>
                  {tableError ||
                    getText(
                      'No pudimos enviar el pedido. Llama a un mesero.',
                      'We could not send the order. Please call a server.',
                    )}
                </p>
              )}
            </>
          )}

          {pickupPlaced && (
            <p
              role="status"
              style={{ margin: '0 0 10px', padding: '14px', borderRadius: '12px', backgroundColor: '#e8f5e9', color: '#1b5e20', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}
            >
              {getText(
                `¡Pedido enviado! ${restaurantMode ? 'El restaurante' : 'El negocio'} lo confirmará en un momento y pagas al recogerlo.`,
                `Order sent! ${restaurantMode ? 'The restaurant' : 'The business'} will confirm it shortly and you pay when you pick it up.`,
              )}
            </p>
          )}
          {pickupPlaced && trackingToken && (
            <a
              href={`/t/${trackingToken}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%',
                backgroundColor: '#1a1a1a', color: '#ffffff', borderRadius: '9999px', padding: '14px',
                fontWeight: 600, fontSize: '14px', textDecoration: 'none', minHeight: '48px',
                boxSizing: 'border-box', marginBottom: '10px',
              }}
            >
              {getText('Seguir mi pedido →', 'Track my order →')}
            </a>
          )}
          {pickupPlaced && trackingToken && (
            <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#777', textAlign: 'center' }}>
              {getText(
                'Guarda este enlace: ahí ves el estado y la hora estimada sin que te escribamos.',
                'Save this link: you can see the status and estimated time there, no extra messages.',
              )}
            </p>
          )}

          {guestCheckout && slug && !tableNumber && !pickupPlaced && !shipping && (
            <>
              <button
                onClick={handlePayAtPickup}
                disabled={checkoutState === 'loading' || closedBlocked || belowMinOrder}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%',
                  backgroundColor: onlinePayments ? '#ffffff' : '#1a1a1a',
                  color: onlinePayments ? '#1a1a1a' : '#ffffff',
                  border: onlinePayments ? '1px solid #1a1a1a' : 'none',
                  borderRadius: '9999px', padding: '14px', fontWeight: 600, fontSize: '14px', minHeight: '48px',
                  boxSizing: 'border-box', marginBottom: '10px',
                  cursor: checkoutState === 'loading' || closedBlocked ? 'default' : 'pointer',
                  opacity: checkoutState === 'loading' ? 0.7 : closedBlocked || belowMinOrder ? 0.45 : 1,
                }}
              >
                {checkoutState === 'loading'
                  ? getText('Enviando...', 'Sending...')
                  : getText('Pedir y pagar al recoger', 'Order and pay at pickup')}
              </button>
              {pickupError && (
                <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#b91c1c', textAlign: 'center' }}>{pickupError}</p>
              )}
              {!pickupError && pickupNewCustomerLimit != null && total > pickupNewCustomerLimit && (
                <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#777', textAlign: 'center' }}>
                  {getText(
                    `Si es tu primer pedido aquí, pagar al recoger está disponible hasta ${fmt.format(pickupNewCustomerLimit)}${onlinePayments ? ': paga con tarjeta arriba' : ''}.`,
                    `If this is your first order here, pay at pickup is available up to ${fmt.format(pickupNewCustomerLimit)}${onlinePayments ? ': pay by card above' : ''}.`,
                  )}
                </p>
              )}
            </>
          )}

          {!tableNumber && !pickupPlaced && !shipping && hasWhatsApp && (<a
            href={closedBlocked ? undefined : waUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={closedBlocked}
            onClick={e => { if (closedBlocked) e.preventDefault() }}
            style={{
              opacity: closedBlocked ? 0.45 : 1,
              pointerEvents: closedBlocked ? 'none' : 'auto',
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
          </a>)}
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
