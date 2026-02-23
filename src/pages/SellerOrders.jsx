import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { listOrdersBySellerId, updateOrderStatus } from '../app/mockDb.js'
import { useAuth } from '../app/AuthContext.jsx'
import { OrderStatus } from '../app/constants.js'

const NEXT_STATUS = {
  [OrderStatus.ASSIGNED]: OrderStatus.PREPARING,
  [OrderStatus.PREPARING]: OrderStatus.OUT_FOR_DELIVERY,
  [OrderStatus.OUT_FOR_DELIVERY]: OrderStatus.DELIVERED,
}

export default function SellerOrders() {
  const { currentUser, refreshDb, refreshKey } = useAuth()
  const orders = useMemo(
    () => (currentUser?.id ? listOrdersBySellerId(currentUser.id) : []),
    [currentUser?.id, refreshKey]
  )

  function moveStatus(orderId, newStatus) {
    try {
      updateOrderStatus({ orderId, newStatus, actorId: currentUser.id })
      refreshDb()
    } catch (err) {
      alert(err?.message)
    }
  }

  const statusLabel = (s) => (s || '').replace(/_/g, ' ')

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="card-inner">
          <h2 style={{ marginTop: 0 }}>My Orders</h2>
          <p className="muted" style={{ marginTop: -6 }}>Admin ne assign kiye hue orders. Status update karein.</p>
        </div>
      </div>
      {orders.length === 0 ? (
        <div className="card">
          <div className="card-inner">
            <p className="muted" style={{ margin: 0 }}>Abhi koi assigned order nahi.</p>
          </div>
        </div>
      ) : (
        <div className="grid" style={{ gap: 10 }}>
          {orders.map((o) => {
            const next = NEXT_STATUS[o.status]
            return (
              <div key={o.id} className="card">
                <div className="card-inner">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>Order #{o.id.slice(-8)}</div>
                      <div className="muted" style={{ fontSize: 13 }}>Rs {o.total} · {o.items?.length || 0} items · {new Date(o.createdAt).toLocaleString()}</div>
                      <div className="muted" style={{ fontSize: 13 }}>Address: {o.deliveryAddress || '—'}</div>
                    </div>
                    <span className="pill">{statusLabel(o.status)}</span>
                  </div>
                  {next && (
                    <div style={{ marginTop: 12 }}>
                      <button className="btn btn-success" type="button" onClick={() => moveStatus(o.id, next)}>
                        Mark as {statusLabel(next)}
                      </button>
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
