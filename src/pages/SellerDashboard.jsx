import { useAuth } from '../app/AuthContext.jsx'

export default function SellerDashboard() {
  const { currentUser } = useAuth()

  return (
    <div className="grid">
      <div className="card">
        <div className="card-inner">
          <div className="pill">Seller Dashboard</div>
          <h2 style={{ marginTop: 10, marginBottom: 6 }}>Verified seller: {currentUser?.name}</h2>
          <p className="muted" style={{ margin: 0 }}>
            Chunk 1–3 me verification + role access complete hai. Chunk 4 me yahan product listing + admin approval
            aayega.
          </p>
          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span className="pill">Type: {currentUser?.sellerType}</span>
            <span className="pill">Status: {currentUser?.verificationStatus}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

