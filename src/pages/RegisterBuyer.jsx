import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../app/AuthContext.jsx'

export default function RegisterBuyer() {
  const { registerBuyerAndLogin } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      registerBuyerAndLogin({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      })
      navigate('/buyer')
    } catch (err) {
      setError(err?.message || 'Registration failed')
    }
  }

  return (
    <div className="card">
      <div className="card-inner">
        <h2 style={{ marginTop: 0 }}>Register as Buyer</h2>
        <p className="muted" style={{ marginTop: -6 }}>
          Ye Chunk 3 ka “signup/login” part cover karta hai. (Buyer verification optional rakh sakte hain later.)
        </p>

        <form className="grid" onSubmit={onSubmit} style={{ maxWidth: 520 }}>
          <div className="field">
            <div className="label">Full name</div>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aoun Raza" required />
          </div>
          <div className="field">
            <div className="label">Email</div>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="buyer@example.com" required />
          </div>
          <div className="field">
            <div className="label">Phone</div>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03xx-xxxxxxx" required />
          </div>
          <div className="field">
            <div className="label">Password</div>
            <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>

          {error ? (
            <div className="pill" style={{ color: 'white', borderColor: 'rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.12)' }}>
              {error}
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" type="submit">
              Create account
            </button>
            <Link className="btn" to="/login">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

