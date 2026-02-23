import {
  Roles,
  SellerTypes,
  VerificationStatus,
  ProductStatus,
  OrderStatus,
  PaymentMethod,
  ComplaintStatus,
} from './constants.js'
import { loadJson, makeId, saveJson } from './storage.js'

const DB_KEY = 'flockpilot_db_v2'

function seed() {
  const sellerId = makeId('user')
  const adminId = makeId('user')
  const buyerId = makeId('user')
  return {
    users: [
      {
        id: adminId,
        role: Roles.ADMIN,
        name: 'Admin',
        email: 'admin@flockpilot.test',
        phone: '0300-0000000',
        password: 'admin123',
        createdAt: new Date().toISOString(),
      },
      {
        id: buyerId,
        role: Roles.BUYER,
        name: 'Demo Buyer',
        email: 'buyer@flockpilot.test',
        phone: '0300-1111111',
        password: 'buyer123',
        createdAt: new Date().toISOString(),
      },
      {
        id: sellerId,
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
        warningCount: 0,
        suspended: false,
      },
    ],
    audit: [],
    products: [
      {
        id: makeId('prod'),
        sellerId,
        title: 'Fresh Farm Eggs (Dozen)',
        description: 'Farm fresh eggs, 12 pieces per pack.',
        price: 250,
        stock: 50,
        unit: 'pack',
        imageUrl: null,
        status: ProductStatus.APPROVED,
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
      },
      {
        id: makeId('prod'),
        sellerId,
        title: 'Live Chicken (1 kg approx)',
        description: 'Live chicken, healthy and fresh.',
        price: 600,
        stock: 20,
        unit: 'piece',
        imageUrl: null,
        status: ProductStatus.APPROVED,
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
      },
    ],
    orders: [],
    reviews: [],
    complaints: [],
  }
}

