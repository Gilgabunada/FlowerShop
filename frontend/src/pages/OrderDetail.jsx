import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { useNotyf } from '../contexts/NotyContext';
import { useAuth } from '../contexts/AuthContext';

function statusBadge(status) {
  const map = {
    'Pending': 'badge-warning',
    'Preparing Bouquet': 'badge-primary',
    'Out for Delivery': 'badge-primary',
    'Delivered': 'badge-success',
    'Cancelled': 'badge-danger',
  };
  return map[status] || 'badge-muted';
}

const SHOP_CONTACT = {
  name: 'Petal & Bloom',
  phone: '0917 123 4567',
  phoneLink: '+639171234567',
};

export default function OrderDetail() {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const notyf = useNotyf();
  const { user } = useAuth();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

async function fetchOrder() {
  const { ok, data } = await api(`/orders/${id}`);
  if (ok && data?.order) setOrder(data.order);
  else setError('Order not found.');
  setLoading(false);
}

  useEffect(() => { fetchOrder(); }, [id]);

  async function handleCancel() {
    setShowCancelConfirm(false);
    setCancelling(true);
    setCancelError('');
    const { ok, data } = await api(`/orders/${id}/cancel`, { method: 'PATCH' });
    if (ok) {
      await fetchOrder();
      notyf.success('✅ Order cancelled successfully');
    } else {
      const errorMsg = data?.error?.message || data?.error || data?.message || 'Failed to cancel order.';
      setCancelError(errorMsg);
      notyf.error(`❌ ${errorMsg}`);
    }
    setCancelling(false);
  }

  if (loading) return <Spinner />;
  if (error) return (
    <main className="page">
      <div className="container">
        <ErrorMessage message={error} />
        <Link to="/orders" className="btn btn-outline mt-2">Back to Orders</Link>
      </div>
    </main>
  );

 const items = order.productsOrdered || [];

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <nav className="breadcrumb">
          <Link to="/orders">My Orders</Link> / <span>Order #{order._id.slice(-6).toUpperCase()}</span>
        </nav>

        <div className="d-flex align-center justify-between mb-2" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <h1 className="section-title" style={{ margin: 0 }}>Order Details</h1>
          <span className={`badge ${statusBadge(order.status)}`} style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
            {order.status}
          </span>
        </div>

        <ErrorMessage message={cancelError} />

        <div className="order-sections">
          {/* Delivery info */}
          <div className="card order-card">
            <h3>Delivery Information</h3>
            <div className="divider" />
            <div className="info-grid">
              <InfoRow label="Recipient" value={order.recipientName} />
              <InfoRow label="Phone" value={order.recipientPhone} />
              <InfoRow label="Address" value={order.deliveryAddress} />
              <InfoRow
                label="Delivery Date"
                value={order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              />
              {order.customMessage && <InfoRow label="Message" value={order.customMessage} />}
            </div>
          </div>

          {/* Items */}
          {items.length > 0 && (
            <div className="card order-card">
              <h3>Items Ordered</h3>
              <div className="divider" />
              <div className="order-items">
                {items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <img
                      src={item.imageUrl || 'https://placehold.co/60x60/f8d7e3/d63384?text=🌸'}
                      alt={item.productName}
                      className="order-item__img"
                    />
                    <div className="order-item__info">
                      <strong>{item.productName || 'Product'}</strong>
                      <span className="text-muted">
                        ₱{Number(item.unitPrice).toLocaleString()} × {item.quantity}
                      </span>
                    </div>
                    <span className="order-item__subtotal">₱{Number(item.subtotal).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="divider" />
              <div className="order-total">
                <strong>Total</strong>
                <strong style={{ color: 'var(--primary)' }}>₱{Number(order.totalPrice).toLocaleString()}</strong>
              </div>
            </div>
          )}

          {!user?.isAdmin && (order.status === 'Pending' || order.status === 'Preparing Bouquet') && (
            <div className="card order-card contact-card">
              <h3>Need to make changes?</h3>
              <div className="divider" />
              <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
                Want to change the delivery date, address, message, or bouquet? Call us
                and we'll sort out your options.
              </p>
              <a href={`tel:${SHOP_CONTACT.phoneLink}`} className="btn btn-primary" onClick={() => notyf.success(`📞 Calling ${SHOP_CONTACT.phone}…`)}
              >
                📞 Call {SHOP_CONTACT.phone}
              </a>
            </div>
          )}

          {order.status === 'Pending' && (
            <div className="d-flex gap-2">
              <button className="btn btn-danger" onClick={() => setShowCancelConfirm(true)} disabled={cancelling}>
                {cancelling ? 'Cancelling…' : 'Cancel Order'}
              </button>
              <Link to="/orders" className="btn btn-outline">Back to Orders</Link>
            </div>
          )}
          {order.status !== 'Pending' && (
            <Link to="/orders" className="btn btn-outline">Back to Orders</Link>
          )}
        </div>
      </div>

      {showCancelConfirm && (
        <div
          className="modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && setShowCancelConfirm(false)}
        >
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2>Cancel this order?</h2>
              <button className="modal-close" onClick={() => setShowCancelConfirm(false)}>×</button>
            </div>
            <p className="text-muted">
              This will cancel order #{order._id.slice(-6).toUpperCase()} and cannot be undone.
              If you only want to change the delivery details, call us instead.
            </p>
            <div className="d-flex gap-2 mt-2">
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleCancel}>
                Yes, cancel order
              </button>
              <button className="btn btn-outline" onClick={() => setShowCancelConfirm(false)}>
                Keep order
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .breadcrumb { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; }
        .breadcrumb a { color: var(--text-muted); }
        .breadcrumb a:hover { color: var(--primary); }
        .order-sections { display: flex; flex-direction: column; gap: 1.25rem; }
        .order-card { padding: 1.5rem; }
        .order-card h3 { font-size: 1.1rem; color: var(--primary-dark); margin-bottom: 0.5rem; }
        .info-grid { display: flex; flex-direction: column; gap: 0.6rem; }
        .info-row { display: grid; grid-template-columns: 140px 1fr; gap: 0.5rem; font-size: 0.92rem; }
        .info-row__label { color: var(--text-muted); font-weight: 500; }
        .order-items { display: flex; flex-direction: column; gap: 0.75rem; }
        .order-item { display: flex; align-items: center; gap: 1rem; }
        .order-item__img { width: 56px; height: 56px; object-fit: cover; border-radius: var(--radius-sm); }
        .order-item__info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; font-size: 0.9rem; }
        .order-item__subtotal { font-weight: 600; color: var(--primary); }
        .order-total { display: flex; justify-content: space-between; font-size: 1rem; padding-top: 0.25rem; }
      `}</style>
    </main>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-row__label">{label}</span>
      <span>{value}</span>
    </div>
  );
}
