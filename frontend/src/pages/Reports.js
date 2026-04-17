import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function statusBadge(s) {
  const map = { Delivered: 'delivered', 'In Transit': 'in-transit', Delayed: 'delayed', Pending: 'pending' };
  return <span className={`badge ${map[s] || 'pending'}`}>{s}</span>;
}

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const fetch = useCallback(async () => {
    try {
      const r = await axios.get('/api/reports');
      setReports(r.data.reports);
      setTotal(r.data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`/api/reports/export`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pan_omkar_report_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) { alert('Export failed'); }
    finally { setExporting(false); }
  };

  const filtered = statusFilter ? reports.filter(r => r.status === statusFilter) : reports;

  const summary = {
    total: reports.length,
    delivered: reports.filter(r => r.status === 'Delivered').length,
    delayed: reports.filter(r => r.status === 'Delayed').length,
    inTransit: reports.filter(r => r.status === 'In Transit').length,
  };

  return (
    <div>
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <div className="stat-card blue"><div className="stat-icon">📊</div><div className="stat-label">Total Records</div><div className="stat-value">{summary.total}</div></div>
        <div className="stat-card green"><div className="stat-icon">✅</div><div className="stat-label">Delivered</div><div className="stat-value">{summary.delivered}</div></div>
        <div className="stat-card blue"><div className="stat-icon">🚛</div><div className="stat-label">In Transit</div><div className="stat-value">{summary.inTransit}</div></div>
        <div className="stat-card red"><div className="stat-icon">⚠</div><div className="stat-label">Delayed</div><div className="stat-value">{summary.delayed}</div></div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div className="table-title">📊 Shipment Report <span style={{ color: 'var(--text3)', fontSize: 13, fontWeight: 400 }}>({filtered.length} records)</span></div>
          <div className="table-actions">
            <select className="input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 140 }}>
              <option value="">All Statuses</option>
              <option>Pending</option>
              <option>In Transit</option>
              <option>Delivered</option>
              <option>Delayed</option>
            </select>
            <button className="btn btn-primary" onClick={handleExport} disabled={exporting}>
              {exporting ? '⏳ Exporting…' : '⬇ Export CSV'}
            </button>
          </div>
        </div>
        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}><div className="loader" style={{ margin: '0 auto' }} /></div>
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
                  <th>Expected</th>
                  <th>Actual</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.tracking_id}>
                    <td className="primary" style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.tracking_id}</td>
                    <td>{r.origin}</td>
                    <td>{r.destination}</td>
                    <td>{r.driver_name || '—'}</td>
                    <td>{r.weight} t</td>
                    <td>{statusBadge(r.status)}</td>
                    <td style={{ fontSize: 12 }}>{r.expected_delivery_date ? new Date(r.expected_delivery_date).toLocaleDateString() : '—'}</td>
                    <td style={{ fontSize: 12 }}>{r.actual_delivery_date ? new Date(r.actual_delivery_date).toLocaleDateString() : '—'}</td>
                    <td style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
