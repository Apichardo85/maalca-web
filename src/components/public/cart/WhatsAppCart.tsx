'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { CartFab } from './CartFab'
import { CartDrawer } from './CartDrawer'
import type { CartEntry, CartItem } from './useCart'

export interface WhatsAppCartProps {
  cart: CartEntry[]
  addToCart: (item: CartItem) => void
  removeFromCart: (itemId: string) => void
  cartTotal: number
  cartCount: number
  whatsappNumber: string
  businessName: string
  /** Tax rate as a decimal, e.g. 0.08875 for 8.875%. Default: 0 */
  taxRate?: number
  /** ISO 4217 currency code. Default: 'USD' */
  currency?: string
  slug?: string
  onlinePayments?: boolean
  /** Edita las notas de personalización de una línea — solo se usa si restaurantMode. */
  updateNotes?: (itemId: string, notes: string) => void
  /** Restaurante: habilita notas de personalización por línea + selector de propina. */
  restaurantMode?: boolean
  /** Negocio cerrado: el pedido solo se acepta programado (ver CartDrawer). */
  schedule?: { dateIso: string; whenEs: string; whenEn: string; opensAtLabel: string } | null
  /** Idioma seleccionado por el visitante — con fallback a español si el template no lo pasa aún. */
  getText?: (es: string, en: string) => string
  /** Modo controlado (opcional): el template abre/cierra el cajón desde su propia UI (ej. la barra
   *  inferior del Restaurante). Sin estas props el cajón se maneja solo, como siempre. */
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Oculta el botón flotante "Ver orden" cuando el template ya trae su propia barra de carrito. */
  hideFab?: boolean
  /** Px extra sobre el borde inferior para el aviso "Agregado al carrito" (ej. si hay una barra fija). */
  bottomInset?: number
}

export function WhatsAppCart({
  cart,
  addToCart,
  removeFromCart,
  cartTotal,
  cartCount,
  whatsappNumber,
  businessName,
  taxRate = 0,
  currency = 'USD',
  slug,
  onlinePayments = false,
  updateNotes,
  restaurantMode = false,
  schedule = null,
  getText = (es) => es,
  isOpen: isOpenProp,
  onOpenChange,
  hideFab = false,
  bottomInset = 0,
}: WhatsAppCartProps) {
  const [isOpenInternal, setIsOpenInternal] = useState(false)
  const isOpen = isOpenProp ?? isOpenInternal
  const setIsOpen = useCallback((next: boolean) => {
    if (onOpenChange) onOpenChange(next)
    else setIsOpenInternal(next)
  }, [onOpenChange])
  // Pedido desde la mesa: el QR de cada mesa apunta a /{slug}?mesa=7. Se lee en el cliente (no en
  // el servidor) para no volver dinámica la página ISR. Solo Restaurante.
  const [tableNumber, setTableNumber] = useState<string | undefined>(undefined)
  useEffect(() => {
    if (!restaurantMode) return
    const raw = new URLSearchParams(window.location.search).get('mesa')?.trim()
    if (raw && raw.length <= 20 && /^[\p{L}\p{N}\- ]+$/u.test(raw)) setTableNumber(raw)
  }, [restaurantMode])
  const [toast, setToast] = useState({ message: '', visible: false })
  const prevCountRef = useRef(cartCount)

  const showToast = useCallback((msg: string) => {
    setToast({ message: msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2000)
  }, [])

  // Toast fires whenever an item is added (count increases)
  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      showToast(getText('✓ Agregado al carrito', '✓ Added to cart'))
    }
    prevCountRef.current = cartCount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartCount, showToast])

  // Close drawer on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [setIsOpen])

  return (
    <>
      <Toast message={toast.message} visible={toast.visible} bottomInset={bottomInset} />

      {!isOpen && !hideFab && (
        <CartFab cartCount={cartCount} onClick={() => setIsOpen(true)} />
      )}

      <CartDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        cart={cart}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        cartTotal={cartTotal}
        cartCount={cartCount}
        taxRate={taxRate}
        currency={currency}
        whatsappNumber={whatsappNumber}
        businessName={businessName}
        slug={slug}
        onlinePayments={onlinePayments}
        updateNotes={updateNotes}
        restaurantMode={restaurantMode}
        getText={getText}
        tableNumber={tableNumber}
        schedule={schedule}
      />
    </>
  )
}

function Toast({ message, visible, bottomInset = 0 }: { message: string; visible: boolean; bottomInset?: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: `calc(5.5rem + ${bottomInset}px)`,
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? '0' : '16px'})`,
        zIndex: 300,
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '9999px',
        fontSize: '13px',
        fontWeight: 600,
        boxShadow: '0 8px 32px rgba(0,0,0,.2)',
        opacity: visible ? 1 : 0,
        transition: 'opacity .25s, transform .25s',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {message}
    </div>
  )
}
