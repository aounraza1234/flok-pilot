import { Link } from 'react-router-dom'
import { useAuth } from '../app/AuthContext.jsx'

export default function SellerPending() {
  const { currentUser } = useAuth()

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="card-inner">
          <div className="pill">Seller Verification</div>
          <h2 style={{ marginTop: 10, marginBottom: 6 }}>Status: {currentUser?.verificationStatus}</h2>
          {currentUser?.verificationStatus === 'rejected' ? (
            <p className="muted" style={{ margin: 0 }}>
              Rejection reason: <b style={{ color: 'white' }}>{currentUser?.rejectionReason || 'Not provided'}</b>
            </p>
          ) : (
            <p className="muted" style={{ margin: 0 }}>
              Aapki application admin review me hai. Approve hone ke baad aapka Seller Dashboard open ho jayega.
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-inner">
          <h3 style={{ marginTop: 0 }}>Next steps</h3>
          <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
            <li>Admin login kare: <code>admin@flockpilot.test</code> / <code>admin123</code></li>
            <li>Admin dashboard se approve/reject</li>
            <li>Seller ko phir <Link to="/seller">Seller Dashboard</Link> mil jayega</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

