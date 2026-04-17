import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => { setEmail('admin@panomkar.com'); setPassword('admin123'); };
  const fillManager = () => { setEmail('manager@panomkar.com'); setPassword('manager123'); };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🚚</div>
          <div className="login-brand">Pan Omkar Logistics</div>
          <div className="login-tagline">Data-Driven Logistics Platform</div>
        </div>

        <h2 className="login-title">Welcome back</h2>
        <p className="login-sub">Sign in to your account to continue</p>

        {error && <div className="login-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              className="input"
              type="email"
              placeholder="you@panomkar.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            {loading ? '⏳ Signing in…' : '→ Sign In'}
          </button>
        </form>

        <div className="login-hint">
          <strong>Quick Login:</strong><br />
          <span
            style={{ cursor: 'pointer', color: 'var(--accent)', textDecoration: 'underline' }}
            onClick={fillAdmin}
          >Admin</span>
          {' — '}admin@panomkar.com / admin123<br />
          <span
            style={{ cursor: 'pointer', color: 'var(--accent)', textDecoration: 'underline' }}
            onClick={fillManager}
          >Manager</span>
          {' — '}manager@panomkar.com / manager123
        </div>
      </div>
    </div>
  );
}
