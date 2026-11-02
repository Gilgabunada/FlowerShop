import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNo: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const { ok, data } = await api('/users/register', {
      method: 'POST',
      body: {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        mobileNo: form.mobileNo,
      },
    });

    if (!ok) {
      setLoading(false);
      const errorMsg = data?.error?.message || data?.error || data?.message || 'Registration failed.';
      setError(errorMsg);
      return;
    }

    // Auto-login after registration
    const loginRes = await api('/users/login', {
      method: 'POST',
      body: { email: form.email, password: form.password },
    });
    setLoading(false);
    if (loginRes.ok && loginRes.data?.access) {
      await login(loginRes.data.access);
      navigate('/');
    } else {
      navigate('/login');
    }
  }

  return (
    <main className="page auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-logo">🌷</div>
          <h1>Create Account</h1>
          <p>Join Petal &amp; Bloom today</p>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                className="form-control"
                placeholder="Jane"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                className="form-control"
                placeholder="Doe"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
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
            <label htmlFor="mobileNo">Mobile Number</label>
            <input
              id="mobileNo"
              name="mobileNo"
              type="tel"
              className="form-control"
              placeholder="09XXXXXXXXX"
              value={form.mobileNo}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="form-control"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>

      <style>{`
        .auth-page { display: flex; justify-content: center; align-items: flex-start; padding-top: 2rem; }
        .auth-card { width: 100%; max-width: 480px; padding: 2.5rem; }
        .auth-header { text-align: center; margin-bottom: 1.75rem; }
        .auth-logo { font-size: 3rem; margin-bottom: 0.5rem; }
        .auth-header h1 { font-size: 1.75rem; color: var(--primary-dark); }
        .auth-header p { color: var(--text-muted); font-size: 0.95rem; margin-top: 0.35rem; }
        .auth-footer { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-muted); }
        .auth-footer a { color: var(--primary); font-weight: 500; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}
