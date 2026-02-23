import { createContext, useContext, useCallback, useMemo, useState } from 'react'
import { loadJson, saveJson } from './storage.js'

const CART_KEY = 'flockpilot_cart_v1'
const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => loadJson(CART_KEY, { items: [] }))

  const persist = useCallback((next) => {
    setCart(next)
    saveJson(CART_KEY, next)
  }, [])

  const addToCart = useCallback(
    (product, quantity = 1) => {
      const qty = Math.max(1, Number(quantity))
      const next = { ...cart, items: [...(cart.items || [])] }
      const existing = next.items.find((i) => i.productId === product.id)
      if (existing) {
        existing.quantity += qty
      } else {
        next.items.push({
          productId: product.id,
          title: product.title,
          price: product.price,
          unit: product.unit,
          quantity: qty,
        })
      }
      persist(next)
    },
    [cart, persist]
  )

  const removeFromCart = useCallback(
    (productId) => {
      const next = { items: (cart.items || []).filter((i) => i.productId !== productId) }
      persist(next)
    },
    [cart, persist]
  )

  const setQuantity = useCallback(
    (productId, quantity) => {
      const qty = Math.max(0, Number(quantity))
      const items = [...(cart.items || [])]
      const idx = items.findIndex((i) => i.productId === productId)
      if (idx === -1) return
      if (qty === 0) {
        items.splice(idx, 1)
      } else {
        items[idx].quantity = qty
      }
      persist({ items })
    },
    [cart, persist]
  )

  const clearCart = useCallback(() => {
    persist({ items: [] })
  }, [persist])

  const value = useMemo(
    () => ({
      cartItems: cart.items || [],
      addToCart,
      removeFromCart,
      setQuantity,
      clearCart,
      cartTotal: (cart.items || []).reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    [cart, addToCart, removeFromCart, setQuantity, clearCart]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
