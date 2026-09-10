import React, { useState } from 'react';

export default function AuthView({ onLogin, onRegister }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  async function submit() {
    setError('');
    const u = username.trim();
    if (!u || !password) {
      setError('Username and password are required.');
      return;
    }
    try {
      if (isRegisterMode) {
        await onRegister(u, password, email.trim());
      } else {
        await onLogin(u, password);
      }
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>{isRegisterMode ? 'Create an account' : 'Welcome back'}</h2>
        <p className="hint">
          {isRegisterMode ? 'Takes about ten seconds.' : 'Log in to view your documents.'}
        </p>

        {isRegisterMode && (
          <>
            <label htmlFor="regEmail">Email</label>
            <input
              type="email"
              id="regEmail"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </>
        )}

        <label htmlFor="authUsername">Username</label>
        <input
          type="text"
          id="authUsername"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="authPassword">Password</label>
        <input
          type="password"
          id="authPassword"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        />

        <button className="btn-primary" onClick={submit}>Continue</button>

        {error && <div className="error-msg">{error}</div>}

        <div className="auth-switch">
          <span>{isRegisterMode ? 'Already have an account?' : 'New here?'}</span>{' '}
          <button className="btn-link" onClick={() => { setIsRegisterMode(!isRegisterMode); setError(''); }}>
            {isRegisterMode ? 'Log in instead' : 'Create an account'}
          </button>
        </div>
      </div>
    </div>
  );
}