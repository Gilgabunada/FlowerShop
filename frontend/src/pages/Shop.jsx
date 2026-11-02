import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotyf } from '../contexts/NotyContext';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

const PAGE_SIZE = 12;

export default function Shop() {
  const { user } = useAuth();
  const notyf = useNotyf();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [nameQuery, setNameQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchMode, setSearchMode] = useState(null); // null | 'name' | 'price'
  const [searchResults, setSearchResults] = useState(null);
  const [searchError, setSearchError] = useState('');

  const occasion = searchParams.get('occasion') || '';

  const fetchProducts = useCallback(async (pg = 1) => {
    setLoading(true);
    setError('');
    setSearchResults(null);
    setSearchMode(null);

    let endpoint = '/products/active';
    const params = { page: pg, limit: PAGE_SIZE };

    if (occasion) {
      endpoint = `/products/occasion/${encodeURIComponent(occasion)}`;
    }

    const { ok, data } = await api(endpoint, { params: occasion ? undefined : params });
    if (ok) {
      if (occasion && Array.isArray(data?.products)) {
        setProducts(data.products);
        setTotal(data.products.length);
      } else if (data?.products) {
        setProducts(data.products);
        setTotal(data.total || data.products.length);
      } else if (Array.isArray(data)) {
        setProducts(data);
        setTotal(data.length);
      } else {
        setProducts([]);
        setTotal(0);
      }
    } else {
      setError('Failed to load products.');
    }
    setLoading(false);
  }, [occasion]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [fetchProducts, occasion]);

  async function handleSearchByName(e) {
    e.preventDefault();
    if (!nameQuery.trim()) return;
    setLoading(true);
    setSearchError('');
    const { ok, data } = await api('/products/search-by-name', {
      method: 'POST',
      body: { name: nameQuery },
    });
    setLoading(false);
    if (ok && Array.isArray(data)) {
      setSearchResults(data);
      setSearchMode('name');
    } else if (ok && data?.message) {
      setSearchResults([]);
      setSearchMode('name');
    } else {
      setSearchError('Search failed. Please try again.');
    }
  }

  async function handleSearchByPrice(e) {
    e.preventDefault();
    if (!minPrice && !maxPrice) return;
    setLoading(true);
    setSearchError('');
    const { ok, data } = await api('/products/search-by-price', {
      method: 'POST',
      body: { minPrice: Number(minPrice) || 0, maxPrice: Number(maxPrice) || 999999 },
    });
    setLoading(false);
    if (ok && Array.isArray(data)) {
      setSearchResults(data);
      setSearchMode('price');
    } else {
      setSearchError('Search failed. Please try again.');
    }
  }

  function clearSearch() {
    setSearchResults(null);
    setSearchMode(null);
    setNameQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSearchError('');
  }

  function handlePageChange(pg) {
    setPage(pg);
    fetchProducts(pg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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

  const displayProducts = searchResults !== null ? searchResults : products;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="page">
      <div className="container">
        <div className="shop-header">
          <div>
            <h1 className="section-title">
              {occasion ? `${occasion} Flowers` : 'Our Collection'}
            </h1>
            <p className="section-subtitle">
              {searchMode ? `${displayProducts.length} result(s)` : `${total} products`}
              {occasion && ` · ${occasion}`}
            </p>
          </div>
          {occasion && (
            <button className="btn btn-outline btn-sm" onClick={() => setSearchParams({})}>
              ✕ Clear Filter
            </button>
          )}
        </div>

        {/* Search panel */}
        <div className="search-panel card">
          <div className="search-row">
            <form onSubmit={handleSearchByName} className="search-form">
              <input
                className="form-control"
                placeholder="Search by name…"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
            <span className="search-or">or</span>
            <form onSubmit={handleSearchByPrice} className="search-form">
              <input
                className="form-control"
                type="number"
                placeholder="Min ₱"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
              />
              <input
                className="form-control"
                type="number"
                placeholder="Max ₱"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
              />
              <button type="submit" className="btn btn-primary">Filter</button>
            </form>
            {searchMode && (
              <button className="btn btn-outline btn-sm" onClick={clearSearch}>✕ Reset</button>
            )}
          </div>
          {searchError && <ErrorMessage message={searchError} />}
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : displayProducts.length === 0 ? (
          <div className="text-center mt-3">
            <p className="text-muted">No products found.</p>
            {searchMode && (
              <button className="btn btn-outline mt-2" onClick={clearSearch}>Back to all products</button>
            )}
          </div>
        ) : (
          <>
            <div className="products-grid">
              {displayProducts.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  isLoggedIn={!!user}
                  onAddToCart={user ? handleAddToCart : null}
                />
              ))}
            </div>
            {!searchMode && totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    className={pg === page ? 'active' : ''}
                    onClick={() => handlePageChange(pg)}
                  >
                    {pg}
                  </button>
                ))}
                <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>›</button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .shop-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .search-panel { padding: 1.25rem; margin-bottom: 2rem; }
        .search-row { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; }
        .search-form { display: flex; gap: 0.5rem; flex-wrap: wrap; flex: 1; min-width: 220px; }
        .search-form .form-control { flex: 1; min-width: 100px; }
        .search-or { color: var(--text-muted); font-size: 0.9rem; white-space: nowrap; }
      `}</style>
    </main>
  );
}
