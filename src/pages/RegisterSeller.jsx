import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../app/AuthContext.jsx'
import { SellerTypes } from '../app/constants.js'

export default function RegisterSeller() {
  const { registerSellerAndLogin } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [sellerType, setSellerType] = useState(SellerTypes.FARM)
  const [docs, setDocs] = useState([])
  const [error, setError] = useState('')

  const docsLabel = useMemo(() => {
    return sellerType === SellerTypes.FARM ? 'Farm docs (CNIC / license)' : 'Shop docs (CNIC / shop proof)'
  }, [sellerType])

  function onDocsChange(e) {
    const files = Array.from(e.target.files || [])
    setDocs(files)
  }

  function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      registerSellerAndLogin({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        sellerType,
        docs,
      })
      navigate('/seller/pending')
    } catch (err) {
      setError(err?.message || 'Registration failed')
    }
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'start' }}>
      <section className="card">
        <div className="card-inner">
          <h2 style={{ marginTop: 0 }}>Register as Seller</h2>
          <p className="muted" style={{ marginTop: -6 }}>
            Seller ko pehle verify hona hota hai. Admin approve/reject karega (Chunk 3).
          </p>

          <form className="grid" onSubmit={onSubmit}>
            <div className="field">
              <div className="label">Full name</div>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Shop Owner / Farm Owner" required />
            </div>
            <div className="field">
              <div className="label">Email</div>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seller@example.com" required />
            </div>
            <div className="field">
              <div className="label">Phone</div>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03xx-xxxxxxx" required />
            </div>
            <div className="field">
              <div className="label">Password</div>
              <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </div>

            <div className="field">
              <div className="label">Seller type</div>
              <select className="input" value={sellerType} onChange={(e) => setSellerType(e.target.value)}>
                <option value={SellerTypes.FARM}>Poultry Farm</option>
                <option value={SellerTypes.SHOP}>Chicken Shop</option>
              </select>
            </div>

            <div className="field">
              <div className="label">{docsLabel}</div>
              <input className="input" type="file" multiple onChange={onDocsChange} />
              <div className="muted" style={{ fontSize: 13 }}>
                Demo app me files sirf metadata ke saath save hoti hain (name/size/type).
              </div>
            </div>

            {docs?.length ? (
              <div className="card" style={{ boxShadow: 'none' }}>
                <div className="card-inner" style={{ padding: 12 }}>
                  <div className="pill">Selected documents ({docs.length})</div>
                  <ul className="muted" style={{ margin: '10px 0 0', paddingLeft: 18 }}>
                    {docs.map((f) => (
                      <li key={`${f.name}-${f.size}`}>{f.name} · {(f.size / 1024).toFixed(0)}KB</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="pill" style={{ color: 'white', borderColor: 'rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.12)' }}>
                {error}
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" type="submit">
                Submit for verification
              </button>
              <Link className="btn" to="/login">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </section>

      <section className="card">
        <div className="card-inner">
          <h3 style={{ marginTop: 0 }}>What happens next?</h3>
          <ol className="muted" style={{ margin: 0, paddingLeft: 18 }}>
            <li>Account create hota hai with status: <b>pending</b></li>
            <li>Admin dashboard me aapki application appear hoti hai</li>
            <li>Admin approve kare to status: <b>verified</b></li>
            <li>Reject ho to reason show hota hai</li>
          </ol>
        </div>
      </section>
    </div>
  )
}

