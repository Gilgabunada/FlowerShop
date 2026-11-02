import { Link } from 'react-router-dom';
import { api } from '../lib/api';

function stockLabel(stock) {
  if (stock === 'unlimited') return { label: 'In Stock', cls: 'badge-success' };
  if (stock === 0) return { label: 'Out of Stock', cls: 'badge-danger' };
  if (stock <= 5) return { label: `${stock} left`, cls: 'badge-warning' };
  return { label: 'In Stock', cls: 'badge-success' };
}

export default function ProductCard({ product, onAddToCart, isLoggedIn }) {
  const { _id, name, price, imageUrl, occasion, stock } = product;
  const { label, cls } = stockLabel(stock);
  const outOfStock = stock !== 'unlimited' && stock === 0;

  async function handleAdd() {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      await api('/cart/add-to-cart', { method: 'POST', body: { productId: _id, quantity: 1 } });
    }
  }

  return (
    <div className="product-card card">
      <Link to={`/products/${_id}`} className="product-card__img-wrap">
        <img
          src={imageUrl || 'https://placehold.co/400x300/f8d7e3/d63384?text=🌸'}
          alt={name}
          className="product-card__img"
        />
      </Link>
      <div className="product-card__body">
        {occasion && (
          <span className="badge badge-primary product-card__occasion">{occasion}</span>
        )}
        <h3 className="product-card__name">
          <Link to={`/products/${_id}`}>{name}</Link>
        </h3>
        <div className="product-card__footer">
          <span className="product-card__price">₱{Number(price).toLocaleString()}</span>
          <span className={`badge ${cls}`}>{label}</span>
        </div>
        {isLoggedIn ? (
          <button
            className="btn btn-primary w-100 mt-2"
            onClick={handleAdd}
            disabled={outOfStock}
          >
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        ) : (
          <Link to="/login" className="btn btn-outline w-100 mt-2">
            Login to Buy
          </Link>
        )}
      </div>
      <style>{`
        .product-card { display: flex; flex-direction: column; transition: box-shadow var(--transition), transform var(--transition); }
        .product-card:hover { box-shadow: var(--shadow-hover); transform: translateY(-3px); }
        .product-card__img-wrap { display: block; overflow: hidden; height: 200px; }
        .product-card__img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s ease; }
        .product-card:hover .product-card__img { transform: scale(1.04); }
        .product-card__body { padding: 1rem; display: flex; flex-direction: column; gap: 0.4rem; flex: 1; }
        .product-card__occasion { align-self: flex-start; }
        .product-card__name { font-size: 1rem; margin: 0; }
        .product-card__name a { color: var(--text); }
        .product-card__name a:hover { color: var(--primary); }
        .product-card__footer { display: flex; justify-content: space-between; align-items: center; }
        .product-card__price { font-weight: 600; color: var(--primary); font-size: 1.05rem; }
      `}</style>
    </div>
  );
}
