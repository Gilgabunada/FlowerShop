import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

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

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  async function fetchOrders(pg = 1) {
    setLoading(true);
    const { ok, data } = await api('/orders/my-orders', { params: { page: pg, limit: PAGE_SIZE } });
    setLoading(false);
    if (ok) {
      setOrders(data?.orders || []);
      setTotal(data?.total || 0);
    } else {
      setError('Failed to load orders.');
    }
  }

  useEffect(() => { fetchOrders(1); }, []);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="page">
      <div className="container">
        <h1 className="section-title">My Orders</h1>
        <p className="section-subtitle">{total} order(s) placed</p>

        <ErrorMessage message={error} />

        {loading ? (
          <Spinner />
        ) : orders.length === 0 ? (
          <div className="text-center card" style={{ padding: '3rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📦</div>
            <h3>No orders yet</h3>
            <p className="text-muted mb-2">Start shopping to place your first order.</p>
            <Link to="/products" className="btn btn-primary">Browse Flowers</Link>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Recipient</th>
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
                      <td>{new Date(order.createdOn || order.createdAt).toLocaleDateString()}</td>
                      <td>{order.recipientName}</td>
                      <td>{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '—'}</td>
                      <td>₱{Number(order.totalPrice).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${statusBadge(order.status)}`}>{order.status}</span>
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
                <button onClick={() => { setPage(p => p - 1); fetchOrders(page - 1); }} disabled={page === 1}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button key={pg} className={pg === page ? 'active' : ''} onClick={() => { setPage(pg); fetchOrders(pg); }}>
                    {pg}
                  </button>
                ))}
                <button onClick={() => { setPage(p => p + 1); fetchOrders(page + 1); }} disabled={page === totalPages}>›</button>
              </div>
            )}
          </>
        )}
      </div>
      <style>{`.order-id { font-family: monospace; font-weight: 600; color: var(--primary-dark); }`}</style>
    </main>
  );
}
