import { Link } from 'react-router-dom'
import { useAuth } from '../app/AuthContext.jsx'

export default function SellerDashboard() {
  const { currentUser } = useAuth()
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="card-inner">
          <div className="pill">Seller Dashboard</div>
          <h2 style={{ marginTop: 10, marginBottom: 6 }}>Verified seller: {currentUser?.name}</h2>
          <p className="muted" style={{ margin: 0 }}>Products add karein, admin approval ke baad buyers ko dikhenge. Assigned orders fulfill karein.</p>
          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span className="pill">Type: {currentUser?.sellerType}</span>
            <span className="pill">Status: {currentUser?.verificationStatus}</span>
          </div>
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <Link className="btn btn-primary" to="/seller/products">My Products</Link>
        <Link className="btn" to="/seller/orders">My Orders</Link>
      </div>
    </div>
  )
}

