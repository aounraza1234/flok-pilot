import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="card">
      <div className="card-inner">
        <div className="pill">404</div>
        <h2 style={{ marginTop: 10, marginBottom: 6 }}>Page not found</h2>
        <p className="muted" style={{ margin: 0 }}>
          Aap jis page par ja rahe thay wo exist nahi karta.
        </p>
        <div style={{ marginTop: 14 }}>
          <Link className="btn btn-primary" to="/">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}

