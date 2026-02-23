import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProductById } from '../app/mockDb.js'
import { useCart } from '../app/CartContext.jsx'
import { useAuth } from '../app/AuthContext.jsx'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { refreshKey } = useAuth()
  const { addToCart } = useCart()
  const product = getProductById(id)
  const [qty, setQty] = useState(1)
  const [msg, setMsg] = useState('')

  if (!product || product.status !== 'approved') {
    return (
      <div className="card">
        <div className="card-inner">
          <p className="muted">Product nahi mila.</p>
          <Link className="btn" to="/buyer/catalog">Back to Catalog</Link>
        </div>
      </div>
    )
  }

  function handleAddToCart() {
    const n = Math.max(1, Math.min(Number(qty) || 1, product.stock))
    if (n > product.stock) {
      setMsg('Stock se zyada add nahi kar sakte.')
      return
    }
    addToCart(product, n)
    setMsg(`${n} added to cart.`)
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="card-inner">
          <div className="pill">Rs {product.price} / {product.unit}</div>
          <h2 style={{ marginTop: 10, marginBottom: 8 }}>{product.title}</h2>
          <p className="muted" style={{ margin: 0 }}>{product.description}</p>
          <p style={{ marginTop: 12, marginBottom: 0 }}>Stock: <strong>{product.stock}</strong> {product.unit}</p>

          <div className="field" style={{ marginTop: 16, maxWidth: 120 }}>
            <div className="label">Quantity</div>
            <input
              className="input"
              type="number"
              min={1}
              max={product.stock}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <button className="btn btn-primary" onClick={handleAddToCart} type="button">
              Add to Cart
            </button>
            <Link className="btn" to="/buyer/catalog">Back to Catalog</Link>
          </div>
          {msg ? <p className="muted" style={{ marginTop: 10, marginBottom: 0 }}>{msg}</p> : null}
        </div>
      </div>
    </div>
  )
}
