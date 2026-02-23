import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../app/AuthContext.jsx'

export default function AdminDashboard() {
  const { currentUser, getPendingSellers, getAllSellers, adminApproveSeller, adminRejectSeller } = useAuth()
  const [rejectReason, setRejectReason] = useState('')
  const [message, setMessage] = useState('')

  const pending = useMemo(() => getPendingSellers(), [getPendingSellers])
  const allSellers = useMemo(() => getAllSellers(), [getAllSellers])

  function approve(id) {
    setMessage('')
    try {
      adminApproveSeller(id)
      setMessage('Seller approved.')
    } catch (e) {
      setMessage(e?.message || 'Failed')
    }
  }

  function reject(id) {
    setMessage('')
    try {
      adminRejectSeller(id, rejectReason || 'Documents incomplete')
      setMessage('Seller rejected.')
      setRejectReason('')
    } catch (e) {
      setMessage(e?.message || 'Failed')
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="card-inner">
          <div className="pill">Admin Dashboard</div>
          <h2 style={{ marginTop: 10, marginBottom: 6 }}>Welcome, {currentUser?.name}</h2>
          <p className="muted" style={{ margin: 0 }}>Sellers, products, orders aur complaints manage karein.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <Link className="btn" to="/admin/products">Products</Link>
            <Link className="btn" to="/admin/orders">Orders</Link>
            <Link className="btn" to="/admin/complaints">Complaints</Link>
          </div>
          {message ? (
            <div className="pill" style={{ marginTop: 12, color: 'white' }}>
              {message}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <section className="card">
          <div className="card-inner">
            <h3 style={{ marginTop: 0 }}>Pending seller applications ({pending.length})</h3>
            <div className="field" style={{ marginBottom: 10 }}>
              <div className="label">Reject reason (optional)</div>
              <input
                className="input"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. CNIC image unclear"
              />
            </div>

            {pending.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                No pending sellers right now.
              </p>
            ) : (
              <div className="grid" style={{ gap: 10 }}>
                {pending.map((s) => (
                  <div key={s.id} className="card" style={{ boxShadow: 'none' }}>
                    <div className="card-inner" style={{ padding: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{s.name}</div>
                          <div className="muted" style={{ fontSize: 13 }}>
                            {s.email} · {s.phone} · {s.sellerType}
                          </div>
                        </div>
                        <span className="pill">PENDING</span>
                      </div>

                      <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>
                        Docs: {s.docs?.length || 0}
                      </div>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                        <button className="btn btn-success" onClick={() => approve(s.id)} type="button">
                          Approve
                        </button>
                        <button className="btn btn-danger" onClick={() => reject(s.id)} type="button">
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="card">
          <div className="card-inner">
            <h3 style={{ marginTop: 0 }}>All sellers ({allSellers.length})</h3>
            <div className="grid" style={{ gap: 10 }}>
              {allSellers.map((s) => (
                <div key={s.id} className="card" style={{ boxShadow: 'none' }}>
                  <div className="card-inner" style={{ padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{s.name}</div>
                        <div className="muted" style={{ fontSize: 13 }}>
                          {s.email} · {s.sellerType}
                        </div>
                      </div>
                      <span className="pill">{(s.verificationStatus || 'n/a').toUpperCase()}</span>
                    </div>
                    {s.verificationStatus === 'rejected' ? (
                      <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>
                        Reason: {s.rejectionReason || 'Not specified'}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

