import { useMemo, useState } from 'react'
import { listOrdersPendingAdmin, listAllSellers, approveOrderByAdmin, cancelOrder } from '../app/mockDb.js'
import { useAuth } from '../app/AuthContext.jsx'

export default function AdminOrders() {
  const { currentUser, refreshDb, refreshKey } = useAuth()
  const [assignSellerId, setAssignSellerId] = useState({})
  const pending = useMemo(() => listOrdersPendingAdmin(), [refreshKey])
  const sellers = useMemo(() => listAllSellers().filter((s) => s.verificationStatus === 'verified' && !s.suspended), [refreshKey])

  function approveAndAssign(orderId, sellerId) {
    try {
      approveOrderByAdmin({ adminEmail: currentUser.email, orderId, sellerId: sellerId || undefined })
      refreshDb()
      setAssignSellerId((prev) => ({ ...prev, [orderId]: null }))
    } catch (err) {
      alert(err?.message)
    }
  }

  function handleCancelOrder(orderId) {
    if (!window.confirm('Order cancel karein? Stock restore ho jayega.')) return
    try {
      cancelOrder({ orderId, actorId: currentUser.id, isAdmin: true })
      refreshDb()
    } catch (err) {
      alert(err?.message)
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="card-inner">
          <h2 style={{ marginTop: 0 }}>Pending orders ({pending.length})</h2>
          <p className="muted" style={{ marginTop: -6 }}>Order approve karein aur seller assign karein. Seller ko order fulfill karna hoga.</p>
        </div>
      </div>
      {pending.length === 0 ? (
        <div className="card">
          <div className="card-inner">
            <p className="muted" style={{ margin: 0 }}>Abhi koi pending order nahi.</p>
          </div>
        </div>
      ) : (
        <div className="grid" style={{ gap: 10 }}>
          {pending.map((o) => (
            <div key={o.id} className="card">
              <div className="card-inner">
                <div style={{ fontWeight: 700 }}>Order #{o.id.slice(-8)}</div>
                <div className="muted" style={{ fontSize: 13 }}>Rs {o.total} · {o.items?.length || 0} items · {new Date(o.createdAt).toLocaleString()}</div>
                <div className="muted" style={{ fontSize: 13 }}>Address: {o.deliveryAddress || '—'}</div>
                <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    className="input"
                    style={{ minWidth: 180 }}
                    value={assignSellerId[o.id] ?? ''}
                    onChange={(e) => setAssignSellerId((prev) => ({ ...prev, [o.id]: e.target.value || null }))}
                  >
                    <option value="">— Select seller —</option>
                    {sellers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.sellerType})</option>
                    ))}
                  </select>
                  <button
                    className="btn btn-success"
                    type="button"
                    onClick={() => approveAndAssign(o.id, assignSellerId[o.id])}
                  >
                    Approve & Assign
                  </button>
                  <button className="btn btn-danger" type="button" onClick={() => handleCancelOrder(o.id)}>
                    Cancel order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
