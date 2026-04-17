import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', icon: '⬡', label: 'Dashboard', exact: true },
  { path: '/shipments', icon: '📦', label: 'Shipments' },
  { path: '/fleet', icon: '🚛', label: 'Fleet' },
  { path: '/routes', icon: '🗺', label: 'Route Analytics' },
  { path: '/reports', icon: '📊', label: 'Reports' },
];

const adminItems = [
  { path: '/admin', icon: '⚙', label: 'Admin Panel' },
];

const pageMeta = {
  '/': { title: 'Dashboard', sub: 'Overview of logistics operations' },
  '/shipments': { title: 'Shipments', sub: 'Track and manage all shipments' },
  '/fleet': { title: 'Fleet Management', sub: 'Monitor vehicles and drivers' },
  '/routes': { title: 'Route Analytics', sub: 'Route performance and delay analysis' },
  '/reports': { title: 'Reports', sub: 'Data exports and summaries' },
  '/admin': { title: 'Admin Panel', sub: 'User and system management' },
};

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const meta = pageMeta[location.pathname] || { title: 'Pan Omkar', sub: '' };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-icon">🚚</div>
            <div>
              <div className="logo-text">Pan Omkar</div>
              <div className="logo-sub">Logistics</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="nav-section-label" style={{ marginTop: 12 }}>Admin</div>
              {adminItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <button className="logout-btn" onClick={logout} title="Logout">⏻</button>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <div className="topbar">
          <div className="topbar-left">
            <div className="page-title">{meta.title}</div>
            <div className="page-subtitle">{meta.sub}</div>
          </div>
          <div className="topbar-right">
            <span className="topbar-badge"><span className="live-dot" />Live</span>
          </div>
        </div>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
