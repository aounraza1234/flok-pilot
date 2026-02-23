import { useMemo } from 'react'
import { listPendingProducts, approveProduct, rejectProduct } from '../app/mockDb.js'
import { useAuth } from '../app/AuthContext.jsx'
import { getUserById } from '../app/mockDb.js'

export default function AdminProducts() {
  const { currentUser, refreshDb, refreshKey } = useAuth()
  const pending = useMemo(() => listPendingProducts(), [refreshKey])

  function approve(productId) {
    try {
      approveProduct({ adminEmail: currentUser.email, productId })
      refreshDb()
    } catch (err) {
      alert(err?.message)
    }
  }

  function reject(productId) {
    try {
      rejectProduct({ adminEmail: currentUser.email, productId })
      refreshDb()
    } catch (err) {
      alert(err?.message)
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="card-inner">
          <h2 style={{ marginTop: 0 }}>Pending products ({pending.length})</h2>
          <p className="muted" style={{ marginTop: -6 }}>Approve ya reject karein. Approved products buyers ko catalog me dikhenge.</p>
        </div>
      </div>
      {pending.length === 0 ? (
        <div className="card">
          <div className="card-inner">
            <p className="muted" style={{ margin: 0 }}>Abhi koi pending product nahi.</p>
          </div>
        </div>
      ) : (
        <div className="grid" style={{ gap: 10 }}>
          {pending.map((p) => {
            const seller = getUserById(p.sellerId)
            return (
              <div key={p.id} className="card">
                <div className="card-inner">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{p.title}</div>
                      <div className="muted" style={{ fontSize: 13 }}>{p.description?.slice(0, 120)}</div>
                      <div className="muted" style={{ fontSize: 13 }}>Rs {p.price} / {p.unit} · Stock: {p.stock}</div>
                      {seller ? <div className="muted" style={{ fontSize: 13 }}>Seller: {seller.name} ({seller.email})</div> : null}
                    </div>
                    <span className="pill">PENDING</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button className="btn btn-success" type="button" onClick={() => approve(p.id)}>Approve</button>
                    <button className="btn btn-danger" type="button" onClick={() => reject(p.id)}>Reject</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
