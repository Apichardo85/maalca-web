'use client'
import { useState, useCallback } from 'react'
import type { RetailAttributes } from '@/lib/commerce'

export interface CartItem {
  id: string
  name: string
  price: number
  image?: string
  /** Retail: reglas de cantidad (mín./múltiplo/máx.) y hazmat del producto — el carrito suma/resta en
   *  pasos válidos y el checkout solo ofrece envíos terrestres si hay perfumes. */
  rules?: RetailAttributes | null
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

  const cartTotal = cart.reduce((sum, e) => sum + e.item.price * e.qty, 0)
  const cartCount = cart.reduce((sum, e) => sum + e.qty, 0)

  return { cart, addToCart, removeFromCart, clearCart, updateNotes, cartTotal, cartCount }
}
