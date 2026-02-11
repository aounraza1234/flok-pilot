import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../app/AuthContext.jsx'
import { Roles } from '../app/constants.js'

export default function Login() {
  const { login, currentUser, devResetDb } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (currentUser) {
    const path = currentUser.role === Roles.ADMIN ? '/admin' : currentUser.role === Roles.SELLER ? '/seller' : '/buyer'
    navigate(path, { replace: true })
  }

  function goRole(emailPreset, passPreset) {
    setEmail(emailPreset)
    setPassword(passPreset)
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const user = login(email.trim(), password)
      const path = user.role === Roles.ADMIN ? '/admin' : user.role === Roles.SELLER ? '/seller' : '/buyer'
      navigate(path)
    } catch (err) {
      setError(err?.message || 'Login failed')
    }
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', alignItems: 'start' }}>
      <section className="card">
        <div className="card-inner">
          <h2 style={{ marginTop: 0 }}>Login</h2>
          <p className="muted" style={{ marginTop: -6 }}>
            Role-based routing enabled hai. Seller verified na ho to “Pending Verification” screen show hoti hai.
          </p>

          <form className="grid" onSubmit={onSubmit}>
            <div className="field">
              <div className="label">Email</div>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="field">
              <div className="label">Password</div>
              <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" />
            </div>
            {error ? (
              <div className="pill" style={{ color: 'white', borderColor: 'rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.12)' }}>
                {error}
              </div>
            ) : null}
            <button className="btn btn-primary" type="submit">
              Login
            </button>
            <div className="muted" style={{ fontSize: 13 }}>
              New user? <Link to="/register/buyer">Buyer register</Link> · <Link to="/register/seller">Seller register</Link>
            </div>
          </form>
        </div>
      </section>

      <section className="card">
        <div className="card-inner">
          <h3 style={{ marginTop: 0 }}>Quick demo</h3>
          <p className="muted" style={{ marginTop: -6 }}>In buttons se credentials auto-fill ho jayenge.</p>
          <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 10 }}>
            <button className="btn" type="button" onClick={() => goRole('admin@flockpilot.test', 'admin123')}>
              Use Admin demo
            </button>
            <button className="btn" type="button" onClick={() => goRole('buyer@flockpilot.test', 'buyer123')}>
              Use Buyer demo
            </button>
            <button className="btn" type="button" onClick={() => goRole('seller@flockpilot.test', 'seller123')}>
              Use Seller (verified) demo
            </button>
          </div>

          <hr style={{ borderColor: 'rgba(255,255,255,0.12)', margin: '16px 0' }} />
          <p className="muted" style={{ marginTop: 0 }}>
            Dev-only: agar local data corrupt ho jaye to reset kar lo.
          </p>
          <button className="btn btn-danger" type="button" onClick={devResetDb}>
            Reset demo DB
          </button>
        </div>
      </section>
    </div>
  )
}

