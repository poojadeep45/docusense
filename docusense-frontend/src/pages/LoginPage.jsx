import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { offerToSaveCredential } from '../utils/credentials.js';
import AuthSidePanel from '../components/AuthSidePanel.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Username and password are required.');
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password, rememberMe);
      offerToSaveCredential(username.trim(), password);
      navigate('/documents');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-panel-brand">
          <span className="sidebar-brand-mark">DS</span>
          <span>DocuSense</span>
        </div>
        <h2>Sign in</h2>
        <p className="auth-panel-hint">Enterprise document intelligence, at your desk.</p>

        <form onSubmit={submit}>
          <label className="field-label">Username</label>
          <input
            className="field-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            autoComplete="username"
          />

          <label className="field-label">Password</label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <div className="field-row-between">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="inline-link">Forgot password?</Link>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button className="btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch-link">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
      <AuthSidePanel />
    </div>
  );
}