import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth as authApi } from '../api.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSubmitted(true);
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

        {submitted ? (
          <>
            <h2>Check your email</h2>
            <p className="auth-panel-hint">
              If an account exists for <strong>{email}</strong>, a password reset link has been sent.
              During development, this link is printed to the backend server's console log instead
              of a real inbox — check there for it.
            </p>
            <p className="auth-switch-link">
              <Link to="/login">Back to sign in</Link>
            </p>
          </>
        ) : (
          <>
            <h2>Forgot your password?</h2>
            <p className="auth-panel-hint">Enter your account email and we'll send a reset link.</p>

            <form onSubmit={submit}>
              <label className="field-label">Email</label>
              <input
                className="field-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />

              {error && <div className="error-msg">{error}</div>}

              <button className="btn-primary btn-full" type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            <p className="auth-switch-link">
              <Link to="/login">Back to sign in</Link>
            </p>
          </>
        )}
      </div>
      <AuthSidePanel />
    </div>
  );
}