import { useAuth } from '../app/AuthContext.jsx'

export default function BuyerDashboard() {
  const { currentUser } = useAuth()
  return (
    <div className="grid">
      <div className="card">
        <div className="card-inner">
          <div className="pill">Buyer Dashboard</div>
          <h2 style={{ marginTop: 10, marginBottom: 6 }}>Welcome, {currentUser?.name}</h2>
          <p className="muted" style={{ margin: 0 }}>
            Chunk 1–3 me buyer side ka focus authentication + role routing hai. Chunk 4–5 me catalog + orders add
            honge.
          </p>
        </div>
      </div>
    </div>
  )
}

