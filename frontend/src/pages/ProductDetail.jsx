import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotyf } from '../contexts/NotyContext';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

function stockLabel(stock) {
  if (stock === 'unlimited') return { label: 'In Stock', cls: 'badge-success' };
  if (stock === 0) return { label: 'Out of Stock', cls: 'badge-danger' };
  if (stock <= 5) return { label: `${stock} left`, cls: 'badge-warning' };
  return { label: 'In Stock', cls: 'badge-success' };
}

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const notyf = useNotyf();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api(`/products/${id}`).then(({ ok, data }) => {
      if (ok && data) setProduct(data);
      else setError('Product not found.');
    }).finally(() => setLoading(false));
  }, [id]);

  async function handleAddToCart() {
    if (!user) { navigate('/login'); return; }
    setAdding(true);
    const { ok, data } = await api('/cart/add-to-cart', {
      method: 'POST',
      body: { productId: id, quantity: qty },
    });
    setAdding(false);
    if (ok) {
      notyf.success(`✨ Added ${qty}× "${product.name}" to cart!`);
    } else {
      const errorMsg = data?.error?.message || data?.error || 'Failed to add to cart';
      notyf.error(`❌ ${errorMsg}`);
    }
  }

  if (loading) return <Spinner />;
  if (error) return (
    <main className="page">
      <div className="container">
        <ErrorMessage message={error} />
        <Link to="/products" className="btn btn-outline mt-2">Back to Shop</Link>
      </div>
    </main>
  );

  const { name, description, price, imageUrl, occasion, stock, isActive } = product;
  const { label, cls } = stockLabel(stock);
  const outOfStock = stock !== 'unlimited' && stock === 0;
  const maxQty = stock === 'unlimited' ? 99 : stock;

  return (
    <main className="page">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/products">Shop</Link> / <span>{name}</span>
        </nav>

        <div className="product-detail">
          <div className="product-detail__image card">
            <img
              src={imageUrl || 'https://placehold.co/600x500/f8d7e3/d63384?text=🌸'}
              alt={name}
            />
          </div>
          <div className="product-detail__info">
            {occasion && <span className="badge badge-primary">{occasion}</span>}
            {!isActive && <span className="badge badge-muted ml-1">Unavailable</span>}
            <h1 className="product-detail__name">{name}</h1>
            <p className="product-detail__price">₱{Number(price).toLocaleString()}</p>
            <span className={`badge ${cls}`}>{label}</span>

            {description && (
              <div className="product-detail__desc">
                <h3>Description</h3>
                <p>{description}</p>
              </div>
            )}

            {user ? (
              <div className="product-detail__actions">
                <div className="qty-selector">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="qty-btn"
                  >−</button>
                  <span className="qty-val">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    disabled={outOfStock || qty >= maxQty}
                    className="qty-btn"
                  >+</button>
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleAddToCart}
                  disabled={outOfStock || adding}
                >
                  {adding ? 'Adding…' : outOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-muted mb-1">Please log in to add items to your cart.</p>
                <Link to="/login" className="btn btn-primary btn-lg">Login to Buy</Link>
              </div>
            )}

            <Link to="/products" className="back-link">← Back to Shop</Link>
          </div>
        </div>
      </div>

      <style>{`
        .breadcrumb { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem; }
        .breadcrumb a { color: var(--text-muted); }
        .breadcrumb a:hover { color: var(--primary); }
        .breadcrumb span { color: var(--text); }
        .product-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; align-items: start; }
        .product-detail__image img { width: 100%; height: 460px; object-fit: cover; }
        .product-detail__info { display: flex; flex-direction: column; gap: 0.85rem; }
        .product-detail__name { font-size: 2rem; color: var(--primary-dark); margin: 0; }
        .product-detail__price { font-size: 1.75rem; font-weight: 700; color: var(--primary); font-family: 'Playfair Display', serif; }
        .product-detail__desc h3 { font-size: 1rem; color: var(--text-muted); margin-bottom: 0.35rem; }
        .product-detail__desc p { color: var(--text); line-height: 1.7; }
        .product-detail__actions { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
        .qty-selector { display: flex; align-items: center; gap: 0; border: 1.5px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; }
        .qty-btn { background: var(--primary-light); border: none; width: 36px; height: 40px; font-size: 1.2rem; color: var(--primary-dark); cursor: pointer; }
        .qty-btn:hover:not(:disabled) { background: var(--border); }
        .qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .qty-val { width: 44px; text-align: center; font-weight: 600; }
        .back-link { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem; }
        .back-link:hover { color: var(--primary); }
        @media (max-width: 768px) {
          .product-detail { grid-template-columns: 1fr; }
          .product-detail__image img { height: 280px; }
        }
      `}</style>
    </main>
  );
}
