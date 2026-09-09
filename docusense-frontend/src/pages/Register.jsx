import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register({ onSwitchToLogin }) {
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
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
      await register(username, password, email)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create an account</h2>
        <p className="hint">Takes about ten seconds.</p>

        <label htmlFor="reg-email">Email</label>
        <input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <label htmlFor="reg-username">Username</label>
        <input
          id="reg-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
        />

        <label htmlFor="reg-password">Password</label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Continue'}
        </button>

        {error && <div className="error-msg">{error}</div>}

        <div className="auth-switch">
          <span>Already have an account?</span>{' '}
          <button type="button" className="btn-link" onClick={onSwitchToLogin}>
            Log in instead
          </button>
        </div>
      </form>
    </div>
  )
}
