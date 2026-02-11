import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="grid" style={{ gap: 18 }}>
      <section className="hero">
        <div className="pill">Final Year Project · Marketplace · Verified sellers</div>
        <h1 style={{ marginTop: 10 }}>Flock Pilot: The Trusted Coop</h1>
        <p className="muted">
          Buyers ko fresh eggs, live chicken, aur meat trusted sellers se milta hai. Admin verification + product/order
          checks se platform transparent aur reliable banta hai.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
          <Link className="btn btn-primary" to="/login">
            Login
          </Link>
          <Link className="btn" to="/register/buyer">
            Register Buyer
          </Link>
          <Link className="btn" to="/register/seller">
            Register Seller
          </Link>
        </div>
      </section>

      <section className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        <div className="card">
          <div className="card-inner">
            <div className="pill">Buyer</div>
            <h3 style={{ margin: '10px 0 6px' }}>Browse & Order</h3>
            <p className="muted" style={{ margin: 0 }}>
              Products browse karein, order place karein, aur status track karein. Feedback/complaint system built-in.
            </p>
          </div>
        </div>
        <div className="card">
          <div className="card-inner">
            <div className="pill">Seller (Farm / Shop)</div>
            <h3 style={{ margin: '10px 0 6px' }}>Get Verified First</h3>
            <p className="muted" style={{ margin: 0 }}>
              Documents upload karke verification ke baad platform par sell kar sakte hain. (Chunk 4 me products add.)
            </p>
          </div>
        </div>
        <div className="card">
          <div className="card-inner">
            <div className="pill">Admin</div>
            <h3 style={{ margin: '10px 0 6px' }}>Approve / Reject</h3>
            <p className="muted" style={{ margin: 0 }}>
              Sellers ko verify karein. Ye demo app Chunk 1–3 deliverables cover karta hai.
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-inner">
          <h3 style={{ margin: 0 }}>Demo credentials</h3>
          <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
            Admin: <code>admin@flockpilot.test</code> / <code>admin123</code>
            <br />
            Buyer: <code>buyer@flockpilot.test</code> / <code>buyer123</code>
            <br />
            Seller (verified): <code>seller@flockpilot.test</code> / <code>seller123</code>
          </p>
        </div>
      </section>
    </div>
  )
}

