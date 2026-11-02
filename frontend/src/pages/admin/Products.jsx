import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';

const OCCASIONS = ['Birthday', 'Anniversary', 'Wedding', 'Sympathy', 'Graduation', 'Thank You', 'Just Because'];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    occasion: '',
    stock: '',
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { ok, data } = await api('/products/all');
    setLoading(false);
    if (ok && Array.isArray(data)) {
      setProducts(data);
    } else if (ok && data?.products) {
      setProducts(data.products);
    } else {
      setError('Failed to load products.');
    }
  }

  function openForm(product = null) {
    if (product) {
      setEditingId(product._id);
      setForm({
        name: product.name,
        description: product.description || '',
        price: product.price,
        imageUrl: product.imageUrl || '',
        occasion: product.occasion || '',
        stock: product.stock === 'unlimited' ? 'unlimited' : product.stock,
        isActive: product.isActive,
        isFeatured: product.isFeatured || false,
      });
    } else {
      setEditingId(null);
      setForm({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        occasion: '',
        stock: '',
        isActive: true,
        isFeatured: false,
      });
    }
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    const body = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      imageUrl: form.imageUrl,
      occasion: form.occasion,
      stock: form.stock === 'unlimited' ? 'unlimited' : Number(form.stock),
      isActive: form.isActive,
      isFeatured: form.isFeatured,
    };

    const endpoint = editingId ? `/products/${editingId}/update` : '/products';
    const method = editingId ? 'PATCH' : 'POST';

    const { ok, data } = await api(endpoint, { method, body });
    setFormLoading(false);

    if (ok) {
      closeForm();
      await fetchProducts();
    } else {
      // AFTER
      setFormError(data?.error?.message || data?.error || data?.message || 'Failed to save product.');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return;
    const { ok } = await api(`/products/${id}`, { method: 'DELETE' });
    if (ok) {
      await fetchProducts();
    } else {
      setError('Failed to delete product.');
    }
  }

  async function toggleActive(product) {
    const action = product.isActive ? 'archive' : 'activate';
    const { ok } = await api(`/products/${product._id}/${action}`, { method: 'PATCH' });
    if (ok) await fetchProducts();
  }

  async function toggleFeatured(product) {
    const { ok } = await api(`/products/${product._id}/update`, {
      method: 'PATCH',
      body: { isFeatured: !product.isFeatured },
    });
    if (ok) await fetchProducts();
  }

  if (loading) return <Spinner />;

  return (
    <main className="page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1 className="section-title">Products</h1>
            <p className="section-subtitle">{products.length} product(s)</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => openForm()}>
            + New Product
          </button>
        </div>

        <ErrorMessage message={error} />

        {products.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <p className="text-muted">No products yet. Create your first one!</p>
            <button className="btn btn-primary mt-2" onClick={() => openForm()}>+ New Product</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Occasion</th>
                  <th>Stock</th>
                  <th>Active</th>
                  <th>Featured</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>₱{Number(p.price).toLocaleString()}</td>
                    <td>{p.occasion || '—'}</td>
                    <td>{p.stock === 'unlimited' ? '∞' : p.stock}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${p.isActive ? 'btn-success' : 'btn-outline'}`}
                        onClick={() => toggleActive(p)}
                      >
                        {p.isActive ? '✓' : '✗'}
                      </button>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${p.isFeatured ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => toggleFeatured(p)}
                      >
                        {p.isFeatured ? '★' : '☆'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openForm(p)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && closeForm()}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Product' : 'New Product'}</h2>
              <button className="modal-close" onClick={closeForm}>×</button>
            </div>
            <ErrorMessage message={formError} />
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Price (₱) *</label>
                  <input
                    className="form-control"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <select
                    className="form-control"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  >
                    <option value="">Select stock type</option>
                    <option value="unlimited">Unlimited</option>
                    {[5, 10, 20, 50, 100].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Occasion</label>
                <select
                  className="form-control"
                  value={form.occasion}
                  onChange={(e) => setForm((f) => ({ ...f, occasion: e.target.value }))}
                >
                  <option value="">No occasion</option>
                  {OCCASIONS.map((occ) => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  className="form-control"
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  Active
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                  />
                  Featured
                </label>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={formLoading}>
                  {formLoading ? 'Saving…' : 'Save Product'}
                </button>
                <button type="button" className="btn btn-outline" onClick={closeForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
      `}</style>
    </main>
  );
}
