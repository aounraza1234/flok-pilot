import { Link } from 'react-router-dom'
import { useAuth } from '../app/AuthContext.jsx'

export default function BuyerDashboard() {
  const { currentUser } = useAuth()
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="card-inner">
          <div className="pill">Buyer Dashboard</div>
          <h2 style={{ marginTop: 10, marginBottom: 6 }}>Welcome, {currentUser?.name}</h2>
          <p className="muted" style={{ margin: 0 }}>Products browse karein, order place karein, status track karein.</p>
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <Link className="btn btn-primary" to="/buyer/catalog">Browse Catalog</Link>
        <Link className="btn" to="/buyer/cart">Cart</Link>
        <Link className="btn" to="/buyer/orders">My Orders</Link>
      </div>
    </div>
  )
}

