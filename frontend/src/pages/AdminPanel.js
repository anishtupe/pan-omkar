import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name: '', email: '', password: '', role: 'manager' };

export default function AdminPanel() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('users');

  const fetchUsers = useCallback(async () => {
    try {
      const r = await axios.get('/api/admin/users');
      setUsers(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setError(''); setModal('add'); };
  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setEditId(u.id); setError(''); setModal('edit');
  };
  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const payload = { ...form };
      if (modal === 'edit' && !payload.password) delete payload.password;
      if (modal === 'add') await axios.post('/api/admin/users', payload);
      else await axios.put(`/api/admin/users/${editId}`, payload);
      setModal(null); fetchUsers();
    } catch (e) { setError(e.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };
  const handleDelete = async (id) => {
    if (id === me.id) { alert("You can't delete yourself!"); return; }
    if (!window.confirm('Delete this user?')) return;
    try { await axios.delete(`/api/admin/users/${id}`); fetchUsers(); } catch { alert('Delete failed'); }
  };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <div className="alert info" style={{ marginBottom: 20 }}>
        ⚙ Admin Panel — Full system control. Be careful with destructive actions.
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['users'].map(t => (
          <button
            key={t}
            className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab(t)}
          >👥 User Management</button>
        ))}
      </div>

      <div className="table-card">
        <div className="table-header">
          <div className="table-title">👥 System Users</div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add User</button>
        </div>
        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}><div className="loader" style={{ margin: '0 auto' }} /></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={u.id === me.id ? { background: 'rgba(79,124,255,0.05)' } : {}}>
                    <td style={{ color: 'var(--text3)', fontSize: 12 }}>#{u.id}</td>
                    <td className="primary">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 6,
                          background: 'linear-gradient(135deg, var(--accent), var(--purple))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0
                        }}>{u.name[0]}</div>
                        {u.name}
                        {u.id === me.id && <span style={{ fontSize: 10, color: 'var(--accent)', background: 'rgba(79,124,255,0.1)', padding: '1px 6px', borderRadius: 8 }}>You</span>}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text2)' }}>{u.email}</td>
                    <td><span className={`badge ${u.role}`}>{u.role}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}>✏ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)} disabled={u.id === me.id}>🗑</button>
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
            <div className="modal-title">{modal === 'add' ? '👤 Add User' : '✏ Edit User'}</div>
            {error && <div className="login-error">{error}</div>}
            <div className="input-group">
              <label className="input-label">Full Name *</label>
              <input className="input" value={form.name} onChange={f('name')} placeholder="Full name" />
            </div>
            <div className="input-group">
              <label className="input-label">Email *</label>
              <input className="input" type="email" value={form.email} onChange={f('email')} placeholder="email@panomkar.com" />
            </div>
            <div className="input-group">
              <label className="input-label">{modal === 'edit' ? 'New Password (leave blank to keep)' : 'Password *'}</label>
              <input className="input" type="password" value={form.password} onChange={f('password')} placeholder="••••••••" />
            </div>
            <div className="input-group">
              <label className="input-label">Role</label>
              <select className="input" value={form.role} onChange={f('role')}>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '⏳ Saving…' : '✓ Save User'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
