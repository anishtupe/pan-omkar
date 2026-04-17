import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function statusBadge(s) {
  const map = { Available: 'available', 'In Transit': 'in-transit', Maintenance: 'maintenance' };
  return <span className={`badge ${map[s] || 'pending'}`}>{s}</span>;
}

const emptyForm = { type: '', capacity: '', driver_name: '', status: 'Available', license_plate: '' };

const VEHICLE_TYPES = ['Truck', 'Mini Truck', 'Container', 'Tanker', 'Flatbed', 'Refrigerated'];

export default function Fleet() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    try {
      const r = await axios.get('/api/vehicles');
      setVehicles(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setError(''); setModal('add'); };
  const openEdit = (v) => {
    setForm({ type: v.type, capacity: v.capacity, driver_name: v.driver_name, status: v.status, license_plate: v.license_plate || '' });
    setEditId(v.id); setError(''); setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      if (modal === 'add') await axios.post('/api/vehicles', form);
      else await axios.put(`/api/vehicles/${editId}`, form);
      setModal(null); fetch();
    } catch (e) { setError(e.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try { await axios.delete(`/api/vehicles/${id}`); fetch(); } catch { alert('Delete failed'); }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'Available').length,
    inTransit: vehicles.filter(v => v.status === 'In Transit').length,
    maintenance: vehicles.filter(v => v.status === 'Maintenance').length,
  };

  return (
    <div>
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <div className="stat-card blue"><div className="stat-icon">🚛</div><div className="stat-label">Total Fleet</div><div className="stat-value">{stats.total}</div></div>
        <div className="stat-card green"><div className="stat-icon">✅</div><div className="stat-label">Available</div><div className="stat-value">{stats.available}</div></div>
        <div className="stat-card blue"><div className="stat-icon">🔄</div><div className="stat-label">In Transit</div><div className="stat-value">{stats.inTransit}</div></div>
        <div className="stat-card amber"><div className="stat-icon">🔧</div><div className="stat-label">Maintenance</div><div className="stat-value">{stats.maintenance}</div></div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div className="table-title">🚛 Fleet Vehicles</div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Vehicle</button>
        </div>
        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}><div className="loader" style={{ margin: '0 auto' }} /></div>
          ) : vehicles.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🚛</div><div className="empty-title">No vehicles</div></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>License Plate</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Shipments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v.id}>
                    <td style={{ color: 'var(--text3)', fontSize: 12 }}>#{v.id}</td>
                    <td className="primary" style={{ fontFamily: 'monospace' }}>{v.license_plate}</td>
                    <td>{v.type}</td>
                    <td>{v.capacity} t</td>
                    <td>{v.driver_name}</td>
                    <td>{statusBadge(v.status)}</td>
                    <td>{v.shipments?.length ?? '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(v)}>✏ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id)}>🗑</button>
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
            <div className="modal-title">{modal === 'add' ? '🚛 Add Vehicle' : '✏ Edit Vehicle'}</div>
            {error && <div className="login-error">{error}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div className="input-group">
                <label className="input-label">Vehicle Type *</label>
                <select className="input" value={form.type} onChange={f('type')}>
                  <option value="">Select type</option>
                  {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Capacity (tons) *</label>
                <input className="input" type="number" step="0.1" value={form.capacity} onChange={f('capacity')} placeholder="0.0" />
              </div>
              <div className="input-group">
                <label className="input-label">Driver Name *</label>
                <input className="input" value={form.driver_name} onChange={f('driver_name')} placeholder="Full name" />
              </div>
              <div className="input-group">
                <label className="input-label">License Plate</label>
                <input className="input" value={form.license_plate} onChange={f('license_plate')} placeholder="MH12AB1234" />
              </div>
              <div className="input-group" style={{ gridColumn: '1/-1' }}>
                <label className="input-label">Status</label>
                <select className="input" value={form.status} onChange={f('status')}>
                  <option>Available</option>
                  <option>In Transit</option>
                  <option>Maintenance</option>
                </select>
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
