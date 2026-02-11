import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../app/AuthContext.jsx'
import { Roles, VerificationStatus } from '../app/constants.js'

export function RequireAuth() {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  return <Outlet />
}

export function RequireRole({ role }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.role !== role) return <Navigate to="/" replace />
  return <Outlet />
}

export function RequireVerifiedSeller() {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.role !== Roles.SELLER) return <Navigate to="/" replace />
  if (currentUser.verificationStatus === VerificationStatus.VERIFIED) return <Outlet />
  return <Navigate to="/seller/pending" replace />
}

