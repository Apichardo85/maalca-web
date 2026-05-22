'use client'
import { useState, useCallback } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  image?: string
}

export interface CartEntry {
  item: CartItem
  qty: number
}

export interface UseCartReturn {
  cart: CartEntry[]
  addToCart: (item: CartItem) => void
  removeFromCart: (itemId: string) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
}

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<CartEntry[]>([])

  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(e => e.item.id === item.id)
      if (existing) {
        return prev.map(e => e.item.id === item.id ? { ...e, qty: e.qty + 1 } : e)
      }
      return [...prev, { item, qty: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => {
      const entry = prev.find(e => e.item.id === itemId)
      if (!entry) return prev
      if (entry.qty === 1) return prev.filter(e => e.item.id !== itemId)
      return prev.map(e => e.item.id === itemId ? { ...e, qty: e.qty - 1 } : e)
    })
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartTotal = cart.reduce((sum, e) => sum + e.item.price * e.qty, 0)
  const cartCount = cart.reduce((sum, e) => sum + e.qty, 0)

  return { cart, addToCart, removeFromCart, clearCart, cartTotal, cartCount }
}
