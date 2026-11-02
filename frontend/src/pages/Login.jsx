import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { ok, data } = await api('/users/login', {
      method: 'POST',
      body: { email: form.email, password: form.password },
    });
    setLoading(false);
    if (ok && data?.access) {
      await login(data.access);
      navigate('/');
    } else {
      setError(data?.error?.message || data?.error || data?.message || 'Invalid email or password.');
    }
  }

  return (
    <main className="page auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-logo">🌸</div>
          <h1>Welcome Back</h1>
          <p>Sign in to your Petal &amp; Bloom account</p>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>

      <style>{`
        .auth-page { display: flex; justify-content: center; align-items: flex-start; padding-top: 3rem; }
        .auth-card { width: 100%; max-width: 420px; padding: 2.5rem; }
        .auth-header { text-align: center; margin-bottom: 2rem; }
        .auth-logo { font-size: 3rem; margin-bottom: 0.5rem; }
        .auth-header h1 { font-size: 1.75rem; color: var(--primary-dark); }
        .auth-header p { color: var(--text-muted); font-size: 0.95rem; margin-top: 0.35rem; }
        .auth-footer { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-muted); }
        .auth-footer a { color: var(--primary); font-weight: 500; }
      `}</style>
    </main>
  );
}
