import { useMemo, useState } from 'react'
import { listComplaints, resolveComplaint, warnSeller, suspendSeller } from '../app/mockDb.js'
import { useAuth } from '../app/AuthContext.jsx'
import { getUserById } from '../app/mockDb.js'

export default function AdminComplaints() {
  const { currentUser, refreshDb, refreshKey } = useAuth()
  const [openOnly, setOpenOnly] = useState(true)
  const complaints = useMemo(() => listComplaints(openOnly), [openOnly, refreshKey])

  function resolve(complaintId) {
    try {
      resolveComplaint({ adminEmail: currentUser.email, complaintId })
      refreshDb()
    } catch (err) {
      alert(err?.message)
    }
  }

  function warn(sellerId) {
    try {
      warnSeller({ adminEmail: currentUser.email, sellerId })
      refreshDb()
    } catch (err) {
      alert(err?.message)
    }
  }

  function suspend(sellerId) {
    if (!window.confirm('Sure? Seller suspend ho jayega.')) return
    try {
      suspendSeller({ adminEmail: currentUser.email, sellerId })
      refreshDb()
    } catch (err) {
      alert(err?.message)
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="card-inner">
          <h2 style={{ marginTop: 0 }}>Complaints</h2>
          <p className="muted" style={{ marginTop: -6 }}>Complaints resolve karein. Seller ko warn ya suspend kar sakte hain.</p>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} />
            <span className="muted">Sirf open</span>
          </label>
        </div>
      </div>
      {complaints.length === 0 ? (
        <div className="card">
          <div className="card-inner">
            <p className="muted" style={{ margin: 0 }}>Koi complaint nahi.</p>
          </div>
        </div>
      ) : (
        <div className="grid" style={{ gap: 10 }}>
          {complaints.map((c) => {
            const buyer = getUserById(c.buyerId)
            const seller = c.sellerId ? getUserById(c.sellerId) : null
            return (
              <div key={c.id} className="card">
                <div className="card-inner">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <div>
                      <div className="muted" style={{ fontSize: 13 }}>From: {buyer?.name} ({buyer?.email})</div>
                      {seller ? <div className="muted" style={{ fontSize: 13 }}>Against seller: {seller.name} ({seller.email})</div> : null}
                      <p style={{ margin: '8px 0 0' }}>{c.message}</p>
                      <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>{new Date(c.createdAt).toLocaleString()}</div>
                    </div>
                    <span className="pill">{(c.status || '').toUpperCase()}</span>
                  </div>
                  {c.status === 'open' && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                      <button className="btn btn-success" type="button" onClick={() => resolve(c.id)}>Resolve</button>
                      {seller && (
                        <>
                          <button className="btn" type="button" onClick={() => warn(seller.id)}>Warn seller</button>
                          <button className="btn btn-danger" type="button" onClick={() => suspend(seller.id)}>Suspend seller</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
