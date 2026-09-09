import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login({ onSwitchToRegister }) {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!username || !password) {
      setError('Username and password are required.')
      return
    }
    setLoading(true)
    try {
      await login(username, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Welcome back</h2>
        <p className="hint">Log in to view your documents.</p>

        <label htmlFor="login-username">Username</label>
        <input
          id="login-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Continue'}
        </button>

        {error && <div className="error-msg">{error}</div>}

        <div className="auth-switch">
          <span>New here?</span>{' '}
          <button type="button" className="btn-link" onClick={onSwitchToRegister}>
            Create an account
          </button>
        </div>
      </form>
    </div>
  )
}
