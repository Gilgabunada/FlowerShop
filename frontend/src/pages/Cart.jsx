import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useNotyf } from '../contexts/NotyContext';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

const INITIAL_CHECKOUT = {
  recipientName: '',
  recipientPhone: '',
  deliveryAddress: '',
  deliveryDate: '',
  customMessage: '',
};

export default function Cart() {
  const navigate = useNavigate();
  const notyf = useNotyf();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkout, setCheckout] = useState(INITIAL_CHECKOUT);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  async function fetchCart(silent = false) {
    if (!silent) setLoading(true);
    const { ok, data } = await api('/cart/get-cart');
    if (!silent) setLoading(false);
    if (ok) {
      setCart(data?.cart || null);
    } else {
      setError('Failed to load cart.');
    }
  }

  useEffect(() => { fetchCart(); }, []);

  async function handleUpdateQty(productId, newQuantity) {
    if (newQuantity < 1) return;
    setUpdating((u) => ({ ...u, [productId]: true }));
    const { ok, data } = await api('/cart/update-cart-quantity', {
      method: 'PATCH',
      body: { productId, quantity: newQuantity },
    });
    if (ok) {
      await fetchCart(true);
      notyf.success('✅ Quantity updated!');
    } else {
      const errorMsg = data?.error?.message || data?.error || 'Failed to update quantity';
      notyf.error(`❌ ${errorMsg}`);
    }
    setUpdating((u) => ({ ...u, [productId]: false }));
  }

  async function handleRemove(productId) {
    setUpdating((u) => ({ ...u, [productId]: 'removing' }));
    const { ok, data } = await api(`/cart/${productId}/remove-from-cart`, { method: 'PATCH' });
    if (ok) {
      await fetchCart(true);
      notyf.success('✅ Item removed from cart');
    } else {
      const errorMsg = data?.error?.message || data?.error || 'Failed to remove item';
      notyf.error(`❌ ${errorMsg}`);
    }
    setUpdating((u) => ({ ...u, [productId]: false }));
  }

  async function handleClear() {
    if (!window.confirm('Clear your entire cart?')) return;
    const { ok, data } = await api('/cart/clear-cart', { method: 'PUT' });
    if (ok) {
      // Use the updated cart from response instead of refetching
      if (data?.cart) {
        setCart(data.cart);
      }
      notyf.success('✅ Cart cleared');
    } else {
      const errorMsg = data?.error?.message || data?.error || 'Failed to clear cart';
      notyf.error(`❌ ${errorMsg}`);
    }
  }

  function handleCheckoutChange(e) {
    setCheckout((c) => ({ ...c, [e.target.name]: e.target.value }));
  }

  async function handleCheckoutSubmit(e) {
    e.preventDefault();
    setCheckoutError('');
    setCheckoutLoading(true);
    const { ok, data } = await api('/orders/checkout', {
      method: 'POST',
      body: checkout,
    });
    setCheckoutLoading(false);
    if (ok) {
      setCheckoutSuccess(true);
      setShowCheckout(false);
      setCart(null);
      setCheckout(INITIAL_CHECKOUT);
      notyf.success('🎉 Order placed successfully!');
    } else {
      const errorMsg = data?.error?.message || data?.error || data?.message || 'Checkout failed. Please try again.';
      setCheckoutError(errorMsg);
      notyf.error(`❌ ${errorMsg}`);
    }
  }

  if (loading) return <Spinner />;

  if (checkoutSuccess) {
    return (
      <main className="page">
        <div className="container text-center">
          <div className="success-box card">
            <div className="success-icon">🌸</div>
            <h2>Order Placed!</h2>
            <p>Thank you for your order. We'll start preparing your bouquet soon!</p>
            <div className="d-flex gap-2 justify-between" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
              <Link to="/orders" className="btn btn-primary">View My Orders</Link>
              <Link to="/products" className="btn btn-outline">Keep Shopping</Link>
            </div>
          </div>
          <style>{`
            .success-box { max-width: 480px; margin: 2rem auto; padding: 3rem 2rem; }
            .success-icon { font-size: 4rem; margin-bottom: 1rem; }
            .success-box h2 { color: var(--primary-dark); margin-bottom: 0.75rem; }
            .success-box p { color: var(--text-muted); }
          `}</style>
        </div>
      </main>
    );
  }

  const items = cart?.cartItems || [];
  const totalPrice = cart?.totalPrice || 0;

  return (
    <main className="page">
      <div className="container">
        <h1 className="section-title">My Cart</h1>
        <p className="section-subtitle">{items.length} item(s)</p>

        <ErrorMessage message={error} />

        {items.length === 0 ? (
          <div className="empty-cart card text-center">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
            <h3>Your cart is empty</h3>
            <p className="text-muted mb-2">Add some beautiful flowers!</p>
            <Link to="/products" className="btn btn-primary">Browse Flowers</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map((item) => {
                const p = item.productId;
                const pid = p?._id || item.productId;
                const busy = updating[pid];
                return (
                  <div key={pid} className="cart-item card">
                    <img
                      src={p?.imageUrl || 'https://placehold.co/100x100/f8d7e3/d63384?text=🌸'}
                      alt={p?.name}
                      className="cart-item__img"
                    />
                    <div className="cart-item__info">
                      <h4>{p?.name}</h4>
                      <p className="cart-item__price">₱{Number(p?.price).toLocaleString()} each</p>
                    </div>
                    <div className="cart-item__controls">
                      <div className="qty-selector">
                        <button
                          className="qty-btn"
                          onClick={() => handleUpdateQty(pid, item.quantity - 1)}
                          disabled={!!busy || item.quantity <= 1}
                        >−</button>
                        <span className="qty-val">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => handleUpdateQty(pid, item.quantity + 1)}
                          disabled={!!busy}
                        >+</button>
                      </div>
                      <span className="cart-item__subtotal">₱{Number(item.subtotal).toLocaleString()}</span>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemove(pid)}
                        disabled={!!busy}
                      >
                        {busy === 'removing' ? '…' : 'Remove'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary card">
              <h3>Order Summary</h3>
              <div className="divider" />
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₱{Number(totalPrice).toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <span className="text-muted">Calculated at checkout</span>
              </div>
              <div className="divider" />
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>₱{Number(totalPrice).toLocaleString()}</span>
              </div>
              <button className="btn btn-primary w-100 btn-lg mt-2" onClick={() => setShowCheckout(true)}>
                Proceed to Checkout
              </button>
              <button className="btn btn-outline w-100 mt-1" onClick={handleClear}>
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowCheckout(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Delivery Details</h2>
              <button className="modal-close" onClick={() => setShowCheckout(false)}>×</button>
            </div>
            <ErrorMessage message={checkoutError} />
            <form onSubmit={handleCheckoutSubmit}>
              <div className="form-group">
                <label>Recipient Name</label>
                <input
                  name="recipientName"
                  className="form-control"
                  placeholder="Full name of recipient"
                  value={checkout.recipientName}
                  onChange={handleCheckoutChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Recipient Phone</label>
                <input
                  name="recipientPhone"
                  type="tel"
                  className="form-control"
                  placeholder="09XXXXXXXXX"
                  value={checkout.recipientPhone}
                  onChange={handleCheckoutChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Delivery Address</label>
                <textarea
                  name="deliveryAddress"
                  className="form-control"
                  placeholder="Full delivery address"
                  value={checkout.deliveryAddress}
                  onChange={handleCheckoutChange}
                  rows={3}
                  required
                />
              </div>
              <div className="form-group">
                <label>Delivery Date</label>
                <input
                  name="deliveryDate"
                  type="date"
                  className="form-control"
                  value={checkout.deliveryDate}
                  onChange={handleCheckoutChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>Custom Message (optional)</label>
                <textarea
                  name="customMessage"
                  className="form-control"
                  placeholder="Add a personal note with your flowers…"
                  value={checkout.customMessage}
                  onChange={handleCheckoutChange}
                  rows={2}
                />
              </div>
              <div className="d-flex gap-2 mt-2">
                <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={checkoutLoading}>
                  {checkoutLoading ? 'Placing Order…' : 'Place Order'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowCheckout(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .empty-cart { padding: 4rem 2rem; max-width: 400px; margin: 0 auto; }
        .cart-layout { display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem; align-items: start; }
        .cart-items { display: flex; flex-direction: column; gap: 1rem; }
        .cart-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; flex-wrap: wrap; }
        .cart-item__img { width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-sm); flex-shrink: 0; }
        .cart-item__info { flex: 1; min-width: 120px; }
        .cart-item__info h4 { font-size: 0.95rem; color: var(--text); }
        .cart-item__price { color: var(--text-muted); font-size: 0.85rem; margin-top: 0.2rem; }
        .cart-item__controls { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .cart-item__subtotal { font-weight: 600; color: var(--primary); min-width: 70px; text-align: right; }
        .qty-selector { display: flex; align-items: center; border: 1.5px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; }
        .qty-btn { background: var(--primary-light); border: none; width: 32px; height: 34px; font-size: 1rem; color: var(--primary-dark); cursor: pointer; }
        .qty-btn:hover:not(:disabled) { background: var(--border); }
        .qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .qty-val { width: 36px; text-align: center; font-weight: 600; font-size: 0.9rem; }
        .cart-summary { padding: 1.5rem; position: sticky; top: 80px; }
        .cart-summary h3 { font-size: 1.2rem; color: var(--primary-dark); margin-bottom: 0.5rem; }
        .summary-row { display: flex; justify-content: space-between; padding: 0.4rem 0; font-size: 0.9rem; }
        .summary-total { font-weight: 700; font-size: 1.05rem; color: var(--primary-dark); }
        @media (max-width: 768px) { .cart-layout { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}
