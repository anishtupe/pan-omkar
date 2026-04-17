import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function statusBadge(s) {
  const map = { Delivered: 'delivered', 'In Transit': 'in-transit', Delayed: 'delayed', Pending: 'pending' };
  return <span className={`badge ${map[s] || 'pending'}`}>{s}</span>;
}

const emptyForm = {
  origin: '', destination: '', weight: '', vehicle_id: '',
  driver_name: '', status: 'Pending',
  expected_delivery_date: '', actual_delivery_date: ''
};

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchShipments = useCallback(async () => {
    try {
      const params = { page, per_page: 15 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const r = await axios.get('/api/shipments', { params });
      setShipments(r.data.shipments);
      setTotal(r.data.total);
      setPages(r.data.pages);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchShipments(); }, [fetchShipments]);

  useEffect(() => {
    axios.get('/api/vehicles').then(r => setVehicles(r.data)).catch(() => {});
  }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setError(''); setModal('add'); };
  const openEdit = (s) => {
    setForm({
      origin: s.origin, destination: s.destination, weight: s.weight,
      vehicle_id: s.vehicle_id || '', driver_name: s.driver_name || '',
      status: s.status,
      expected_delivery_date: s.expected_delivery_date ? s.expected_delivery_date.slice(0,10) : '',
      actual_delivery_date: s.actual_delivery_date ? s.actual_delivery_date.slice(0,10) : ''
    });
    setEditId(s.id); setError(''); setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const payload = { ...form };
      if (payload.actual_delivery_date === '') payload.actual_delivery_date = null;
      if (modal === 'add') {
        await axios.post('/api/shipments', payload);
      } else {
        await axios.put(`/api/shipments/${editId}`, payload);
      }
      setModal(null);
      fetchShipments();
    } catch (e) {
      setError(e.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shipment?')) return;
    try {
      await axios.delete(`/api/shipments/${id}`);
      fetchShipments();
    } catch (e) { alert('Delete failed'); }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <div className="table-card">
        <div className="table-header">
          <div className="table-title">📦 All Shipments <span style={{ color: 'var(--text3)', fontSize: 13, fontWeight: 400 }}>({total})</span></div>
          <div className="table-actions">
            <div className="search-input" style={{ position: 'relative' }}>
              <span className="search-icon">🔍</span>
              <input className="input" placeholder="Search…" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ width: 180, paddingLeft: 32 }} />
            </div>
            <select className="input" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ width: 130 }}>
              <option value="">All Statuses</option>
              <option>Pending</option>
              <option>In Transit</option>
              <option>Delivered</option>
              <option>Delayed</option>
            </select>
            <button className="btn btn-primary" onClick={openAdd}>+ Add Shipment</button>
          </div>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}><div className="loader" style={{ margin: '0 auto' }} /></div>
          ) : shipments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <div className="empty-title">No shipments found</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Driver</th>
                  <th>Weight</th>
                  <th>Status</th>
                  <th>Expected Delivery</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map(s => (
                  <tr key={s.id}>
                    <td className="primary" style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.tracking_id}</td>
                    <td>{s.origin}</td>
                    <td>{s.destination}</td>
                    <td>{s.driver_name || '—'}</td>
                    <td>{s.weight} t</td>
                    <td>{statusBadge(s.status)}</td>
                    <td style={{ fontSize: 12 }}>{s.expected_delivery_date ? new Date(s.expected_delivery_date).toLocaleDateString() : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>✏ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pages > 1 && (
          <div className="pagination">
            <div className="page-info">Showing page {page} of {pages} ({total} total)</div>
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <button className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              {modal === 'add' ? '📦 New Shipment' : '✏ Edit Shipment'}
            </div>
            {error && <div className="login-error">{error}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div className="input-group">
                <label className="input-label">Origin *</label>
                <input className="input" value={form.origin} onChange={f('origin')} placeholder="City" />
              </div>
              <div className="input-group">
                <label className="input-label">Destination *</label>
                <input className="input" value={form.destination} onChange={f('destination')} placeholder="City" />
              </div>
              <div className="input-group">
                <label className="input-label">Weight (tons) *</label>
                <input className="input" type="number" step="0.1" value={form.weight} onChange={f('weight')} placeholder="0.0" />
              </div>
              <div className="input-group">
                <label className="input-label">Vehicle</label>
                <select className="input" value={form.vehicle_id} onChange={f('vehicle_id')}>
                  <option value="">Select Vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.license_plate} – {v.type} ({v.driver_name})</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Driver Name</label>
                <input className="input" value={form.driver_name} onChange={f('driver_name')} placeholder="Driver name" />
              </div>
              <div className="input-group">
                <label className="input-label">Status</label>
                <select className="input" value={form.status} onChange={f('status')}>
                  <option>Pending</option>
                  <option>In Transit</option>
                  <option>Delivered</option>
                  <option>Delayed</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Expected Delivery *</label>
                <input className="input" type="date" value={form.expected_delivery_date} onChange={f('expected_delivery_date')} />
              </div>
              <div className="input-group">
                <label className="input-label">Actual Delivery</label>
                <input className="input" type="date" value={form.actual_delivery_date} onChange={f('actual_delivery_date')} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '⏳ Saving…' : '✓ Save Shipment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
