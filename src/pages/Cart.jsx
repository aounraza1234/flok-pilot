import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../app/CartContext.jsx'
import { getProductById } from '../app/mockDb.js'

export default function Cart() {
  const { cartItems, setQuantity, removeFromCart, cartTotal } = useCart()

  // Sync quantity down when product stock is less than cart quantity
  useEffect(() => {
    cartItems.forEach((i) => {
      const product = getProductById(i.productId)
      const maxStock = product && product.status === 'approved' ? Math.max(0, product.stock) : 0
      if (maxStock > 0 && i.quantity > maxStock) setQuantity(i.productId, maxStock)
    })
  }, [cartItems, setQuantity])

  if (cartItems.length === 0) {
    return (
      <div className="card">
        <div className="card-inner">
          <h2 style={{ marginTop: 0 }}>Cart</h2>
          <p className="muted" style={{ margin: 0 }}>Cart khali hai.</p>
          <Link className="btn btn-primary" to="/buyer/catalog" style={{ marginTop: 12 }}>Browse Products</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="card-inner">
          <h2 style={{ marginTop: 0 }}>Cart ({cartItems.length} items)</h2>
          <div className="grid" style={{ gap: 12 }}>
            {cartItems.map((i) => {
              const product = getProductById(i.productId)
              const maxStock = product && product.status === 'approved' ? Math.max(0, product.stock) : 0
              const effectiveQty = maxStock > 0 ? Math.min(i.quantity, maxStock) : i.quantity
              return (
                <div key={i.productId} className="card" style={{ boxShadow: 'none' }}>
                  <div className="card-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{i.title}</div>
                      <div className="muted" style={{ fontSize: 13 }}>Rs {i.price} × {i.quantity} {i.unit}</div>
                      {maxStock > 0 && <div className="muted" style={{ fontSize: 12 }}>Max available: {maxStock}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        className="input"
                        type="number"
                        min={1}
                        max={maxStock || 999}
                        style={{ width: 64 }}
                        value={effectiveQty}
                        onChange={(e) => {
                          const v = Math.max(1, Math.min(Number(e.target.value) || 1, maxStock || 999))
                          setQuantity(i.productId, v)
                        }}
                      />
                      <button className="btn btn-danger" type="button" onClick={() => removeFromCart(i.productId)}>Remove</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 16, fontSize: 18 }}>Total: <strong>Rs {cartTotal}</strong></div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <Link className="btn btn-primary" to="/buyer/checkout">Proceed to Checkout</Link>
            <Link className="btn" to="/buyer/catalog">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
