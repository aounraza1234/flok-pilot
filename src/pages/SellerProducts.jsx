import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  listProductsBySellerId,
  createProduct,
  updateProduct,
  updateProductStock,
} from '../app/mockDb.js'
import { useAuth } from '../app/AuthContext.jsx'
import { ProductStatus } from '../app/constants.js'

export default function SellerProducts() {
  const { currentUser, refreshDb, refreshKey } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [unit, setUnit] = useState('piece')
  const [error, setError] = useState('')

  const products = useMemo(
    () => (currentUser?.id ? listProductsBySellerId(currentUser.id) : []),
    [currentUser?.id, refreshKey]
  )

  function resetForm() {
    setTitle('')
    setDescription('')
    setPrice('')
    setStock('')
    setUnit('piece')
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (editingId) {
        updateProduct(editingId, {
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          stock: Math.max(0, Number(stock)),
          unit: unit.trim(),
        })
      } else {
        createProduct({
          sellerId: currentUser.id,
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          stock: Math.max(0, Number(stock)),
          unit: unit.trim(),
          imageUrl: null,
        })
      }
      refreshDb()
      resetForm()
    } catch (err) {
      setError(err?.message || 'Failed')
    }
  }

  function startEdit(p) {
    setEditingId(p.id)
    setTitle(p.title)
    setDescription(p.description || '')
    setPrice(String(p.price))
    setStock(String(p.stock))
    setUnit(p.unit || 'piece')
    setShowForm(true)
  }

  function updateStock(productId, newStock) {
    try {
      updateProductStock(productId, newStock)
      refreshDb()
    } catch (err) {
      setError(err?.message)
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="card-inner">
          <h2 style={{ marginTop: 0 }}>My Products</h2>
          <p className="muted" style={{ marginTop: -6 }}>Naye product ke liye Add Product. Approved products buyers ko dikhenge.</p>
          <button className="btn btn-primary" type="button" onClick={() => { resetForm(); setShowForm(true); }}>
            {showForm && !editingId ? 'Cancel' : 'Add Product'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <div className="card-inner">
            <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit product' : 'New product'}</h3>
            <form className="grid" onSubmit={handleSubmit}>
              <div className="field">
                <div className="label">Title</div>
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="field">
                <div className="label">Description</div>
                <textarea className="input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="field">
                <div className="label">Price (Rs)</div>
                <input className="input" type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className="field">
                <div className="label">Stock</div>
                <input className="input" type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} required />
              </div>
              <div className="field">
                <div className="label">Unit</div>
                <select className="input" value={unit} onChange={(e) => setUnit(e.target.value)}>
                  <option value="piece">piece</option>
                  <option value="pack">pack</option>
                  <option value="kg">kg</option>
                </select>
              </div>
              {error ? <div className="pill" style={{ color: 'white', borderColor: 'rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.12)' }}>{error}</div> : null}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit">{editingId ? 'Update' : 'Create'}</button>
                <button className="btn" type="button" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid" style={{ gap: 10 }}>
        {products.map((p) => (
          <div key={p.id} className="card">
            <div className="card-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{p.title}</div>
                <div className="muted" style={{ fontSize: 13 }}>Rs {p.price} / {p.unit} · Stock: {p.stock}</div>
                <span className="pill" style={{ marginTop: 6 }}>{(p.status || '').toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  className="input"
                  type="number"
                  min={0}
                  style={{ width: 72 }}
                  defaultValue={p.stock}
                  onBlur={(e) => { const v = e.target.value; if (v !== '' && Number(v) !== p.stock) updateStock(p.id, v); }}
                />
                <button className="btn" type="button" onClick={() => startEdit(p)}>Edit</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {products.length === 0 && !showForm && <p className="muted">Abhi koi product nahi.</p>}
    </div>
  )
}
