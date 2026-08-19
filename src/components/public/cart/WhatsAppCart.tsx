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
  /** Idioma seleccionado por el visitante — con fallback a español si el template no lo pasa aún. */
  getText?: (es: string, en: string) => string
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
  getText = (es) => es,
}: WhatsAppCartProps) {
  const [isOpen, setIsOpen] = useState(false)
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
  }, [])

  return (
    <>
      <Toast message={toast.message} visible={toast.visible} />

      {!isOpen && (
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
      />
    </>
  )
}

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '5.5rem',
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
