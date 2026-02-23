import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { listOrdersByBuyerId } from '../app/mockDb.js'
import { useAuth } from '../app/AuthContext.jsx'

export default function MyOrders() {
  const { currentUser, refreshKey } = useAuth()
  const orders = useMemo(
    () => (currentUser?.id ? listOrdersByBuyerId(currentUser.id) : []),
    [currentUser?.id, refreshKey]
  )

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="card-inner">
          <h2 style={{ marginTop: 0 }}>My Orders</h2>
          <p className="muted" style={{ marginTop: -6 }}>Status track karne ke liye order par click karein.</p>
        </div>
      </div>
      {orders.length === 0 ? (
        <div className="card">
          <div className="card-inner">
            <p className="muted" style={{ margin: 0 }}>Abhi koi order nahi.</p>
            <Link className="btn btn-primary" to="/buyer/catalog" style={{ marginTop: 10 }}>Browse Products</Link>
          </div>
        </div>
      ) : (
        <div className="grid" style={{ gap: 10 }}>
          {orders.map((o) => (
            <Link key={o.id} to={`/buyer/orders/${o.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Order #{o.id.slice(-8)}</div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    Rs {o.total} · {o.items?.length || 0} items · {new Date(o.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span className="pill">{(o.status || '').replace(/_/g, ' ')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
