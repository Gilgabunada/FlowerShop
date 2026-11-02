import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__logo">🌸 Petal &amp; Bloom</span>
          <p>Fresh flowers, heartfelt moments.</p>
        </div>
        <div className="footer__links">
          <h4>Shop</h4>
          <Link to="/products">All Flowers</Link>
          <Link to="/products?occasion=Birthday">Birthday</Link>
          <Link to="/products?occasion=Anniversary">Anniversary</Link>
          <Link to="/products?occasion=Wedding">Wedding</Link>
        </div>
        <div className="footer__links">
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/profile">Profile</Link>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container">
          © {new Date().getFullYear()} Petal &amp; Bloom. All rights reserved.
        </div>
      </div>
      <style>{`
        .footer {
          background: var(--text);
          color: #e8c8d4;
          margin-top: auto;
        }
        .footer__inner {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 2rem;
          padding: 3rem 1.25rem 2rem;
        }
        .footer__logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          color: #fff;
          display: block;
          margin-bottom: 0.5rem;
        }
        .footer__brand p { font-size: 0.9rem; opacity: 0.7; }
        .footer__links { display: flex; flex-direction: column; gap: 0.5rem; }
        .footer__links h4 { color: #fff; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.25rem; }
        .footer__links a { color: #e8c8d4; font-size: 0.88rem; opacity: 0.8; }
        .footer__links a:hover { color: var(--accent); opacity: 1; }
        .footer__bottom {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 1rem 1.25rem;
          font-size: 0.82rem;
          opacity: 0.6;
        }
        @media (max-width: 600px) {
          .footer__inner { grid-template-columns: 1fr; gap: 1.5rem; }
        }
      `}</style>
    </footer>
  );
}
