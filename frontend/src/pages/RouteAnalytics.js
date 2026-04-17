import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const emptyForm = { origin: '', destination: '', distance: '', avg_time: '' };

export default function RouteAnalytics() {
  const [routes, setRoutes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [rr, ra] = await Promise.all([axios.get('/api/routes'), axios.get('/api/analytics')]);
      setRoutes(rr.data);
      setAnalytics(ra.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setError(''); setModal('add'); };
  const openEdit = (r) => {
    setForm({ origin: r.origin, destination: r.destination, distance: r.distance, avg_time: r.avg_time });
    setEditId(r.id); setError(''); setModal('edit');
  };
  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      if (modal === 'add') await axios.post('/api/routes', form);
      else await axios.put(`/api/routes/${editId}`, form);
      setModal(null); fetchAll();
    } catch (e) { setError(e.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete route?')) return;
    try { await axios.delete(`/api/routes/${id}`); fetchAll(); } catch { alert('Delete failed'); }
  };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  // Build delay analysis from analytics top routes
  const delayedRoutes = analytics?.top_routes || [];

  if (loading) return <div className="loading-screen"><div className="loader" /></div>;

  return (
    <div>
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="stat-card blue">
          <div className="stat-icon">🗺</div>
          <div className="stat-label">Total Routes</div>
          <div className="stat-value">{routes.length}</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">📏</div>
          <div className="stat-label">Avg Distance</div>
          <div className="stat-value">
            {routes.length ? Math.round(routes.reduce((a, r) => a + r.distance, 0) / routes.length) : 0} km
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">⏱</div>
          <div className="stat-label">Avg Transit Time</div>
          <div className="stat-value">
            {routes.length ? (routes.reduce((a, r) => a + r.avg_time, 0) / routes.length).toFixed(1) : 0} hrs
          </div>
        </div>
      </div>

      {delayedRoutes.length > 0 && (
        <div className="table-card" style={{ marginBottom: 20 }}>
          <div className="table-header">
            <div className="table-title">🏆 Busiest Routes</div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Route</th><th>Total Shipments</th><th>Volume</th></tr></thead>
              <tbody>
                {delayedRoutes.map((r, i) => (
                  <tr key={r.route}>
                    <td style={{ color: 'var(--text3)' }}>{i + 1}</td>
                    <td className="primary">{r.route}</td>
                    <td>{r.count}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: 4, height: 6, maxWidth: 160 }}>
                          <div style={{ width: `${Math.min(100, (r.count / (delayedRoutes[0]?.count || 1)) * 100)}%`, background: 'var(--accent)', height: '100%', borderRadius: 4 }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="table-card">
        <div className="table-header">
          <div className="table-title">🗺 All Routes</div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Route</button>
        </div>
        <div className="table-wrap">
          {routes.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🗺</div><div className="empty-title">No routes found</div></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Distance</th>
                  <th>Avg Time</th>
                  <th>Speed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map(r => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--text3)', fontSize: 12 }}>#{r.id}</td>
                    <td className="primary">{r.origin}</td>
                    <td className="primary">{r.destination}</td>
                    <td>{r.distance.toFixed(0)} km</td>
                    <td>{r.avg_time.toFixed(1)} hrs</td>
                    <td style={{ color: 'var(--text3)', fontSize: 12 }}>
                      {(r.distance / r.avg_time).toFixed(0)} km/h
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)}>✏ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{modal === 'add' ? '🗺 Add Route' : '✏ Edit Route'}</div>
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
                <label className="input-label">Distance (km) *</label>
                <input className="input" type="number" value={form.distance} onChange={f('distance')} placeholder="0" />
              </div>
              <div className="input-group">
                <label className="input-label">Avg Time (hrs) *</label>
                <input className="input" type="number" step="0.1" value={form.avg_time} onChange={f('avg_time')} placeholder="0.0" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '⏳ Saving…' : '✓ Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
