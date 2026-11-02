import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';

const STATUS_LIST = ['Pending', 'Preparing Bouquet', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/orders/dashboard-stats').then(({ ok, data }) => {
      if (ok) setStats(data);
      else setError('Failed to load dashboard stats.');
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const statusCounts = {
  'Pending': stats?.ordersByStatus?.pending || 0,
  'Preparing Bouquet': stats?.ordersByStatus?.preparing || 0,
  'Out for Delivery': stats?.ordersByStatus?.outForDelivery || 0,
  'Delivered': stats?.ordersByStatus?.delivered || 0,
  'Cancelled': stats?.ordersByStatus?.cancelled || 0,
}

  return (
    <main className="page">
      <div className="container">
        <h1 className="section-title">Admin Dashboard</h1>
        <p className="section-subtitle">Overview of your flower shop</p>

        <ErrorMessage message={error} />

        {stats && (
          <>
            <div className="stats-grid">
              <StatCard
                value={`₱${Number(stats.totalRevenue || 0).toLocaleString()}`}
                label="Total Revenue"
                icon="💰"
              />
              <StatCard value={stats.totalOrders || 0} label="Total Orders" icon="📦" />
              <StatCard value={stats.inventory?.activeBouquets || 0} label="Products" icon="🌸" />
              <StatCard value={statusCounts['Pending']} label="Pending" icon="⏳" />
              <StatCard value={statusCounts['Delivered']} label="Delivered" icon="✅" />
              <StatCard value={statusCounts['Cancelled']} label="Cancelled" icon="❌" />
            </div>

            {stats && (
              <div className="card admin-section">
                <h3>Orders by Status</h3>
                <div className="divider" />
                <div className="status-bars">
                  {STATUS_LIST.map((s) => {
                    const count = statusCounts[s] || 0;
                    const total = stats.totalOrders || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={s} className="status-bar-row">
                        <span className="status-bar-label">{s}</span>
                        <div className="status-bar-track">
                          <div className="status-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="status-bar-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="admin-quick-links">
              <Link to="/admin/products" className="btn btn-primary btn-lg">Manage Products</Link>
              <Link to="/admin/orders" className="btn btn-outline btn-lg">Manage Orders</Link>
            </div>
          </>
        )}
      </div>

      <style>{`
        .admin-section { padding: 1.5rem; margin-bottom: 1.5rem; }
        .admin-section h3 { color: var(--primary-dark); font-size: 1.1rem; }
        .status-bars { display: flex; flex-direction: column; gap: 0.75rem; }
        .status-bar-row { display: grid; grid-template-columns: 160px 1fr 40px; align-items: center; gap: 0.75rem; font-size: 0.88rem; }
        .status-bar-label { color: var(--text-muted); }
        .status-bar-track { background: var(--primary-light); border-radius: 4px; height: 8px; overflow: hidden; }
        .status-bar-fill { background: var(--primary); height: 100%; border-radius: 4px; transition: width 0.5s ease; min-width: 4px; }
        .status-bar-count { font-weight: 600; text-align: right; }
        .admin-quick-links { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1.5rem; }
      `}</style>
    </main>
  );
}

function StatCard({ value, label, icon }) {
  return (
    <div className="stat-card">
      <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
