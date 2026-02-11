import { Roles, SellerTypes, VerificationStatus } from './constants.js'
import { loadJson, makeId, saveJson } from './storage.js'

const DB_KEY = 'flockpilot_db_v1'

function seed() {
  return {
    users: [
      {
        id: makeId('user'),
        role: Roles.ADMIN,
        name: 'Admin',
        email: 'admin@flockpilot.test',
        phone: '0300-0000000',
        password: 'admin123',
        createdAt: new Date().toISOString(),
      },
      {
        id: makeId('user'),
        role: Roles.BUYER,
        name: 'Demo Buyer',
        email: 'buyer@flockpilot.test',
        phone: '0300-1111111',
        password: 'buyer123',
        createdAt: new Date().toISOString(),
      },
      {
        id: makeId('user'),
        role: Roles.SELLER,
        name: 'Demo Seller (Verified)',
        email: 'seller@flockpilot.test',
        phone: '0300-2222222',
        password: 'seller123',
        sellerType: SellerTypes.FARM,
        verificationStatus: VerificationStatus.VERIFIED,
        docs: [{ id: makeId('doc'), name: 'cnic.jpg', size: 123456, type: 'image/jpeg' }],
        createdAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString(),
      },
    ],
    audit: [],
  }
}

export function getDb() {
  const db = loadJson(DB_KEY, null)
  if (db && db.users) return db
  const fresh = seed()
  saveJson(DB_KEY, fresh)
  return fresh
}

function setDb(updater) {
  const current = getDb()
  const next = updater(structuredClone(current))
  saveJson(DB_KEY, next)
  return next
}

export function resetDb() {
  const fresh = seed()
  saveJson(DB_KEY, fresh)
  return fresh
}

export function login(email, password) {
  const db = getDb()
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!user) throw new Error('User not found')
  if (user.password !== password) throw new Error('Invalid password')
  return sanitizeUser(user)
}

export function registerBuyer({ name, email, phone, password }) {
  return setDb((db) => {
    const exists = db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())
    if (exists) throw new Error('Email already in use')
    const user = {
      id: makeId('user'),
      role: Roles.BUYER,
      name,
      email,
      phone,
      password,
      createdAt: new Date().toISOString(),
    }
    db.users.push(user)
    db.audit.push({
      id: makeId('audit'),
      at: new Date().toISOString(),
      action: 'REGISTER_BUYER',
      actorEmail: email,
      targetUserId: user.id,
    })
    return db
  })
}

export function registerSeller({ name, email, phone, password, sellerType, docs }) {
  return setDb((db) => {
    const exists = db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())
    if (exists) throw new Error('Email already in use')
    const user = {
      id: makeId('user'),
      role: Roles.SELLER,
      name,
      email,
      phone,
      password,
      sellerType,
      verificationStatus: VerificationStatus.PENDING,
      docs: (docs || []).map((d) => ({
        id: makeId('doc'),
        name: d.name,
        size: d.size,
        type: d.type,
      })),
      createdAt: new Date().toISOString(),
    }
    db.users.push(user)
    db.audit.push({
      id: makeId('audit'),
      at: new Date().toISOString(),
      action: 'REGISTER_SELLER',
      actorEmail: email,
      targetUserId: user.id,
    })
    return db
  })
}

export function listPendingSellers() {
  const db = getDb()
  return db.users
    .filter((u) => u.role === Roles.SELLER && u.verificationStatus === VerificationStatus.PENDING)
    .map(sanitizeUser)
}

export function listAllSellers() {
  const db = getDb()
  return db.users.filter((u) => u.role === Roles.SELLER).map(sanitizeUser)
}

export function approveSeller({ adminEmail, sellerId }) {
  return setDb((db) => {
    const seller = db.users.find((u) => u.id === sellerId && u.role === Roles.SELLER)
    if (!seller) throw new Error('Seller not found')
    seller.verificationStatus = VerificationStatus.VERIFIED
    seller.verifiedAt = new Date().toISOString()
    seller.rejectionReason = undefined
    db.audit.push({
      id: makeId('audit'),
      at: new Date().toISOString(),
      action: 'APPROVE_SELLER',
      actorEmail: adminEmail,
      targetUserId: seller.id,
    })
    return db
  })
}

export function rejectSeller({ adminEmail, sellerId, reason }) {
  return setDb((db) => {
    const seller = db.users.find((u) => u.id === sellerId && u.role === Roles.SELLER)
    if (!seller) throw new Error('Seller not found')
    seller.verificationStatus = VerificationStatus.REJECTED
    seller.rejectionReason = reason || 'Not specified'
    db.audit.push({
      id: makeId('audit'),
      at: new Date().toISOString(),
      action: 'REJECT_SELLER',
      actorEmail: adminEmail,
      targetUserId: seller.id,
      meta: { reason: seller.rejectionReason },
    })
    return db
  })
}

export function getUserByEmail(email) {
  const db = getDb()
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  return user ? sanitizeUser(user) : null
}

export function getUserById(id) {
  const db = getDb()
  const user = db.users.find((u) => u.id === id)
  return user ? sanitizeUser(user) : null
}

export function sanitizeUser(user) {
  // remove password in UI layer
  // eslint-disable-next-line no-unused-vars
  const { password, ...safe } = user
  return safe
}

