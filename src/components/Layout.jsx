import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../app/AuthContext.jsx'
import { Roles } from '../app/constants.js'

export default function Layout() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  function onLogout() {
    logout()
    navigate('/login')
  }

  function dashboardPath() {
    if (!currentUser) return '/'
    if (currentUser.role === Roles.ADMIN) return '/admin'
    if (currentUser.role === Roles.SELLER) return '/seller'
    return '/buyer'
  }

  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <Link to="/" className="brand" aria-label="Flock Pilot home">
            <div className="brand-badge" />
            <div>
              FlockPilot <span className="muted" style={{ fontWeight: 600 }}>· Trusted Coop</span>
            </div>
          </Link>

          <nav className="nav">
            <Link className="btn" to="/">
              Home
            </Link>
            {!currentUser ? (
              <>
                <Link className="btn btn-primary" to="/login">
                  Login
                </Link>
                <Link className="btn" to="/register/buyer">
                  Register Buyer
                </Link>
                <Link className="btn" to="/register/seller">
                  Register Seller
                </Link>
              </>
            ) : (
              <>
                <Link className="btn" to={dashboardPath()}>
                  Dashboard
                </Link>
                {currentUser.role === Roles.BUYER && (
                  <>
                    <Link className="btn" to="/buyer/catalog">Catalog</Link>
                    <Link className="btn" to="/buyer/cart">Cart</Link>
                    <Link className="btn" to="/buyer/orders">My Orders</Link>
                  </>
                )}
                {currentUser.role === Roles.SELLER && currentUser.verificationStatus === 'verified' && (
                  <>
                    <Link className="btn" to="/seller/products">Products</Link>
                    <Link className="btn" to="/seller/orders">Orders</Link>
                  </>
                )}
                {currentUser.role === Roles.ADMIN && (
                  <>
                    <Link className="btn" to="/admin/products">Products</Link>
                    <Link className="btn" to="/admin/orders">Orders</Link>
                    <Link className="btn" to="/admin/complaints">Complaints</Link>
                  </>
                )}
                <span className="pill" title={currentUser.email}>
                  {currentUser.role.toUpperCase()} · {currentUser.name}
                </span>
                <button className="btn" onClick={onLogout}>
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </div>

      <main className="container page">
        <Outlet />
      </main>
    </>
  )
}

