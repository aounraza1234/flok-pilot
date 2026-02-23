import { createContext, useContext, useMemo, useState } from 'react'
import { Roles, VerificationStatus } from './constants.js'
import {
  approveSeller,
  getUserByEmail,
  getUserById,
  listAllSellers,
  listPendingSellers,
  login as dbLogin,
  registerBuyer,
  registerSeller,
  rejectSeller,
  resetDb,
} from './mockDb.js'
import { loadJson, saveJson } from './storage.js'

const SESSION_KEY = 'flockpilot_session_v1'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadJson(SESSION_KEY, { userId: null }))
  const [refreshKey, setRefreshKey] = useState(0)

  const currentUser = useMemo(() => {
    if (!session?.userId) return null
    return getUserById(session.userId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.userId, refreshKey])

  function setUserId(userId) {
    const next = { userId }
    setSession(next)
    saveJson(SESSION_KEY, next)
  }

  function logout() {
    setUserId(null)
  }

  function login(email, password) {
    const user = dbLogin(email, password)
    const full = getUserByEmail(user.email)
    setUserId(full.id)
    return full
  }

  function registerBuyerAndLogin(payload) {
    registerBuyer(payload)
    return login(payload.email, payload.password)
  }

  function registerSellerAndLogin(payload) {
    registerSeller(payload)
    return login(payload.email, payload.password)
  }

  function adminApproveSeller(sellerId) {
    if (!currentUser || currentUser.role !== Roles.ADMIN) throw new Error('Unauthorized')
    approveSeller({ adminEmail: currentUser.email, sellerId })
    setRefreshKey((k) => k + 1)
  }

  function adminRejectSeller(sellerId, reason) {
    if (!currentUser || currentUser.role !== Roles.ADMIN) throw new Error('Unauthorized')
    rejectSeller({ adminEmail: currentUser.email, sellerId, reason })
    setRefreshKey((k) => k + 1)
  }

  function getPendingSellers() {
    return listPendingSellers()
  }

  function getAllSellers() {
    return listAllSellers()
  }

  function isSellerVerified() {
    return currentUser?.role === Roles.SELLER && currentUser?.verificationStatus === VerificationStatus.VERIFIED
  }

  function devResetDb() {
    resetDb()
    setRefreshKey((k) => k + 1)
    logout()
  }

  function refreshDb() {
    setRefreshKey((k) => k + 1)
  }

  const value = useMemo(
    () => ({
      currentUser,
      refreshKey,
      login,
      logout,
      registerBuyerAndLogin,
      registerSellerAndLogin,
      adminApproveSeller,
      adminRejectSeller,
      getPendingSellers,
      getAllSellers,
      isSellerVerified,
      devResetDb,
      refreshDb,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser, refreshKey]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

