import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listApprovedProducts } from '../app/mockDb.js'
import { useAuth } from '../app/AuthContext.jsx'

export default function Catalog() {
  const { refreshKey } = useAuth()
  const [search, setSearch] = useState('')
  const products = useMemo(() => listApprovedProducts(), [refreshKey])
  const filtered = useMemo(
    () => products.filter((p) => p.title.toLowerCase().includes((search || '').toLowerCase())),
    [products, search]
  )

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="card">
        <div className="card-inner">
          <h2 style={{ marginTop: 0 }}>Product Catalog</h2>
          <p className="muted" style={{ marginTop: -6 }}>
            Sirf approved products dikhaye ja rahe hain. Search se filter karein.
          </p>
          <div className="field" style={{ maxWidth: 360 }}>
            <div className="label">Search by title</div>
            <input
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. eggs, chicken"
            />
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {filtered.length === 0 ? (
          <div className="card">
            <div className="card-inner">
              <p className="muted" style={{ margin: 0 }}>
                {products.length === 0 ? 'Abhi koi approved product nahi.' : 'Search par koi result nahi.'}
              </p>
            </div>
          </div>
        ) : (
          filtered.map((p) => (
            <Link key={p.id} to={`/buyer/product/${p.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card-inner">
                <div className="pill">Rs {p.price} / {p.unit}</div>
                <h3 style={{ margin: '10px 0 6px' }}>{p.title}</h3>
                <p className="muted" style={{ margin: 0, fontSize: 14 }}>{p.description?.slice(0, 80)}{p.description?.length > 80 ? '…' : ''}</p>
                <div style={{ marginTop: 10, fontSize: 13 }}>Stock: {p.stock} {p.unit}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
