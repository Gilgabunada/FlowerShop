import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';

const STATUS_LIST = ['Pending', 'Preparing Bouquet', 'Out for Delivery', 'Delivered', 'Cancelled'];

function statusBadge(status) {
  const map = {
    'Pending': 'badge-warning',
    'Preparing Bouquet': 'badge-primary',
    'Out for Delivery': 'badge-primary',
    'Delivered': 'badge-success',
    'Cancelled': 'badge-danger',
  };
  return map[status] || 'badge-muted';
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchOrders(1);
  }, [statusFilter]);

  async function fetchOrders(pg = 1) {
    setLoading(true);
    const params = { page: pg, limit: PAGE_SIZE };
    if (statusFilter) params.status = statusFilter;

    const { ok, data } = await api('/orders/all-orders', { params });
    setLoading(false);
    if (ok) {
      setOrders(data?.orders || []);
      setTotal(data?.total || 0);
    } else {
      setError('Failed to load orders.');
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    setUpdatingId(orderId);
    const { ok, data } = await api(`/orders/${orderId}/update-status`, {
      method: 'PATCH',
      body: { status: newStatus },
    });
    setUpdatingId(null);
    if (ok) {
      await fetchOrders(page);
    } else {
      setError(data?.error?.message || data?.error || data?.message || 'Failed to update order.');
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (loading) return <Spinner />;

  return (
    <main className="page">
      <div className="container">
        <h1 className="section-title">Orders Management</h1>
        <p className="section-subtitle">{total} order(s) total</p>

        <ErrorMessage message={error} />

        {/* Filter */}
        <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
          <label style={{ marginRight: '1rem' }}>Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="form-control"
            style={{ maxWidth: 200, display: 'inline-block', verticalAlign: 'middle' }}
          >
            <option value="">All Orders</option>
            {STATUS_LIST.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {orders.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <p className="text-muted">No orders found.</p>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Delivery Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="order-id">#{order._id.slice(-6).toUpperCase()}</td>
                      <td>{order.recipientName}</td>
                      <td>{new Date(order.orderedOn).toLocaleDateString()}</td>
                      <td>{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '—'}</td>
                      <td>₱{Number(order.totalPrice).toLocaleString()}</td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updatingId === order._id}
                          className="form-control"
                          style={{ maxWidth: 160 }}
                        >
                          {STATUS_LIST.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => { setPage(p => p - 1); fetchOrders(page - 1); }}
                  disabled={page === 1}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    className={pg === page ? 'active' : ''}
                    onClick={() => { setPage(pg); fetchOrders(pg); }}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  onClick={() => { setPage(p => p + 1); fetchOrders(page + 1); }}
                  disabled={page === totalPages}
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .order-id { font-family: monospace; font-weight: 600; color: var(--primary-dark); }
      `}</style>
    </main>
  );
}
