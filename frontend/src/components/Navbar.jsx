import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!user || user.isAdmin) return;
    api('/cart/get-cart').then(({ ok, data }) => {
      if (ok && data?.cart?.cartItems) {
        setCartCount(data.cart.cartItems.reduce((s, i) => s + i.quantity, 0));
      }
    });
  }, [user]);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand" onClick={() => setMenuOpen(false)}>
          🌸 Petal &amp; Bloom
        </Link>

        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>

        <nav ref={menuRef} className={`navbar__nav${menuOpen ? ' open' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>Shop</NavLink>

          {!user && (
            <>
              <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>Login</NavLink>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}

          {user && !user.isAdmin && (
            <>
              <Link to="/cart" className="navbar__cart" onClick={() => setMenuOpen(false)}>
                <span className="cart-icon">🛒</span>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
              <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>My Orders</NavLink>
              <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>Profile</NavLink>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          )}

          {user && user.isAdmin && (
            <>
              <NavLink to="/admin" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
              <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>Products</NavLink>
              <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>Orders</NavLink>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          )}
        </nav>
      </div>

      <style>{`
        .navbar {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          box-shadow: 0 1px 8px rgba(214,51,132,0.06);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .navbar__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
          gap: 1rem;
        }
        .navbar__brand {
          font-family: 'Playfair Display', serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--primary);
          white-space: nowrap;
        }
        .navbar__brand:hover { color: var(--primary-dark); }
        .navbar__nav {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .nav-link {
          color: var(--text);
          font-weight: 500;
          font-size: 0.92rem;
          padding: 0.3rem 0.1rem;
          border-bottom: 2px solid transparent;
          transition: color var(--transition), border-color var(--transition);
        }
        .nav-link:hover, .nav-link.active { color: var(--primary); border-bottom-color: var(--primary); }
        .navbar__cart {
          position: relative;
          font-size: 1.3rem;
          color: var(--text);
          line-height: 1;
        }
        .cart-icon { display: block; }
        .cart-badge {
          position: absolute;
          top: -6px;
          right: -8px;
          background: var(--primary);
          color: #fff;
          font-size: 0.65rem;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }
        .navbar__hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
        }
        .navbar__hamburger span {
          display: block;
          width: 24px;
          height: 2px;
          background: var(--text);
          border-radius: 2px;
          transition: background var(--transition);
        }
        @media (max-width: 768px) {
          .navbar__hamburger { display: flex; }
          .navbar__nav {
            display: none;
            position: absolute;
            top: 64px;
            left: 0;
            right: 0;
            background: var(--surface);
            border-bottom: 1px solid var(--border);
            flex-direction: column;
            padding: 1rem 1.25rem;
            gap: 0.75rem;
            box-shadow: 0 4px 12px rgba(61,26,42,0.1);
          }
          .navbar__nav.open { display: flex; }
          .nav-link { border-bottom: none; padding: 0.4rem 0; width: 100%; }
          .btn-sm { width: 100%; }
        }
      `}</style>
    </header>
  );
}
