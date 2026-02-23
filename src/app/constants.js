export const Roles = Object.freeze({
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin',
})

export const SellerTypes = Object.freeze({
  FARM: 'farm',
  SHOP: 'shop',
})

export const VerificationStatus = Object.freeze({
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
})

export const ProductStatus = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
})

export const OrderStatus = Object.freeze({
  PENDING_ADMIN: 'pending_admin',
  APPROVED: 'approved',
  ASSIGNED: 'assigned',
  PREPARING: 'preparing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
})

export const PaymentMethod = Object.freeze({
  COD: 'cod',
  ADVANCE: 'advance',
})

export const ComplaintStatus = Object.freeze({
  OPEN: 'open',
  RESOLVED: 'resolved',
})

