import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler);

const chartDefaults = {
  plugins: { legend: { labels: { color: '#8896b0', font: { size: 12, family: 'DM Sans' } } } },
  scales: {
    x: { ticks: { color: '#4d5f7a' }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { ticks: { color: '#4d5f7a' }, grid: { color: 'rgba(255,255,255,0.04)' } }
  }
};

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetch = useCallback(async () => {
    try {
      const r = await axios.get('/api/analytics');
      setAnalytics(r.data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, [fetch]);

  if (loading) return <div className="loading-screen"><div className="loader" /></div>;
  if (!analytics) return <div className="empty-state"><div className="empty-icon">⚠</div><div className="empty-title">Failed to load analytics</div></div>;

  const a = analytics;

  const barData = {
    labels: a.trends.map(t => t.month),
    datasets: [
      { label: 'Total', data: a.trends.map(t => t.total), backgroundColor: 'rgba(79,124,255,0.6)', borderRadius: 6 },
      { label: 'Delivered', data: a.trends.map(t => t.delivered), backgroundColor: 'rgba(16,214,124,0.6)', borderRadius: 6 },
      { label: 'Delayed', data: a.trends.map(t => t.delayed), backgroundColor: 'rgba(255,71,87,0.6)', borderRadius: 6 },
    ]
  };

  const donutData = {
    labels: a.status_breakdown.map(s => s.label),
    datasets: [{
      data: a.status_breakdown.map(s => s.value),
      backgroundColor: a.status_breakdown.map(s => s.color),
      borderColor: '#0e1420',
      borderWidth: 3,
    }]
  };

  const lineData = {
    labels: a.trends.map(t => t.month),
    datasets: [{
      label: 'Deliveries',
      data: a.trends.map(t => t.delivered),
      borderColor: '#10d67c',
      backgroundColor: 'rgba(16,214,124,0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#10d67c',
    }]
  };

  const stats = [
    { label: 'Total Shipments', value: a.total_shipments, icon: '📦', color: 'blue', sub: 'All time' },
    { label: 'Delivered', value: a.delivered, icon: '✅', color: 'green', sub: `${((a.delivered/a.total_shipments||0)*100).toFixed(1)}% success rate` },
    { label: 'In Transit', value: a.in_transit, icon: '🚛', color: 'blue', sub: 'Currently moving' },
    { label: 'Delayed', value: a.delayed, icon: '⚠', color: 'red', sub: 'Needs attention' },
    { label: 'Avg Delivery', value: `${a.avg_delivery_time}d`, icon: '⏱', color: 'purple', sub: 'Average days' },
    { label: 'Vehicle Usage', value: `${a.vehicle_utilization}%`, icon: '🚗', color: 'amber', sub: 'Fleet utilization' },
  ];

  return (
    <div>
      {a.delayed > 0 && (
        <div className="alert warning" style={{ marginBottom: 20 }}>
          ⚠ {a.delayed} shipment{a.delayed > 1 ? 's are' : ' is'} delayed and require attention.
          {lastUpdated && <span style={{ marginLeft: 'auto', fontSize: 11 }}>Updated {lastUpdated.toLocaleTimeString()}</span>}
        </div>
      )}

      <div className="stat-grid">
        {stats.map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">Shipment Trends</div>
          <div className="chart-sub">Monthly breakdown by status</div>
          <Bar data={barData} options={{ ...chartDefaults, responsive: true, maintainAspectRatio: true, aspectRatio: 2 }} />
        </div>

        <div className="chart-card">
          <div className="chart-title">Status Distribution</div>
          <div className="chart-sub">Current shipment breakdown</div>
          <div style={{ maxWidth: 260, margin: '0 auto' }}>
            <Doughnut data={donutData} options={{
              responsive: true, cutout: '65%',
              plugins: { legend: { position: 'bottom', labels: { color: '#8896b0', padding: 12, font: { size: 12 } } } }
            }} />
          </div>
        </div>

        <div className="chart-card wide">
          <div className="chart-title">Delivery Performance</div>
          <div className="chart-sub">Successful deliveries over time</div>
          <Line data={lineData} options={{ ...chartDefaults, responsive: true, maintainAspectRatio: true, aspectRatio: 3 }} />
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div className="table-title">🏆 Top Routes</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Route</th>
                <th>Shipments</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {a.top_routes.map((r, i) => (
                <tr key={r.route}>
                  <td>{i + 1}</td>
                  <td className="primary">{r.route}</td>
                  <td>{r.count}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: 4, height: 6 }}>
                        <div style={{ width: `${(r.count / a.total_shipments * 100).toFixed(0)}%`, background: 'var(--accent)', height: '100%', borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text3)', width: 36 }}>
                        {(r.count / a.total_shipments * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
