import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { auth as authApi } from '../api.js';
import PasswordInput from '../components/PasswordInput.jsx';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('This reset link is missing its token. Please request a new one.');
      return;
    }
    if (newPassword.length < 14) {
      setError("Password must be at least 14 characters long, e.g. 'Correct-Horse-Battery9'.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
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

        {success ? (
          <>
            <h2>Password updated</h2>
            <p className="auth-panel-hint">Redirecting you to sign in…</p>
          </>
        ) : (
          <>
            <h2>Choose a new password</h2>
            <p className="auth-panel-hint">
              Must be at least 14 characters, e.g. <strong>'Correct-Horse-Battery9'</strong>.
            </p>

            {!token && (
              <div className="error-msg">
                No reset token found in this link. Request a new one from the
                {' '}<Link to="/forgot-password">forgot password page</Link>.
              </div>
            )}

            <form onSubmit={submit}>
              <label className="field-label">New password</label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••••"
                autoComplete="new-password"
              />

              <label className="field-label">Confirm new password</label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••••"
                autoComplete="new-password"
              />

              {error && <div className="error-msg">{error}</div>}

              <button className="btn-primary btn-full" type="submit" disabled={loading || !token}>
                {loading ? 'Updating…' : 'Update password'}
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