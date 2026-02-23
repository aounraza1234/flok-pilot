import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrderById, createReview, createComplaint, getReviewByOrderId, getUserById, cancelOrder } from '../app/mockDb.js'
import { OrderStatus } from '../app/constants.js'
import { useAuth } from '../app/AuthContext.jsx'

export default function OrderDetail() {
  const { id } = useParams()
  const { currentUser, refreshDb, refreshKey } = useAuth()
  const order = useMemo(() => getOrderById(id), [id, refreshKey])
  const existingReview = useMemo(() => (order ? getReviewByOrderId(order.id) : null), [order?.id, refreshKey])
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [complaintMsg, setComplaintMsg] = useState('')
  const [msg, setMsg] = useState('')

  if (!order) {
    return (
      <div className="card">
        <div className="card-inner">
          <p className="muted">Order nahi mila.</p>
          <Link className="btn" to="/buyer/orders">My Orders</Link>
        </div>
      </div>
    )
  }

  const isBuyer = currentUser?.id === order.buyerId
  const delivered = order.status === OrderStatus.DELIVERED
  const seller = order.sellerId ? getUserById(order.sellerId) : null
  const canCancel = isBuyer && [OrderStatus.PENDING_ADMIN, OrderStatus.APPROVED].includes(order.status)

  function handleCancel() {
    if (!window.confirm('Order cancel karna hai? Stock wapas add ho jayega.')) return
    setMsg('')
    try {
      cancelOrder({ orderId: order.id, actorId: currentUser.id, isAdmin: false })
      refreshDb()
      setMsg('Order cancelled.')
    } catch (err) {
      setMsg(err?.message || 'Cancel failed')
    }
  }

  function handleReview(e) {
    e.preventDefault()
    setMsg('')
    try {
      createReview({
        orderId: order.id,
        productId: order.items?.[0]?.productId,
        buyerId: currentUser.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      })
      refreshDb()
      setMsg('Review submit ho gaya.')
    } catch (err) {
      setMsg(err?.message || 'Failed')
    }
  }

  function handleComplaint(e) {
    e.preventDefault()
    setMsg('')
    try {
      createComplaint({
        buyerId: currentUser.id,
        orderId: order.id,
        sellerId: order.sellerId,
        message: complaintMsg.trim(),
      })
      refreshDb()
      setMsg('Complaint register ho gaya.')
    } catch (err) {
      setMsg(err?.message || 'Failed')
    }
  }

  const statusLabels = {
    [OrderStatus.PENDING_ADMIN]: 'Pending admin approval',
    [OrderStatus.APPROVED]: 'Approved',
    [OrderStatus.ASSIGNED]: 'Assigned to seller',
    [OrderStatus.PREPARING]: 'Preparing',
    [OrderStatus.OUT_FOR_DELIVERY]: 'Out for delivery',
    [OrderStatus.DELIVERED]: 'Delivered',
    [OrderStatus.CANCELLED]: 'Cancelled',
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="card-inner">
          <div className="pill">Order #{order.id.slice(-8)}</div>
          <h2 style={{ marginTop: 10, marginBottom: 8 }}>Rs {order.total}</h2>
          <p className="muted" style={{ margin: 0 }}>Payment: {order.paymentMethod === 'advance' ? 'Advance' : 'COD'} · Address: {order.deliveryAddress || '—'}</p>
          {seller ? <p className="muted" style={{ marginTop: 6 }}>Seller: {seller.name}</p> : null}
        </div>
      </div>

      <div className="card">
        <div className="card-inner">
          <h3 style={{ marginTop: 0 }}>Items</h3>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {(order.items || []).map((i, idx) => (
              <li key={idx}>{i.title} × {i.quantity} {i.unit} — Rs {i.price * i.quantity}</li>
            ))}
          </ul>
        </div>
      </div>

      {canCancel && (
        <div className="card">
          <div className="card-inner">
            <button className="btn btn-danger" type="button" onClick={handleCancel}>
              Cancel order
            </button>
            <p className="muted" style={{ marginTop: 8, marginBottom: 0, fontSize: 13 }}>Sirf pending/approved orders cancel ho sakte hain. Stock wapas add ho jayega.</p>
          </div>
        </div>
      )}
      <div className="card">
        <div className="card-inner">
          <h3 style={{ marginTop: 0 }}>Status timeline</h3>
          <div className="grid" style={{ gap: 8 }}>
            {(order.statusHistory || []).map((h, idx) => (
              <div key={idx} className="pill">
                {statusLabels[h.status] || h.status} — {new Date(h.at).toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isBuyer && delivered && (
        <>
          <div className="card">
            <div className="card-inner">
              <h3 style={{ marginTop: 0 }}>Leave a review</h3>
              {existingReview ? (
                <p className="muted">Aap pehle hi review de chuke hain ({existingReview.rating}/5).</p>
              ) : (
              <form className="grid" onSubmit={handleReview}>
                <div className="field">
                  <div className="label">Rating (1–5)</div>
                  <select className="input" value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))}>
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="field">
                  <div className="label">Comment</div>
                  <textarea className="input" rows={2} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
                </div>
                <button className="btn btn-primary" type="submit">Submit Review</button>
              </form>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card-inner">
              <h3 style={{ marginTop: 0 }}>Register complaint</h3>
              <form className="grid" onSubmit={handleComplaint}>
                <div className="field">
                  <div className="label">Message</div>
                  <textarea className="input" rows={3} value={complaintMsg} onChange={(e) => setComplaintMsg(e.target.value)} placeholder="Describe the issue..." required />
                </div>
                <button className="btn btn-danger" type="submit">Submit Complaint</button>
              </form>
            </div>
          </div>
        </>
      )}
      {msg ? <div className="pill" style={{ color: 'white' }}>{msg}</div> : null}
      <div>
        <Link className="btn" to="/buyer/orders">Back to My Orders</Link>
      </div>
    </div>
  )
}
