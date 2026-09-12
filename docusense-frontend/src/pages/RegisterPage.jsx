import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { offerToSaveCredential } from '../utils/credentials.js';
import AuthSidePanel from '../components/AuthSidePanel.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      await register(username.trim(), password, email.trim());
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
        <h2>Create an account</h2>
        <p className="auth-panel-hint">Takes about ten seconds.</p>

        <form onSubmit={submit}>
          <label className="field-label">Email</label>
          <input
            className="field-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />

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
            autoComplete="new-password"
          />
          <p className="field-hint">At least 14 characters, e.g. 'Correct-Horse-Battery9'.</p>

          {error && <div className="error-msg">{error}</div>}

          <button className="btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
        <AuthSidePanel />
    </div>
  );
}