export function getDb() {
  const db = loadJson(DB_KEY, null)
  if (db && db.users) {
    if (!Array.isArray(db.products)) db.products = []
    if (!Array.isArray(db.orders)) db.orders = []
    if (!Array.isArray(db.reviews)) db.reviews = []
    if (!Array.isArray(db.complaints)) db.complaints = []
    db.users.forEach((u) => {
      if (u.role === Roles.SELLER && u.warningCount === undefined) u.warningCount = 0
      if (u.role === Roles.SELLER && u.suspended === undefined) u.suspended = false
    })
    saveJson(DB_KEY, db)
    return db
  }
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

// ---------- Products (Chunk 4) ----------
export function createProduct({ sellerId, title, description, price, stock, unit, imageUrl }) {
  return setDb((db) => {
    const product = {
      id: makeId('prod'),
      sellerId,
      title: title?.trim() || '',
      description: description?.trim() || '',
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      unit: unit?.trim() || 'piece',
      imageUrl: imageUrl || null,
      status: ProductStatus.PENDING,
      createdAt: new Date().toISOString(),
    }
    db.products.push(product)
    db.audit.push({
      id: makeId('audit'),
      at: new Date().toISOString(),
      action: 'CREATE_PRODUCT',
      actorEmail: db.users.find((u) => u.id === sellerId)?.email,
      targetUserId: sellerId,
      meta: { productId: product.id },
    })
    return db
  })
}

export function listApprovedProducts() {
  const db = getDb()
  return (db.products || []).filter((p) => p.status === ProductStatus.APPROVED && (p.stock ?? 0) > 0)
}

export function listProductsBySellerId(sellerId) {
  const db = getDb()
  return (db.products || []).filter((p) => p.sellerId === sellerId)
}

export function listPendingProducts() {
  const db = getDb()
  return (db.products || []).filter((p) => p.status === ProductStatus.PENDING)
}

export function getProductById(id) {
  const db = getDb()
  return (db.products || []).find((p) => p.id === id) || null
}

export function approveProduct({ adminEmail, productId }) {
  return setDb((db) => {
    const product = db.products.find((p) => p.id === productId)
    if (!product) throw new Error('Product not found')
    product.status = ProductStatus.APPROVED
    product.approvedAt = new Date().toISOString()
    db.audit.push({
      id: makeId('audit'),
      at: new Date().toISOString(),
      action: 'APPROVE_PRODUCT',
      actorEmail: adminEmail,
      targetUserId: product.sellerId,
      meta: { productId },
    })
    return db
  })
}

export function rejectProduct({ adminEmail, productId }) {
  return setDb((db) => {
    const product = db.products.find((p) => p.id === productId)
    if (!product) throw new Error('Product not found')
    product.status = ProductStatus.REJECTED
    db.audit.push({
      id: makeId('audit'),
      at: new Date().toISOString(),
      action: 'REJECT_PRODUCT',
      actorEmail: adminEmail,
      targetUserId: product.sellerId,
      meta: { productId },
    })
    return db
  })
}

export function updateProductStock(productId, newStock) {
  return setDb((db) => {
    const product = db.products.find((p) => p.id === productId)
    if (!product) throw new Error('Product not found')
    product.stock = Math.max(0, Number(newStock))
    return db
  })
}

export function updateProduct(productId, updates) {
  return setDb((db) => {
    const product = db.products.find((p) => p.id === productId)
    if (!product) throw new Error('Product not found')
    if (product.status !== ProductStatus.PENDING) {
      if (updates.title !== undefined) product.title = String(updates.title).trim()
      if (updates.description !== undefined) product.description = String(updates.description).trim()
      if (updates.price !== undefined) product.price = Number(updates.price)
      if (updates.stock !== undefined) product.stock = Math.max(0, Number(updates.stock))
      if (updates.unit !== undefined) product.unit = String(updates.unit).trim()
      if (updates.imageUrl !== undefined) product.imageUrl = updates.imageUrl
    } else {
      Object.assign(product, {
        title: updates.title !== undefined ? String(updates.title).trim() : product.title,
        description: updates.description !== undefined ? String(updates.description).trim() : product.description,
        price: updates.price !== undefined ? Number(updates.price) : product.price,
        stock: updates.stock !== undefined ? Math.max(0, Number(updates.stock)) : product.stock,
        unit: updates.unit !== undefined ? String(updates.unit).trim() : product.unit,
        imageUrl: updates.imageUrl !== undefined ? updates.imageUrl : product.imageUrl,
      })
    }
    return db
  })
}

// ---------- Orders (Chunk 5) ----------
export function createOrder({ buyerId, items, paymentMethod, deliveryAddress }) {
  return setDb((db) => {
    const orderId = makeId('order')
    const orderItems = items.map((item) => {
      const product = db.products.find((p) => p.id === item.productId)
      if (!product || product.status !== ProductStatus.APPROVED) throw new Error(`Product ${item.productId} not available`)
      const qty = Math.max(1, Number(item.quantity))
      if (product.stock < qty) throw new Error(`Insufficient stock for ${product.title}`)
      return {
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: qty,
        unit: product.unit,
      }
    })
    let total = 0
    orderItems.forEach((i) => { total += i.price * i.quantity })
    const order = {
      id: orderId,
      buyerId,
      items: orderItems,
      total,
      paymentMethod: paymentMethod === PaymentMethod.ADVANCE ? PaymentMethod.ADVANCE : PaymentMethod.COD,
      deliveryAddress: deliveryAddress?.trim() || '',
      status: OrderStatus.PENDING_ADMIN,
      sellerId: null,
      createdAt: new Date().toISOString(),
      statusHistory: [{ status: OrderStatus.PENDING_ADMIN, at: new Date().toISOString() }],
    }
    db.orders.push(order)
    orderItems.forEach((item) => {
      const product = db.products.find((p) => p.id === item.productId)
      if (product) product.stock -= item.quantity
    })
    db.audit.push({
      id: makeId('audit'),
      at: new Date().toISOString(),
      action: 'CREATE_ORDER',
      actorEmail: db.users.find((u) => u.id === buyerId)?.email,
      targetUserId: buyerId,
      meta: { orderId },
    })
    return db
  })
}

export function listOrdersByBuyerId(buyerId) {
  const db = getDb()
  return (db.orders || []).filter((o) => o.buyerId === buyerId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function listOrdersPendingAdmin() {
  const db = getDb()
  return (db.orders || []).filter((o) => o.status === OrderStatus.PENDING_ADMIN)
}

export function listOrdersBySellerId(sellerId) {
  const db = getDb()
  return (db.orders || [])
    .filter((o) => o.sellerId === sellerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getOrderById(orderId) {
  const db = getDb()
  return (db.orders || []).find((o) => o.id === orderId) || null
}

function pushOrderStatus(db, order, newStatus) {
  order.status = newStatus
  order.statusHistory = order.statusHistory || []
  order.statusHistory.push({ status: newStatus, at: new Date().toISOString() })
}

export function assignOrderToSeller({ adminEmail, orderId, sellerId }) {
  return setDb((db) => {
    const order = db.orders.find((o) => o.id === orderId)
    if (!order) throw new Error('Order not found')
    if (order.status !== OrderStatus.PENDING_ADMIN) throw new Error('Order already processed')
    const seller = db.users.find((u) => u.id === sellerId && u.role === Roles.SELLER && u.verificationStatus === VerificationStatus.VERIFIED && !u.suspended)
    if (!seller) throw new Error('Seller not found or not eligible')
    order.sellerId = sellerId
    pushOrderStatus(db, order, OrderStatus.ASSIGNED)
    db.audit.push({
      id: makeId('audit'),
      at: new Date().toISOString(),
      action: 'ASSIGN_ORDER',
      actorEmail: adminEmail,
      targetUserId: sellerId,
      meta: { orderId },
    })
    return db
  })
}

export function updateOrderStatus({ orderId, newStatus, actorId }) {
  return setDb((db) => {
    const order = db.orders.find((o) => o.id === orderId)
    if (!order) throw new Error('Order not found')
    const allowed = [OrderStatus.PREPARING, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED, OrderStatus.CANCELLED]
    if (!allowed.includes(newStatus)) throw new Error('Invalid status')
    if (order.sellerId && order.sellerId !== actorId && newStatus !== OrderStatus.CANCELLED) throw new Error('Only assigned seller can update')
    if (newStatus === OrderStatus.CANCELLED && order.status !== OrderStatus.ASSIGNED && order.status !== OrderStatus.PREPARING && order.status !== OrderStatus.OUT_FOR_DELIVERY) {
      // Restore stock when cancelling before/during fulfillment
      ;(order.items || []).forEach((item) => {
        const product = db.products.find((p) => p.id === item.productId)
        if (product) product.stock += item.quantity
      })
    }
    pushOrderStatus(db, order, newStatus)
    return db
  })
}

/** Cancel order by buyer (only when pending_admin or approved) or admin. Restores stock. */
export function cancelOrder({ orderId, actorId, isAdmin }) {
  return setDb((db) => {
    const order = db.orders.find((o) => o.id === orderId)
    if (!order) throw new Error('Order not found')
    const canCancel = [OrderStatus.PENDING_ADMIN, OrderStatus.APPROVED].includes(order.status)
    if (!canCancel) throw new Error('Order cannot be cancelled at this stage')
    const allowed = isAdmin || order.buyerId === actorId
    if (!allowed) throw new Error('Not allowed to cancel this order')
    ;(order.items || []).forEach((item) => {
      const product = db.products.find((p) => p.id === item.productId)
      if (product) product.stock += item.quantity
    })
    pushOrderStatus(db, order, OrderStatus.CANCELLED)
    db.audit.push({
      id: makeId('audit'),
      at: new Date().toISOString(),
      action: 'CANCEL_ORDER',
      actorEmail: db.users.find((u) => u.id === actorId)?.email,
      targetUserId: order.buyerId,
      meta: { orderId },
    })
    return db
  })
}

export function approveOrderByAdmin({ adminEmail, orderId, sellerId }) {
  return setDb((db) => {
    const order = db.orders.find((o) => o.id === orderId)
    if (!order) throw new Error('Order not found')
    if (order.status !== OrderStatus.PENDING_ADMIN) throw new Error('Order already processed')
    if (sellerId) {
      const seller = db.users.find((u) => u.id === sellerId && u.role === Roles.SELLER && u.verificationStatus === VerificationStatus.VERIFIED && !u.suspended)
      if (!seller) throw new Error('Seller not found or not eligible')
      order.sellerId = sellerId
      pushOrderStatus(db, order, OrderStatus.ASSIGNED)
    } else {
      pushOrderStatus(db, order, OrderStatus.APPROVED)
    }
    db.audit.push({
      id: makeId('audit'),
      at: new Date().toISOString(),
      action: sellerId ? 'ASSIGN_ORDER' : 'APPROVE_ORDER',
      actorEmail: adminEmail,
      targetUserId: order.buyerId,
      meta: { orderId, sellerId: sellerId || undefined },
    })
    return db
  })
}

// ---------- Reviews (Chunk 6) ----------
export function createReview({ orderId, productId, buyerId, rating, comment }) {
  return setDb((db) => {
    const order = db.orders.find((o) => o.id === orderId)
    if (!order || order.buyerId !== buyerId) throw new Error('Order not found')
    if (order.status !== OrderStatus.DELIVERED) throw new Error('Order must be delivered to review')
    const review = {
      id: makeId('review'),
      orderId,
      productId,
      buyerId,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: String(comment || '').trim(),
      createdAt: new Date().toISOString(),
    }
    db.reviews.push(review)
    return db
  })
}

export function getReviewsByProductId(productId) {
  const db = getDb()
  return (db.reviews || []).filter((r) => r.productId === productId)
}

export function getReviewByOrderId(orderId) {
  const db = getDb()
  return (db.reviews || []).find((r) => r.orderId === orderId) || null
}

// ---------- Complaints (Chunk 6) ----------
export function createComplaint({ buyerId, orderId, sellerId, message }) {
  return setDb((db) => {
    const complaint = {
      id: makeId('complaint'),
      buyerId,
      orderId: orderId || null,
      sellerId: sellerId || null,
      message: String(message || '').trim(),
      status: ComplaintStatus.OPEN,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
      resolvedBy: null,
    }
    db.complaints.push(complaint)
    return db
  })
}

export function listComplaints(onlyOpen = false) {
  const db = getDb()
  let list = db.complaints || []
  if (onlyOpen) list = list.filter((c) => c.status === ComplaintStatus.OPEN)
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function resolveComplaint({ adminEmail, complaintId }) {
  return setDb((db) => {
    const c = db.complaints.find((x) => x.id === complaintId)
    if (!c) throw new Error('Complaint not found')
    c.status = ComplaintStatus.RESOLVED
    c.resolvedAt = new Date().toISOString()
    c.resolvedBy = adminEmail
    return db
  })
}

export function warnSeller({ adminEmail, sellerId }) {
  return setDb((db) => {
    const seller = db.users.find((u) => u.id === sellerId && u.role === Roles.SELLER)
    if (!seller) throw new Error('Seller not found')
    seller.warningCount = (seller.warningCount || 0) + 1
    db.audit.push({
      id: makeId('audit'),
      at: new Date().toISOString(),
      action: 'WARN_SELLER',
      actorEmail: adminEmail,
      targetUserId: sellerId,
      meta: { warningCount: seller.warningCount },
    })
    return db
  })
}

export function suspendSeller({ adminEmail, sellerId }) {
  return setDb((db) => {
    const seller = db.users.find((u) => u.id === sellerId && u.role === Roles.SELLER)
    if (!seller) throw new Error('Seller not found')
    seller.suspended = true
    db.audit.push({
      id: makeId('audit'),
      at: new Date().toISOString(),
      action: 'SUSPEND_SELLER',
      actorEmail: adminEmail,
      targetUserId: sellerId,
    })
    return db
  })
}

