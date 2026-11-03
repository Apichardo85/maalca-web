'use client'
import { useState, useCallback, useMemo } from 'react'
import { unitPriceFor, type RetailAttributes } from '@/lib/commerce'

export interface CartItem {
  id: string
  name: string
  price: number
  image?: string
  /** Retail: reglas de cantidad (mín./múltiplo/máx.) y hazmat del producto — el carrito suma/resta en
   *  pasos válidos y el checkout solo ofrece envíos terrestres si hay perfumes. */
  rules?: RetailAttributes | null
  /** Precio público del producto (Retail con cuentas): permite volver al precio público al cerrar sesión. */
  basePrice?: number
  /** Solo en el carrito expuesto: precio por unidad antes del escalón de volumen (para tacharlo). */
  listPrice?: number
}

export interface CartEntry {
  item: CartItem
  qty: number
  /** Personalización de esta línea (ej. "sin cebolla, extra queso") — Restaurante. */
  notes?: string
}

export interface UseCartReturn {
  cart: CartEntry[]
  /** qty = unidades a sumar (1 por defecto; Retail suma en múltiplos de caja). */
  addToCart: (item: CartItem, qty?: number) => void
  /** qty = unidades a restar (1 por defecto); llegar a 0 quita la línea. */
  removeFromCart: (itemId: string, qty?: number) => void
  clearCart: () => void
  /** Edita las notas de una línea ya en el carrito — no crea una línea nueva ni cambia qty. */
  updateNotes: (itemId: string, notes: string) => void
  /** Recalcula el precio mostrado de cada línea (ej. al iniciar/cerrar sesión de miembro). El API recalcula igual. */
  reprice: (priceOf: (item: CartItem) => number) => void
  cartTotal: number
  cartCount: number
}

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<CartEntry[]>([])

  const addToCart = useCallback((item: CartItem, qty = 1) => {
    const n = Math.max(1, Math.floor(qty))
    setCart(prev => {
      const existing = prev.find(e => e.item.id === item.id)
      if (existing) {
        return prev.map(e => e.item.id === item.id ? { ...e, qty: e.qty + n } : e)
      }
      return [...prev, { item, qty: n }]
    })
  }, [])

  const removeFromCart = useCallback((itemId: string, qty = 1) => {
    const n = Math.max(1, Math.floor(qty))
    setCart(prev => {
      const entry = prev.find(e => e.item.id === itemId)
      if (!entry) return prev
      if (entry.qty <= n) return prev.filter(e => e.item.id !== itemId)
      return prev.map(e => e.item.id === itemId ? { ...e, qty: e.qty - n } : e)
    })
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const updateNotes = useCallback((itemId: string, notes: string) => {
    setCart(prev => prev.map(e => (e.item.id === itemId ? { ...e, notes } : e)))
  }, [])

  const reprice = useCallback((priceOf: (item: CartItem) => number) => {
    setCart(prev => {
      let changed = false
      const next = prev.map(e => {
        const price = priceOf(e.item)
        if (price === e.item.price) return e
        changed = true
        return { ...e, item: { ...e.item, price } }
      })
      return changed ? next : prev
    })
  }, [])

  // Precio por cantidad (Retail): el carrito que ve el resto de la app trae en item.price el precio por unidad
  // que corresponde a la cantidad de la línea (escalón alcanzado vs. su precio), y listPrice con el de antes del
  // escalón. Lo guardado no cambia: si baja la cantidad, vuelve solo al precio normal. El API recalcula igual.
  const pricedCart = useMemo(() => cart.map(e => {
    const tiers = e.item.rules?.volumeTiers
    if (!tiers || tiers.length === 0) return e
    const unit = unitPriceFor(e.item.price, tiers, e.qty)
    return unit === e.item.price ? e : { ...e, item: { ...e.item, price: unit, listPrice: e.item.price } }
  }), [cart])

  const cartTotal = pricedCart.reduce((sum, e) => sum + e.item.price * e.qty, 0)
  const cartCount = pricedCart.reduce((sum, e) => sum + e.qty, 0)

  return { cart: pricedCart, addToCart, removeFromCart, clearCart, updateNotes, reprice, cartTotal, cartCount }
}
