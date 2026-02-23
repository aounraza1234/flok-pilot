import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createOrder } from '../app/mockDb.js'
import { PaymentMethod } from '../app/constants.js'
import { useCart } from '../app/CartContext.jsx'
import { useAuth } from '../app/AuthContext.jsx'

export default function Checkout() {
  const { currentUser, refreshDb } = useAuth()
  const { cartItems, cartTotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [payment, setPayment] = useState(PaymentMethod.COD)
  const [error, setError] = useState('')

  if (cartItems.length === 0) {
    return (
      <div className="card">
        <div className="card-inner">
          <p className="muted">Cart khali hai. Pehle products add karein.</p>
          <Link className="btn" to="/buyer/catalog">Catalog</Link>
        </div>
      </div>
    )
  }

  function handlePlaceOrder(e) {
    e.preventDefault()
    setError('')
    try {
      createOrder({
        buyerId: currentUser.id,
        items: cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod: payment,
        deliveryAddress: address.trim(),
      })
      refreshDb()
      clearCart()
      navigate('/buyer/orders')
    } catch (err) {
      setError(err?.message || 'Order place nahi ho saka.')
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="card-inner">
          <h2 style={{ marginTop: 0 }}>Checkout</h2>
          <p className="muted" style={{ marginTop: -6 }}>Total: Rs {cartTotal} ({cartItems.length} items)</p>

          <form className="grid" onSubmit={handlePlaceOrder}>
            <div className="field">
              <div className="label">Delivery address</div>
              <textarea
                className="input"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address..."
                required
              />
            </div>
            <div className="field">
              <div className="label">Payment method</div>
              <select className="input" value={payment} onChange={(e) => setPayment(e.target.value)}>
                <option value={PaymentMethod.COD}>Cash on Delivery (COD)</option>
                <option value={PaymentMethod.ADVANCE}>Advance payment</option>
              </select>
            </div>
            {error ? <div className="pill" style={{ color: 'white', borderColor: 'rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.12)' }}>{error}</div> : null}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" type="submit">Place Order</button>
              <Link className="btn" to="/buyer/cart">Back to Cart</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
