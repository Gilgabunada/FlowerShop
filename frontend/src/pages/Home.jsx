import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotyf } from '../contexts/NotyContext';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

const OCCASIONS = ['Birthday', 'Anniversary', 'Wedding', 'Sympathy', 'Graduation', 'Thank You', 'Just Because'];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const notyf = useNotyf();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/products/featured').then(({ ok, data }) => {
      if (ok && data?.products) setFeatured(data.products);
    }).finally(() => setLoading(false));
  }, []);

  async function handleAddToCart(product) {
    const { ok, data } = await api('/cart/add-to-cart', {
      method: 'POST',
      body: { productId: product._id, quantity: 1 },
    });
    if (ok) {
      notyf.success(`✨ "${product.name}" added to cart!`);
    } else {
      const errorMsg = data?.error?.message || data?.error || 'Failed to add to cart';
      notyf.error(`❌ ${errorMsg}`);
    }
  }

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="hero__content">
          <h1 className="hero__title">Fresh Flowers,<br />Heartfelt Moments</h1>
          <p className="hero__sub">
            Handcrafted bouquets delivered to your doorstep — for every occasion that matters.
          </p>
          <div className="hero__actions">
            <Link to="/products" className="btn btn-primary btn-lg">Shop Now</Link>
            {!user && (
              <Link to="/register" className="btn btn-outline btn-lg">Join Us</Link>
            )}
          </div>
        </div>
        <div className="hero__emoji" aria-hidden="true">🌸🌺🌹🌷</div>
      </section>

      {/* Occasions */}
      <section className="occasions-section">
        <div className="container">
          <h2 className="section-title text-center">Shop by Occasion</h2>
          <p className="section-subtitle text-center">Find the perfect flowers for every moment</p>
          <div className="occasions-grid">
            {OCCASIONS.map((occ) => (
              <Link
                key={occ}
                to={`/products?occasion=${encodeURIComponent(occ)}`}
                className="occasion-chip"
              >
                {occ}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="container page-section">
        <h2 className="section-title">Featured Flowers</h2>
        <p className="section-subtitle">Our best picks, curated just for you</p>
        {loading ? (
          <Spinner />
        ) : featured.length === 0 ? (
          <p className="text-muted">No featured products yet.</p>
        ) : (
          <div className="products-grid">
            {featured.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                isLoggedIn={!!user}
                onAddToCart={user ? handleAddToCart : null}
              />
            ))}
          </div>
        )}
        <div className="text-center mt-3">
          <Link to="/products" className="btn btn-outline btn-lg">View All Products</Link>
        </div>
      </section>

      <style>{`
        .hero {
          background: linear-gradient(135deg, #fff0f6 0%, #fce4ec 50%, #f8d7e3 100%);
          padding: 5rem 1.25rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .hero__content { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }
        .hero__title {
          font-size: clamp(2rem, 6vw, 3.5rem);
          color: var(--primary-dark);
          margin-bottom: 1rem;
          line-height: 1.2;
        }
        .hero__sub {
          font-size: 1.1rem;
          color: var(--text-muted);
          margin-bottom: 2rem;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
        }
        .hero__actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .hero__emoji {
          font-size: 5rem;
          margin-top: 2rem;
          letter-spacing: 0.5rem;
          animation: float 4s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .occasions-section {
          background: var(--surface);
          padding: 3.5rem 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .occasions-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
        }
        .occasion-chip {
          display: inline-block;
          padding: 0.5rem 1.25rem;
          border-radius: 999px;
          background: var(--primary-light);
          color: var(--primary-dark);
          font-weight: 500;
          font-size: 0.9rem;
          transition: background var(--transition), color var(--transition), transform var(--transition);
        }
        .occasion-chip:hover {
          background: var(--primary);
          color: #fff;
          transform: translateY(-2px);
        }
        .page-section { padding: 3.5rem 0; }
      `}</style>
    </main>
  );
}
